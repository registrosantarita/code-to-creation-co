/**
 * CheckIndex — exportação dos dados indexados nos campos do sistema do
 * Cartório (indicador real + indicador pessoal), em CSV (ponto e vírgula,
 * UTF-8 com BOM), XLSX e JSON.
 */
import type { IndexAto, IndexCadastros, IndexProprietario } from "./matricula-index-parser";
import { rotuloAto } from "./matricula-index-parser";

export type RegistroIndexado = {
  id: string;
  label: string;
  /** 2 = Matrícula; 3 = Registro Auxiliar. */
  tipo_livro: number | null;
  livro: string | null;
  matricula_numero: string | null;
  cns: string | null;
  data_abertura: string | null;
  ultima_ficha: string | null;
  ultimo_ato: string | null;
  registro_anterior: string | null;
  encerrada: boolean | null;
  matriculas_abertas: string[] | null;
  natureza: string;
  cep: string | null;
  tipo_logradouro: string | null;
  logradouro: string | null;
  numero_logradouro: string | null;
  bairro: string | null;
  lote: string | null;
  quadra: string | null;
  condominio: string | null;
  unidade: string | null;
  andar: string | null;
  bloco: string | null;
  tipo_rural: string | null;
  denominacao_rural: string | null;
  cim: string | null;
  certificacao: string | null;
  cadastros: IndexCadastros | Record<string, unknown> | null;
  area_m2: number | string | null;
  area_hectare: number | string | null;
  perimetro_m: number | string | null;
  area_construida_m2: number | string | null;
  descricao: string;
  prenotacao: string | null;
  tipo_ato: string | null;
  ato: string | null;
  data_ato: string | null;
  selo: string | null;
  adquirente: string | null;
  conjuge_adq: string | null;
  transmitente: string | null;
  conjuge_transm: string | null;
  usufrutuario: string | null;
  conjuge_usu: string | null;
  outorgante: string | null;
  conjuge_outorgante: string | null;
  outorgado: string | null;
  conjuge_outorgado: string | null;
  credor: string | null;
  devedor: string | null;
  serviente: string | null;
  dominante: string | null;
  estado_civil: string | null;
  data_casamento: string | null;
  lei_casamento: string | null;
  reg_bens: string | null;
  pacto: string | null;
  endereco: string;
  email: string | null;
  telefone: string | null;
  identificacao: string | null;
  inscricao_estadual: string | null;
  situacao_titulares: string | null;
  proprietarios: IndexProprietario[] | unknown;
  atos: IndexAto[] | unknown;
  onus: IndexAto[] | unknown;
  review_status: string;
};

export const COLUNAS_EXPORT = [
  // Indicador real
  "TIPO_LIVRO",
  "LIVRO",
  "CNS",
  "DATA_ABERTURA",
  "ULTIMAFICHA",
  "ULTIMOATO",
  "REGISTROANTERIOR",
  "ENCERRADA",
  "NATUREZA",
  "CEP",
  "TIPO_LOGRADOURO",
  "LOGRADOURO",
  "NUMERO_LOGRADOURO",
  "BAIRRO",
  "LOTE",
  "QUADRA",
  "CONDOMINIO",
  "UNIDADE",
  "ANDAR",
  "BLOCO",
  "TIPO_RURAL",
  "DENOMINACAO_RURAL",
  "CIB",
  "CIM",
  "CCIR",
  "CAR",
  "CERTIFICACAO",
  "AREA_M2",
  "AREA_HECTARE",
  "PERIMETRO",
  "AREA_CONSTRUIDA",
  // Indicador pessoal
  "PRENOTACAO",
  "TIPO_ATO",
  "ATO",
  "DATA_ATO",
  "SELO",
  "ADQUIRENTE",
  "CONJUGE_ADQ",
  "TRANSMITENTE",
  "CONJUGE_TRANSM",
  "USUFRUTUARIO",
  "CONJUGE_USU",
  "OUTORGANTE",
  "CONJUGE_OUTORGANTE",
  "OUTORGADO",
  "CONJUGE_OUTORGADO",
  "CREDOR",
  "DEVEDOR",
  "SERVIENTE",
  "DOMINANTE",
  "ESTADO_CIVIL",
  "DATA_CASAMENTO",
  "LEI_CASAMENTO",
  "REG_BENS",
  "PACTO",
  "ENDERECO",
  "EMAIL",
  "TELEFONE",
  "IDENTIFICACAO",
  "INSCRICAO_ESTADUAL",
  "SITUACAO_TITULARES",
  // Apoio ao relatório do CheckIndex
  "PROPRIETARIOS_ATIVOS",
  "PROPRIETARIOS_INATIVOS",
  "QTD_ATOS",
  "ONUS_VIGENTES",
  "ONUS_CANCELADOS",
  // Controle interno
  "SITUACAO",
] as const;

