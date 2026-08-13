/**
 * Validação humana dos achados.
 *
 * A decisão do conferente é gravada na própria tabela `findings`
 * (`reviewed` + `reviewer_note`), sem alterar o esquema: o parecer fica
 * codificado como prefixo da nota, seguido da justificativa livre.
 *
 * Quando vários achados compartilham a mesma justificativa, o prefixo
 * carrega o número do grupo de validação: `[RELEVADO#2] texto`.
 */

export type DecisaoAchado = "pendente" | "confirmado" | "relevado";

export const DECISAO_LABEL: Record<DecisaoAchado, string> = {
  pendente: "Aguardando validação",
  confirmado: "Divergência confirmada",
  relevado: "Relevado / justificado",
};

const PREFIXO: Record<Exclude<DecisaoAchado, "pendente">, string> = {
  confirmado: "[CONFIRMADO",
  relevado: "[RELEVADO",
};

export function montarNota(
  decisao: Exclude<DecisaoAchado, "pendente">,
  justificativa: string,
  grupo?: number | null,
): string {
  const marca = grupo ? `${PREFIXO[decisao]}#${grupo}]` : `${PREFIXO[decisao]}]`;
  return `${marca} ${justificativa.trim()}`.trim();
}

export function lerDecisao(f: {
  reviewed: boolean | null;
  reviewer_note: string | null;
}): { decisao: DecisaoAchado; justificativa: string; grupo: number | null } {
  const nota = (f.reviewer_note ?? "").trim();
  if (!f.reviewed && !nota)
    return { decisao: "pendente", justificativa: "", grupo: null };

  const m = /^\[(RELEVADO|CONFIRMADO)(?:#(\d+))?\]\s*/.exec(nota);
  if (m) {
    return {
      decisao: m[1] === "RELEVADO" ? "relevado" : "confirmado",
      justificativa: nota.slice(m[0].length).trim(),
      grupo: m[2] ? Number(m[2]) : null,
    };
  }
  return {
    decisao: f.reviewed ? "confirmado" : "pendente",
    justificativa: nota,
    grupo: null,
  };
}

export type AchadoBase = {
  id: string;
  code: string;
  title: string;
  severity: string;
  reviewed: boolean | null;
  reviewer_note: string | null;
};

export type GrupoValidacao = {
  numero: number;
  decisao: Exclude<DecisaoAchado, "pendente">;
  justificativa: string;
  achados: AchadoBase[];
};

/** Agrupa os achados já validados pelos números de validação humana. */
export function agruparValidacoes(achados: AchadoBase[]): GrupoValidacao[] {
  const mapa = new Map<number, GrupoValidacao>();
  for (const a of achados) {
    const d = lerDecisao(a);
    if (d.decisao === "pendente" || !d.grupo) continue;
    const g = mapa.get(d.grupo);
    if (g) g.achados.push(a);
    else
      mapa.set(d.grupo, {
        numero: d.grupo,
        decisao: d.decisao,
        justificativa: d.justificativa,
        achados: [a],
      });
  }
  return [...mapa.values()].sort((a, b) => a.numero - b.numero);
}

export function proximoNumeroGrupo(achados: AchadoBase[]): number {
  const nums = achados
    .map((a) => lerDecisao(a).grupo)
    .filter((n): n is number => !!n);
  return nums.length ? Math.max(...nums) + 1 : 1;
}
