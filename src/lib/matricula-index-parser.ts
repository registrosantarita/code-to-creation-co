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
  /** Gravame identificado (hipoteca, penhora…), quando o ato for ônus. */
  gravame?: string | null;
  /** false quando houver averbação de cancelamento/baixa do gravame. */
  vigente?: boolean;
  /** Ato que cancelou o gravame (ex.: AV-7). */
  cancelado_por?: string | null;
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
  /** Área em hectares (literal do documento, ou convertida de m²). */
  area_hectare: number | null;
  /** Perímetro em metros. */
  perimetro_m: number | null;
  /** Área construída/edificada em m². */
  area_construida_m2: number | null;
  /** Endereço decomposto (urbanos) e identificação rural. */
  cep: string | null;
  tipo_logradouro: string | null;
  logradouro: string | null;
  numero_logradouro: string | null;
  tipo_rural: string | null;
  denominacao_rural: string | null;
  lote: string | null;
  quadra: string | null;
  /** Cadastro imobiliário municipal. */
  cim: string | null;
  /** Última ficha física da matrícula (alfanumérico: 6, 6V…). */
  ultima_ficha: string | null;
  /** Código de certificação do INCRA (rurais georreferenciados). */
  certificacao: string | null;
  /** Ato de origem, no formato R.05/M.5.456, AV.08/M.1.234, TR.7.908/L3.-Q. */
  registro_anterior: string | null;
  encerrada: boolean;
  /** Matrículas abertas a partir desta, quando encerrada. */
  matriculas_abertas: string[];
  /** Partes do último ato registrado. */
  adquirente: string | null;
  conjuge_adq: string | null;
  transmitente: string | null;
  conjuge_transm: string | null;
  usufrutuario: string | null;
  conjuge_usu: string | null;
  /** Dados do protocolo/ato. */
  prenotacao: string | null;
  ato: string | null;
  data_ato: string | null;
  selo: string | null;
  cadastros: IndexCadastros;
  proprietarios: IndexProprietario[];
  atos: IndexAto[];
  /** Ônus ainda vigentes (cancelados são excluídos daqui). */
  onus: IndexAto[];
  /** Ônus baixados/cancelados, mantidos para auditoria. */
  onus_cancelados: IndexAto[];

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

/** Linguagem padronizada de baixa/cancelamento averbada nas matrículas. */
const CANCELAMENTO_TERMOS = [
  "cancel", // cancelo, cancelada, cancelamento
  "baixa d", "baixa da", "baixa do", "dou baixa", "procedo à baixa", "procedo a baixa",
  "extin", // extinção, extinto o usufruto
  "levantamento", "liberação", "liberacao", "libero", "remissão", "remissao",
  "insubsist", "sem efeito", "nada consta", "quitação da dívida", "quitacao da divida",
];

const ehCancelamento = (t: string): boolean => {
  const s = t.toLowerCase();
  return CANCELAMENTO_TERMOS.some((c) => s.includes(c));
};

/** Referências a atos anteriores citadas no corpo da averbação (R-4, AV.7…). */
function referenciasInternas(descricao: string): string[] {
  return [...descricao.matchAll(/\b(R|AV|Av|R\.|AV\.)\s*[-.\s]?\s*(\d{1,3})\b/g)]
    .map((m) => `${(m[1] ?? "").toUpperCase().startsWith("A") ? "AV" : "R"}-${m[2]}`)
    .slice(1); // o primeiro marcador é o próprio número do ato
}

/** Gravame identificado no texto do ato (hipoteca, penhora…). */
function gravameDe(descricao: string): string | null {
  const s = descricao.toLowerCase();
  return ONUS_TERMOS.find((t) => s.includes(t)) ?? null;
}

/**
 * Marca cada ônus como vigente ou cancelado. O cancelamento é ligado ao ato de
 * origem pela referência interna ("cancelo o R-4"); sem referência explícita,
 * casa-se pelo mesmo tipo de gravame ainda vigente mais recente.
 */
