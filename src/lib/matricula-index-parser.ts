/**
 * CheckIndex — extração determinística de dados estruturados de matrículas
 * digitalizadas. Apenas expressões regulares e normalizações: nenhum crédito
 * de IA é consumido nesta etapa.
 */

export type IndexProprietario = {
  nome: string | null;
  cpf_cnpj: string | null;
  fracao: string | null;
};

export type IndexAto = {
  tipo: string | null;
  numero: string | null;
  data: string | null;
  descricao: string;
};

export type IndexCadastros = {
  cadastro_municipal: string | null;
  cib: string | null;
  ccir: string | null;
  car: string | null;
  inscricao_estadual: string | null;
};

export type MatriculaIndexada = {
  matricula_numero: string | null;
  livro: string | null;
  folha: string | null;
  cartorio: string | null;
  data_abertura: string | null;
  natureza: "urbano" | "rural" | "nao_identificado";
  descricao: string;
  endereco: string;
  municipio: string | null;
  uf: string | null;
  area_m2: number | null;
  cadastros: IndexCadastros;
  proprietarios: IndexProprietario[];
  atos: IndexAto[];
  onus: IndexAto[];
};

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ",
  "RN","RS","RO","RR","SC","SP","SE","TO",
];

const MESES: Record<string, string> = {
  janeiro: "01", fevereiro: "02", marco: "03", "março": "03", abril: "04", maio: "05",
  junho: "06", julho: "07", agosto: "08", setembro: "09", outubro: "10",
  novembro: "11", dezembro: "12",
};

const limpar = (v: string | undefined | null): string | null => {
  const s = (v ?? "").replace(/\s+/g, " ").trim().replace(/[.,;:]+$/, "");
  return s ? s : null;
};

const digitos = (v: string): string => v.replace(/\D/g, "");

function normalizarData(bruto: string): string | null {
  const numerica = bruto.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (numerica) {
    return `${numerica[3]}-${numerica[2]!.padStart(2, "0")}-${numerica[1]!.padStart(2, "0")}`;
  }
  const extenso = bruto
    .toLowerCase()
    .match(/(\d{1,2})\s+de\s+([a-zçã]+)\s+de\s+(\d{4})/);
  if (extenso) {
    const mes = MESES[extenso[2]!];
    if (mes) return `${extenso[3]}-${mes}-${extenso[1]!.padStart(2, "0")}`;
  }
  return null;
}

/** Converte áreas em ha/alqueire/m² para metros quadrados. */
function areaParaM2(valor: string, unidade: string): number | null {
  const bruto = valor.replace(/\./g, "").replace(",", ".");
  const n = Number(bruto);
  if (!Number.isFinite(n)) return null;
  const u = unidade.toLowerCase();
  if (u.startsWith("ha") || u.includes("hectare")) return n * 10000;
  if (u.includes("alqueire")) return n * 24200;
  return n;
}

function capturar(texto: string, padroes: RegExp[]): string | null {
  for (const re of padroes) {
    const m = texto.match(re);
    if (m?.[1]) {
      const v = limpar(m[1]);
      if (v) return v;
    }
  }
  return null;
}

