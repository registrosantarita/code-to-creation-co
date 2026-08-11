export const STATUS_ANALISE: Record<string, string> = {
  draft: "Rascunho",
  processing: "Processando",
  ready: "Pronta",
  review_pending: "Aguardando revisão",
  completed: "Concluída",
  archived: "Arquivada",
  error: "Erro",
};

export const STATUS_DOCUMENTO: Record<string, string> = {
  uploaded: "Recebido",
  parsed: "Extraído",
  failed: "Falha na extração",
  archived: "Arquivado",
};

export const CATEGORIA_DOCUMENTO: Record<string, string> = {
  memorial: "Memorial descritivo",
  matricula: "Matrícula",
  escritura: "Escritura",
  planta: "Planta",
  norma: "Norma",
  tabela_tecnica: "Tabela técnica",
  imagem_tecnica: "Imagem técnica",
  documento_complementar: "Documento complementar",
  nao_classificado: "Não classificado",
};

export const TIPO_COMPARACAO: Record<string, string> = {
  memorial_to_memorial: "Memorial x Memorial",
  memorial_to_plan: "Memorial x Planta",
  plan_to_plan: "Planta x Planta",
  memorial_to_title: "Memorial x Escritura / Título",
  boundary_to_boundary: "Divisa comum entre vizinhos",
  memorial_to_registry: "Memorial x Matrícula",
  custom: "Comparação personalizada",
};

export const CLASSIFICACAO: Record<
  string,
  { label: string; tone: "success" | "warning" | "destructive" | "muted" }
> = {
  compatible: { label: "Compatível", tone: "success" },
  compatible_with_remarks: { label: "Compatível com ressalvas", tone: "warning" },
  incompatible: { label: "Incompatível", tone: "destructive" },
  inconclusive: { label: "Inconclusivo", tone: "muted" },
};

export const SEVERIDADE: Record<
  string,
  { label: string; tone: "success" | "warning" | "destructive" | "muted" }
> = {
  critical: { label: "Crítico", tone: "destructive" },
  moderate: { label: "Moderado", tone: "warning" },
  informative: { label: "Informativo", tone: "success" },
  inconclusive: { label: "Inconclusivo", tone: "muted" },
};

export const TONE_CLASS: Record<string, string> = {
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/50 bg-warning/15 text-warning-foreground",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
};

export function fmtNum(value: number | string | null, digits = 2): string {
  if (value === null || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/**
 * Ângulo em grau/minuto/segundo respeitando a precisão do documento de origem:
 * não completa casas que não foram informadas (45°12' permanece 45°12').
 */
/** Decompõe graus decimais em g/m/s sem arredondar o que não existe. */
function decompor(abs: number, casasSeg: number) {
  let d = Math.floor(abs);
  const mFloat = (abs - d) * 60;
  let m = Math.floor(mFloat + 1e-9);
  const fator = 10 ** casasSeg;
  let s = Math.round((mFloat - m) * 60 * fator) / fator;
  if (s >= 60) {
    s -= 60;
    m += 1;
  }
  if (m >= 60) {
    m -= 60;
    d += 1;
  }
  return { d, m, s };
}

/** Segundos sem zeros artificiais: 24,443 / 07 / 12,5 */
function segundosStr(s: number, casas: number): string {
  const txt = s.toFixed(casas);
  const [int, frac = ""] = txt.split(".");
  const base = int!.padStart(2, "0");
  const fracLimpa = frac.replace(/0+$/, "");
  return fracLimpa ? `${base},${fracLimpa}` : base;
}

export function degToDms(value: number | string | null): string {
  if (value === null) return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  const sinal = n < 0 ? "-" : "";
  let { d, m, s } = decompor(Math.abs(n), 2);
  // Ruído de conversão: segundos praticamente inteiros voltam a ser inteiros.
  const inteiro = Math.round(s);
  if (Math.abs(s - inteiro) < 0.02) s = inteiro;
  if (s >= 60) {
    s -= 60;
    m += 1;
  }
  if (m >= 60) {
    m -= 60;
    d += 1;
  }
  if (m === 0 && s === 0) return `${sinal}${d}°`;
  const mm = String(m).padStart(2, "0");
  if (s === 0) return `${sinal}${d}°${mm}'`;
  return `${sinal}${d}°${mm}'${segundosStr(s, 2)}"`;
}


/**
 * Latitude/longitude em grau, minuto e segundo, com sinal e hemisfério.
 * Os segundos voltam exatamente com as casas do documento de origem: o valor
 * decimal é reconvertido e "encaixado" na menor precisão que o reproduz,
 * eliminando o ruído de ponto flutuante (…32,956001 → …32,956).
 */
export function coordToDms(
  value: number | string | null | undefined,
  eixo: "lat" | "lon",
): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  const negativo = n < 0;
  const hemisferio = eixo === "lat" ? (negativo ? "S" : "N") : negativo ? "W" : "E";
  const { d, m, s } = decompor(Math.abs(n), 6);
  // Menor número de casas de segundo que reproduz o valor informado.
  let casas = 6;
  for (let c = 0; c <= 6; c++) {
    if (Math.abs(s - Number(s.toFixed(c))) < 5e-4) {
      casas = c;
      break;
    }
  }
  const sinal = negativo ? "-" : "";
  return `${sinal}${d}°${String(m).padStart(2, "0")}'${segundosStr(s, casas)}"${hemisferio}`;
}




/** Casas decimais efetivamente informadas na medida de origem (máx. 6). */
export function casasDecimais(value: number | string | null): number {
  if (value === null || value === "") return 0;
  const n = typeof value === "string" ? Number(String(value).replace(",", ".")) : value;
  if (!Number.isFinite(n)) return 0;
  const s = String(Number(n.toFixed(6)));
  const i = s.indexOf(".");
  return i < 0 ? 0 : s.length - i - 1;
}

/**
 * Medida (distância, altitude, área) com a mesma precisão do documento de
 * origem: mínimo de 2 casas, no máximo as casas efetivamente informadas.
 */
export function fmtMedida(value: number | string | null, min = 2, max = 6): string {
  if (value === null || value === "") return "—";
  const n = typeof value === "string" ? Number(String(value).replace(",", ".")) : value;
  if (!Number.isFinite(n)) return "—";
  const d = Math.min(max, Math.max(min, casasDecimais(n)));
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

/** Ângulo/azimute sempre em grau, minuto e segundo. */
export function fmtAngulo(value: number | string | null): string {
  return degToDms(value === "" ? null : (value as number | string | null));
}

/** Cor de identificação de cada documento comparado (A, B, C, D, ...). */
const DOC_CLASSES = [
  "doc-a",
  "doc-b",
  "doc-c",
  "doc-d",
  "doc-e",
  "doc-f",
  "doc-g",
  "doc-h",
] as const;

export function docColor(indice: number): string {
  return DOC_CLASSES[indice % DOC_CLASSES.length]!;
}

/** Letra do documento na ordem de comparação: 0 → A, 1 → B, ... */
export function docLetra(indice: number): string {
  return String.fromCharCode(65 + (indice % 26));
}
