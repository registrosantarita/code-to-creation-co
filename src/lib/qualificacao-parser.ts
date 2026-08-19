/**
 * Extração determinística de dados de qualificação (partes, estado civil,
 * cadastros do imóvel e cadeia registral) a partir do texto do documento.
 * Nenhum crédito de IA é consumido aqui: apenas expressões regulares e
 * validadores de dígito verificador.
 */

export type Pessoa = {
  nome: string | null;
  cpf: string | null;
  cnpj: string | null;
  rg: string | null;
  orgao_rg: string | null;
  nacionalidade: string | null;
  profissao: string | null;
  endereco: string | null;
  estado_civil: string | null;
  regime_bens: string | null;
  data_casamento: string | null;
  conjuge: string | null;
};

export type Imovel = {
  cadastro_municipal: string | null;
  ccir: string | null;
  cib: string | null;
  car: string | null;
  itr_nirf: string | null;
  inscricao_estadual: string | null;
};

export type Cadeia = {
  matricula: string | null;
  transcricao: string | null;
  cartorio: string | null;
  livro: string | null;
  folha: string | null;
  registro_anterior: string | null;
};

export type Qualificacao = {
  pessoas: Pessoa[];
  imovel: Imovel;
  cadeia: Cadeia;
};

export const CAMPOS_PESSOA: { chave: keyof Pessoa; rotulo: string; critico?: boolean }[] = [
  { chave: "nome", rotulo: "Nome", critico: true },
  { chave: "cpf", rotulo: "CPF", critico: true },
  { chave: "cnpj", rotulo: "CNPJ", critico: true },
  { chave: "rg", rotulo: "RG" },
  { chave: "orgao_rg", rotulo: "Órgão expedidor" },
  { chave: "nacionalidade", rotulo: "Nacionalidade" },
  { chave: "profissao", rotulo: "Profissão" },
  { chave: "endereco", rotulo: "Endereço" },
  { chave: "estado_civil", rotulo: "Estado civil", critico: true },
  { chave: "regime_bens", rotulo: "Regime de bens", critico: true },
  { chave: "data_casamento", rotulo: "Data do casamento" },
  { chave: "conjuge", rotulo: "Cônjuge" },
];

export const CAMPOS_IMOVEL: { chave: keyof Imovel; rotulo: string; critico?: boolean }[] = [
  { chave: "cadastro_municipal", rotulo: "Cadastro imobiliário municipal" },
  { chave: "ccir", rotulo: "CCIR", critico: true },
  { chave: "cib", rotulo: "CIB" },
  { chave: "car", rotulo: "CAR" },
  { chave: "itr_nirf", rotulo: "ITR" },
  { chave: "inscricao_estadual", rotulo: "Inscrição estadual" },
];

export const CAMPOS_CADEIA: { chave: keyof Cadeia; rotulo: string; critico?: boolean }[] = [
  { chave: "matricula", rotulo: "Matrícula", critico: true },
  { chave: "transcricao", rotulo: "Transcrição" },
  { chave: "registro_anterior", rotulo: "Registro anterior", critico: true },
  { chave: "cartorio", rotulo: "Serventia / Cartório" },
  { chave: "livro", rotulo: "Livro" },
  { chave: "folha", rotulo: "Folha" },
];

export function qualificacaoVazia(): Qualificacao {
  return {
    pessoas: [],
    imovel: {
      cadastro_municipal: null,
      ccir: null,
      cib: null,
      car: null,
      itr_nirf: null,
      inscricao_estadual: null,
    },
    cadeia: {
      matricula: null,
      transcricao: null,
      cartorio: null,
      livro: null,
      folha: null,
      registro_anterior: null,
    },
  };
}

function pessoaVazia(): Pessoa {
  return {
    nome: null,
    cpf: null,
    cnpj: null,
    rg: null,
    orgao_rg: null,
    nacionalidade: null,
    profissao: null,
    endereco: null,
    estado_civil: null,
    regime_bens: null,
    data_casamento: null,
    conjuge: null,
  };
}

/* ------------------------------------------------------------------ */
/* Normalizações e validadores                                         */
/* ------------------------------------------------------------------ */

export function digitos(v: string | null | undefined): string {
  return (v ?? "").replace(/\D/g, "");
}