function aplicarVigencia(atos: IndexAto[]): { onus: IndexAto[]; onusCancelados: IndexAto[] } {
  const onus = atos
    .filter((a) => !ehCancelamento(a.descricao) && gravameDe(a.descricao))
    .map<IndexAto>((a) => ({
      ...a,
      gravame: gravameDe(a.descricao),
      vigente: true,
      cancelado_por: null,
    }));

  const chave = (a: IndexAto) => `${a.tipo}-${a.numero}`;

  for (const ato of atos) {
    if (!ehCancelamento(ato.descricao)) continue;
    const refs = referenciasInternas(ato.descricao);
    const alvos = onus.filter((o) => refs.includes(chave(o)));
    if (alvos.length) {
      for (const alvo of alvos) {
        alvo.vigente = false;
        alvo.cancelado_por = chave(ato);
      }
      continue;
    }
    const grav = gravameDe(ato.descricao);
    if (!grav) continue;
    const candidatos = onus.filter((o) => o.vigente !== false && o.gravame === grav);
    const alvo = candidatos.length ? candidatos[candidatos.length - 1] : null;
    if (alvo) {
      alvo.vigente = false;
      alvo.cancelado_por = chave(ato);
    }
  }

  return {
    onus: onus.filter((o) => o.vigente !== false),
    onusCancelados: onus.filter((o) => o.vigente === false),
  };
}

/** Localiza os atos (R-1, AV-2, Av.3…) e classifica os que representam ônus. */
function extrairAtos(texto: string): { atos: IndexAto[]; onus: IndexAto[]; onusCancelados: IndexAto[] } {
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
  return { atos, ...aplicarVigencia(atos) };
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
  const partes = extrairPartes(compacto);
  const ultimoAto = atos.length ? atos[atos.length - 1]! : null;

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
    area_hectare: extrairHectares(compacto, areaM2),
    perimetro_m: extrairPerimetro(compacto),
    area_construida_m2: extrairAreaConstruida(compacto),
    ...extrairLocalizacao(compacto, endereco, cadastros),
    ultima_ficha: extrairUltimaFicha(compacto),
    certificacao: extrairCertificacao(compacto),
    registro_anterior: extrairRegistroAnterior(compacto),
    encerrada: ENCERRAMENTO.test(compacto),
    matriculas_abertas: extrairMatriculasAbertas(compacto),
    ...partes,
    prenotacao: extrairPrenotacao(compacto),
    ato: ultimoAto ? `${ultimoAto.tipo}-${ultimoAto.numero}` : null,
    data_ato: ultimoAto?.data ?? null,
    selo: extrairSelo(compacto),
    cadastros,
    proprietarios: extrairProprietarios(compacto),
    atos,
    onus,
  };
}

/** Nome próprio logo após um rótulo de parte (adquirente, transmitente…). */
function nomeApos(texto: string, rotulos: string[]): string | null {
  for (const rot of rotulos) {
    const m = texto.match(
      new RegExp(`${rot}\\s*(?:\\(a\\))?\\s*[:\\-]?\\s*([A-ZÀ-Ÿ][A-Za-zÀ-ÿ'’.\\- ]{5,80})`, "i"),
    );
    const v = limpar(m?.[1]);
    if (v && v.split(" ").length >= 2) return v.toUpperCase();
  }
  return null;
}

