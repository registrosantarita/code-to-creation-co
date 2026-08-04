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
  boundary_to_boundary: "Divisa x Divisa (confrontantes)",
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

export function degToDms(value: number | string | null): string {
  if (value === null) return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  let d = Math.floor(n);
  const mFloat = (n - d) * 60;
  let m = Math.floor(mFloat);
  let s = Math.round((mFloat - m) * 60);
  if (s === 60) {
    s = 0;
    m += 1;
  }
  if (m === 60) {
    m = 0;
    d += 1;
  }
  return `${d}°${String(m).padStart(2, "0")}'${String(s).padStart(2, "0")}"`;
}
