import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "listar_analises",
  title: "Listar análises",
  description:
    "Lista as análises de conferência registral acessíveis ao usuário autenticado, com status, objetivo e etiquetas.",
  inputSchema: {
    status: z
      .string()
      .optional()
      .describe("Filtro opcional por status (ex.: em_andamento, concluida)."),
    limite: z.number().int().min(1).max(100).optional().describe("Máximo de registros (padrão 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limite }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("analyses")
      .select("id, title, objective, status, tags, created_at, updated_at, closed_at")
      .order("updated_at", { ascending: false })
      .limit(limite ?? 20);
    if (status) query = query.eq("status", status as never);
    const { data, error } = await query;
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { analises: data ?? [] },
    };
  },
});
