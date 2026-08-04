import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "listar_achados",
  title: "Listar achados",
  description:
    "Lista os achados (divergências) de uma análise, com código, severidade, descrição e evidências rastreáveis.",
  inputSchema: {
    analise_id: z.string().uuid().describe("Identificador da análise."),
    severidade: z
      .string()
      .optional()
      .describe("Filtro opcional por severidade (ex.: critica, moderada, informativa)."),
    apenas_nao_revisados: z
      .boolean()
      .optional()
      .describe("Se verdadeiro, retorna apenas achados ainda não revisados."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ analise_id, severidade, apenas_nao_revisados }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("findings")
      .select(
        "id, comparison_id, code, title, description, severity, evidence, reviewed, reviewer_note, created_at",
      )
      .eq("analysis_id", analise_id)
      .order("created_at", { ascending: true });
    if (severidade) query = query.eq("severity", severidade as never);
    if (apenas_nao_revisados) query = query.eq("reviewed", false);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { achados: data ?? [] },
    };
  },
});
