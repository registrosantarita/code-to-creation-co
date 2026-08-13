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
          "id, label, file_name, file_extension, source_type, doc_role, extracted, extraction_source, created_at",
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
    const { data: row, error } = await context.supabase
      .from("qualification_docs")
      .insert({
        set_id: data.setId,
        label: data.label || data.fileName || "Documento",
        file_name: data.fileName ?? null,
        file_extension: (data.extension ?? "").replace(".", "").toLowerCase() || null,
        source_type: data.base64 ? "upload" : "pasted_text",
        doc_role: data.docRole,
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