export function normalizarTexto(v: string | null | undefined): string {
  return (v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function cpfValido(valor: string | null): boolean {
  const d = digitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const [len, peso] of [
    [9, 10],
    [10, 11],
  ] as const) {
    let soma = 0;
    for (let i = 0; i < len; i++) soma += Number(d[i]) * (peso - i);
    let dv = (soma * 10) % 11;
    if (dv === 10) dv = 0;
    if (dv !== Number(d[len])) return false;
  }
  return true;
}

export function cnpjValido(valor: string | null): boolean {
  const d = digitos(valor);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (len: number) => {
    const pesos = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < len; i++) soma += Number(d[i]) * pesos[i]!;
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

export function ccirFormatoValido(valor: string | null): boolean {
  const d = digitos(valor);
  return d.length === 13;
}

export function carFormatoValido(valor: string | null): boolean {
  return /^[A-Z]{2}-\d{7}-[0-9A-F.]{8,}$/i.test((valor ?? "").trim());
}

/* ------------------------------------------------------------------ */
/* Extração                                                            */
/* ------------------------------------------------------------------ */

function primeiro(texto: string, re: RegExp): string | null {
  const m = texto.match(re);
  const v = (m?.[1] ?? "").trim().replace(/[;,.]$/, "");
  return v ? v : null;
}

const NOME = "[A-ZÁÂÃÀÉÊÍÓÔÕÚÇ][\\wÀ-ÿ'.-]+(?:\\s+(?:d[aeo]s?|e|[A-ZÁÂÃÀÉÊÍÓÔÕÚÇ][\\wÀ-ÿ'.-]+)){1,7}";

/**
 * Termos que jamais compõem nome de pessoa: logradouros, atos registrais,
 * ônus, órgãos e rótulos de documento. Se qualquer palavra do candidato
 * estiver aqui, o texto não é tratado como nome.
 */
const TERMOS_NAO_NOME = new Set(
  [
    // logradouros e endereço
    "rua","avenida","av","travessa","alameda","rodovia","estrada","praca","praça","largo","viela",
    "beco","quadra","lote","bairro","distrito","municipio","município","comarca","estado","cep",
    "numero","número","apartamento","apto","bloco","andar","condominio","condomínio","chacara",
    "chácara","sitio","sítio","fazenda","gleba","setor","zona","cidade","logradouro","km",
    // atos, ônus e institutos
    "gravame","gravames","usufruto","usufrutuario","usufrutuário","reserva","hipoteca","penhora",
    "arresto","sequestro","alienacao","alienação","fiduciaria","fiduciária","servidao","servidão",
    "clausula","cláusula","incomunicabilidade","impenhorabilidade","inalienabilidade","caucao","caução",
    "compra","venda","doacao","doação","permuta","cessao","cessão","direitos","promessa","dacao","dação",
    "pagamento","partilha","inventario","inventário","arrematacao","arrematação","adjudicacao","adjudicação",
    "penhor","anticrese","enfiteuse","superficie","superfície","averbacao","averbação","registro",
    "matricula","matrícula","transcricao","transcrição","livro","folha","ficha","protocolo","prenotacao",
    "prenotação","escritura","publica","pública","procuracao","procuração","certidao","certidão",
    "titulo","título","imovel","imóvel","area","área","perimetro","perímetro","confrontante",
    // órgãos e entidades
    "cartorio","cartório","oficio","ofício","tabelionato","serventia","comarca","prefeitura",
    "municipal","estadual","federal","receita","fazenda","banco","caixa","economica","econômica",
    "juizo","juízo","vara","tribunal","justica","justiça","secretaria","instituto","incra","inss",
    // rótulos comuns
    "adquirente","transmitente","outorgante","outorgado","credor","devedor","proprietario",
    "proprietário","titular","requerente","interessado","parte","partes","natureza","observacao",
    "observação","valor","total","data","real","reais",
  ],
);

const PALAVRA_LIGACAO = new Set(["da","de","do","das","dos","e","del","di","van","von","y"]);

/** Heurística: o candidato extraído é mesmo um nome de pessoa? */
export function nomeValido(candidato: string | null | undefined): boolean {
  const bruto = (candidato ?? "").trim();
  if (bruto.length < 5) return false;
  if (/\d/.test(bruto)) return false;

  const tokens = bruto.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return false;

  const simples = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\wÀ-ÿ]/g, "").toLowerCase();

  let proprios = 0;
  for (const tk of tokens) {
    const s = simples(tk);
    if (!s) continue;
    if (TERMOS_NAO_NOME.has(s)) return false;
    if (!PALAVRA_LIGACAO.has(s) && !/^[a-z]\.?$/i.test(tk)) proprios++;
  }
  // pelo menos dois vocábulos próprios (nome + sobrenome)
  return proprios >= 2;
}


