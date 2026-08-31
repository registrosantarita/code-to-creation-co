// Seção "S" — Comunicações ao COAF (especialidade Registro de Imóveis).
// Perguntas com duas respostas (SIM/NÃO); o fluxo sempre segue para o próximo
// item e toda resposta "SIM" gera Alerta no relatório.
import type { No, Secao } from "./question-check-types";

const G_S1 = "Operações Suspeitas — todas as especialidades (art. 20, Provimento CNJ 88)";
const G_S2 = "Comunicação Automática — Registro de Imóveis (art. 25, Provimento CNJ 88)";
const G_S3 = "Operações Suspeitas — Registro de Imóveis (art. 26, Provimento CNJ 88)";

/** Perguntas COAF: "SIM" gera alerta e o fluxo segue para o próximo item. */
function coaf(id: string, texto: string, grupo: string): No {
  return {
    id,
    texto,
    grupo,
    codigo: id.slice(2),
    tipo: "sim_nao",
    efeitos: [{ quando: "sim", alerta: `Comunicação ao COAF — ${id}: ${texto}` }],
  };
}

const TIPO_IMOVEL = [
  { id: "a", rotulo: "Terreno ou lote urbano" },
  { id: "b", rotulo: "Terreno com edificação" },
  { id: "c", rotulo: "Terra nua rural" },
  { id: "d", rotulo: "Imóvel rural com benfeitorias" },
];

/** Campos de valor de mercado sempre abertos, independentemente da resposta. */
function camposMercado(prefixo: string, grupo: string): No[] {
  const cod = prefixo.slice(2);
  return [
    { id: `${prefixo}-a`, texto: "Valor declarado (R$):", grupo, codigo: `${cod}.1`, tipo: "numero" },
    {
      id: `${prefixo}-b`,
      texto: "Valor aproximado de mercado (R$):",
      grupo,
      codigo: `${cod}.2`,
      tipo: "numero",
    },
    {
      id: `${prefixo}-c`,
      texto: "Tipo de Imóvel:",
      grupo,
      codigo: `${cod}.3`,
      tipo: "opcoes",
      opcoes: TIPO_IMOVEL,
    },
    {
      id: `${prefixo}-d`,
      texto: "Fonte de pesquisa:",
      grupo,
      codigo: `${cod}.4`,
      tipo: "texto",
      ajuda: "Campo de texto livre, sem limite de quantidade de caracteres",
    },
  ];
}

