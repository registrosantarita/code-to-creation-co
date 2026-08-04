/**
 * Segmentação de textos normativos em trechos citáveis.
 * Puro e determinístico — sem IA, sem custo.
 */

const ALVO = 1200;
const MAXIMO = 1800;

/** Quebra o inteiro teor em blocos por artigo/parágrafo, preservando a ordem. */
export function chunkNorma(texto: string): string[] {
  const limpo = texto
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!limpo) return [];

  // Marca início de dispositivos (Art. 1º, § 2º, I -, a)) como pontos de corte.
  const marcado = limpo.replace(
    /\n\s*(Art\.?\s*\d+|Artigo\s*\d+|§\s*\d+|Parágrafo único|[IVXLC]+\s*[-–—]|[a-z]\)\s)/g,
    "\n\u0000$1",
  );
  const blocos = marcado
    .split(/\n\u0000|\n{2,}/)
    .map((b) => b.replace(/\u0000/g, "").trim())
    .filter(Boolean);

  const trechos: string[] = [];
  let atual = "";

  const empurrar = () => {
    const t = atual.trim();
    if (t) trechos.push(t);
    atual = "";
  };

  for (const bloco of blocos) {
    if (bloco.length > MAXIMO) {
      empurrar();
      for (const parte of dividirLongo(bloco)) trechos.push(parte);
      continue;
    }
    if (atual.length + bloco.length + 1 > ALVO) empurrar();
    atual = atual ? `${atual}\n${bloco}` : bloco;
  }
  empurrar();

  return trechos;
}

function dividirLongo(bloco: string): string[] {
  const frases = bloco.split(/(?<=[.;:])\s+/);
  const partes: string[] = [];
  let atual = "";
  for (const frase of frases) {
    if (atual.length + frase.length + 1 > ALVO && atual) {
      partes.push(atual.trim());
      atual = "";
    }
    atual = atual ? `${atual} ${frase}` : frase;
    while (atual.length > MAXIMO) {
      partes.push(atual.slice(0, ALVO).trim());
      atual = atual.slice(ALVO);
    }
  }
  if (atual.trim()) partes.push(atual.trim());
  return partes;
}
