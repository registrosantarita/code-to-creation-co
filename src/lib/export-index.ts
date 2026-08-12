/**
 * CheckIndex — exportação dos dados indexados em formatos legíveis por
 * sistemas de cartório: CSV (delimitado por ponto e vírgula, UTF-8 com BOM),
 * XLSX e JSON.
 */
import type { IndexAto, IndexCadastros, IndexProprietario } from "./matricula-index-parser";

export type RegistroIndexado = {
  id: string;
  label: string;
  matricula_numero: string | null;
  livro: string | null;
  folha: string | null;
  cartorio: string | null;
  data_abertura: string | null;
  natureza: string;
  descricao: string;
  endereco: string;
  municipio: string | null;
  uf: string | null;
  area_m2: number | string | null;
  area_hectare: number | string | null;
  perimetro_m: number | string | null;
  area_construida_m2: number | string | null;
  cep: string | null;
  tipo_logradouro: string | null;
  logradouro: string | null;
  numero_logradouro: string | null;
  tipo_rural: string | null;
  denominacao_rural: string | null;
  lote: string | null;
  quadra: string | null;
  cim: string | null;
  cadastros: IndexCadastros | Record<string, unknown> | null;
  proprietarios: IndexProprietario[] | unknown;
  atos: IndexAto[] | unknown;
  onus: IndexAto[] | unknown;
  ultima_ficha: string | null;
  certificacao: string | null;
  registro_anterior: string | null;
  encerrada: boolean | null;
  matriculas_abertas: string[] | null;
  adquirente: string | null;
  conjuge_adq: string | null;
  transmitente: string | null;
  conjuge_transm: string | null;
  usufrutuario: string | null;
  conjuge_usu: string | null;
  prenotacao: string | null;
  ato: string | null;
  data_ato: string | null;
  selo: string | null;
  review_status: string;
};

export const COLUNAS_EXPORT = [
  "MATRICULA",
  "LIVRO",
  "FOLHA",
  "CARTORIO",
  "DATA_ABERTURA",
  "NATUREZA",
  "ENDERECO",
  "CEP",
  "TIPO_LOGRADOURO",
  "LOGRADOURO",
  "NUMERO_LOGRADOURO",
  "TIPO_RURAL",
  "DENOMINACAO_RURAL",
  "LOTE",
  "QUADRA",
  "CIM",
  "MUNICIPIO",
  "UF",
  "AREA_M2",
  "AREA_HECTARE",
  "PERIMETRO",
  "AREA_CONSTRUIDA",
  "CADASTRO_MUNICIPAL",
  "CIB",
  "CCIR",
  "CAR",
  "INSCRICAO_ESTADUAL",
  "PROPRIETARIOS",
  "DOCUMENTOS_PROPRIETARIOS",
  "SITUACAO_PROPRIETARIOS",
  "PROPRIETARIOS_ATIVOS",
  "PROPRIETARIOS_INATIVOS",
  "QTD_ATOS",
  "ONUS",
  "ONUS_CANCELADOS",
  "SITUACAO_ONUS",
  "ULTIMAFICHA",
  "CERTIFICACAO",
  "REGISTROANTERIOR",
  "ENCERRADA",
  "ADQUIRENTE",
  "CONJUGE_ADQ",
  "TRANSMITENTE",
  "CONJUGE_TRANSM",
  "USUFRUTUARIO",
  "CONJUGE_USU",
  "PRENOTACAO",
  "ATO",
  "DATA_ATO",
  "SELO",
  "SITUACAO",
] as const;

const numero = (v: unknown): string | number =>
  v === null || v === undefined || v === "" ? "" : Number(v);

const texto = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

/** ENCERRADA:10.345;10.346 — matrículas abertas a partir da encerrada. */
function encerramento(r: RegistroIndexado): string {
  if (!r.encerrada) return "";
  const abertas = (r.matriculas_abertas ?? []).map((m) => texto(m)).filter(Boolean);
  return abertas.length ? `ENCERRADA:${abertas.join(";")}` : "ENCERRADA";
}

const lista = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Rótulo do ônus: R.04 (HIPOTECA) — legível pelo importador do cartório. */
const rotuloOnus = (o: IndexAto): string => {
  const num = String(o.numero ?? "").padStart(2, "0");
  const base = `${texto(o.tipo)}.${num}`;
  const grav = texto(o.gravame).toUpperCase();
  return grav ? `${base} (${grav})` : base;
};