const REGIMES = [
  "comunhão parcial de bens",
  "comunhão universal de bens",
  "separação total de bens",
  "separação convencional de bens",
  "separação obrigatória de bens",
  "separação legal de bens",
  "participação final nos aquestos",
];

const ESTADOS_CIVIS = [
  "casado",
  "casada",
  "solteiro",
  "solteira",
  "divorciado",
  "divorciada",
  "viúvo",
  "viúva",
  "separado judicialmente",
  "separada judicialmente",
  "união estável",
];

/** Extrai os cadastros do imóvel e a cadeia registral do texto inteiro. */
function extrairImovel(t: string): Imovel {
  return {
    cadastro_municipal:
      primeiro(t, /cadastro\s+(?:imobili[áa]rio\s+)?(?:municipal\s+)?(?:n[º°.]?\s*)?([\w.\-/]{4,})/i) ??
      primeiro(t, /(?:IPTU|inscri[çc][ãa]o\s+municipal)\s*(?:n[º°.]?\s*)?[:\-]?\s*([\w.\-/]{4,})/i),
    ccir: primeiro(t, /CCIR\s*(?:n[º°.]?\s*)?[:\-]?\s*([\d.\-\s]{10,})/i),
    cib:
      primeiro(t, /\bCIB\s*(?:n[º°.]?\s*)?[:\-]?\s*([\w.\-]{4,})/i) ??
      primeiro(t, /\bNIRF\s*(?:n[º°.]?\s*)?[:\-]?\s*([\d.\-]{6,})/i),
    car: primeiro(t, /\bCAR\s*(?:n[º°.]?\s*)?[:\-]?\s*([A-Z]{2}-\d{7}-[0-9A-F.]{8,})/i),
    itr_nirf: primeiro(t, /\bITR\s*(?:n[º°.]?\s*)?[:\-]?\s*([\d.\-]{6,})/i),
    inscricao_estadual: primeiro(t, /inscri[çc][ãa]o\s+estadual\s*(?:n[º°.]?\s*)?[:\-]?\s*([\w.\-/]{4,})/i),
  };
}

function extrairCadeia(t: string): Cadeia {
  return {
    matricula: primeiro(t, /matr[íi]cula\s*(?:imobili[áa]ria\s*)?(?:n[º°.]?\s*)?[:\-]?\s*([\d.]{1,12})/i),
    transcricao: primeiro(t, /transcri[çc][ãa]o\s*(?:n[º°.]?\s*)?[:\-]?\s*([\d.]{1,12})/i),
    cartorio:
      primeiro(t, /((?:\d+[ºa°]?\s*)?(?:Of[íi]cio|Cart[óo]rio|Servi[çc]o Registral|Registro de Im[óo]veis)[^,.;\n]{0,60})/i),
    livro: primeiro(t, /livro\s*(?:n[º°.]?\s*)?[:\-]?\s*([\w.\-/]{1,12})/i),
    folha: primeiro(t, /(?:folhas?|fls?\.?)\s*(?:n[º°.]?\s*)?[:\-]?\s*([\d./\-]{1,12})/i),
    registro_anterior: primeiro(
      t,
      /registro\s+anterior\s*[:\-]?\s*([^\n;]{3,160}?)(?=\.\s+[A-ZÁÉÍÓÚ]|[;\n]|\.$|$)/i,
    ),
  };
}