function extrairProprietarios(texto: string): IndexProprietario[] {
  const encontrados = new Map<string, IndexProprietario>();
  const re =
    /([A-ZÀ-Ÿ][A-Za-zÀ-ÿ'’.\- ]{5,80}?)\s*,?\s*(?:[^.\n]{0,120}?)?\b(?:CPF|C\.P\.F\.|CNPJ|C\.N\.P\.J\.)\s*(?:n[.º°]*)?\s*[:\-]?\s*([\d.\-/]{11,18})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const doc = digitos(m[2] ?? "");
    if (doc.length !== 11 && doc.length !== 14) continue;
    const nome = limpar(m[1]);
    if (!nome || nome.split(" ").length < 2) continue;
    if (!encontrados.has(doc)) {
      encontrados.set(doc, { nome: nome.toUpperCase(), cpf_cnpj: formatarDoc(doc), fracao: null });
    }
  }
  return [...encontrados.values()];
}

export function formatarDoc(doc: string): string {
  if (doc.length === 11) return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (doc.length === 14) return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return doc;
}

const ONUS_TERMOS = [
  "hipoteca", "penhora", "arresto", "usufruto", "servidão", "alienação fiduciária",
  "indisponibilidade", "arrolamento", "cláusula de inalienabilidade", "cláusula de impenhorabilidade",
  "bem de família", "reserva legal", "citação", "protesto", "compromisso de compra e venda",
];

/** Localiza os atos (R-1, AV-2, Av.3…) e classifica os que representam ônus. */
function extrairAtos(texto: string): { atos: IndexAto[]; onus: IndexAto[] } {
  const atos: IndexAto[] = [];
  const marcador = /\b(R|AV|Av|R\.|AV\.)\s*[-.\s]?\s*(\d{1,3})\b/g;
  const posicoes: { idx: number; tipo: string; numero: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = marcador.exec(texto))) {
    const tipo = (m[1] ?? "").toUpperCase().startsWith("A") ? "AV" : "R";
    posicoes.push({ idx: m.index, tipo, numero: m[2] ?? "" });
  }
  for (let i = 0; i < posicoes.length; i++) {
    const inicio = posicoes[i]!.idx;
    const fim = i + 1 < posicoes.length ? posicoes[i + 1]!.idx : Math.min(texto.length, inicio + 1200);
    const trecho = texto.slice(inicio, fim).replace(/\s+/g, " ").trim();
    if (trecho.length < 20) continue;
    atos.push({
      tipo: posicoes[i]!.tipo,
      numero: posicoes[i]!.numero,
      data: normalizarData(trecho),
      descricao: trecho.slice(0, 600),
    });
  }
  const onus = atos.filter((a) =>
    ONUS_TERMOS.some((t) => a.descricao.toLowerCase().includes(t)),
  );
  return { atos, onus };
}

