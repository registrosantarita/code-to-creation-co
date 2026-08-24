import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listarConferencias = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({}).parse(input ?? {}))
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("question_check_sessions")
      .select("id, title, protocolo, tipo_titulo, secoes, status, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const criarConferencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().trim().min(3).max(160),
        protocolo: z.string().trim().max(80).default(""),
        note: z.string().max(2000).default(""),
        tipoTitulo: z.string().max(60).default(""),
        secoes: z.array(z.string().max(2)).max(20).default([]),
        subsecoes: z.array(z.string().max(240)).max(400).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("question_check_sessions")
      .insert({
        title: data.title,
        protocolo: data.protocolo,
        note: data.note,
        tipo_titulo: data.tipoTitulo,
        secoes: data.secoes,
        subsecoes: data.subsecoes,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Falha ao criar a conferência.");
    return { id: row.id };
  });

export const obterConferencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("question_check_sessions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Conferência não encontrada.");
    return row;
  });

export const salvarConferencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        tipoTitulo: z.string().max(60).optional(),
        secoes: z.array(z.string().max(2)).max(20).optional(),
        subsecoes: z.array(z.string().max(240)).max(400).optional(),
        respostas: z.record(z.string(), z.unknown()).optional(),
        exigencias: z.array(z.record(z.string(), z.unknown())).max(500).optional(),
        alertas: z.array(z.record(z.string(), z.unknown())).max(500).optional(),
        notaExigencia: z.string().max(60000).optional(),
        listaAlertas: z.string().max(60000).optional(),
        status: z.enum(["em_andamento", "concluida"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    if (data.tipoTitulo !== undefined) patch['tipo_titulo'] = data.tipoTitulo;
    if (data.secoes !== undefined) patch['secoes'] = data.secoes;
    if (data.subsecoes !== undefined) patch['subsecoes'] = data.subsecoes;
    if (data.respostas !== undefined) patch['respostas'] = JSON.parse(JSON.stringify(data.respostas));
    if (data.exigencias !== undefined) patch['exigencias'] = JSON.parse(JSON.stringify(data.exigencias));
    if (data.alertas !== undefined) patch['alertas'] = JSON.parse(JSON.stringify(data.alertas));
    if (data.notaExigencia !== undefined) patch['nota_exigencia'] = data.notaExigencia;
    if (data.listaAlertas !== undefined) patch['lista_alertas'] = data.listaAlertas;
    if (data.status !== undefined) patch['status'] = data.status;
    if (!Object.keys(patch).length) return { ok: true as const };

    const { error } = await context.supabase
      .from("question_check_sessions")
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    if (data.status) {
      await context.supabase.from("audit_logs").insert({
        actor_id: context.userId,
        entity_type: "question_check_session",
        entity_id: data.id,
        action: data.status === "concluida" ? "questioncheck_concluido" : "questioncheck_reaberto",
        metadata: {},
      });
    }
    return { ok: true as const };
  });

export const excluirConferencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("question_check_sessions")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.from("audit_logs").insert({
      actor_id: context.userId,
      entity_type: "question_check_session",
      entity_id: data.id,
      action: "questioncheck_excluido",
      metadata: {},
    });
    return { ok: true as const };
  });
