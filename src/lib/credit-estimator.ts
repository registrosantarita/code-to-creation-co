/**
 * Estimador de créditos de IA.
 *
 * Base empírica medida no Lovable AI Gateway (google/gemini-3.6-flash),
 * com o mesmo prompt de OCR usado em src/lib/ocr.server.ts:
 * ~0,058 crédito por página digitalizada (≈17 páginas por crédito).
 *
 * Somente documentos SEM camada de texto (PDFs digitalizados e imagens)
 * acionam OCR. Todos os demais formatos são processados por parsers locais
 * determinísticos, com custo zero de IA.
 */

export const CREDITOS_POR_PAGINA_OCR = 0.058;
/** Fator de incerteza aplicado à faixa (páginas densas x páginas simples). */
/**
 * Créditos por token, derivado da mesma medição:
 * 2.889 tokens (1.182 entrada + 1.707 saída) ≈ 0,058 crédito.
 */
export const CREDITOS_POR_TOKEN = 0.0000201;

export function creditosDeTokens(totalTokens: number): number {
  return Math.round(totalTokens * CREDITOS_POR_TOKEN * 100000) / 100000;
}

export const FATOR_MIN = 0.6;
export const FATOR_MAX = 1.8;

/** Peso médio de uma página, em bytes, por tipo de arquivo. */
const BYTES_POR_PAGINA: Record<string, number> = {
  pdf: 180_000,
  tif: 900_000,
  tiff: 900_000,
  png: 700_000,
  jpg: 400_000,
  jpeg: 400_000,
  webp: 300_000,
};

const EXT_IMAGEM = ["png", "jpg", "jpeg", "tif", "tiff", "webp"];
const EXT_SEM_IA = [
  "txt",
  "csv",
  "md",
  "docx",
  "xlsx",
  "xls",
  "kml",
  "kmz",
  "geojson",
  "json",
  "dwg",
  "dxf",
];

export type ProbabilidadeOcr = "nenhuma" | "possivel" | "certa";

export type EstimativaCreditos = {
  extensao: string;
  tamanhoBytes: number;
  /** Páginas estimadas (imagens contam como 1). */
  paginasEstimadas: number;
  probabilidadeOcr: ProbabilidadeOcr;
  creditosMin: number;
  creditosMax: number;
  /** Estimativa central, usada para somatórios. */
  creditosEsperados: number;
  observacao: string;
};

export function extensaoDe(nome: string): string {
  const parte = nome.split(".").pop();
  return parte && parte !== nome ? parte.toLowerCase() : "";
}

export function estimarPaginas(extensao: string, tamanhoBytes: number): number {
  if (EXT_IMAGEM.includes(extensao)) return 1;
  const porPagina = BYTES_POR_PAGINA[extensao];
  if (!porPagina) return 0;
  return Math.max(1, Math.round(tamanhoBytes / porPagina));
}

export function estimarCreditos(
  nomeArquivo: string,
  tamanhoBytes: number,
): EstimativaCreditos {
  const extensao = extensaoDe(nomeArquivo);
  const paginas = estimarPaginas(extensao, tamanhoBytes);

  let probabilidade: ProbabilidadeOcr = "nenhuma";
  let observacao =
    "Processamento local determinístico — sem consumo de créditos de IA.";

  if (EXT_IMAGEM.includes(extensao)) {
    probabilidade = "certa";
    observacao =
      "Imagem sem camada de texto: o OCR assistido por IA será acionado.";
  } else if (extensao === "pdf") {
    probabilidade = "possivel";
    observacao =
      "PDF com texto nativo é lido localmente (custo zero). O OCR só entra se o arquivo for digitalizado.";
  } else if (!EXT_SEM_IA.includes(extensao) && extensao !== "") {
    probabilidade = "possivel";
    observacao =
      "Formato não mapeado: pode cair no OCR caso não haja texto extraível.";
  }

  const base = probabilidade === "nenhuma" ? 0 : paginas * CREDITOS_POR_PAGINA_OCR;
  const min = probabilidade === "possivel" ? 0 : base * FATOR_MIN;
  const max = base * FATOR_MAX;

  return {
    extensao,
    tamanhoBytes,
    paginasEstimadas: probabilidade === "nenhuma" ? 0 : paginas,
    probabilidadeOcr: probabilidade,
    creditosMin: arred(min),
    creditosMax: arred(max),
    creditosEsperados: arred(base),
    observacao,
  };
}

export function somarEstimativas(
  itens: EstimativaCreditos[],
): { creditosMin: number; creditosMax: number; paginas: number } {
  return itens.reduce(
    (acc, i) => ({
      creditosMin: arred(acc.creditosMin + i.creditosMin),
      creditosMax: arred(acc.creditosMax + i.creditosMax),
      paginas: acc.paginas + i.paginasEstimadas,
    }),
    { creditosMin: 0, creditosMax: 0, paginas: 0 },
  );
}

export function fmtCreditos(v: number): string {
  if (v === 0) return "0";
  if (v < 0.01) return "<0,01";
  return v.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function arred(v: number): number {
  return Math.round(v * 1000) / 1000;
}