/** ATIVO = proprietário atual; INATIVO = titular anterior. */
const situacaoProp = (p: IndexProprietario): "ATIVO" | "INATIVO" =>
  p.situacao === "INATIVO" ? "INATIVO" : "ATIVO";

export function linhaDoRegistro(r: RegistroIndexado): (string | number)[] {
  const cad = (r.cadastros ?? {}) as Record<string, unknown>;
  const props = lista<IndexProprietario>(r.proprietarios);
  const todosOnus = lista<IndexAto>(r.onus);
  const onus = todosOnus.filter((o) => o.vigente !== false);
  const onusCancelados = todosOnus.filter((o) => o.vigente === false);
  const atos = lista<IndexAto>(r.atos);

  return [
    texto(r.matricula_numero),
    texto(r.livro),
    texto(r.folha),
    texto(r.cartorio),
    texto(r.data_abertura),
    texto(r.natureza).toUpperCase(),
    texto(r.endereco),
    texto(r.cep),
    texto(r.tipo_logradouro),
    texto(r.logradouro),
    texto(r.numero_logradouro),
    texto(r.tipo_rural),
    texto(r.denominacao_rural),
    texto(r.lote),
    texto(r.quadra),
    texto(r.cim),
    texto(r.municipio),
    texto(r.uf),
    numero(r.area_m2),
    numero(r.area_hectare),
    numero(r.perimetro_m),
    numero(r.area_construida_m2),
    texto(cad['cadastro_municipal']),
    texto(cad['cib']),
    texto(cad['ccir']),
    texto(cad['car']),
    texto(cad['inscricao_estadual']),
    props.map((p) => texto(p.nome)).filter(Boolean).join(" | "),
    props.map((p) => texto(p.cpf_cnpj)).filter(Boolean).join(" | "),
    props.map(situacaoProp).join(" | "),
    props.filter((p) => situacaoProp(p) === "ATIVO").map((p) => texto(p.nome)).filter(Boolean).join(" | "),
    props.filter((p) => situacaoProp(p) === "INATIVO").map((p) => texto(p.nome)).filter(Boolean).join(" | "),
    atos.length,
    onus.map(rotuloOnus).join(" | "),
    onusCancelados
      .map((o) => `${rotuloOnus(o)}${o.cancelado_por ? ` cancelado por ${o.cancelado_por}` : " cancelado"}`)
      .join(" | "),
    [...onus.map(() => "ATIVO"), ...onusCancelados.map(() => "INATIVO")].join(" | "),
    texto(r.ultima_ficha).toUpperCase(),
    texto(r.certificacao),
    texto(r.registro_anterior),
    encerramento(r),
    texto(r.adquirente),
    texto(r.conjuge_adq),
    texto(r.transmitente),
    texto(r.conjuge_transm),
    texto(r.usufrutuario),
    texto(r.conjuge_usu),
    texto(r.prenotacao),
    texto(r.ato),
    texto(r.data_ato),
    texto(r.selo),
    texto(r.review_status).toUpperCase(),
  ];
}

function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportarCsv(registros: RegistroIndexado[], nomeArquivo: string) {
  const escape = (v: string | number) => {
    const s = String(v).replace(/"/g, '""').replace(/\r?\n/g, " ");
    return `"${s}"`;
  };
  const linhas = [
    COLUNAS_EXPORT.join(";"),
    ...registros.map((r) => linhaDoRegistro(r).map(escape).join(";")),
  ];
  baixar(new Blob(["\uFEFF" + linhas.join("\r\n")], { type: "text/csv;charset=utf-8" }), nomeArquivo);
}

export function exportarJson(registros: RegistroIndexado[], nomeArquivo: string) {
  const payload = registros.map((r) =>
    Object.fromEntries(COLUNAS_EXPORT.map((c, i) => [c, linhaDoRegistro(r)[i] ?? ""])),
  );
  baixar(
    new Blob([JSON.stringify({ gerado_em: new Date().toISOString(), registros: payload }, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
    nomeArquivo,
  );
}

export async function exportarXlsx(registros: RegistroIndexado[], nomeArquivo: string) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Índice");
  ws.addRow([...COLUNAS_EXPORT]);
  ws.getRow(1).font = { name: "Montserrat", size: 9, bold: true };
  for (const r of registros) ws.addRow(linhaDoRegistro(r));
  ws.eachRow((row, i) => {
    if (i > 1) row.font = { name: "Montserrat", size: 9 };
  });
  ws.columns.forEach((c) => {
    c.width = 22;
  });
  const buffer = await wb.xlsx.writeBuffer();
  baixar(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    nomeArquivo,
  );
}
