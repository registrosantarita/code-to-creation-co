import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "registrar_nota_achado",
  title: "Registrar nota de qualificação em achado",
  description:
    "Registra a nota do Oficial em um achado e marca (ou desmarca) sua revisão. A decisão jurídica permanece do Oficial.",
  inputSchema: {
    achado_id: z.string().uuid().describe("Identificador do achado."),
    nota: z.string().trim().min(1).max(4000).describe("Nota do revisor."),
    revisado: z
      .boolean()
      .optional()
      .describe("Marca o achado como revisado (padrão: verdadeiro)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  handler: async ({ achado_id, nota, revisado }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("findings")
      .update({ reviewer_note: nota, reviewed: revisado ?? true })
      .eq("id", achado_id)
      .select("id, code, title, reviewed, reviewer_note");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data || data.length === 0)
      return {
        content: [{ type: "text", text: "Achado não encontrado ou sem permissão." }],
        isError: true,
      };
    return {
      content: [{ type: "text", text: JSON.stringify(data[0], null, 2) }],
      structuredContent: { achado: data[0] },
    };
  },
});
