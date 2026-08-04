import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "detalhar_analise",
  title: "Detalhar análise",
  description:
    "Retorna uma análise com seus documentos, imóveis extraídos e comparações, para leitura de contexto técnico.",
  inputSchema: {
    analise_id: z.string().uuid().describe("Identificador da análise."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ analise_id }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    const supabase = supabaseForUser(ctx);

    const [analise, documentos, imoveis, comparacoes] = await Promise.all([
      supabase.from("analyses").select("*").eq("id", analise_id).maybeSingle(),
      supabase
        .from("documents")
        .select(
          "id, file_name, document_category, source_type, status, language_code, error_message, created_at",
        )
        .eq("analysis_id", analise_id),
      supabase
        .from("parcels")
        .select(
          "id, document_id, label, area_m2, declared_perimeter_m, computed_perimeter_m, vertex_count, confrontantes",
        )
        .eq("analysis_id", analise_id),
      supabase
        .from("comparisons")
        .select(
          "id, comparison_type, status, classification, summary, metrics, tolerances, created_at",
        )
        .eq("analysis_id", analise_id),
    ]);

    const erro =
      analise.error ?? documentos.error ?? imoveis.error ?? comparacoes.error;
    if (erro) return { content: [{ type: "text", text: erro.message }], isError: true };
    if (!analise.data)
      return {
        content: [{ type: "text", text: "Análise não encontrada ou sem acesso." }],
        isError: true,
      };

    const payload = {
      analise: analise.data,
      documentos: documentos.data ?? [],
      imoveis: imoveis.data ?? [],
      comparacoes: comparacoes.data ?? [],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
