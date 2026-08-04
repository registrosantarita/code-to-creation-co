import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listarAnalises from "./tools/listar-analises";
import detalharAnalise from "./tools/detalhar-analise";
import listarAchados from "./tools/listar-achados";
import detalharComparacao from "./tools/detalhar-comparacao";
import registrarNotaAchado from "./tools/registrar-nota-achado";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "plataforma-inteligente-de-conferencia-registral",
  title: "Plataforma Inteligente de Conferência Registral",
  version: "0.1.0",
  instructions:
    "Ferramentas da Plataforma Inteligente de Conferência Registral. Permitem consultar análises, documentos, imóveis, comparações técnicas e achados (divergências) do usuário autenticado, além de registrar notas de revisão. Os dados são produzidos por algoritmos determinísticos; qualquer interpretação normativa é subsídio opinativo e não substitui a qualificação jurídica do Oficial.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listarAnalises,
    detalharAnalise,
    listarAchados,
    detalharComparacao,
    registrarNotaAchado,
  ],
});
