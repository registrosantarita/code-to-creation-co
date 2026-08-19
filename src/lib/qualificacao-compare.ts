/**
 * Confronto dos dados de qualificação entre dois ou mais documentos.
 * Comparação puramente determinística: normaliza, compara e classifica.
 */
import {
  CAMPOS_CADEIA,
  CAMPOS_IMOVEL,
  CAMPOS_PESSOA,
  carFormatoValido,
  ccirFormatoValido,
  cnpjValido,
  cpfValido,
  digitos,
  normalizarTexto,
  type Qualificacao,
} from "./qualificacao-parser";

export type Severidade = "critical" | "moderate" | "informative" | "inconclusive";

export type LinhaConferencia = {
  bloco: string;
  campo: string;
  /** Valores na ordem dos documentos (null = não informado). */
  valores: (string | null)[];
  situacao: "conforme" | "divergente" | "incompleto" | "invalido";
  severidade: Severidade;
  observacao?: string;
};

export type DocQualificacao = { rotulo: string; dados: Qualificacao };

/** Comparação numérica/textual tolerante a máscaras e acentos. */
function equivalente(campo: string, a: string, b: string): boolean {
  const numericos = ["CPF", "CNPJ", "CCIR", "CIB", "ITR", "Matrícula", "Transcrição", "RG"];
  if (numericos.includes(campo)) return digitos(a) === digitos(b) && digitos(a) !== "";
  return normalizarTexto(a) === normalizarTexto(b);
}

function avaliar(
  bloco: string,
  campo: string,
  critico: boolean,
  valores: (string | null)[],
): LinhaConferencia {
  const preenchidos = valores.filter((v): v is string => Boolean(v && v.trim()));

  // Validadores de dígito verificador / formato.
  const invalidos: string[] = [];
  for (const v of preenchidos) {
    if (campo === "CPF" && !cpfValido(v)) invalidos.push(v);
    if (campo === "CNPJ" && !cnpjValido(v)) invalidos.push(v);
    if (campo === "CCIR" && !ccirFormatoValido(v)) invalidos.push(v);
    if (campo === "CAR" && !carFormatoValido(v)) invalidos.push(v);
  }

  if (preenchidos.length === 0) {
    return {
      bloco,
      campo,
      valores,
      situacao: "incompleto",
      severidade: "inconclusive",
      observacao: "Não informado em nenhum documento.",
    };
  }

  if (invalidos.length) {
    return {
      bloco,
      campo,
      valores,
      situacao: "invalido",
      severidade: "critical",
      observacao: `Dígito verificador ou formato inválido: ${invalidos.join(", ")}.`,
    };
  }

  const base = preenchidos[0]!;
  const divergente = preenchidos.some((v) => !equivalente(campo, base, v));
  if (divergente) {
    return {
      bloco,
      campo,
      valores,
      situacao: "divergente",
      severidade: critico ? "critical" : "moderate",
      observacao: "Os documentos apresentam valores diferentes para este campo.",
    };
  }

  if (preenchidos.length < valores.length) {
    return {
      bloco,
      campo,
      valores,
      situacao: "incompleto",
      severidade: "inconclusive",
      observacao: "Campo ausente em ao menos um documento — não comparável.",
    };
  }

  return { bloco, campo, valores, situacao: "conforme", severidade: "informative" };
}

/** Pareia as partes entre documentos por CPF/CNPJ e, na falta, pelo nome. */
function chavePessoa(p: Qualificacao["pessoas"][number]): string {
  const d = digitos(p.cpf ?? p.cnpj);
  if (d) return `doc:${d}`;
  return `nome:${normalizarTexto(p.nome)}`;
}

export type ResultadoQualificacao = {
  linhas: LinhaConferencia[];
  resumo: { conformes: number; divergentes: number; incompletos: number; invalidos: number };
  classificacao: "compatible" | "compatible_with_remarks" | "incompatible" | "inconclusive";
};

/** Critérios selecionáveis na criação de uma comparação. */
export const CRITERIOS = [
  { id: "identificacao", rotulo: "Partes e identificação" },
  { id: "estado_civil", rotulo: "Estado civil e regime de bens" },
  { id: "endereco", rotulo: "Endereço das partes" },
  { id: "imovel", rotulo: "Cadastros do imóvel" },
  { id: "cadeia", rotulo: "Cadeia registral" },
  { id: "onus", rotulo: "Ônus e direitos reais" },
] as const;

export type CriterioId = (typeof CRITERIOS)[number]["id"];

export const CRITERIOS_PADRAO: CriterioId[] = [
  "identificacao",
  "estado_civil",
  "endereco",
  "imovel",
  "cadeia",
  "onus",
];

