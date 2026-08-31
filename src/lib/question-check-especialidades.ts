/**
 * Especialidades do QuestionCheck. Cada especialidade tem seu próprio catálogo
 * de seções, naturezas de título e seções comuns.
 */
import { SECOES } from "./question-check-secoes";
import { SECAO_S } from "./question-check-secao-s";
import {
  SECOES_RCPJ,
  TIPOS_TITULO_RCPJ,
  SECOES_COMUNS_INICIAIS_RCPJ,
  SECOES_COMUNS_FINAIS_RCPJ,
} from "./question-check-rcpj";
import {
  SECOES_COMUNS_FINAIS,
  SECOES_COMUNS_INICIAIS,
  TIPOS_TITULO,
  type Secao,
} from "./question-check-types";

export type TipoTitulo = { id: string; rotulo: string; secoes: string[] };

export type Especialidade = {
  id: string;
  rotulo: string;
  secoes: Secao[];
  tipos: TipoTitulo[];
  comunsIniciais: string[];
  comunsFinais: string[];
  /**
   * Seções comuns finais dispensadas quando o título ativa alguma das seções
   * variáveis listadas (ex.: a Seção "S" — COAF — não se aplica a penhora,
   * usucapião, loteamento, incorporação, retificação e execução de garantias).
   */
  dispensaFinais?: Record<string, string[]>;
};

export const ESPECIALIDADE_PADRAO = "registro_imoveis";

export const ESPECIALIDADES: Especialidade[] = [
  {
    id: "registro_imoveis",
    rotulo: "Registro de Imóveis",
    secoes: [...SECOES, SECAO_S],
    tipos: TIPOS_TITULO,
    comunsIniciais: SECOES_COMUNS_INICIAIS,
    comunsFinais: SECOES_COMUNS_FINAIS,
    dispensaFinais: { S: ["G", "J", "K", "L", "M", "N", "O"] },
  },
  {
    id: "rcpj",
    rotulo: "Registro Civil das Pessoas Jurídicas",
    secoes: SECOES_RCPJ,
    tipos: TIPOS_TITULO_RCPJ,
    comunsIniciais: SECOES_COMUNS_INICIAIS_RCPJ,
    comunsFinais: SECOES_COMUNS_FINAIS_RCPJ,
  },
];

export function especialidadePorId(id?: string | null): Especialidade {
  return (
    ESPECIALIDADES.find((e) => e.id === id) ??
    ESPECIALIDADES.find((e) => e.id === ESPECIALIDADE_PADRAO)!
  );
}

export function secoesDaEspecialidade(id?: string | null): Secao[] {
  return especialidadePorId(id).secoes;
}

export function tiposDaEspecialidade(id?: string | null): TipoTitulo[] {
  return especialidadePorId(id).tipos;
}

/** Seções aplicáveis (comuns + variáveis) dentro de uma especialidade. */
export function secoesAplicaveisNaEspecialidade(
  especialidade: string | null | undefined,
  tipoTitulo: string,
  extras: string[] = [],
): string[] {
  const esp = especialidadePorId(especialidade);
  const tipo = esp.tipos.find((t) => t.id === tipoTitulo);
  const variaveis = [...new Set([...(tipo?.secoes ?? []), ...extras])].sort();
  const finais = esp.comunsFinais.filter((sid) => {
    const dispensa = esp.dispensaFinais?.[sid];
    return !dispensa?.some((v) => variaveis.includes(v));
  });
  return [...esp.comunsIniciais, ...variaveis, ...finais];
}
