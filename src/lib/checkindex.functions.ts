import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { extrairIndiceMatricula } from "./matricula-index-parser";

export const listarLotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({}).parse(input ?? {}))
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("index_batches")
      .select("id, title, note, export_layout, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const criarLote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().trim().min(1).max(160),
        note: z.string().max(2000).default(""),
        exportLayout: z.enum(["csv_padrao", "xlsx_padrao", "json_padrao"]).default("csv_padrao"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("index_batches")
      .insert({
        title: data.title,
        note: data.note,
        export_layout: data.exportLayout,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Falha ao criar o lote.");
    return { id: row.id };
  });

export const excluirLote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("index_batches").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const obterLote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const [lote, registros] = await Promise.all([
      context.supabase.from("index_batches").select("*").eq("id", data.id).maybeSingle(),
      context.supabase
        .from("index_records")
        .select(
          "id, label, file_name, file_extension, source_type, matricula_numero, livro, folha, cartorio, data_abertura, natureza, descricao, endereco, municipio, uf, area_m2, ultima_ficha, certificacao, registro_anterior, encerrada, matriculas_abertas, adquirente, conjuge_adq, transmitente, conjuge_transm, usufrutuario, conjuge_usu, prenotacao, ato, data_ato, selo, cadastros, proprietarios, atos, onus, extraction_source, review_status, created_at",
        )
        .eq("batch_id", data.id)
        .order("created_at", { ascending: true }),
    ]);
    if (lote.error) throw new Error(lote.error.message);
    if (!lote.data) throw new Error("Lote não encontrado.");
    if (registros.error) throw new Error(registros.error.message);
    return { lote: lote.data, registros: registros.data ?? [] };
  });

export const indexarMatricula = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        batchId: z.string().uuid(),
        label: z.string().trim().max(120).default(""),
        fileName: z.string().max(255).optional(),
        extension: z.string().max(12).optional(),
        base64: z.string().optional(),
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

      if (r.usage) {
        const { creditosDeTokens } = await import("./credit-estimator");
        await context.supabase.from("ai_usage_events").insert({
          user_id: context.userId,
          operation: "checkindex_ocr",
          model: r.usage.model,
          ocr_used: true,
          file_name: data.fileName ?? null,
          file_extension: (data.extension ?? "").replace(".", "").toLowerCase() || null,
          prompt_tokens: r.usage.promptTokens,
          completion_tokens: r.usage.completionTokens,
          total_tokens: r.usage.totalTokens,
          credits_estimated: creditosDeTokens(r.usage.totalTokens),
          note: "OCR de matrícula digitalizada (CheckIndex).",
        });
      }
    }

    if (!texto.trim()) throw new Error(note ?? "Nenhum texto pôde ser extraído deste documento.");

    const dados = extrairIndiceMatricula(texto);
    const { data: row, error } = await context.supabase
      .from("index_records")
      .insert({
        batch_id: data.batchId,
        label: data.label || data.fileName || `Matrícula ${dados.matricula_numero ?? ""}`.trim(),
        file_name: data.fileName ?? null,
        file_extension: (data.extension ?? "").replace(".", "").toLowerCase() || null,
        source_type: data.base64 ? "upload" : "pasted_text",
        matricula_numero: dados.matricula_numero,
        livro: dados.livro,
        folha: dados.folha,
        cartorio: dados.cartorio,
        data_abertura: dados.data_abertura,
        natureza: dados.natureza,
        descricao: dados.descricao,
        endereco: dados.endereco,
        municipio: dados.municipio,
        uf: dados.uf,
        area_m2: dados.area_m2,
        ultima_ficha: dados.ultima_ficha,
        certificacao: dados.certificacao,
        registro_anterior: dados.registro_anterior,
        encerrada: dados.encerrada,
        matriculas_abertas: dados.matriculas_abertas,
        adquirente: dados.adquirente,
        conjuge_adq: dados.conjuge_adq,
        transmitente: dados.transmitente,
        conjuge_transm: dados.conjuge_transm,
        usufrutuario: dados.usufrutuario,
        conjuge_usu: dados.conjuge_usu,
        prenotacao: dados.prenotacao,
        ato: dados.ato,
        data_ato: dados.data_ato,
        selo: dados.selo,
        cadastros: JSON.parse(JSON.stringify(dados.cadastros)),
        proprietarios: JSON.parse(JSON.stringify(dados.proprietarios)),
        atos: JSON.parse(JSON.stringify(dados.atos)),
        onus: JSON.parse(JSON.stringify(dados.onus)),
        extracted: JSON.parse(JSON.stringify(dados)),
        extraction_source: "deterministico",
        raw_text: texto.slice(0, 400000),
        review_status: "pendente",
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Falha ao indexar a matrícula.");
    return { id: row.id, note };
  });

export const atualizarRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        campos: z
          .object({
            matricula_numero: z.string().max(40).nullable().optional(),
            livro: z.string().max(40).nullable().optional(),
            folha: z.string().max(40).nullable().optional(),
            cartorio: z.string().max(160).nullable().optional(),
            natureza: z.enum(["urbano", "rural", "nao_identificado"]).optional(),
            endereco: z.string().max(400).optional(),
            municipio: z.string().max(80).nullable().optional(),
            uf: z.string().max(2).nullable().optional(),
            area_m2: z.number().nullable().optional(),
            ultima_ficha: z.string().max(20).nullable().optional(),
            certificacao: z.string().max(80).nullable().optional(),
            registro_anterior: z.string().max(120).nullable().optional(),
            encerrada: z.boolean().optional(),
            matriculas_abertas: z.array(z.string().max(20)).max(200).optional(),
            adquirente: z.string().max(160).nullable().optional(),
            conjuge_adq: z.string().max(160).nullable().optional(),
            transmitente: z.string().max(160).nullable().optional(),
            conjuge_transm: z.string().max(160).nullable().optional(),
            usufrutuario: z.string().max(160).nullable().optional(),
            conjuge_usu: z.string().max(160).nullable().optional(),
            prenotacao: z.string().max(40).nullable().optional(),
            ato: z.string().max(40).nullable().optional(),
            data_ato: z.string().max(10).nullable().optional(),
            selo: z.string().max(60).nullable().optional(),
            descricao: z.string().max(4000).optional(),
            review_status: z.enum(["pendente", "revisado"]).optional(),
          })
          .strict(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const campos = Object.fromEntries(
      Object.entries(data.campos).filter(([, v]) => v !== undefined),
    ) as unknown as Database["public"]["Tables"]["index_records"]["Update"];
    const { error } = await context.supabase
      .from("index_records")
      .update(campos)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const excluirRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("index_records").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