export const SECAO_S: Secao = {
  id: "S",
  titulo: "Comunicações ao COAF",
  coaf: true,
  itens: [
    coaf(
      "S-951",
      "A operação aparenta não resultar de atividades ou negócios usuais do cliente ou de seu ramo de negócio?",
      G_S1,
    ),
    coaf(
      "S-952",
      "A operação tem origem ou fundamentação econômica ou legal que não sejam claramente aferíveis ou identificáveis?",
      G_S1,
    ),
    coaf("S-953", "A operação é incompatível com o patrimônio ou capacidade econômica do cliente?", G_S1),
    coaf("S-954", "Trata-se de operação em que não tenha sido possível identificar o beneficiário final?", G_S1),
    coaf(
      "S-955",
      "A operação envolve pessoa jurídica domiciliada em jurisdição considerada pelo GAFI como de Alto Risco ou com deficiências estratégicas de prevenção e combate à lavagem de dinheiro e financiamento de terrorismo?",
      G_S1,
    ),
    coaf(
      "S-956",
      "A operação envolve países ou dependências considerados pela Receita Federal como sendo de tributação favorecida ou de regime fiscal privilegiado, conforme lista pública?",
      G_S1,
    ),
    coaf(
      "S-957",
      "A operação envolve pessoa jurídica cujo beneficiário final, sócios, acionistas, procuradores, etc. sejam domiciliados em jurisdição considerada pelo GAFI como de Alto Risco ou com deficiências estratégicas de prevenção e combate à lavagem de dinheiro e financiamento de terrorismo?",
      G_S1,
    ),
    coaf(
      "S-958",
      "O cliente ou demais envolvidos na operação OFERECERAM RESISTÊNCIA em fornecer informações solicitadas para registro ou preenchimento de cadastro?",
      G_S1,
    ),
    coaf(
      "S-959",
      "O cliente ou demais envolvidos na operação PRESTARAM INFORMAÇÕES FALSAS ou de DIFÍCIL VERIFICAÇÃO ou de ONEROSA VERIFICAÇÃO para registro da operação ou preenchimento de cadastro?",
      G_S1,
    ),
    coaf(
      "S-960",
      "A operação é injustificadamente complexa ou com custos mais elevados, que visem DIFICULTAR O RASTREAMENTO dos recursos ou a identificação do seu real objetivo?",
      G_S1,
    ),
    coaf(
      "S-961",
      "A operação é FICTÍCIA ou com INDÍCIOS DE VALORES INCOMPATÍVEIS COM AS PRATICADAS NO MERCADO?",
      G_S1,
    ),
    ...camposMercado("S-961", G_S1),
    coaf(
      "S-962",
      "A operação contém cláusulas que estabeleçam CONDIÇÕES INCOMPATÍVEIS COM AS PRATICADAS NO MERCADO?",
      G_S1,
    ),
    coaf(
      "S-963",
      "Houve qualquer tentativa de BURLAR os controles e registros exigidos pela legislação de prevenção à lavagem de dinheiro e ao financiamento do terrorismo, através de FRACIONAMENTO, PAGAMENTO EM ESPÉCIE ou por meio de TÍTULO AO PORTADOR?",
      G_S1,
    ),
    coaf(
      "S-964",
      "A operação se consubstanciou em registro de DOCUMENTO ESTRANGEIRO, nos termos do artigo 129, §6º, combinado com o artigo 48, da Lei 6.015/73?",
      G_S1,
    ),
    coaf("S-965", "A operação se refere a AUMENTO DE CAPITAL em curto período de tempo?", G_S1),
    coaf(
      "S-966",
      "A operação envolveu OUTORGA OU UTILIZAÇÃO DE PROCURAÇÃO ao mandatário com poderes de administração, gerência, ou movimentação de conta-corrente de EMPRESÁRIO INDIVIDUAL, SOCIEDADE EMPRESÁRIA ou COOPERATIVA?",
      G_S1,
    ),
    coaf(
      "S-967",
      "A operação se refere a AUMENTO DE CAPITAL com possíveis indícios de que este aumento não possua correspondência com o valor ou o patrimônio da empresa?",
      G_S1,
    ),
    coaf(
      "S-968",
      "Tendo em vista as PARTES, DEMAIS ENVOLVIDOS, VALORES, MODO DE REALIZAÇÃO E FORMA DE PAGAMENTO, a operação pode ser considerada suspeita de configurar SÉRIOS INDÍCIOS de ocorrência de lavagem de dinheiro ou financiamento de terrorismo?",
      G_S1,
    ),
    {
      id: "S-969",
      texto:
        "A operação se enquadra em outras situações previstas como suspeita em INSTRUÇÕES COMPLEMENTARES (do próprio COAF, bem como do CNJ ou CGJ/SP)?",
      grupo: G_S1,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          alerta: "Comunicação ao COAF — S-969: outras situações previstas como suspeitas.",
          filhos: [
            {
              id: "S-969-1",
              texto: "Descreva a situação identificada:",
              codigo: "969.1",
              tipo: "texto",
              ajuda: "Campo de texto livre, sem limite de quantidade de caracteres",
            },
          ],
        },
      ],
    },
    coaf(
      "S-973",
      "Trata-se de caso de TRANSMISSÕES SUCESSIVAS de um MESMO BEM em período não superior a 06 (seis) meses, com DIFERENÇAS de VALOR DECLARADO em mais de 50% (cinquenta por cento)?",
      G_S2,
    ),
    coaf(
      "S-974-a",
      "A operação se refere a registro de título com DIFERENÇAS entre valor de avaliação FISCAL (IPTU, ITR, ITBI, ITCMD) e o valor DECLARADO, superiores a 100% (cem por cento), para mais ou para menos?",
      G_S2,
    ),
    { id: "S-974-a-1", texto: "Valor declarado (R$):", grupo: G_S2, codigo: "974-a.1", tipo: "numero" },
    {
      id: "S-974-a-2",
      texto: "Valor fiscal para fins de IPTU (se urbano) ou ITR (se rural) (R$):",
      grupo: G_S2,
      codigo: "974-a.2",
      tipo: "numero",
    },
    {
      id: "S-974-a-3",
      texto: "Valor fiscal para fins de ITBI/ITCMD (R$):",
      grupo: G_S2,
      codigo: "974-a.3",
      tipo: "numero",
    },
    coaf(
      "S-974-b",
      "A operação se refere a registro de título com DIFERENÇAS entre valor PATRIMONIAL (DE MERCADO) e o valor DECLARADO, superiores a 100% (cem por cento), para mais ou para menos?",
      G_S2,
    ),
    ...camposMercado("S-974-b", G_S2),
    coaf(
      "S-975",
      "A operação se refere a registro de título em que conste DECLARAÇÃO DAS PARTES de que o pagamento foi feito EM ESPÉCIE ou em TÍTULO AO PORTADOR, SUPERIOR a R$ 30.000,00?",
      G_S2,
    ),
    coaf(
      "S-976",
      "A operação se refere a uma DOAÇÃO para terceiros sem vínculo familiar com o doador, referente a bem imóvel (ou direito real) cujo valor venal municipal seja igual ou superior a R$ 100.000,00 (cem mil reais)?",
      G_S3,
    ),
    coaf(
      "S-977",
      "A operação se refere a EMPRÉSTIMO com garantia HIPOTECÁRIA ou FIDUCIÁRIA entre particulares?",
      G_S3,
    ),
    coaf(
      "S-978",
      "A operação se refere a registro de título que se refira a negócios celebrados por sociedade que tenha sido dissolvida e tenha retornado à atividade?",
      G_S3,
    ),
    coaf(
      "S-979",
      "A operação se refere a AQUISIÇÃO DE IMÓVEL por FUNDAÇÕES E ASSOCIAÇÕES, e as características do negócio não se coadunam com as suas finalidades estatutárias?",
      G_S3,
    ),
  ],
};
