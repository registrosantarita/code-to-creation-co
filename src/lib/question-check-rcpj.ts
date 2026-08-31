// Checklist de qualificação do Registro Civil das Pessoas Jurídicas.
// As seções serão transcritas conforme o documento fornecido pelo Oficial.
import type { Secao } from "./question-check-types";

export const SECOES_RCPJ: Secao[] = [];

/** Naturezas de título do RCPJ e as seções variáveis correspondentes. */
export const TIPOS_TITULO_RCPJ: { id: string; rotulo: string; secoes: string[] }[] = [
  { id: "outro", rotulo: "Título ainda não classificado", secoes: [] },
];

export const SECOES_COMUNS_INICIAIS_RCPJ: string[] = [];
export const SECOES_COMUNS_FINAIS_RCPJ: string[] = [];