export function extrairIndiceMatricula(textoBruto: string): MatriculaIndexada {
  const texto = textoBruto.replace(/\r/g, "");
  const compacto = texto.replace(/\s+/g, " ");

  const matricula = capturar(compacto, [
    /matr[ií]cula\s*(?:n[.º°]*)?\s*[:\-]?\s*([\d.]{1,12})/i,
    /\bMAT\.?\s*(?:n[.º°]*)?\s*([\d.]{1,12})/i,
  ]);

  const livro = capturar(compacto, [/livro\s*[:\-]?\s*([\w\-.º°/]{1,20})/i]);
  const folha = capturar(compacto, [/(?:folhas?|fls?\.?)\s*[:\-]?\s*([\w\-./]{1,20})/i]);
  const cartorio = capturar(compacto, [
    /((?:\d+[ºo°]?\s*)?(?:of[ií]cio|cart[óo]rio|servi[çc]o registral)[^,.;]{0,80})/i,
  ]);

  const dataBruta =
    compacto.match(/(?:aberta?|aberta em|em)\s+(\d{1,2}[/.-]\d{1,2}[/.-]\d{4})/i)?.[1] ??
    compacto.match(/(\d{1,2}\s+de\s+[a-zA-ZçÇãÃ]+\s+de\s+\d{4})/)?.[1] ??
    "";
  const dataAbertura = dataBruta ? normalizarData(dataBruta) : null;

  const ruralIndicios = /(?:im[óo]vel rural|s[íi]tio|fazenda|ch[áa]cara|gleba|ccir|incra|sigef|matr[íi]cula rural)/i;
  const urbanoIndicios = /(?:lote|quadra|apartamento|casa|im[óo]vel urbano|loteamento|rua|avenida)/i;
  const natureza: MatriculaIndexada["natureza"] = ruralIndicios.test(compacto)
    ? "rural"
    : urbanoIndicios.test(compacto)
      ? "urbano"
      : "nao_identificado";

  const areaMatch = compacto.match(
    /[áa]rea(?:\s+total|\s+do\s+terreno|\s+superficial)?\s*(?:de|:)?\s*([\d.]+,\d+|[\d.]+)\s*(m²|m2|metros quadrados|ha|hectares?|alqueires?)/i,
  );
  const areaM2 = areaMatch ? areaParaM2(areaMatch[1] ?? "", areaMatch[2] ?? "m2") : null;

  const endereco =
    capturar(compacto, [
      /((?:rua|avenida|av\.|travessa|alameda|estrada|rodovia|pra[çc]a)[^;.]{5,140})/i,
    ]) ?? "";

  const municipio = capturar(compacto, [
    /munic[íi]pio\s+de\s+([A-Za-zÀ-ÿ'’.\- ]{3,60})/i,
    /comarca\s+de\s+([A-Za-zÀ-ÿ'’.\- ]{3,60})/i,
  ]);

  const ufMatch = compacto.match(
    new RegExp(`\\b(?:estado d[eo]\\s+)?\\b(${UFS.join("|")})\\b`),
  );
  const uf = ufMatch?.[1] ?? null;

  const cadastros: IndexCadastros = {
    cadastro_municipal: capturar(compacto, [
      /(?:cadastro municipal|inscri[çc][ãa]o (?:imobili[áa]ria|municipal)|IPTU)\s*(?:n[.º°]*)?\s*[:\-]?\s*([\w.\-/]{4,30})/i,
    ]),
    // Matrículas antigas trazem "NIRF"; o cadastro atual é o CIB.
    cib: capturar(compacto, [/\b(?:CIB|NIRF)\b\s*(?:n[.º°]*)?\s*[:\-]?\s*([\w.\-/]{4,30})/i]),
    ccir: capturar(compacto, [/\bCCIR\b\s*(?:n[.º°]*)?\s*[:\-]?\s*([\w.\-/]{4,40})/i]),
    car: capturar(compacto, [/\bCAR\b\s*(?:n[.º°]*)?\s*[:\-]?\s*([\w.\-/]{6,60})/i]),
    inscricao_estadual: capturar(compacto, [
      /inscri[çc][ãa]o estadual\s*(?:n[.º°]*)?\s*[:\-]?\s*([\w.\-/]{4,30})/i,
    ]),
  };

  const descricaoMatch = compacto.match(
    /(?:im[óo]vel|descri[çc][ãa]o)\s*[:\-]?\s*([^]{40,900}?)(?:propriet[áa]ri|registro anterior|R-1|AV-1|$)/i,
  );

  const { atos, onus } = extrairAtos(texto);

  return {
    matricula_numero: matricula,
    livro,
    folha,
    cartorio,
    data_abertura: dataAbertura,
    natureza,
    descricao: limpar(descricaoMatch?.[1]) ?? "",
    endereco,
    municipio: municipio ? municipio.toUpperCase() : null,
    uf,
    area_m2: areaM2,
    cadastros,
    proprietarios: extrairProprietarios(compacto),
    atos,
    onus,
  };
}

/** Campos exibidos na revisão e exportados na ordem do layout padrão. */
export const CAMPOS_INDICE: { chave: keyof MatriculaIndexada; rotulo: string }[] = [
  { chave: "matricula_numero", rotulo: "Matrícula" },
  { chave: "livro", rotulo: "Livro" },
  { chave: "folha", rotulo: "Folha" },
  { chave: "cartorio", rotulo: "Cartório" },
  { chave: "data_abertura", rotulo: "Data de abertura" },
  { chave: "natureza", rotulo: "Natureza" },
  { chave: "endereco", rotulo: "Endereço" },
  { chave: "municipio", rotulo: "Município" },
  { chave: "uf", rotulo: "UF" },
  { chave: "area_m2", rotulo: "Área (m²)" },
  { chave: "descricao", rotulo: "Descrição" },
];
