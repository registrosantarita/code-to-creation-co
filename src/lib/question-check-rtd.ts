/**
 * QuestionCheck — Especialidade Registro de Títulos e Documentos (RTD).
 *
 * Este arquivo contém o catálogo provisório de seções, tipos de título e
 * seções comuns da especialidade. As perguntas específicas serão inseridas
 * assim que o usuário finalizar a elaboração do checklist.
 */
import type { Secao, TipoTitulo } from "./question-check-types";

/** Naturezas de título típicas do Registro de Títulos e Documentos. */
export const TIPOS_TITULO_RTD: TipoTitulo[] = [
  { id: "escritura_publica", rotulo: "Escritura pública", secoes: ["B"] },
  { id: "contrato", rotulo: "Contrato particular", secoes: ["C"] },
  { id: "procuracao", rotulo: "Procuração pública ou particular", secoes: ["D"] },
  { id: "ato_unilateral", rotulo: "Ato unilateral (testamento, declaração, recibo etc.)", secoes: ["E"] },
  { id: "documento_particular", rotulo: "Documento particular autenticado ou reconhecido", secoes: ["F"] },
  { id: "certidao", rotulo: "Certidão ou documento público", secoes: ["G"] },
  { id: "outro", rotulo: "Outro título ou documento (somente seções comuns)", secoes: [] },
];

/** Seção A — Prenotação, Título e Contraditório (comum a todos os títulos). */
const SECAO_A_RTD: Secao = {
  id: "A",
  titulo: "Prenotação, Título e Contraditório",
  itens: [
    {
      id: "A-1",
      texto: "O título/documento está acompanhado de prenotação válida e não expirada?",
      tipo: "sim_nao",
      efeitos: [
        { quando: "nao", exigencia: "Regularizar a prenotação ou apresentar guia de emolumentos atualizada." },
      ],
    },
    {
      id: "A-2",
      texto: "A identificação das partes no título é compatível com os documentos apresentados?",
      tipo: "sim_nao",
      efeitos: [
        { quando: "nao", exigencia: "Solicitar documento de identificação compatível ou retificação do título." },
      ],
    },
    {
      id: "A-3",
      texto: "O título encontra-se íntegro, sem rasuras, emendas ou adulterações não reconhecidas?",
      tipo: "sim_nao",
      efeitos: [
        { quando: "nao", exigencia: "Esclarecer rasuras/emendas com reconhecimento de firmas ou substituir o título." },
      ],
    },
  ],
};

/** Seções variáveis — estrutura provisória, a ser preenchida com as perguntas. */
const SECAO_B_RTD: Secao = {
  id: "B",
  titulo: "Escrituras Públicas",
  itens: [
    {
      id: "B-1",
      texto: "A escritura pública contém lavra do tabelionato competente e número de instrumento?",
      tipo: "sim_nao",
    },
  ],
};

const SECAO_C_RTD: Secao = {
  id: "C",
  titulo: "Contratos",
  itens: [
    {
      id: "C-1",
      texto: "O contrato particular contém firma reconhecida das partes, quando exigido?",
      tipo: "sim_nao",
    },
  ],
};

const SECAO_D_RTD: Secao = {
  id: "D",
  titulo: "Procurações",
  itens: [
    {
      id: "D-1",
      texto: "A procuração outorga poderes específicos para o ato praticado?",
      tipo: "sim_nao",
    },
  ],
};

const SECAO_E_RTD: Secao = {
  id: "E",
  titulo: "Atos Unilaterais",
  itens: [
    {
      id: "E-1",
      texto: "O ato unilateral atende aos requisitos de forma e de competência?",
      tipo: "sim_nao",
    },
  ],
};

const SECAO_F_RTD: Secao = {
  id: "F",
  titulo: "Documentos Particulares",
  itens: [
    {
      id: "F-1",
      texto: "O documento particular está devidamente autenticado ou reconhecido, quando exigido?",
      tipo: "sim_nao",
    },
  ],
};

const SECAO_G_RTD: Secao = {
  id: "G",
  titulo: "Certidões e Documentos Públicos",
  itens: [
    {
      id: "G-1",
      texto: "A certidão é recente e expedida por autoridade competente?",
      tipo: "sim_nao",
    },
  ],
};

/** Seção Q — Fechamento e Emolumentos. */
const SECAO_Q_RTD: Secao = {
  id: "Q",
  titulo: "Fechamento e Emolumentos",
  itens: [
    {
      id: "Q-1",
      texto: "Os emolumentos foram calculados e recolhidos conforme a tabela em vigor?",
      tipo: "sim_nao",
      efeitos: [
        { quando: "nao", exigencia: "Recalcular e recolher emolumentos conforme a tabela vigente." },
      ],
    },
    {
      id: "Q-2",
      texto: "O ato está apto ao registro ou ao arquivo?",
      tipo: "sim_nao",
      efeitos: [
        { quando: "nao", alerta: "Verificar pendências restantes antes do fechamento." },
      ],
    },
  ],
};

/** Seção R — Nota de Exigência e Responsável. */
const SECAO_R_RTD: Secao = {
  id: "R",
  titulo: "Nota de Exigência e Responsável",
  itens: [
    {
      id: "R-1",
      texto: "Há exigências pendentes a serem comunicadas ao interessado?",
      tipo: "sim_nao",
      efeitos: [
        { quando: "sim", alerta: "Elaborar nota de exigência fundamentada e registrar na prenotação." },
      ],
    },
  ],
};

export const SECOES_RTD: Secao[] = [
  SECAO_A_RTD,
  SECAO_B_RTD,
  SECAO_C_RTD,
  SECAO_D_RTD,
  SECAO_E_RTD,
  SECAO_F_RTD,
  SECAO_G_RTD,
  SECAO_Q_RTD,
  SECAO_R_RTD,
];

export const SECOES_COMUNS_INICIAIS_RTD = ["A"];
export const SECOES_COMUNS_FINAIS_RTD = ["Q", "R"];
