/**
 * Validação humana dos achados.
 *
 * A decisão do conferente é gravada na própria tabela `findings`
 * (`reviewed` + `reviewer_note`), sem alterar o esquema: o parecer fica
 * codificado como prefixo da nota, seguido da justificativa livre.
 */

export type DecisaoAchado = "pendente" | "confirmado" | "relevado";

export const DECISAO_LABEL: Record<DecisaoAchado, string> = {
  pendente: "Aguardando validação",
  confirmado: "Divergência confirmada",
  relevado: "Relevado / justificado",
};

const PREFIXO: Record<Exclude<DecisaoAchado, "pendente">, string> = {
  confirmado: "[CONFIRMADO]",
  relevado: "[RELEVADO]",
};

export function montarNota(
  decisao: Exclude<DecisaoAchado, "pendente">,
  justificativa: string,
): string {
  return `${PREFIXO[decisao]} ${justificativa.trim()}`.trim();
}

export function lerDecisao(f: {
  reviewed: boolean | null;
  reviewer_note: string | null;
}): { decisao: DecisaoAchado; justificativa: string } {
  const nota = (f.reviewer_note ?? "").trim();
  if (!f.reviewed && !nota) return { decisao: "pendente", justificativa: "" };
  if (nota.startsWith(PREFIXO.relevado)) {
    return {
      decisao: "relevado",
      justificativa: nota.slice(PREFIXO.relevado.length).trim(),
    };
  }
  if (nota.startsWith(PREFIXO.confirmado)) {
    return {
      decisao: "confirmado",
      justificativa: nota.slice(PREFIXO.confirmado.length).trim(),
    };
  }
  return { decisao: f.reviewed ? "confirmado" : "pendente", justificativa: nota };
}