/** Cônjuge citado na sequência do nome da parte ("casado com FULANA"). */
function conjugeDe(texto: string, nome: string | null): string | null {
  if (!nome) return null;
  const idx = texto.toUpperCase().indexOf(nome);
  if (idx < 0) return null;
  const janela = texto.slice(idx, idx + 400);
  const m = janela.match(
    /(?:casad[oa]\s+(?:com|de)|c[ôo]njuge|e\s+sua\s+(?:esposa|mulher)|e\s+seu\s+marido)\s*[:\-]?\s*([A-ZÀ-Ÿ][A-Za-zÀ-ÿ'’.\- ]{5,80})/i,
  );
  const v = limpar(m?.[1]);
  return v && v.split(" ").length >= 2 ? v.toUpperCase() : null;
}

function extrairPartes(texto: string) {
  const adquirente = nomeApos(texto, [
    "adquirente",
    "comprador(?:a)?",
    "outorgad[oa] comprador(?:a)?",
    "cession[áa]ri[oa]",
  ]);
  const transmitente = nomeApos(texto, [
    "transmitente",
    "vendedor(?:a)?",
    "outorgante vendedor(?:a)?",
    "cedente",
  ]);
  const usufrutuario = nomeApos(texto, ["usufrutu[áa]ri[oa]", "usufruto\\s+em\\s+favor\\s+de"]);
  return {
    adquirente,
    conjuge_adq: conjugeDe(texto, adquirente),
    transmitente,
    conjuge_transm: conjugeDe(texto, transmitente),
    usufrutuario,
    conjuge_usu: conjugeDe(texto, usufrutuario),
  };
}

function extrairPrenotacao(texto: string): string | null {
  return capturar(texto, [
    /(?:prenota[çc][ãa]o|protocolo)\s*(?:sob\s*(?:o\s*)?)?(?:n[.º°]*)?\s*[:\-]?\s*([\d.\-/]{2,20})/i,
  ]);
}

function extrairSelo(texto: string): string | null {
  return capturar(texto, [
    /selo\s*(?:digital|de\s+fiscaliza[çc][ãa]o)?\s*(?:n[.º°]*)?\s*[:\-]?\s*([A-Z0-9.\-]{6,40})/i,
  ]);
}

/** Formata número de matrícula com separador de milhar (10345 -> 10.345). */
export function formatarNumeroMatricula(valor: string): string {
  const d = digitos(valor);
  if (!d) return valor.trim();
  return String(Number(d)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const ENCERRAMENTO = /\bencerrad[ao]\b/i;

function extrairUltimaFicha(texto: string): string | null {
  return capturar(texto, [
    /(?:[úu]ltima\s+)?ficha\s*(?:n[.º°]*)?\s*[:\-]?\s*(\d{1,4}\s*[Vv]?)\b/i,
  ])?.replace(/\s+/g, "").toUpperCase() ?? null;
}

function extrairCertificacao(texto: string): string | null {
  return capturar(texto, [
    /certifica[çc][ãa]o\s*(?:do\s*)?(?:INCRA|SIGEF)?\s*(?:sob\s*(?:o\s*)?)?(?:n[.º°]*)?\s*[:\-]?\s*([\w.\-/]{6,60})/i,
    /c[óo]digo\s+(?:da\s+)?certifica[çc][ãa]o\s*[:\-]?\s*([\w.\-/]{6,60})/i,
  ]);
}

/** Monta o ato de origem no padrão R.05/M.5.456, AV.08/M.1.234 ou TR.7.908/L3.-Q. */
function extrairRegistroAnterior(texto: string): string | null {
  const janela =
    texto.match(/registro\s+anterior[^]{0,200}/i)?.[0] ??
    texto.match(/(?:oriund[ao]|proveniente|desmembrad[ao])\s+d[ae][^]{0,200}/i)?.[0] ??
    "";
  if (!janela) return null;

  const ato = janela.match(/\b(R|AV|TR)\b[.\-\s]*\s*(\d{1,6})/i);
  const origem =
    janela.match(/\b(?:matr[íi]cula|M)\b[.\s]*(?:n[.º°]*)?\s*([\d.]{1,12})/i) ??
    janela.match(/\btranscri[çc][ãa]o\b[.\s]*(?:n[.º°]*)?\s*([\d.]{1,12})/i);
  if (!ato && !origem) return null;

  const tipo = (ato?.[1] ?? "R").toUpperCase();
  const numeroAto = ato?.[2] ? formatarNumeroMatricula(ato[2]) : "";
  const alvo = origem?.[1] ? `M.${formatarNumeroMatricula(origem[1])}` : "";
  const esquerda = numeroAto ? `${tipo}.${ato?.[2]?.length === 1 ? `0${numeroAto}` : numeroAto}` : tipo;
  return alvo ? `${esquerda}/${alvo}` : esquerda;
}

function extrairMatriculasAbertas(texto: string): string[] {
  if (!ENCERRAMENTO.test(texto)) return [];
  const janela = texto.match(/encerrad[ao][^]{0,320}/i)?.[0] ?? "";
  const numeros = [...janela.matchAll(/\bn?[.º°]*\s*([\d]{1,3}(?:\.\d{3})+|\d{3,8})\b/g)].map((m) =>
    formatarNumeroMatricula(m[1] ?? ""),
  );
  return [...new Set(numeros)];
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
  { chave: "ultima_ficha", rotulo: "Última ficha" },
  { chave: "certificacao", rotulo: "Certificação (INCRA)" },
  { chave: "registro_anterior", rotulo: "Registro anterior" },
  { chave: "descricao", rotulo: "Descrição" },
];

const TIPOS_LOGRADOURO = [
  "rua","avenida","alameda","travessa","praça","praca","rodovia","estrada","via","viela",
  "largo","beco","passagem","quadra","conjunto","servidão","servidao","ladeira","marginal",
];

const TIPOS_RURAL = [
  "fazenda","sítio","sitio","chácara","chacara","gleba","lote rural","sesmaria","estância",
  "estancia","haras","granja","colônia","colonia","quinhão","quinhao","retiro","povoado",
];

/**
 * Decompõe o endereço urbano (CEP, tipo/nome/número de logradouro, lote e quadra)
 * e a identificação rural (tipo e denominação), além do CIM.
 */
function extrairLocalizacao(
  compacto: string,
  endereco: string,
  cadastros: IndexCadastros,
) {
  const base = `${endereco} ${compacto}`;

  const cep = capturar(base, [/\bCEP\s*[:\-]?\s*(\d{5}-?\d{3})\b/i, /\b(\d{5}-\d{3})\b/]);

  const alt = TIPOS_LOGRADOURO.map((t) => t.replace(/ /g, "\\s+")).join("|");
  const mLog = base.match(
    new RegExp(`\\b(${alt})\\b\\s+((?:[A-Za-zÀ-ÿ0-9'’.\\-]+\\s*){1,8}?)(?=,|\\s+n[.º°]|\\s+nº|\\s+número|$)`, "i"),
  );
  const tipoLogradouro = mLog?.[1] ? limpar(mLog[1])!.toUpperCase() : null;
  const logradouro = mLog?.[2] ? limpar(mLog[2])?.toUpperCase() ?? null : null;

  const numeroLogradouro =
    capturar(base, [
      /\b(?:n[.º°]{1,2}|n[uú]mero|nº)\s*[:\-]?\s*(\d{1,6}\s*[A-Za-z]?)\b/i,
      /,\s*(\d{1,6})\s*(?:,|-|$)/,
    ])?.replace(/\s+/g, "").toUpperCase() ?? null;

  const lote = capturar(base, [/\blote\s*(?:n[.º°]*)?\s*[:\-]?\s*([A-Z0-9\-/]{1,10})\b/i])?.toUpperCase() ?? null;
  const quadra = capturar(base, [/\bquadra\s*(?:n[.º°]*)?\s*[:\-]?\s*([A-Z0-9\-/]{1,10})\b/i])?.toUpperCase() ?? null;

  const altR = TIPOS_RURAL.map((t) => t.replace(/ /g, "\\s+")).join("|");
  const mRural = base.match(
    new RegExp(`\\b(${altR})\\b\\s*(?:denominad[oa]\\s*)?["'“]?((?:[A-Za-zÀ-ÿ0-9'’.\\-]+\\s*){1,6}?)(?=["'”,.;]|\\s+(?:situad|localizad|com\\s+[áa]rea|de\\s+propriedade)|$)`, "i"),
  );
  const tipoRural = mRural?.[1] ? limpar(mRural[1])!.toUpperCase() : null;
  const denominacaoRural = mRural?.[2] ? limpar(mRural[2])?.toUpperCase() ?? null : null;

  const cim =
    capturar(base, [
      /(?:CIM|cadastro\s+imobili[áa]rio\s+municipal)\s*(?:n[.º°]*)?\s*[:\-]?\s*([\w.\-/]{3,40})/i,
    ]) ?? (cadastros as Record<string, unknown>)['cadastro_municipal'] as string | undefined ?? null;

  return {
    cep: cep ? cep.replace(/^(\d{5})-?(\d{3})$/, "$1-$2") : null,
    tipo_logradouro: tipoLogradouro,
    logradouro,
    numero_logradouro: numeroLogradouro,
    tipo_rural: tipoRural,
    denominacao_rural: denominacaoRural,
    lote,
    quadra,
    cim: cim ? String(cim) : null,
  };
}

const numeroBr = (v: string | undefined | null): number | null => {
  if (!v) return null;
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/** Área em hectares: literal do documento; senão convertida da área em m². */
function extrairHectares(texto: string, areaM2: number | null): number | null {
  const m = texto.match(
    /[áa]rea[^.;\n]{0,40}?([\d.]+,\d+|[\d.]+)\s*(?:ha\b|hectares?)/i,
  );
  const lit = numeroBr(m?.[1]);
  if (lit !== null) return lit;
  return areaM2 !== null ? Number((areaM2 / 10000).toFixed(4)) : null;
}

/** Perímetro em metros (converte km quando necessário). */
function extrairPerimetro(texto: string): number | null {
  const m = texto.match(
    /per[íi]metro[^.;\n]{0,30}?([\d.]+,\d+|[\d.]+)\s*(m\b|metros|km\b|quil[ôo]metros)?/i,
  );
  const n = numeroBr(m?.[1]);
  if (n === null) return null;
  const u = (m?.[2] ?? "m").toLowerCase();
  return u.startsWith("km") || u.startsWith("quil") ? n * 1000 : n;
}

/** Área construída/edificada em m². */
function extrairAreaConstruida(texto: string): number | null {
  const m = texto.match(
    /[áa]rea\s+(?:constru[íi]da|edificada|de\s+constru[çc][ãa]o)[^.;\n]{0,25}?([\d.]+,\d+|[\d.]+)\s*(m²|m2|metros quadrados)?/i,
  );
  return numeroBr(m?.[1]);
}
