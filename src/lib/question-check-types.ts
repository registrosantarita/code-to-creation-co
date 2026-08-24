/**
 * Modelo de dados do QuestionCheck — checklist condicional de qualificação
 * registral. As perguntas são apresentadas em sequência: Seção A (comum),
 * seções variáveis (B–P, conforme a natureza do título) e, ao final, as
 * Seções Q e R (comuns).
 */

export type TipoNo = "sim_nao" | "opcoes" | "multipla" | "numero" | "texto" | "info";

export type Opcao = { id: string; rotulo: string; obrigatorio?: boolean; ajuda?: string };

/** Condição que dispara alertas, exigências e perguntas encadeadas. */
export type Quando = "sim" | "nao" | "alguma" | "nenhuma" | "faltando" | `opcao:${string}`;

export type Efeito = {
  quando: Quando | string;
  alerta?: string;
  exigencia?: string;
  filhos?: No[];
};

export type No = {
  id: string;
  texto: string;
  grupo?: string;
  tipo: TipoNo;
  ajuda?: string;
  opcoes?: Opcao[];
  efeitos?: Efeito[];
};

export type Secao = {
  id: string;
  titulo: string;
  itens: No[];
};

/** Resposta do conferente para cada nó (chave = id do nó). */
export type Resposta = string | string[] | number | boolean | null;
export type Respostas = Record<string, Resposta>;

export type Acumulado = {
  no: string;
  secao: string;
  pergunta: string;
  texto: string;
  detalhe?: string;
};

/** Naturezas de título e as seções variáveis correspondentes. */
export const TIPOS_TITULO: { id: string; rotulo: string; secoes: string[] }[] = [
  { id: "compra_venda", rotulo: "Compra e venda, promessa e demais transmissões onerosas", secoes: ["B"] },
  { id: "doacao", rotulo: "Doação e demais transmissões gratuitas", secoes: ["C"] },
  { id: "aquisicao_forcada", rotulo: "Adjudicação e arrematação em execução judicial", secoes: ["D"] },
  { id: "divorcio", rotulo: "Separação e divórcio com partilha de bens", secoes: ["E"] },
  { id: "causa_mortis", rotulo: "Partilha causa mortis (inventário ou arrolamento)", secoes: ["F"] },
  { id: "penhora", rotulo: "Penhora, arresto e sequestro", secoes: ["G"] },
  { id: "credito", rotulo: "Cédulas de crédito e operações de crédito", secoes: ["H"] },
  { id: "garantia_real", rotulo: "Direitos reais de garantia (penhor, hipoteca, alienação fiduciária)", secoes: ["I"] },
  { id: "usucapiao_judicial", rotulo: "Usucapião judicial", secoes: ["J"] },
  { id: "loteamento", rotulo: "Loteamento, desmembramento e desdobro", secoes: ["K"] },
  { id: "incorporacao", rotulo: "Incorporação imobiliária e instituição de condomínio", secoes: ["L"] },
  { id: "retificacao", rotulo: "Retificação perimetral extrajudicial", secoes: ["M"] },
  { id: "usucapiao_extrajudicial", rotulo: "Usucapião extrajudicial", secoes: ["N"] },
  { id: "execucao_garantia", rotulo: "Execução extrajudicial de garantias", secoes: ["O"] },
  { id: "adjudicacao_compulsoria", rotulo: "Adjudicação compulsória extrajudicial", secoes: ["P"] },
  { id: "outro", rotulo: "Outro título (somente seções comuns)", secoes: [] },
];

export const SECOES_COMUNS_INICIAIS = ["A"];
export const SECOES_COMUNS_FINAIS = ["Q", "R"];

export function secoesAplicaveis(tipoTitulo: string, extras: string[] = []): string[] {
  const tipo = TIPOS_TITULO.find((t) => t.id === tipoTitulo);
  const variaveis = [...new Set([...(tipo?.secoes ?? []), ...extras])].sort();
  return [...SECOES_COMUNS_INICIAIS, ...variaveis, ...SECOES_COMUNS_FINAIS];
}

/** Chave estável de uma subseção (seção + título do grupo). */
export function chaveSubsecao(secaoId: string, grupo: string): string {
  return `${secaoId}|${grupo}`;
}