const GRUPO_PESSOA: Record<string, CriterioId> = {
  nome: "identificacao",
  cpf: "identificacao",
  cnpj: "identificacao",
  rg: "identificacao",
  orgao_rg: "identificacao",
  nacionalidade: "identificacao",
  profissao: "identificacao",
  endereco: "endereco",
  estado_civil: "estado_civil",
  regime_bens: "estado_civil",
  data_casamento: "estado_civil",
  conjuge: "estado_civil",
};

export function conferirQualificacao(
  docs: DocQualificacao[],
  criterios: string[] = [...CRITERIOS_PADRAO],
): ResultadoQualificacao {
  const linhas: LinhaConferencia[] = [];
  const n = docs.length;
  const ativo = (c: CriterioId) => criterios.includes(c);
  const pessoasAtivas = ativo("identificacao") || ativo("estado_civil") || ativo("endereco");

  // Cadastros do imóvel
  if (ativo("imovel"))
    for (const c of CAMPOS_IMOVEL) {
      linhas.push(
        avaliar("Cadastros do imóvel", c.rotulo, Boolean(c.critico), docs.map((d) => d.dados.imovel[c.chave] ?? null)),
      );
    }

  // Cadeia registral
  if (ativo("cadeia"))
    for (const c of CAMPOS_CADEIA) {
      linhas.push(
        avaliar("Cadeia registral", c.rotulo, Boolean(c.critico), docs.map((d) => d.dados.cadeia[c.chave] ?? null)),
      );
    }

  // Partes
  const chaves: string[] = [];
  for (const d of docs)
    for (const p of d.dados.pessoas) {
      const k = chavePessoa(p);
      if (!chaves.includes(k)) chaves.push(k);
    }

  chaves.forEach((chave, idx) => {
    const porDoc = docs.map((d) => d.dados.pessoas.find((p) => chavePessoa(p) === chave) ?? null);
    const nome = porDoc.find((p) => p?.nome)?.nome ?? `Parte ${idx + 1}`;
    const bloco = `Parte — ${nome}`;

    if (porDoc.some((p) => p === null)) {
      linhas.push({
        bloco,
        campo: "Presença nos documentos",
        valores: porDoc.map((p, i) => (p ? docs[i]!.rotulo : null)),
        situacao: "incompleto",
        severidade: "moderate",
        observacao: "A parte não foi localizada em todos os documentos conferidos.",
      });
    }

    for (const c of CAMPOS_PESSOA) {
      const valores = porDoc.map((p) => (p ? (p[c.chave] ?? null) : null));
      if (valores.every((v) => !v)) continue;
      linhas.push(avaliar(bloco, c.rotulo, Boolean(c.critico), valores));
    }

    // Regra registral: casado exige regime de bens e data do casamento.
    for (let i = 0; i < n; i++) {
      const p = porDoc[i];
      if (!p) continue;
      const casado = /casad|uni[ãa]o est[áa]vel/i.test(p.estado_civil ?? "");
      if (casado && !p.regime_bens) {
        linhas.push({
          bloco,
          campo: "Regime de bens",
          valores: docs.map((_, j) => (j === i ? "(ausente)" : null)),
          situacao: "incompleto",
          severidade: "critical",
          observacao: `Parte declarada casada em ${docs[i]!.rotulo} sem indicação do regime de bens.`,
        });
      }
      if (casado && !p.data_casamento) {
        linhas.push({
          bloco,
          campo: "Data do casamento",
          valores: docs.map((_, j) => (j === i ? "(ausente)" : null)),
          situacao: "incompleto",
          severidade: "moderate",
          observacao: `Parte declarada casada em ${docs[i]!.rotulo} sem data do casamento.`,
        });
      }
    }
  });

  const resumo = {
    conformes: linhas.filter((l) => l.situacao === "conforme").length,
    divergentes: linhas.filter((l) => l.situacao === "divergente").length,
    incompletos: linhas.filter((l) => l.situacao === "incompleto").length,
    invalidos: linhas.filter((l) => l.situacao === "invalido").length,
  };

  const classificacao: ResultadoQualificacao["classificacao"] =
    resumo.invalidos > 0 || linhas.some((l) => l.situacao === "divergente" && l.severidade === "critical")
      ? "incompatible"
      : resumo.divergentes > 0
        ? "compatible_with_remarks"
        : resumo.conformes === 0
          ? "inconclusive"
          : resumo.incompletos > 0
            ? "compatible_with_remarks"
            : "compatible";

  return { linhas, resumo, classificacao };
}
