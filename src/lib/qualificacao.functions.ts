import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { extrairQualificacao, type Qualificacao } from "./qualificacao-parser";

export const listarConjuntos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({}).parse(input ?? {}))
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("qualification_sets")
      .select("id, title, note, mode, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const criarConjunto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().trim().min(1).max(160),
        note: z.string().max(2000).default(""),
        mode: z.enum(["titulo_x_matricula", "titulo_x_titulo"]).default("titulo_x_matricula"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("qualification_sets")
      .insert({ title: data.title, note: data.note, mode: data.mode, created_by: context.userId })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Falha ao criar a conferência.");
    return { id: row.id };
  });

export const excluirConjunto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("qualification_sets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const obterConjunto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const [conjunto, docs] = await Promise.all([
      context.supabase.from("qualification_sets").select("*").eq("id", data.id).maybeSingle(),
      context.supabase
        .from("qualification_docs")
        .select(
          "id, label, file_name, file_extension, source_type, doc_role, doc_species, extracted, extraction_source, raw_text, created_at",
        )
        .eq("set_id", data.id)
        .order("created_at", { ascending: true }),
    ]);
    if (conjunto.error) throw new Error(conjunto.error.message);
    if (!conjunto.data) throw new Error("Conferência não encontrada.");
    if (docs.error) throw new Error(docs.error.message);
    return { conjunto: conjunto.data, documentos: docs.data ?? [] };
  });

export const adicionarDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        setId: z.string().uuid(),
        label: z.string().trim().max(120).default(""),
        fileName: z.string().max(255).optional(),
        extension: z.string().max(12).optional(),
        base64: z.string().optional(),
        docRole: z.enum(["titulo", "matricula"]).default("titulo"),
        texto: z.string().max(500000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    let texto = (data.texto ?? "").trim();
    let note: string | undefined;

    if (!texto && data.base64) {
      const bin = atob(data.base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const { extractTextFromFile } = await import("./extraction.server");
      const r = await extractTextFromFile(bytes.buffer, data.extension ?? "");
      texto = r.text ?? "";
      note = r.note;
    }

    if (!texto.trim()) throw new Error(note ?? "Nenhum texto pôde ser extraído deste documento.");

    const dados = extrairQualificacao(texto);
    const { classificarEspecie } = await import("./qualificacao-especie");
    const especie = classificarEspecie(texto, data.fileName);
    const { data: row, error } = await context.supabase
      .from("qualification_docs")
      .insert({
        set_id: data.setId,
        label: data.label || data.fileName || "Documento",
        file_name: data.fileName ?? null,
        file_extension: (data.extension ?? "").replace(".", "").toLowerCase() || null,
        source_type: data.base64 ? "upload" : "pasted_text",
        doc_role: data.docRole,
        doc_species: especie,
        raw_text: texto.slice(0, 400000),
        extracted: JSON.parse(JSON.stringify(dados)),
        extraction_source: "deterministico",
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Falha ao registrar o documento.");
    return { id: row.id, note };
  });

export const excluirDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("qualification_docs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const complementarComIA = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ docId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: doc, error } = await context.supabase
      .from("qualification_docs")
      .select("id, raw_text, extracted, file_name, file_extension")
      .eq("id", data.docId)
      .single();
    if (error || !doc) throw new Error("Documento não encontrado.");

    const { extrairQualificacaoIA, mesclar } = await import("./qualificacao-ai.server");
    const r = await extrairQualificacaoIA(doc.raw_text ?? "");

    if (r.usage) {
      const { creditosDeTokens } = await import("./credit-estimator");
      await context.supabase.from("ai_usage_events").insert({
        user_id: context.userId,
        operation: "qualificacao_ia",
        model: r.usage.model,
        ocr_used: false,
        file_name: doc.file_name,
        file_extension: doc.file_extension,
        prompt_tokens: r.usage.promptTokens,
        completion_tokens: r.usage.completionTokens,
        total_tokens: r.usage.totalTokens,
        credits_estimated: creditosDeTokens(r.usage.totalTokens),
        note: "Complemento de dados de qualificação por IA.",
      });
    }

    if (!r.dados) return { ok: false as const, note: r.note ?? "A IA não retornou dados." };

    const base = (doc.extracted ?? {}) as unknown as Qualificacao;
    const mesclado = mesclar(
      { pessoas: base.pessoas ?? [], imovel: base.imovel, cadeia: base.cadeia },
      r.dados,
    );
    const { error: upError } = await context.supabase
      .from("qualification_docs")
      .update({
        extracted: JSON.parse(JSON.stringify(mesclado)),
        extraction_source: "deterministico+ia",
      })
      .eq("id", doc.id);
    if (upError) throw new Error(upError.message);
    return { ok: true as const, note: r.note };
  });

const validacaoSchema = z.object({
  numero: z.number().int().positive(),
  decisao: z.enum(["relevado", "confirmado", "oposicao"]),
  justificativa: z.string().trim().min(1).max(4000),
  chaves: z.array(z.string().max(400)).min(1),
});

export const salvarValidacoes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        setId: z.string().uuid(),
        validacoes: z.array(validacaoSchema).max(200),
        acao: z.string().max(60).default("validacao_lote_salva"),
        detalhe: z.record(z.string(), z.unknown()).default({}),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("qualification_sets")
      .update({ validations: data.validacoes as never })
      .eq("id", data.setId);
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_logs").insert({
      actor_id: context.userId,
      entity_type: "qualification_validation",
      entity_id: data.setId,
      action: data.acao,
      metadata: JSON.parse(JSON.stringify(data.detalhe)),
    });
    return { ok: true as const };
  });