const texto = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

/** Número no padrão brasileiro: separador de milhar e casas decimais fixas. */
function numeroBr(v: unknown, casas: number): string {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

/** Datas gravadas como AAAA-MM-DD são exportadas em DD/MM/AAAA. */
function dataBr(v: unknown): string {
  const s = texto(v);
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : s;
}

/** Número do livro com separador de milhar (10345 -> 10.345). */
function livroBr(v: unknown): string {
  const s = texto(v);
  const d = s.replace(/\D/g, "");
  if (!d) return s;
  return String(Number(d)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** ENCERRADA:10.345;10.346 — matrículas abertas a partir da encerrada. */
function encerramento(r: RegistroIndexado): string {
  if (!r.encerrada) return "";
  const abertas = (r.matriculas_abertas ?? []).map((m) => texto(m)).filter(Boolean);
  return abertas.length ? `ENCERRADA:${abertas.join(";")}` : "ENCERRADA";
}

const lista = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Rótulo do ônus: R.04 (HIPOTECA) — legível pelo importador do cartório. */
const rotuloOnus = (o: IndexAto): string => {
  const base = rotuloAto(texto(o.tipo), o.numero);
  const grav = texto(o.gravame).toUpperCase();
  return grav ? `${base} (${grav})` : base;
};

/** ATIVO = titular atual; INATIVO = titular anterior. */
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
    r.tipo_livro ?? 2,
    livroBr(r.livro ?? r.matricula_numero),
    texto(r.cns),
    dataBr(r.data_abertura),
    texto(r.ultima_ficha).toUpperCase(),
    texto(r.ultimo_ato),
    texto(r.registro_anterior),
    encerramento(r),
    texto(r.natureza).toUpperCase(),
    texto(r.cep),
    texto(r.tipo_logradouro),
    texto(r.logradouro),
    texto(r.numero_logradouro),
    texto(r.bairro),
    texto(r.lote),
    texto(r.quadra),
    texto(r.condominio),
    texto(r.unidade),
    texto(r.andar),
    texto(r.bloco),
    texto(r.tipo_rural),
    texto(r.denominacao_rural),
    texto(cad['cib']),
    texto(r.cim ?? cad['cim']),
    texto(cad['ccir']),
    texto(cad['car']),
    texto(r.certificacao),
    numeroBr(r.area_m2, 2),
    numeroBr(r.area_hectare, 4),
    numeroBr(r.perimetro_m, 4),
    numeroBr(r.area_construida_m2, 2),
    texto(r.prenotacao),
    texto(r.tipo_ato).toUpperCase(),
    texto(r.ato),
    dataBr(r.data_ato),
    texto(r.selo),
    texto(r.adquirente),
    texto(r.conjuge_adq),
    texto(r.transmitente),
    texto(r.conjuge_transm),
    texto(r.usufrutuario),
    texto(r.conjuge_usu),
    texto(r.outorgante),
    texto(r.conjuge_outorgante),
    texto(r.outorgado),
    texto(r.conjuge_outorgado),
    texto(r.credor),
    texto(r.devedor),
    texto(r.serviente),
    texto(r.dominante),
    texto(r.estado_civil),
    dataBr(r.data_casamento),
    texto(r.lei_casamento),
    texto(r.reg_bens),
    texto(r.pacto),
    texto(r.endereco),
    texto(r.email),
    texto(r.telefone),
    texto(r.identificacao),
    texto(r.inscricao_estadual),
    texto(r.situacao_titulares).toUpperCase(),
    props.filter((p) => situacaoProp(p) === "ATIVO").map((p) => texto(p.nome)).filter(Boolean).join(" | "),
    props.filter((p) => situacaoProp(p) === "INATIVO").map((p) => texto(p.nome)).filter(Boolean).join(" | "),
    atos.length,
    onus.map(rotuloOnus).join(" | "),
    onusCancelados
      .map((o) => `${rotuloOnus(o)}${o.cancelado_por ? ` cancelado por ${o.cancelado_por}` : " cancelado"}`)
      .join(" | "),
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
