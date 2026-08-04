import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "detalhar_comparacao",
  title: "Detalhar comparação",
  description:
    "Retorna uma comparação técnica com métricas quantitativas, tolerâncias aplicadas e os achados vinculados.",
  inputSchema: {
    comparacao_id: z.string().uuid().describe("Identificador da comparação."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ comparacao_id }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const [comparacao, achados] = await Promise.all([
      supabase.from("comparisons").select("*").eq("id", comparacao_id).maybeSingle(),
      supabase
        .from("findings")
        .select("id, code, title, description, severity, evidence, reviewed, reviewer_note")
        .eq("comparison_id", comparacao_id),
    ]);
    const erro = comparacao.error ?? achados.error;
    if (erro) return { content: [{ type: "text", text: erro.message }], isError: true };
    if (!comparacao.data)
      return {
        content: [{ type: "text", text: "Comparação não encontrada ou sem acesso." }],
        isError: true,
      };
    const payload = { comparacao: comparacao.data, achados: achados.data ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
