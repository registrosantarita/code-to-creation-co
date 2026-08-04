import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const TIPOS = [
  "lei",
  "decreto",
  "provimento",
  "resolucao",
  "normas_servico",
  "parecer",
  "decisao_administrativa",
  "sumula",
  "enunciado",
  "outro",
] as const;

const SITUACOES = ["vigente", "revogada", "suspensa", "em_consulta"] as const;

const NormaInput = z.object({
  title: z.string().trim().min(3).max(300),
  issuer: z.string().trim().max(200).default(""),
  norm_type: z.enum(TIPOS).default("outro"),
  number: z.string().trim().max(60).optional(),
  year: z.number().int().min(1500).max(2200).optional(),
  hierarchy: z.number().int().min(1).max(100).default(50),
  ementa: z.string().trim().max(4000).default(""),
  full_text: z.string().trim().min(20).max(400000),
  source_url: z.string().trim().url().max(600).optional().or(z.literal("")),
  jurisdiction: z.string().trim().max(120).default("nacional"),
  effective_from: z.string().trim().optional().or(z.literal("")),
  effective_to: z.string().trim().optional().or(z.literal("")),
  status: z.enum(SITUACOES).default("vigente"),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
});

export const criarNorma = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => NormaInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { chunkNorma } = await import("./norma-chunker");
    const { embedTexts } = await import("./embeddings.server");

    const trechos = chunkNorma(data.full_text);
    if (trechos.length === 0) throw new Error("O inteiro teor não contém texto indexável.");

    const embedding = await embedTexts(trechos);

    const { data: norma, error } = await supabase
      .from("norms")
      .insert({
        title: data.title,
        issuer: data.issuer,
        norm_type: data.norm_type,
        number: data.number || null,
        year: data.year ?? null,
        hierarchy: data.hierarchy,
        ementa: data.ementa,
        full_text: data.full_text,
        source_url: data.source_url || null,
        jurisdiction: data.jurisdiction || "nacional",
        effective_from: data.effective_from || null,
        effective_to: data.effective_to || null,
        status: data.status,
        tags: data.tags,
        chunk_count: trechos.length,
        embedding_model: embedding.model,
        created_by: userId,
      })
      .select("id")
      .single();
    if (error || !norma) throw new Error("Falha ao salvar a norma.");

    const { error: chunkError } = await supabase.from("norm_chunks").insert(
      trechos.map((content, i) => ({
        norm_id: norma.id,
        seq: i + 1,
        content,
        embedding: JSON.stringify(embedding.vectors[i]),
      })),
    );
    if (chunkError) {
      await supabase.from("norms").delete().eq("id", norma.id);
      throw new Error("Falha ao indexar os trechos da norma.");
    }

    const { creditosDeTokens } = await import("./credit-estimator");
    await supabase.from("ai_usage_events").insert({
      user_id: userId,
      operation: "indexacao_norma",
      model: embedding.model,
      ocr_used: false,
      file_name: data.title.slice(0, 200),
      prompt_tokens: embedding.promptTokens,
      completion_tokens: 0,
      total_tokens: embedding.totalTokens,
      credits_estimated: creditosDeTokens(embedding.totalTokens),
      note: `Indexação semântica de ${trechos.length} trecho(s) normativo(s).`,
    });

    await supabase.from("audit_logs").insert({
      actor_id: userId,
      entity_type: "norm",
      entity_id: norma.id,
      action: "create",
      metadata: { trechos: trechos.length, tipo: data.norm_type, situacao: data.status },
    });

    return { id: norma.id, trechos: trechos.length };
  });

export const listarNormas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("norms")
      .select(
        "id, title, issuer, norm_type, number, year, hierarchy, ementa, source_url, jurisdiction, effective_from, effective_to, status, tags, chunk_count, created_at, created_by",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Falha ao carregar o acervo normativo.");
    return data ?? [];
  });

export const obterNorma = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: norma, error } = await context.supabase
      .from("norms")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !norma) throw new Error("Norma não encontrada.");
    return norma;
  });

export const excluirNorma = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("norms").delete().eq("id", data.id);
    if (error) throw new Error("Falha ao excluir a norma (verifique suas permissões).");
    await context.supabase.from("audit_logs").insert({
      actor_id: context.userId,
      entity_type: "norm",
      entity_id: data.id,
      action: "delete",
      metadata: {},
    });
    return { ok: true as const };
  });

const BuscaInput = z.object({
  consulta: z.string().trim().min(3).max(1000),
  limite: z.number().int().min(1).max(20).default(8),
  apenasVigentes: z.boolean().default(true),
});

export const buscarNormas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BuscaInput.parse(input))
  .handler(async ({ data, context }) => {
    const { embedTexts } = await import("./embeddings.server");
    const { creditosDeTokens } = await import("./credit-estimator");
    const embedding = await embedTexts([data.consulta]);
    const vetor = embedding.vectors[0];
    if (!vetor) throw new Error("Falha ao interpretar a consulta.");

    const { data: resultados, error } = await context.supabase.rpc(
      "buscar_normas_semantico",
      {
        query_embedding: JSON.stringify(vetor),
        match_count: data.limite,
        ...(data.apenasVigentes ? { filtro_status: "vigente" as const } : {}),
      },
    );
    if (error) throw new Error("Falha na busca normativa.");

    await context.supabase.from("ai_usage_events").insert({
      user_id: context.userId,
      operation: "busca_normativa",
      model: embedding.model,
      ocr_used: false,
      prompt_tokens: embedding.promptTokens,
      completion_tokens: 0,
      total_tokens: embedding.totalTokens,
      credits_estimated: creditosDeTokens(embedding.totalTokens),
      note: "Consulta semântica ao acervo normativo.",
    });

    return resultados ?? [];
  });
