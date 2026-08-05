/**
 * Léxico registral: padroniza sinônimos, abreviaturas e grafias variantes
 * encontradas em memoriais descritivos brasileiros ANTES da extração técnica.
 *
 * A normalização é conservadora: não altera números, apenas uniformiza os
 * termos que o parser reconhece (vértice, azimute, distância, confrontação,
 * área, perímetro, matrícula e unidades).
 */

export type RegraLexical = {
  /** Rótulo canônico produzido pela regra. */
  canonico: string;
  /** Variantes aceitas (aplicadas como alternância de regex, sem acento-sensibilidade). */
  variantes: string[];
};

/** Sinônimos de vértice (ponto = vértice = marco = estaca = piquete). */
export const VERTICE: RegraLexical = {
  canonico: "vértice",
  variantes: [
    "v[ée]rtices?",
    "v[ée]rt\\.?",
    "vt\\.?",
    "v\\.\\s*(?=[0-9]|[A-Z]{1,3}[\\-.0-9])",
    "pontos?",
    "pto\\.?",
    "pt\\.?",
    "p\\.\\s*(?=[0-9]|[A-Z]{1,3}[\\-.0-9])",
    "marcos?",
    "marco\\s+geod[ée]sico",
    "mc\\.?",
    "estacas?",
    "est\\.\\s*(?=[0-9]|[A-Z]{1,3}[\\-.0-9])",
    "piquetes?",
    "pique\\.?",

  ],
};

/** Sinônimos de azimute. */
export const AZIMUTE: RegraLexical = {
  canonico: "azimute",
  variantes: [
    "azimutes?",
    "azim\\.?",
    "azi\\.?",
    "az\\.?(?=\\s*(?:de\\s+)?[\\d(])",
    "az\\.",
    "[âa]ngulo\\s+azimutal",
    "azimute\\s+(?:plano|verdadeiro|geod[ée]sico|magn[ée]tico)",
  ],
};

/** Sinônimos de rumo. */
export const RUMO: RegraLexical = {
  canonico: "rumo",
  variantes: ["rumos?", "rm\\.?(?=\\s*\\d)", "dire[çc][ãa]o\\s+magn[ée]tica"],
};

/** Sinônimos de distância. */
export const DISTANCIA: RegraLexical = {
  canonico: "distância",
  variantes: [
    "dist[âa]ncias?",
    "dist\\.?",
    "dst\\.?",
    "extens[ãa]o",
    "comprimento",
    "medida\\s+de",
    "na\\s+medida\\s+de",
    "percorrendo",
  ],
};

/** Sinônimos de altitude (cota / elevação / altura ortométrica). */
export const ALTITUDE: RegraLexical = {
  canonico: "altitude",
  variantes: [
    "altitudes?",
    "alt\\.?(?=\\s*[:=]?\\s*-?\\d)",
    "altura\\s+(?:ortom[ée]trica|geom[ée]trica|elipsoidal)",
    "cotas?\\s+(?:altim[ée]trica|do\\s+v[ée]rtice|de\\s+n[íi]vel)",
    "cota(?=\\s*[:=]?\\s*-?\\d)",
    "eleva[çc][ãa]o(?=\\s*[:=]?\\s*-?\\d)",
    "n[íi]vel\\s+altim[ée]trico",
  ],
};

/** Sinônimos de confrontação. */

export const CONFRONTACAO: RegraLexical = {
  canonico: "confrontando com",
  variantes: [
    "confront(?:ando|a|ante|antes|a[çc][ãa]o)?\\s*(?:-se)?\\s*(?:com|:)",
    "confr\\.?\\s*(?:com|:)",
    "divis(?:a|ando|ando-se)\\s+com",
    "divisa\\s+com",
    "fazendo\\s+divisa\\s+com",
    "limitando(?:-se)?\\s+com",
    "limite\\s+com",
    "faz\\s+frente\\s+(?:para|com)",
    "lindeiro\\s+(?:a|com)",
    "de\\s+frente\\s+(?:para|com)",
  ],
};

/** Sinônimos de área. */
export const AREA: RegraLexical = {
  canonico: "área",
  variantes: [
    "[áa]reas?",
    "[áa]r\\.?(?=\\s*(?:total|de|:))",
    "superf[íi]cie",
    "[áa]rea\\s+(?:total|superficial|do\\s+pol[íi]gono)",
  ],
};

/** Sinônimos de perímetro. */
export const PERIMETRO: RegraLexical = {
  canonico: "perímetro",
  variantes: ["per[íi]metros?", "per[íi]m\\.?", "contorno\\s+total"],
};

/** Sinônimos de matrícula. */
export const MATRICULA: RegraLexical = {
  canonico: "matrícula",
  variantes: [
    "matr[íi]culas?",
    "matr\\.?",
    "mat\\.(?=\\s*n?[ºo°.\\d])",
    "m\\.\\s*n[ºo°]",
  ],
};

/** Verbos de deslocamento entre vértices — uniformizados para "segue". */
export const SEGUE: RegraLexical = {
  canonico: "segue",
  variantes: [
    "segue(?:-se)?",
    "seguindo",
    "prossegue(?:-se)?",
    "prosseguindo",
    "ruma(?:-se)?",
    "rumando",
    "deflete(?:-se)?",
    "defletindo",
    "caminha(?:-se)?",
    "confina(?:-se)?\\s+seguindo",
  ],
};

