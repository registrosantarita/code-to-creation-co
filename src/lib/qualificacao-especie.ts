/**
 * Classificação determinística da espécie do documento carregado no
 * CheckTítulo. Nenhum consumo de créditos: apenas leitura de padrões
 * textuais típicos de cada espécie registral.
 */
export const ESPECIES = [
  "matricula",
  "transcricao",
  "escritura",
  "instrumento_particular",
  "titulo_judicial",
  "requerimento",
  "certidao",
  "procuracao",
  "contrato_social",
  "outro",
  "nao_classificado",
] as const;

export type EspecieDocumento = (typeof ESPECIES)[number];

export const ESPECIE_LABEL: Record<EspecieDocumento, string> = {
  matricula: "Matrícula",
  transcricao: "Transcrição",
  escritura: "Escritura pública",
  instrumento_particular: "Instrumento particular",
  titulo_judicial: "Título judicial",
  requerimento: "Requerimento",
  certidao: "Certidão",
  procuracao: "Procuração",
  contrato_social: "Contrato social / estatuto",
  outro: "Outro documento",
  nao_classificado: "Não classificado",
};

/** Papel presumido de cada espécie na conferência. */
export function papelDaEspecie(e: EspecieDocumento): "titulo" | "matricula" {
  return e === "matricula" || e === "transcricao" ? "matricula" : "titulo";
}

const REGRAS: { especie: EspecieDocumento; peso: number; re: RegExp }[] = [
  { especie: "matricula", peso: 4, re: /matr[íi]cula\s*(?:n[.ºo°]*)?\s*[:\-]?\s*[\d.]{2,12}/i },
  { especie: "matricula", peso: 3, re: /livro\s*n[.ºo°]?\s*2\b|registro\s+geral/i },
  { especie: "matricula", peso: 2, re: /\bR[.\-]?\s?\d{1,3}[\/\-]\s?[\d.]{2,12}\b|\bAV[.\-]?\s?\d{1,3}[\/\-]/i },
  { especie: "transcricao", peso: 4, re: /transcri[çc][ãa]o\s*(?:n[.ºo°]*)?\s*[:\-]?\s*[\d.]{2,12}/i },
  { especie: "escritura", peso: 5, re: /escritura\s+p[úu]blica/i },
  { especie: "escritura", peso: 3, re: /tabeli(?:on|ã)ato|livro\s+de\s+notas|notas?\s+do\s+\d+/i },
  { especie: "instrumento_particular", peso: 5, re: /instrumento\s+particular/i },
  { especie: "instrumento_particular", peso: 3, re: /contrato\s+particular|compromisso\s+de\s+compra\s+e\s+venda/i },
  { especie: "titulo_judicial", peso: 5, re: /carta\s+de\s+(?:arremata[çc][ãa]o|adjudica[çc][ãa]o|senten[çc]a)|formal\s+de\s+partilha|mandado\s+judicial/i },
  { especie: "titulo_judicial", peso: 2, re: /ju[íi]zo\s+de\s+direito|vara\s+(?:c[íi]vel|de\s+fam[íi]lia)|processo\s+n[.ºo°]/i },
  { especie: "requerimento", peso: 4, re: /\brequer(?:imento|o)\b|vem,?\s+respeitosamente/i },
  { especie: "certidao", peso: 4, re: /certid[ãa]o\b/i },
  { especie: "procuracao", peso: 5, re: /procura[çc][ãa]o\b|outorga\s+poderes/i },
  { especie: "contrato_social", peso: 4, re: /contrato\s+social|estatuto\s+social|junta\s+comercial/i },
];

/** Espécie sugerida a partir do texto extraído (nunca lança). */
export function classificarEspecie(texto: string, nomeArquivo?: string): EspecieDocumento {
  const alvo = `${nomeArquivo ?? ""}\n${(texto ?? "").slice(0, 20000)}`;
  const pontos = new Map<EspecieDocumento, number>();
  for (const r of REGRAS) {
    if (!r.re.test(alvo)) continue;
    pontos.set(r.especie, (pontos.get(r.especie) ?? 0) + r.peso);
  }
  if (!pontos.size) return "nao_classificado";
  return [...pontos.entries()].sort((a, b) => b[1] - a[1])[0]![0];
}