/** Janela de texto em torno de cada CPF/CNPJ: base para montar cada parte. */
function extrairPessoas(t: string): Pessoa[] {
  const pessoas: Pessoa[] = [];
  const docRe = /(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/g;
  const vistos = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = docRe.exec(t)) !== null) {
    const bruto = m[1]!;
    const d = digitos(bruto);
    const ehCnpj = d.length === 14;
    if (vistos.has(d)) continue;
    vistos.add(d);

    const ini = Math.max(0, m.index - 600);
    const janela = t.slice(ini, Math.min(t.length, m.index + 600));
    const antes = t.slice(ini, m.index);

    const p = pessoaVazia();
    if (ehCnpj) p.cnpj = bruto;
    else p.cpf = bruto;

    // Nome: último nome próprio antes do documento.
    // O titular é o primeiro nome próprio da sentença que contém o documento
    // (nomes posteriores costumam ser o cônjuge ou o representante).
    const sentenca = antes.split(/(?<=[.;])\s+(?=[A-ZÁÉÍÓÚ])/).pop() ?? antes;
    const nomes = sentenca.match(new RegExp(NOME, "g"));
    p.nome = nomes?.length ? nomes[0]!.trim() : null;

    p.rg = primeiro(janela, /(?:RG|C[ée]dula de Identidade|identidade)\s*(?:n[º°.]?\s*)?[:\-]?\s*([\d.\-\/A-Za-z]{5,15})/i);
    p.orgao_rg = primeiro(janela, /(?:SSP|SESP|SJS|DETRAN|PC|IFP|IIRGD)[\s/-]{0,3}([A-Z]{2})/);
    if (p.orgao_rg) {
      const org = janela.match(/(SSP|SESP|SJS|DETRAN|PC|IFP|IIRGD)[\s/-]{0,3}([A-Z]{2})/);
      p.orgao_rg = org ? `${org[1]}/${org[2]}` : p.orgao_rg;
    }
    p.nacionalidade = primeiro(janela, /\b(brasileir[oa]|portugu[êe]s[a]?|estrangeir[oa]|italian[oa]|argentin[oa])\b/i);
    p.profissao = primeiro(
      janela,
      /(?:profiss[ãa]o\s*[:\-]?\s*|brasileir[oa],\s*)([a-zà-ÿ]+(?:\s+[a-zà-ÿ]+){0,2})\s*,/i,
    );
    p.endereco = primeiro(
      janela,
      /(?:residente e domiciliad[oa](?: [àna]{1,3})?|endere[çc]o\s*[:\-]?|com sede (?:na|em|à))\s*([^\n;]{8,160}?)(?=\.\s+[A-ZÁÉÍÓÚ]|[;\n]|\.$|$)/i,
    );

    const ec = ESTADOS_CIVIS.find((e) => new RegExp(`\\b${e}\\b`, "i").test(janela));
    p.estado_civil = ec ? ec.charAt(0).toUpperCase() + ec.slice(1) : null;

    const regime = REGIMES.find((r) => new RegExp(r.replace(/ /g, "\\s+"), "i").test(janela));
    p.regime_bens = regime ? regime.charAt(0).toUpperCase() + regime.slice(1) : null;

    p.data_casamento = primeiro(
      janela,
      /(?:casad[oa][^.;\n]{0,80}?(?:desde|em)|data do casamento\s*[:\-]?)\s*(\d{2}[/.\-]\d{2}[/.\-]\d{4}|\d{1,2}\s+de\s+[a-zç]+\s+de\s+\d{4})/i,
    );
    p.conjuge = primeiro(
      janela,
      new RegExp(`(?:c[ôo]njuge|esposa|esposo|marido|casad[oa][^.;\\n]{0,90}?\\bcom\\b)\\s*[:\\-]?\\s*(${NOME})`, "i"),
    );

    pessoas.push(p);
  }
  return pessoas;
}

export function extrairQualificacao(texto: string): Qualificacao {
  const t = (texto ?? "").replace(/\r/g, "");
  if (!t.trim()) return qualificacaoVazia();
  return {
    pessoas: extrairPessoas(t),
    imovel: extrairImovel(t),
    cadeia: extrairCadeia(t),
  };
}

/** Campos ainda em branco — usados para decidir se vale acionar a IA. */
export function camposFaltantes(q: Qualificacao): string[] {
  const faltas: string[] = [];
  for (const c of CAMPOS_IMOVEL) if (!q.imovel[c.chave]) faltas.push(c.rotulo);
  for (const c of CAMPOS_CADEIA) if (!q.cadeia[c.chave]) faltas.push(c.rotulo);
  if (!q.pessoas.length) faltas.push("Partes");
  else
    q.pessoas.forEach((p, i) => {
      for (const c of CAMPOS_PESSOA) {
        if (c.chave === "cnpj" && p.cpf) continue;
        if (c.chave === "cpf" && p.cnpj) continue;
        if (!p[c.chave]) faltas.push(`Parte ${i + 1} — ${c.rotulo}`);
      }
    });
  return faltas;
}