/** Conector de chegada — uniformizado para "até o vértice". */
export const ATE: RegraLexical = {
  canonico: "até",
  variantes: ["at[ée]", "at\\.?\\s*o(?=\\s*v)", "alcan[çc]ando", "chegando\\s+a[oo]?"],
};

export const REGRAS: RegraLexical[] = [
  MATRICULA,
  AREA,
  PERIMETRO,
  AZIMUTE,
  RUMO,
  DISTANCIA,
  ALTITUDE,

  CONFRONTACAO,
  VERTICE,
  SEGUE,
  ATE,
];

/** Unidades: grafias variantes -> forma canônica. */
const UNIDADES: [RegExp, string][] = [
  [/\bmetros?\s+lineares\b/gi, "metros"],
  [/\bm\.?l\.?\b/gi, "metros"],
  [/\bmts?\.?\b/gi, "metros"],
  [/\bm[eé]tros\b/gi, "metros"],
  [/\bmetros?\s+quadrados?\b/gi, "m²"],
  [/\bm\s*2\b/gi, "m²"],
  [/\bm\s*²/gi, "m²"],
  [/\bmetro\s+quadrado\b/gi, "m²"],
  [/\bhas?\.?\b/gi, "ha"],
  [/\bhectares?\b/gi, "ha"],
  [/\balq\.?\b/gi, "alqueires"],
  [/\bquil[oô]metros?\b/gi, "km"],
];

/** Símbolos sexagesimais: grafias variantes -> ° ' ". */
const SEXAGESIMAL: [RegExp, string][] = [
  [/\b(\d{1,3})\s*(?:graus|gr\.?|g\.)\s*/gi, "$1° "],
  [/\b(\d{1,2})\s*(?:minutos?|min\.?)\s*/gi, "$1' "],
  [/\b(\d{1,2}(?:[.,]\d+)?)\s*(?:segundos?|seg\.?)\b/gi, '$1" '],
  [/[º∘˚]/g, "°"],
  [/[′’´`]/g, "'"],
  [/[″”“]/g, '"'],
];

/** Quadrantes: NO -> NW e SO -> SW (notação luso-brasileira). */
const QUADRANTES: [RegExp, string][] = [
  [/\bN\.?\s*O\.?\b/g, "NW"],
  [/\bS\.?\s*O\.?\b/g, "SW"],
  [/\bN\.?\s*E\.?\b/g, "NE"],
  [/\bS\.?\s*E\.?\b/g, "SE"],
  [/\bnoroeste\b/gi, "NW"],
  [/\bsudoeste\b/gi, "SW"],
  [/\bnordeste\b/gi, "NE"],
  [/\bsudeste\b/gi, "SE"],
];

function preservaCaixa(canonico: string, original: string): string {
  const primeira = original.trimStart().charAt(0);
  if (primeira && primeira === primeira.toUpperCase() && /[A-ZÁÂÃÉÍÓÔÕÚÇ]/.test(primeira)) {
    return canonico.charAt(0).toUpperCase() + canonico.slice(1);
  }
  return canonico;
}

/**
 * Aplica o léxico ao texto bruto do memorial.
 * Retorna o texto padronizado e a lista de padronizações efetuadas.
 */
export function normalizeMemorialText(text: string): {
  text: string;
  aplicadas: string[];
} {
  let out = text
    .replace(/\u00a0/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\r\n?/g, "\n");

  const aplicadas: string[] = [];

  for (const [re, sub] of SEXAGESIMAL) out = out.replace(re, sub);
  for (const [re, sub] of QUADRANTES) out = out.replace(re, sub);
  for (const [re, sub] of UNIDADES) {
    if (re.test(out)) aplicadas.push(`unidade → ${sub}`);
    re.lastIndex = 0;
    out = out.replace(re, sub);
  }

  for (const regra of REGRAS) {
    const re = new RegExp(`(?<![\\wÀ-ÿ])(?:${regra.variantes.join("|")})`, "gi");
    let usou = false;
    out = out.replace(re, (match) => {
      if (match.toLowerCase().replace(/\s+/g, " ") === regra.canonico) return match;
      usou = true;
      return preservaCaixa(regra.canonico, match);
    });
    if (usou) aplicadas.push(`sinônimos → "${regra.canonico}"`);
  }

  // Pontuação residual das abreviaturas expandidas. Não colapsar espaços nem
  // quebras: em memoriais tabulares, o espaçamento define as colunas.
  out = out
    .replace(/[\t ]+([,;.])/g, "$1")
    .replace(/°\s+'/g, "°")
    .replace(/'\s+"/g, "'");

  return { text: out, aplicadas };
}

/** Lista legível das padronizações do léxico, para exibição na interface. */
export function descreverLexico(): { canonico: string; exemplos: string }[] {
  return REGRAS.map((r) => ({
    canonico: r.canonico,
    exemplos: r.variantes
      .map((v) =>
        v
          .replace(/\(\?[:=!<][^)]*\)/g, "")
          .replace(/[\\^$*+?()[\]{}|]/g, "")
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter((v) => v.length > 1)
      .slice(0, 8)
      .join(", "),
  }));
}