/** Classificação do documento: espécie e papel na conferência. */
export const classificarDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        especie: z.string().max(40).optional(),
        docRole: z.enum(["titulo", "matricula"]).optional(),
        label: z.string().trim().max(120).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: Record<string, string> = {};
    if (data.especie) patch["doc_species"] = data.especie;
    if (data.docRole) patch["doc_role"] = data.docRole;
    if (data.label) patch["label"] = data.label;
    if (!Object.keys(patch).length) return { ok: true as const };
    const { error } = await context.supabase
      .from("qualification_docs")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listarComparacoes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ setId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("qualification_comparisons")
      .select(
        "id, title, paradigm_doc_id, compared_doc_ids, criteria, summary, classification, created_at",
      )
      .eq("set_id", data.setId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const obterComparacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("qualification_comparisons")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Comparação não encontrada.");
    return row;
  });

/**
 * Cria uma comparação: o resultado é calculado no servidor, de forma
 * determinística, e gravado junto com os critérios adotados.
 */
export const criarComparacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        setId: z.string().uuid(),
        title: z.string().trim().max(160).default(""),
        paradigmDocId: z.string().uuid(),
        comparedDocIds: z.array(z.string().uuid()).min(1).max(20),
        criterios: z.array(z.string().max(40)).min(1),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const ids = [data.paradigmDocId, ...data.comparedDocIds.filter((i) => i !== data.paradigmDocId)];
    const { data: docs, error } = await context.supabase
      .from("qualification_docs")
      .select("id, label, doc_role, doc_species, extracted")
      .eq("set_id", data.setId)
      .in("id", ids);
    if (error) throw new Error(error.message);
    if (!docs || docs.length < 2) throw new Error("Selecione ao menos dois documentos válidos.");

    const ordenados = ids
      .map((id) => docs.find((d) => d.id === id))
      .filter((d): d is NonNullable<typeof d> => Boolean(d));

    const { conferirQualificacao } = await import("./qualificacao-compare");
    const { qualificacaoVazia } = await import("./qualificacao-parser");
    const resultado = conferirQualificacao(
      ordenados.map((d, i) => ({
        rotulo: `Doc. ${String.fromCharCode(65 + i)}`,
        dados: { ...qualificacaoVazia(), ...((d.extracted ?? {}) as never) },
      })),
      data.criterios,
    );

    const resumo =
      `${resultado.resumo.conformes} conformes · ${resultado.resumo.divergentes} divergentes · ` +
      `${resultado.resumo.invalidos} inválidos · ${resultado.resumo.incompletos} não comparados.`;

    const { data: row, error: insErr } = await context.supabase
      .from("qualification_comparisons")
      .insert({
        set_id: data.setId,
        title: data.title || `Comparação de ${ordenados.length} documento(s)`,
        paradigm_doc_id: data.paradigmDocId,
        compared_doc_ids: ids.slice(1),
        criteria: data.criterios,
        result: JSON.parse(JSON.stringify({ ...resultado, documentos: ordenados.map((d) => ({ id: d.id, label: d.label, doc_role: d.doc_role, doc_species: d.doc_species })) })),
        summary: resumo,
        classification: resultado.classificacao,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (insErr || !row) throw new Error(insErr?.message ?? "Falha ao criar a comparação.");

    await context.supabase.from("audit_logs").insert({
      actor_id: context.userId,
      entity_type: "qualification_comparison",
      entity_id: row.id,
      action: "comparacao_criada",
      metadata: { set_id: data.setId, criterios: data.criterios, documentos: ids },
    });

    return { id: row.id };
  });

export const salvarValidacoesComparacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        comparacaoId: z.string().uuid(),
        validacoes: z.array(validacaoSchema).max(200),
        acao: z.string().max(60).default("validacao_lote_salva"),
        detalhe: z.record(z.string(), z.unknown()).default({}),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("qualification_comparisons")
      .update({ validations: data.validacoes as never })
      .eq("id", data.comparacaoId);
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_logs").insert({
      actor_id: context.userId,
      entity_type: "qualification_comparison_validation",
      entity_id: data.comparacaoId,
      action: data.acao,
      metadata: JSON.parse(JSON.stringify(data.detalhe)),
    });
    return { ok: true as const };
  });
