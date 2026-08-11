import type { TrechoConferido } from "./comparison-engine";

export type TrechoConfrontante = {
  confrontante: string;
  /** Confrontante conforme o documento comparado (quando informado). */
  confrontante_b: string;
  de: string;
  ate: string;
  /** Caminhamento conforme o documento comparado. */
  de_b: string;
  ate_b: string;
  trechos: number;
  extensao_m: number | null;
  /** Extensão somada conforme o documento comparado. */
  extensao_b_m: number | null;
  ok: boolean;
  problemas: string[];
};

const chave = (v: string | null | undefined): string =>
  (v ?? "").trim().replace(/\s+/g, " ").toUpperCase();

/**
 * Resume o caminhamento por confrontante: agrupa trechos contíguos que
 * descrevem a mesma confrontação, mantendo apenas o vértice inicial e o final.
 */
export function agruparConfrontantes(
  trechos: TrechoConferido[],
): TrechoConfrontante[] {
  const grupos: TrechoConfrontante[] = [];
  let atual: { k: string; g: TrechoConfrontante } | null = null;

  for (const t of trechos) {
    const nome = (t.confrontante_a ?? t.confrontante_b ?? "").trim();
    if (!nome) {
      atual = null;
      continue;
    }
    const k = chave(nome);
    if (!atual || atual.k !== k) {
      atual = {
        k,
        g: {
          confrontante: nome,
          confrontante_b: (t.confrontante_b ?? "").trim(),
          de: t.de_a ?? `seg. ${t.seq_a}`,
          ate: t.ate_a ?? `seg. ${t.seq_a}`,
          de_b: t.de_b ?? "",
          ate_b: t.ate_b ?? "",
          trechos: 0,
          extensao_m: 0,
          extensao_b_m: 0,
          ok: true,
          problemas: [],
        },
      };
      grupos.push(atual.g);
    }
    const g = atual.g;
    g.ate = t.ate_a ?? g.ate;
    if (t.ate_b) g.ate_b = t.ate_b;
    if (!g.de_b && t.de_b) g.de_b = t.de_b;
    if (!g.confrontante_b && t.confrontante_b) {
      g.confrontante_b = t.confrontante_b.trim();
    }
    g.trechos += 1;
    g.extensao_m =
      t.distancia_a === null ? g.extensao_m : (g.extensao_m ?? 0) + t.distancia_a;
    g.extensao_b_m =
      t.distancia_b == null
        ? g.extensao_b_m
        : (g.extensao_b_m ?? 0) + t.distancia_b;
    if (!t.ok) {
      g.ok = false;
      t.problemas.forEach((p) => {
        if (!g.problemas.includes(p)) g.problemas.push(p);
      });
    }
  }


  return grupos;
}
