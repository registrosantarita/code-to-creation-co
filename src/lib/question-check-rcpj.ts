// Transcrição estruturada do Checklist de Qualificação do Registro Civil das
// Pessoas Jurídicas (Seções A–F). Cada nó preserva o texto original das
// perguntas, alertas e exigências do documento fornecido pelo Oficial.
import type { Secao } from "./question-check-types";

const G_A = "Prenotação, Título e Contraditório";
const G_B_GERAL = "Disposições Gerais";
const G_B1 = "Disposições específicas para fundação de Associações e Organizações Religiosas";
const G_B2 = "Disposições específicas para Eleição e/ou Posse";
const G_B3 = "Disposições específicas para alteração de Estatuto";
const G_B4 = "Disposições específicas para dissolução de Pessoa Jurídica";
const G_C_GERAL = "Disposições Gerais sobre o Contrato Social";
const G_C1 = "Alteração da Sociedade (Alteração do Contrato Social)";
const G_C2 = "Dissolução da Sociedade (Distrato Social)";
const G_F1 = "Operações Suspeitas (art. 20, Provimento CNJ 88)";
const G_F2 = "Hipóteses de Comunicação Automática (art. 27, Provimento CNJ 88)";

/** Perguntas COAF: sim gera alerta, não interrompe o fluxo. */
function coaf(id: string, texto: string, grupo: string) {
  return {
    id,
    texto,
    grupo,
    tipo: "sim_nao" as const,
    efeitos: [{ quando: "sim", alerta: `Comunicação ao COAF — ${id}: ${texto}` }],
  };
}

const SECAO_A: Secao = {
  id: "A",
  titulo: "Itens comuns a todas as Pessoas Jurídicas",
  itens: [
    {
      id: "A-1",
      texto: "O título foi prenotado?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [
        { quando: "nao", alerta: "Título não prenotado e sem prioridade sobre quaisquer outros!" },
      ],
    },
    {
      id: "A-2",
      texto: "Será necessária a renumeração dos atos já praticados e atualização no sistema?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "A-2-1",
              texto: "Já foi feita a renumeração?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  alerta: "Necessária renumeração até o final do processo de registro.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "A-3",
      texto: "A Pessoa Jurídica tem registro na Serventia?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "A-3-1",
              texto: "Consta o CNPJ nos indicadores?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Necessário que conste o número do CNPJ no título ou em documento oficial a ser apresentado.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "A-4",
      texto:
        "Há outra Pessoa Jurídica com a mesma denominação ou similares a ponto de gerar confusão, registrada na Serventia?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          exigencia:
            "Não é possível o registro de Pessoa Jurídica com o nome escolhido, pois já existe outra com o mesmo nome / nome semelhante, capaz de gerar confusão entre ambas.",
        },
      ],
    },
    {
      id: "A-5",
      texto:
        "A estrutura do nome da Pessoa Jurídica analisada contém elemento que pertença a outra espécie e que possa causar confusão em razão de sua natureza?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          exigencia:
            "Não é possível o registro de Pessoa Jurídica com a expressão utilizada, uma vez que é típica de outra espécie societária e, portanto, capaz de gerar confusão entre ambas.",
        },
      ],
    },
    {
      id: "A-6",
      texto: "A Pessoa Jurídica analisada contém em seu nome as siglas “ME” ou “EPP”?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          exigencia:
            "Não é possível o registro de Pessoa Jurídica com nome que contenha as partículas “ME” ou “EPP”, por expressa vedação legal nesse sentido.",
        },
      ],
    },
    {
      id: "A-7",
      texto:
        "Os dados da Pessoa Jurídica e dos seus integrantes, constantes do título, foram cadastrados no Controle de Contraditório?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [{ quando: "nao", alerta: "Cadastrar dados no Controle do Contraditório." }],
    },
    {
      id: "A-8",
      texto: "O Controle do Contraditório foi executado?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          alerta: "Controle do Contraditório não executado – risco ao princípio da prioridade!",
        },
        {
          quando: "sim",
          filhos: [
            {
              id: "A-8-1",
              texto: "Foi encontrada alguma ocorrência?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "sim",
                  alerta:
                    "Anote todas as ocorrências (ex.: indisponibilidades, bloqueios, direitos reais, gravames, etc.)",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "A-9",
      texto:
        "Selecione abaixo se há algum caso de Pessoa Jurídica que se enquadre na categoria de registro vedado pelos Comunicados da CGJ/SP:",
      grupo: G_A,
      tipo: "opcoes",
      opcoes: [
        {
          id: "a",
          rotulo:
            "103/2018: Proíbe os Cartórios de registrarem PJs relacionadas a prestação assistencial de idosos ou congêneres a bem do serviço público",
        },
        {
          id: "b",
          rotulo:
            "2109/2018 (Proc. 1015357-82.2016.8.26.0053): Proíbe os Cartórios de registrarem PJ em nome de EVAILSON DOS SANTOS TEIXEIRA COELHO e IRACY PEREIRA DOS SANTOS, que tenha por objeto a prestação de serviços relacionados ao idoso",
        },
        { id: "c", rotulo: "Não se aplica." },
      ],
      efeitos: [
        {
          quando: "opcao:a",
          exigencia:
            "O título não pode ser registrado em razão de vedação expressa da Corregedoria Geral da Justiça do Estado de São Paulo, veiculada no Comunicado 103/2018.",
        },
        {
          quando: "opcao:b",
          exigencia:
            "O título não pode ser registrado em razão de vedação expressa da Corregedoria Geral da Justiça do Estado de São Paulo, veiculada no Comunicado 2109/2018.",
        },
        { quando: "nenhuma", alerta: "Escolha uma das opções." },
      ],
    },
    {
      id: "A-10",
      texto: "É caso de informar o Siscoaf?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [{ quando: "sim", alerta: "Informar o Siscoaf ao final do registro." }],
    },
    {
      id: "A-11",
      texto: "Há Requerimento?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          filhos: [
            {
              id: "A-11-1",
              texto: "Trata-se de alguma hipótese de dispensa de Requerimento?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia: "Não foi apresentado o Requerimento, o que é necessário.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "A-12",
      texto: "Selecione o formato do Requerimento:",
      grupo: G_A,
      tipo: "opcoes",
      opcoes: [
        { id: "a", rotulo: "Papel" },
        { id: "b", rotulo: "Eletrônico" },
      ],
      efeitos: [
        {
          quando: "opcao:a",
          filhos: [
            {
              id: "A-12-1",
              texto:
                "Foi assinado pelo interessado/representante legal/administrador com firma reconhecida?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "sim",
                  filhos: [
                    {
                      id: "A-12-1-1",
                      texto:
                        "Foram confirmados os selos dos reconhecimentos de firma e das autenticações dos documentos apresentados, no site do Portal Extrajudicial?",
                      tipo: "sim_nao",
                      efeitos: [
                        {
                          quando: "nao",
                          exigencia:
                            "Não foi possível a confirmação dos selos de autenticidade dos reconhecimentos de firma e autenticações dos documentos apresentados.",
                        },
                      ],
                    },
                  ],
                },
                {
                  quando: "nao",
                  filhos: [
                    {
                      id: "A-12-1-2",
                      texto: "Trata-se de algum caso de dispensa legal de reconhecimento de firma?",
                      tipo: "sim_nao",
                      efeitos: [
                        {
                          quando: "nao",
                          exigencia: "Necessário reconhecimento da firma dos signatários.",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          quando: "opcao:b",
          filhos: [
            {
              id: "A-12-2",
              texto: "Qual o tipo de formato eletrônico?",
              tipo: "opcoes",
              opcoes: [
                { id: "b.1", rotulo: "Digital Nativo" },
                { id: "b.2", rotulo: "Digitalizado" },
              ],
              efeitos: [
                {
                  quando: "opcao:b.1",
                  filhos: [
                    {
                      id: "A-12-2-1",
                      texto:
                        "Consta assinatura do interessado na modalidade qualificada (ICP-Brasil) ou avançada (GOV)?",
                      tipo: "sim_nao",
                      efeitos: [
                        {
                          quando: "nao",
                          exigencia:
                            "A modalidade de assinatura eletrônica utilizada não permite o ingresso do Requerimento no Registro Civil das Pessoas Jurídicas.",
                        },
                      ],
                    },
                  ],
                },
                {
                  quando: "opcao:b.2",
                  filhos: [
                    {
                      id: "A-12-2-2",
                      texto:
                        "Constam os requisitos do Decreto 10.278/20 e mais assinatura eletrônica de uma das partes, na modalidade qualificada (ICP-Brasil) ou avançada (GOV)?",
                      tipo: "sim_nao",
                      efeitos: [
                        { quando: "nao", exigencia: "Faltam os requisitos do Decreto 10.278/20." },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "A-13",
      texto: "Selecione o formato do Título apresentado:",
      grupo: G_A,
      tipo: "opcoes",
      opcoes: [
        { id: "a", rotulo: "Papel" },
        { id: "b", rotulo: "Eletrônico" },
      ],
      efeitos: [
        {
          quando: "opcao:a",
          filhos: [
            {
              id: "A-13-1",
              texto: "Foi assinado pelas partes com firma reconhecida?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "sim",
                  filhos: [
                    {
                      id: "A-13-1-1",
                      texto:
                        "Foram confirmados os selos dos reconhecimentos de firma e das autenticações dos documentos apresentados, no site do Portal Extrajudicial?",
                      tipo: "sim_nao",
                      efeitos: [
                        {
                          quando: "nao",
                          exigencia:
                            "Não foi possível a confirmação dos selos de autenticidade dos reconhecimentos de firma e autenticações dos documentos apresentados.",
                        },
                      ],
                    },
                  ],
                },
                {
                  quando: "nao",
                  filhos: [
                    {
                      id: "A-13-1-2",
                      texto: "Trata-se de algum caso de dispensa legal de reconhecimento de firma?",
                      tipo: "sim_nao",
                      efeitos: [
                        {
                          quando: "nao",
                          exigencia: "Necessário reconhecimento da firma dos signatários.",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          quando: "opcao:b",
          filhos: [
            {
              id: "A-13-2",
              texto: "Qual o tipo de formato eletrônico?",
              tipo: "opcoes",
              opcoes: [
                { id: "b.1", rotulo: "Digital Nativo" },
                { id: "b.2", rotulo: "Digitalizado" },
              ],
              efeitos: [
                {
                  quando: "opcao:b.1",
                  filhos: [
                    {
                      id: "A-13-2-1",
                      texto:
                        "Consta assinatura das partes na modalidade qualificada (ICP-Brasil) ou avançada (GOV)?",
                      tipo: "sim_nao",
                      efeitos: [
                        {
                          quando: "nao",
                          exigencia:
                            "A modalidade de assinatura eletrônica utilizada não permite o ingresso do Título no Registro Civil das Pessoas Jurídicas.",
                        },
                      ],
                    },
                  ],
                },
                {
                  quando: "opcao:b.2",
                  filhos: [
                    {
                      id: "A-13-2-2",
                      texto:
                        "Constam os requisitos do Decreto 10.278/20 e mais assinatura eletrônica de uma das partes, na modalidade qualificada (ICP-Brasil) ou avançada (GOV)?",
                      tipo: "sim_nao",
                      efeitos: [
                        { quando: "nao", exigencia: "Faltam os requisitos do Decreto 10.278/20." },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "A-14",
      texto: "O Requerimento, Ata ou Contrato Social contêm rasuras ou entrelinhas?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          exigencia:
            "O Requerimento, Ata ou Contrato Social apresentam rasuras e/ou entrelinhas, o que impede o registro.",
        },
      ],
    },
    {
      id: "A-15",
      texto: "Há documentos em cópias (simples/autenticadas), como anexos?",
      grupo: G_A,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          alerta:
            "As cópias de documentos apresentadas como anexo deverão ser elencadas na Certificação do Registro.",
        },
      ],
    },
    {
      id: "A-16",
      texto: "Selecione a natureza do ato a ser praticado:",
      grupo: G_A,
      tipo: "opcoes",
      opcoes: [
        { id: "a", rotulo: "Registro de Associação ou Organização Religiosa" },
        { id: "b", rotulo: "Registro de Sociedade Simples" },
        { id: "c", rotulo: "Averbação de alteração de Estatuto" },
        { id: "d", rotulo: "Averbação de Eleição e Posse" },
        { id: "e", rotulo: "Averbação de dissolução de associação ou organização religiosa" },
        { id: "f", rotulo: "Distrato Social" },
        { id: "g", rotulo: "Registro e Autenticação de Livros Contábeis de pessoas jurídicas" },
      ],
      efeitos: [{ quando: "nenhuma", alerta: "Selecione a natureza do ato a ser praticado." }],
    },
  ],
};

const SECAO_B: Secao = {
  id: "B",
  titulo: "Ata de Assembleia ou Reunião",
  itens: [
    {
      id: "B-1",
      texto: "O ato a ser registrado/averbado pelo título demanda convocação de Edital?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
    },
    {
      id: "B-2",
      texto: "Foi apresentado o Edital de Convocação?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          filhos: [
            {
              id: "B-2-1",
              texto: "Há alguma hipótese de dispensa ou desnecessidade de apresentá-lo?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia: "O Edital de Convocação não foi apresentado, o que é necessário.",
                },
              ],
            },
          ],
        },
        {
          quando: "sim",
          filhos: [
            {
              id: "B-2-2",
              texto: "O Edital foi assinado por quem tem poderes para fazê-lo?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "O Edital de Convocação não foi assinado por quem tem o poder estatutário de fazê-lo.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "B-3",
      texto: "Consta do Edital apresentado a deliberação sobre o assunto tratado no título?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          filhos: [
            {
              id: "B-3-1",
              texto: "O Estatuto permite deliberação de assunto não incluso em pauta?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "O Edital não constou expressamente como pauta o(s) assunto(s) tratados no título, o que é necessário.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "B-4",
      texto:
        "O Edital de Convocação foi publicado com a antecedência mínima prevista no Estatuto para o tipo de reunião ou assunto a ser tratado em assembleia?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia: "O Edital não foi publicado com a antecedência mínima exigida pelo Estatuto.",
        },
      ],
    },
    {
      id: "B-5",
      texto: "O Estatuto exige publicação do Edital na imprensa?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "B-5-1",
              texto:
                "Foi apresentada a publicação por página inteira, seja em original ou em cópia autenticada?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "O Edital publicado na imprensa não foi apresentado em página inteira.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "B-6",
      texto:
        "Há como verificar se foi respeitado o quórum de instalação estabelecido no Estatuto para a matéria tratada na reunião?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "B-6-1",
              texto: "Em qual convocação a reunião foi iniciada?",
              tipo: "opcoes",
              opcoes: [
                { id: "a", rotulo: "Primeira convocação" },
                { id: "b", rotulo: "Segunda ou demais convocações" },
              ],
            },
          ],
        },
        {
          quando: "nao",
          exigencia:
            "Não há informações na Ata sobre o quórum de instalação da reunião, quer seja a convocação, quer seja o horário exato do início.",
        },
      ],
    },
    {
      id: "B-7",
      texto: "A Pessoa Jurídica está identificada na Ata?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia: "A Pessoa Jurídica não está identificada na Ata, o que é necessário.",
        },
      ],
    },
    {
      id: "B-8",
      texto: "Consta da Ata o número de inscrição da Pessoa Jurídica no CNPJ?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          filhos: [
            {
              id: "B-8-1",
              texto: "Trata-se de algum caso de dispensa ou desnecessidade?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Não constou da Ata o número de inscrição da Pessoa Jurídica no CNPJ, o que é necessário.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "B-9",
      texto: "Consta lista de presença, datada do dia da reunião?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          filhos: [
            {
              id: "B-9-1",
              texto: "Consta da Ata, ao menos, o nome de todos os presentes?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Não foi apresentada a Lista de Presença, nem tampouco constou alternativamente na Ata o nome dos presentes.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "B-10",
      texto: "A Assembleia ou Reunião foi presidida por quem era competente?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia: "A Reunião ou Assembleia não foi presidida pelo membro competente.",
        },
      ],
    },
    {
      id: "B-11",
      texto: "Consta a rubrica do presidente da reunião em todas as páginas da Ata?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
      efeitos: [{ quando: "nao", exigencia: "A Ata não foi rubricada pelo presidente da reunião." }],
    },
    {
      id: "B-12",
      texto: "Consta assinatura do Representante Legal e do Secretário que lavrou a Ata?",
      grupo: G_B_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "A Ata não foi assinada pelo Representante Legal e pelo Secretário que a lavrou.",
        },
      ],
    },
    {
      id: "B-13",
      texto: "Selecione o tipo de Ata apresentada:",
      grupo: G_B_GERAL,
      tipo: "opcoes",
      opcoes: [
        {
          id: "a",
          rotulo: "Traslado (transcrição integral) da Ata constante do livro da Pessoa Jurídica",
        },
        { id: "b", rotulo: "Ata Original" },
      ],
      efeitos: [
        {
          quando: "opcao:a",
          filhos: [
            {
              id: "B-13-1",
              texto:
                "Consta menção expressa de que seus dizeres correspondem ao conteúdo do livro original?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "A Ata apresentada é uma transcrição integral da Ata que consta do Livro em que foi lavrada. Contudo, não constou declaração de que seus dizeres correspondem ao conteúdo da que se encontra arquivada no Livro.",
                },
              ],
            },
          ],
        },
      ],
    },

    // Subseção B-1
    {
      id: "B-Sub1_1",
      texto: "Foi apresentado o DBE (Documento Básico de Entrada)?",
      grupo: G_B1,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária apresentação do Documento Básico de Entrada, acessível pelo Redesim.",
        },
      ],
    },
    {
      id: "B-Sub1_2",
      texto: "Consta da Ata que o objetivo da reunião é criar uma nova Pessoa Jurídica?",
      grupo: G_B1,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária menção expressa sobre o propósito da reunião em criar uma nova Pessoa Jurídica.",
        },
      ],
    },
    {
      id: "B-Sub1_3",
      texto: "Consta o nome e qualificação dos fundadores?",
      grupo: G_B1,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia: "Necessária qualificação completa dos fundadores da Pessoa Jurídica.",
        },
      ],
    },
    {
      id: "B-Sub1_4",
      texto:
        "Consta na Ata a aprovação da criação da Pessoa Jurídica bem como do seu respectivo Estatuto?",
      grupo: G_B1,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária menção expressa sobre a aprovação dos presentes a respeito da criação da Pessoa Jurídica.",
        },
      ],
    },
    {
      id: "B-Sub1_5",
      texto:
        "Tendo em vista a natureza da atividade desenvolvida, é necessário visto/autorização do Conselho Profissional competente?",
      grupo: G_B1,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "B-Sub1_5-1",
              texto: "O visto ou a autorização foram apresentados?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Necessária apresentação de autorização do Conselho Profissional competente, ou visto no Distrato Social, em qualquer caso com reconhecimento de firma, ou, alternativamente, com assinatura eletrônica qualificada ou avançada.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "B-Sub1_6",
      texto: "O Estatuto foi rubricado pelo representante legal da Pessoa Jurídica?",
      grupo: G_B1,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária rubrica do Representante Legal da Pessoa Jurídica em todas as folhas do Estatuto.",
        },
      ],
    },
    {
      id: "B-Sub1_7",
      texto: "Selecione os requisitos abaixo, presentes no Estatuto.",
      grupo: G_B1,
      tipo: "multipla",
      opcoes: [
        { id: "a", rotulo: "Denominação social" },
        {
          id: "b",
          rotulo:
            "Declaração de ser uma associação / organização religiosa sem fins econômicos, conforme o caso",
        },
        { id: "c", rotulo: "Endereço completo da sede social" },
        { id: "d", rotulo: "Finalidade da associação" },
        { id: "e", rotulo: "Fundo social, quando houver", obrigatorio: false },
        {
          id: "f",
          rotulo: "Prazo de duração ou disposição de que vigorará por tempo indeterminado",
        },
        { id: "g", rotulo: "Requisitos para a admissão dos associados" },
        { id: "h", rotulo: "Requisitos para a demissão (voluntária) dos associados" },
        {
          id: "i",
          rotulo:
            "Requisitos para a exclusão (compulsória) dos associados: a exclusão do associado só é admissível havendo justa causa, assim reconhecida em procedimento que assegure direito de defesa e de recurso, nos termos previstos no Estatuto",
        },
        { id: "j", rotulo: "Direitos e deveres dos associados ou membros" },
        { id: "k", rotulo: "Forma de gestão administrativa" },
        { id: "l", rotulo: "Forma de aprovação das contas" },
        {
          id: "m",
          rotulo:
            "Se os associados ou membros respondem subsidiariamente ou não pelas obrigações sociais",
        },
        { id: "n", rotulo: "Composição e funcionamento da Assembleia Geral" },
        {
          id: "o",
          rotulo:
            "Competência privativa da Assembleia Geral para destituição dos administradores e alteração do Estatuto com previsão de deliberação em Assembleia Geral especialmente convocada para essas finalidades",
        },
        {
          id: "p",
          rotulo:
            "Menção sobre o fato de o ato constitutivo ser ou não reformável no tocante à administração e de que modo",
        },
        {
          id: "q",
          rotulo:
            "Composição, mandato, modo de Eleição, funcionamento e competência dos órgãos deliberativos",
        },
        { id: "r", rotulo: "Modo de representação da associação" },
        { id: "s", rotulo: "Condições para alteração do Estatuto social" },
        { id: "t", rotulo: "Condições para dissolução da associação" },
        { id: "u", rotulo: "Destino do patrimônio social, no caso de dissolução" },
        { id: "v", rotulo: "Fontes de recursos para a manutenção da associação" },
        {
          id: "w",
          rotulo:
            "Não contrariar normas de ordem pública da legislação em geral, a moral e os bons costumes",
        },
      ],
      efeitos: [{ quando: "faltando", exigencia: "Faltou o seguinte requisito obrigatório:" }],
    },

    // Subseção B-2
    {
      id: "B-Sub2_1",
      texto: "Selecione os itens constantes da Ata a respeito dos membros eleitos:",
      grupo: G_B2,
      tipo: "multipla",
      opcoes: [
        { id: "a", rotulo: "Nome completo" },
        { id: "b", rotulo: "Nacionalidade" },
        { id: "c", rotulo: "Profissão" },
        { id: "d", rotulo: "RG ou RNE e CPF" },
        { id: "e", rotulo: "Estado civil" },
        { id: "f", rotulo: "Endereço" },
      ],
      efeitos: [{ quando: "faltando", exigencia: "Faltou o seguinte requisito obrigatório:" }],
    },
    {
      id: "B-Sub2_2",
      texto: "Os cargos preenchidos pela Eleição estão previstos no Estatuto?",
      grupo: G_B2,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia: "Os cargos preenchidos pela Eleição não estão previstos no Estatuto vigente.",
        },
      ],
    },
    {
      id: "B-Sub2_3",
      texto: "O mandato constante da Ata coincide com o previsto no Estatuto vigente?",
      grupo: G_B2,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia: "O mandato constante da Ata não coincide com o previsto no Estatuto vigente.",
        },
      ],
    },
    {
      id: "B-Sub2_4",
      texto: "O mandato dos cargos sujeitos à Eleição está vencido?",
      grupo: G_B2,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          filhos: [
            {
              id: "B-Sub2_4-1",
              texto: "Ao menos estará vencido quando os novos membros eleitos entrarem na Posse?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "O mandato da última Diretoria ainda estará vigente na data de início do mandato dos membros agora eleitos e/ou empossados, o que não é possível.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "B-Sub2_5",
      texto: "Consta averbada a Ata de Eleição anterior?",
      grupo: G_B2,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária prévia averbação da Eleição para o mandato anterior, em razão do princípio da continuidade.",
        },
      ],
    },
    {
      id: "B-Sub2_6",
      texto: "Constam na mesma Ata a deliberação sobre a Eleição e a Posse?",
      grupo: G_B2,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "B-Sub2_6-1",
              texto: "Os membros eleitos e empossados estavam presentes na Assembleia?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Não há comprovação de que os membros eleitos estavam presentes na Assembleia que os elegeu, o que é absolutamente necessário em razão da previsão de Posse instantânea dos eleitos.",
                },
              ],
            },
          ],
        },
        {
          quando: "nao",
          filhos: [
            {
              id: "B-Sub2_6-2",
              texto: "Trata-se de caso em que a Posse ocorre posteriormente à Eleição?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Não constou da Ata o momento em que os membros eleitos entraram na Posse dos cargos.",
                },
                {
                  quando: "sim",
                  filhos: [
                    {
                      id: "B-Sub2_6-2-1",
                      texto:
                        "Foram apresentadas duas Atas, sendo uma para Eleição e outra para Posse?",
                      tipo: "sim_nao",
                      efeitos: [
                        {
                          quando: "sim",
                          alerta:
                            "Cada Ata deve ser objeto de Prenotação separada e registros separados.",
                        },
                        {
                          quando: "nao",
                          filhos: [
                            {
                              id: "B-Sub2_6-2-1-1",
                              texto: "Selecione a opção correspondente ao caso analisado:",
                              tipo: "opcoes",
                              opcoes: [
                                { id: "a", rotulo: "Foi apresentada apenas a Ata de Eleição" },
                                { id: "b", rotulo: "Foi apresentada apenas a Ata de Posse" },
                              ],
                              efeitos: [
                                {
                                  quando: "opcao:a",
                                  alerta:
                                    "Averbação possível, desde que os demais requisitos de qualificação estiverem corretos. A Posse poderá ser averbada posteriormente.",
                                },
                                {
                                  quando: "opcao:b",
                                  exigencia:
                                    "Não é possível averbar a Posse sem a prévia averbação da Eleição.",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // Subseção B-3
    {
      id: "B-Sub3_1",
      texto: "O Estatuto alterado foi rubricado pelo Representante Legal da Pessoa Jurídica?",
      grupo: G_B3,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária rubrica do Representante Legal da Pessoa Jurídica em todas as folhas do Estatuto alterado.",
        },
      ],
    },
    {
      id: "B-Sub3_2",
      texto: "O Estatuto foi alterado conforme as regras do Estatuto vigente?",
      grupo: G_B3,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "O Estatuto não foi alterado conforme as regras do Estatuto vigente – mencionar os motivos.",
        },
      ],
    },
    {
      id: "B-Sub3_3",
      texto:
        "Os artigos do Estatuto que se pretendem alterar versam sobre matéria que não possa ser objeto de alteração?",
      grupo: G_B3,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          exigencia:
            "Os artigos alterados no Estatuto se referem a matérias que não podem ser objeto de reforma.",
        },
      ],
    },
    {
      id: "B-Sub3_4",
      texto: "Consta da Ata que o Estatuto foi aprovado pelos presentes?",
      grupo: G_B3,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Não consta da Ata que os artigos alterados, ou que o Estatuto consolidado tenham sido aprovados pelos presentes.",
        },
      ],
    },
    {
      id: "B-Sub3_5",
      texto: "Foi apresentado o Estatuto Social consolidado, após as alterações realizadas?",
      grupo: G_B3,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária apresentação da versão consolidada do Estatuto Social após as alterações realizadas.",
        },
        {
          quando: "sim",
          filhos: [
            {
              id: "B-Sub3_5-1",
              texto:
                "Na versão consolidada do Estatuto, a nova redação dos artigos está de acordo com as alterações deliberadas na Ata e os artigos inalterados continuam com a mesma redação anterior?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "A nova redação dos artigos alterados não está de acordo com o que foi deliberado na Assembleia Geral. // OU // A versão consolidada do Estatuto contém outros artigos alterados, os quais não integraram a pauta da Assembleia Geral.",
                },
              ],
            },
          ],
        },
      ],
    },

    // Subseção B-4
    {
      id: "B-Sub4_1",
      texto: "O mandato dos cargos sujeitos à Eleição está vencido?",
      grupo: G_B4,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          filhos: [
            {
              id: "B-Sub4_1-1",
              texto: "Ao menos estará vencido quando os novos membros eleitos entrarem na Posse?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "O mandato da última Diretoria ainda estará vigente na data de início do mandato dos membros agora eleitos e/ou empossados, o que não é possível.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "B-Sub4_2",
      texto: "Consta averbada a Ata de Eleição anterior?",
      grupo: G_B4,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária prévia averbação da Eleição para o mandato anterior, em razão do princípio da continuidade.",
        },
      ],
    },
    {
      id: "B-Sub4_3",
      texto: "Foi apresentado o DBE (Documento Básico de Entrada)?",
      grupo: G_B4,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária apresentação do Documento Básico de Entrada, acessível pelo Redesim.",
        },
      ],
    },
    {
      id: "B-Sub4_4",
      texto: "Foi apresentada a Certidão Negativa de Débitos relativos ao FGTS?",
      grupo: G_B4,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Embora a CND Previdenciária seja dispensada por força de lei, não foi apresentada a CND relativa ao FGTS em nome da Pessoa Jurídica dissolvida, o que é necessário.",
        },
      ],
    },
    {
      id: "B-Sub4_5",
      texto:
        "Consta da Ata o motivo da Assembleia de Dissolução, e que tenha sido votada e aprovada a dissolução?",
      grupo: G_B4,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Não constou o motivo da dissolução, nem tampouco o fato de ter sido votada e aprovada.",
        },
      ],
    },
    {
      id: "B-Sub4_6",
      texto:
        "Consta da Ata o nome e qualificação completa do membro que ficará responsável pela guarda dos livros contábeis da Pessoa Jurídica?",
      grupo: G_B4,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária a indicação do nome e qualificação completa do membro que ficará responsável pela guarda dos livros contábeis da Pessoa Jurídica.",
        },
      ],
    },
    {
      id: "B-Sub4_7",
      texto:
        "Consta da Ata o destino do patrimônio líquido, observado o artigo 61 do Código Civil e as regras do Estatuto Social?",
      grupo: G_B4,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia: "Não constou da Ata o destino do patrimônio líquido após a dissolução.",
        },
      ],
    },
    {
      id: "B-Sub4_8",
      texto:
        "Tendo em vista a natureza da atividade desenvolvida, é necessário visto/autorização do Conselho Profissional competente?",
      grupo: G_B4,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "B-Sub4_8-1",
              texto: "O visto ou a autorização foram apresentados?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Necessária apresentação de autorização do Conselho Profissional competente, ou visto no Distrato Social, em qualquer caso com reconhecimento de firma, ou, alternativamente, com assinatura eletrônica qualificada ou avançada.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "B-Sub4_9",
      texto: "Há visto de advogado, com prova de inscrição na OAB?",
      grupo: G_B4,
      tipo: "sim_nao",
      efeitos: [
        { quando: "nao", exigencia: "Necessário visto de advogado devidamente inscrito na OAB." },
      ],
    },
  ],
};

const SECAO_C: Secao = {
  id: "C",
  titulo: "Sociedades Simples",
  itens: [
    {
      id: "C-1",
      texto: "Foi apresentado o DBE (Documento Básico de Entrada)?",
      grupo: G_C_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária apresentação do Documento Básico de Entrada, acessível pelo Redesim.",
        },
      ],
    },
    {
      id: "C-2",
      texto: "Todas as folhas estão rubricadas pelos sócios?",
      grupo: G_C_GERAL,
      tipo: "sim_nao",
      efeitos: [
        { quando: "nao", exigencia: "Não consta a rubrica de todos os sócios no instrumento." },
      ],
    },
    {
      id: "C-3",
      texto: "Selecione abaixo os requisitos presentes no título:",
      grupo: G_C_GERAL,
      tipo: "multipla",
      opcoes: [
        { id: "a", rotulo: "Nome completo dos sócios, sem abreviaturas" },
        {
          id: "b",
          rotulo:
            "Documentos de identificação, nacionalidade, estado civil, profissão e endereço dos sócios",
        },
        { id: "c", rotulo: "Número de inscrição da sociedade no CNPJ" },
        { id: "d", rotulo: "Tipo societário" },
        { id: "e", rotulo: "Endereço da sede social" },
        { id: "f", rotulo: "Objeto da sociedade" },
        {
          id: "g",
          rotulo: "Prazo de duração ou disposição de que vigorará por tempo indeterminado",
        },
        { id: "h", rotulo: "Capital social expresso em moeda corrente" },
        { id: "i", rotulo: "Administração da sociedade" },
        { id: "j", rotulo: "Responsabilidade dos sócios em relação ao capital social" },
        { id: "k", rotulo: "Participação de cada sócio nos lucros e nas perdas" },
        { id: "l", rotulo: "Data do encerramento do exercício social" },
        {
          id: "m",
          rotulo:
            "Declaração de desimpedimento para o exercício da administração (art. 1.011, §1º, CC)",
        },
        { id: "n", rotulo: "Local e data da assinatura do contrato" },
        { id: "o", rotulo: "Data, local e assinaturas dos sócios" },
      ],
      efeitos: [{ quando: "faltando", exigencia: "Faltou o seguinte requisito obrigatório:" }],
    },
    {
      id: "C-4",
      texto:
        "O objeto social indica destino ou atividades ilícitos ou contrários, nocivos ou perigosos ao bem público, à segurança do Estado e da coletividade, à ordem pública ou social, à moral e aos bons costumes?",
      grupo: G_C_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          exigencia:
            "O objeto social demonstra atividade contrária ou nociva ao bem público, segurança do Estado e da coletividade, ordem pública ou social, à moral e aos bons costumes.",
        },
      ],
    },
    {
      id: "C-5",
      texto: "Selecione abaixo o tipo societário:",
      grupo: G_C_GERAL,
      tipo: "opcoes",
      opcoes: [
        { id: "a", rotulo: "Sociedade Simples Pura" },
        { id: "b", rotulo: "Sociedade Simples Limitada" },
      ],
      efeitos: [
        {
          quando: "opcao:a",
          filhos: [
            {
              id: "C-5-1",
              texto: "Consta do nome a partícula “S/S” ou a expressão “Sociedade Simples”?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Tendo em vista o tipo societário constante do Contrato Social, não constou a partícula “S/S”, nem tampouco a expressão “Sociedade Simples”.",
                },
              ],
            },
          ],
        },
        {
          quando: "opcao:b",
          filhos: [
            {
              id: "C-5-2",
              texto:
                "Consta do nome a partícula “Ltda” ou a expressão “Limitada”, conforme o caso?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Tendo em vista o tipo societário constante do Contrato Social, não constou a partícula “Ltda”, nem tampouco a expressão “Limitada”.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "C-6",
      texto: "O nome da sociedade é estruturado como firma (razão social)?",
      grupo: G_C_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "C-6-1",
              texto:
                "Os nomes de todos os sócios constam da razão social, ou, ao menos foi acrescida a expressão “& Cia.” para incluir os nomes não mencionados?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Tendo em vista a escolha da estrutura do nome, não constou a expressão “& Cia.” para incluir os nomes dos sócios não mencionados.",
                },
              ],
            },
          ],
        },
        {
          quando: "nao",
          filhos: [
            {
              id: "C-6-2",
              texto: "Em se tratando de denominação, consta do nome o objeto social?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Tendo em vista a escolha da estrutura do nome, não constou dele o objeto social.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "C-7",
      texto: "A natureza do objeto da sociedade exige a indicação de responsável técnico?",
      grupo: G_C_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "C-7-1",
              texto: "O responsável técnico foi nomeado?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Tendo em vista a natureza do objeto social, necessária a nomeação de responsável técnico.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "C-8",
      texto: "Consta o foro de Eleição?",
      grupo: G_C_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Não constou o foro de Eleição no Contrato Social, o que é necessário tendo em vista o art. 53, III, do Decreto 1.800/96, aplicável às sociedades simples em razão do disposto no art. 1.150, CC.",
        },
      ],
    },
    {
      id: "C-9",
      texto:
        "Havendo sócios solteiros, há indicação da capacidade civil, de acordo com o artigo 5º, CC?",
      grupo: G_C_GERAL,
      tipo: "opcoes",
      opcoes: [
        { id: "a", rotulo: "Sim" },
        { id: "b", rotulo: "Não" },
        { id: "c", rotulo: "Não se aplica" },
      ],
      efeitos: [
        {
          quando: "opcao:b",
          exigencia:
            "Havendo sócios solteiros, não constou a indicação da capacidade civil, nos termos do artigo 5º do Código Civil.",
        },
      ],
    },
    {
      id: "C-10",
      texto: "Havendo sócios casados entre si, há menção ao respectivo regime de bens?",
      grupo: G_C_GERAL,
      tipo: "opcoes",
      opcoes: [
        { id: "a", rotulo: "Sim" },
        { id: "b", rotulo: "Não" },
        { id: "c", rotulo: "Não se aplica" },
      ],
      efeitos: [
        {
          quando: "opcao:b",
          exigencia: "Não constou menção ao regime de bens dos sócios casados entre si.",
        },
        {
          quando: "opcao:a",
          filhos: [
            {
              id: "C-10-1",
              texto: "O regime de bens é o da comunhão universal ou separação obrigatória?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "sim",
                  exigencia:
                    "Não é possível a constituição de sociedade entre cônjuges casados entre si pelo regime da comunhão universal ou da separação obrigatória.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "C-11",
      texto: "Consta menção sobre o capital distribuído entre os sócios?",
      grupo: G_C_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia: "Não consta menção sobre o capital distribuído entre os sócios.",
        },
      ],
    },
    {
      id: "C-12",
      texto:
        "Tendo em vista a natureza da atividade desenvolvida, é necessário visto/autorização do Conselho Profissional competente?",
      grupo: G_C_GERAL,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "C-12-1",
              texto: "O visto ou a autorização foram apresentados?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Necessária apresentação de autorização do Conselho Profissional competente, ou visto no Distrato Social, em qualquer caso com reconhecimento de firma, ou, alternativamente, com assinatura eletrônica qualificada ou avançada.",
                },
              ],
            },
          ],
        },
      ],
    },

    // Subseção C-1
    {
      id: "C-Sub1_1",
      texto:
        "A alteração que se pretende realizar opera a mudança de competência deste RCPJ para o RCPJ de outra Comarca, por mudança de sede?",
      grupo: G_C1,
      tipo: "sim_nao",
    },
    {
      id: "C-Sub1_2",
      texto:
        "A alteração que se pretende realizar opera a mudança de competência de RCPJ de outra Comarca para nosso RCPJ, por mudança de sede?",
      grupo: G_C1,
      tipo: "sim_nao",
    },
    {
      id: "C-Sub1_3",
      texto:
        "A alteração que se pretende realizar opera a mudança de competência deste RCPJ para a Junta Comercial?",
      grupo: G_C1,
      tipo: "sim_nao",
    },
    {
      id: "C-Sub1_4",
      texto:
        "A alteração que se pretende realizar opera a mudança de competência anteriormente atribuída à Junta Comercial para a competência deste RCPJ?",
      grupo: G_C1,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "C-Sub1_4-1",
              texto: "Há prova de que o registro na Junta Comercial foi cancelado ou encerrado?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Necessária comprovação de que o registro da Pessoa Jurídica na Junta Comercial foi devidamente cancelado.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "C-Sub1_5",
      texto:
        "A alteração que se pretende realizar opera a mudança de competência deste RCPJ para a Junta Comercial?",
      grupo: G_C1,
      tipo: "sim_nao",
    },
    {
      id: "C-Sub1_6",
      texto:
        "A versão consolidada do Contrato Social alterado manteve a mesma redação das disposições não alteradas?",
      grupo: G_C1,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "A versão consolidada do Contrato Social apresentou disposições modificadas sem a respectiva correspondência no Instrumento de alteração.",
        },
      ],
    },

    // Subseção C-2
    {
      id: "C-Sub2_1",
      texto: "Consta o motivo da dissolução?",
      grupo: G_C2,
      tipo: "sim_nao",
      efeitos: [{ quando: "nao", exigencia: "Não consta menção sobre o motivo da dissolução." }],
    },
    {
      id: "C-Sub2_2",
      texto: "Consta referência à(s) pessoa(s) que assumirão o ativo e passivo da sociedade?",
      grupo: G_C2,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Não consta menção sobre qual o sócio assumirá a responsabilidade pelo ativo e passivo da sociedade.",
        },
      ],
    },
    {
      id: "C-Sub2_3",
      texto: "Consta referência à(s) pessoa(s) incumbida(s) da guarda dos documentos da sociedade?",
      grupo: G_C2,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Não consta menção sobre quem ficará incumbido da guarda dos documentos da sociedade.",
        },
      ],
    },
    {
      id: "C-Sub2_4",
      texto: "Há nomeação de liquidante?",
      grupo: G_C2,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          filhos: [
            {
              id: "C-Sub2_4-1",
              texto:
                "Trata-se de caso de dispensa ou desnecessidade, devidamente declarada no contrato social?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Não foi nomeado o liquidante, nem tampouco alternativamente declarada sua desnecessidade.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "C-Sub2_5",
      texto:
        "Tendo em vista a natureza da atividade desenvolvida, é necessário visto/autorização do Conselho Profissional competente?",
      grupo: G_C2,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          filhos: [
            {
              id: "C-Sub2_5-1",
              texto: "O visto ou a autorização foram apresentados?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "Necessária apresentação de autorização do Conselho Profissional competente, ou visto no Distrato Social, em qualquer caso com reconhecimento de firma, ou, alternativamente, com assinatura eletrônica qualificada ou avançada.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "C-Sub2_6",
      texto: "Há visto de advogado, com prova de inscrição na OAB?",
      grupo: G_C2,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          filhos: [
            {
              id: "C-Sub2_6-1",
              texto: "Trata-se de ME ou EPP?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia: "Necessário visto de advogado devidamente inscrito na OAB.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const G_D = "Registro e Autenticação de Livros Contábeis (Decreto-lei 486/69 e Decreto 64.567/69)";

const SECAO_D: Secao = {
  id: "D",
  titulo: "Registro e Autenticação de Livros Contábeis",
  itens: [
    {
      id: "D-1",
      texto: "A Pessoa Jurídica tem registro na Serventia?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessário prévio registro da Pessoa Jurídica antes da autenticação pretendida.",
        },
        {
          quando: "sim",
          filhos: [
            {
              id: "D-1-1",
              texto: "Trata-se de associação ou organização religiosa?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "sim",
                  filhos: [
                    {
                      id: "D-1-1-1",
                      texto: "As Atas de Eleição estão regularmente averbadas, conforme a continuidade?",
                      tipo: "sim_nao",
                      efeitos: [
                        {
                          quando: "nao",
                          exigencia: "Necessária regularização da continuidade das Atas de Eleição.",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "D-2",
      texto: "O Livro está rasurado ou possui entrelinhas?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          exigencia:
            "O Livro não pode ser registrado nem autenticado em razão de rasuras e/ou entrelinhas.",
        },
      ],
    },
    {
      id: "D-3",
      texto:
        "Consta no Livro na primeira página o Termo de Abertura e na última o Termo de Encerramento?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia: "Necessário que o Livro contenha Termo de Abertura e de Encerramento.",
        },
      ],
    },
    {
      id: "D-4",
      texto: "Consta do Termo o nome da Pessoa Jurídica, seu endereço e o número do CNPJ?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Não consta do Termo o nome da Pessoa Jurídica, o endereço da sua sede, nem o respectivo número de CNPJ.",
        },
      ],
    },
    {
      id: "D-5",
      texto: "Consta o número de ordem do Livro?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [{ quando: "nao", exigencia: "Não consta o número de ordem do Livro." }],
    },
    {
      id: "D-6",
      texto: "Consta o número de páginas do Livro?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [
        { quando: "nao", exigencia: "Não consta o número de páginas do Livro." },
        {
          quando: "sim",
          filhos: [
            {
              id: "D-6-1",
              texto: "O Livro possui de fato a quantidade de páginas indicadas?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia:
                    "O número de páginas indicado no Livro não coincide com a contagem das suas folhas físicas, o que é necessário.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "D-7",
      texto: "A numeração das folhas é sequencial?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [
        { quando: "nao", exigencia: "A numeração das folhas do Livro não é sequencial." },
      ],
    },
    {
      id: "D-8",
      texto: "O Livro contábil anterior foi autenticado no cartório?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          filhos: [
            {
              id: "D-8-1",
              texto:
                "A ausência se deu por extravio, deterioração ou destruição do instrumento já escriturado?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "nao",
                  exigencia: "Necessária a autenticação do Livro contábil anterior.",
                },
                {
                  quando: "sim",
                  filhos: [
                    {
                      id: "D-8-1-1",
                      texto: "Houve publicação de Edital sobre o fato ocorrido?",
                      tipo: "sim_nao",
                      efeitos: [
                        {
                          quando: "nao",
                          exigencia:
                            "Providenciar o Edital de Publicação noticiando o extravio, deterioração ou destruição do Livro já escriturado e não autenticado.",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "D-9",
      texto: "A data do Termo coincide com o primeiro lançamento?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia: "A data do Termo não coincide com a do primeiro lançamento do Livro.",
        },
      ],
    },
    {
      id: "D-10",
      texto:
        "Consta do Termo a assinatura do Contador e o número de registro no Conselho Regional de Contabilidade?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia:
            "Necessária assinatura do Contador devidamente inscrito no Conselho Regional de Contabilidade.",
        },
      ],
    },
    {
      id: "D-11",
      texto: "Consta do Termo a assinatura do representante legal?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          exigencia: "Necessária assinatura do representante legal da Pessoa Jurídica no Termo.",
        },
      ],
    },
    {
      id: "D-12",
      texto:
        "Procedimento para Arquivamento: (a) lançar o registro no sistema; (b) digitalizar os Termos de Abertura e Encerramento; (c) conferir a digitalização; (d) carimbar e rubricar todas as folhas do Livro apresentado fisicamente; (e) gerar o arquivo PDF-A, assiná-lo eletronicamente e arquivá-lo na pasta da Prenotação; (f) arquivar uma cópia dos Termos na Pasta da PJ. Confirma a execução?",
      grupo: G_D,
      tipo: "sim_nao",
      efeitos: [
        { quando: "nao", alerta: "Executar integralmente o procedimento de arquivamento do Livro." },
      ],
    },
  ],
};

const G_E = "Cobrança de Emolumentos e Finalização";

const SECAO_E: Secao = {
  id: "E",
  titulo: "Cobrança de Emolumentos e Finalização",
  itens: [
    {
      id: "E-1",
      texto: "O depósito prévio foi realizado corretamente?",
      grupo: G_E,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          filhos: [
            {
              id: "E-1-1",
              texto: "Foi feita a complementação de depósito prévio?",
              tipo: "sim_nao",
              efeitos: [{ quando: "nao", exigencia: "Efetuar o complemento do depósito." }],
            },
          ],
        },
      ],
    },
    {
      id: "E-2",
      texto:
        "O conferente declara sob responsabilidade que leu integral e atentamente o título ora qualificado?",
      grupo: G_E,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          alerta: "Declare expressamente que você leu integral e atentamente o título.",
        },
      ],
    },
    {
      id: "E-3",
      texto: "O título foi considerado APTO para registro?",
      grupo: G_E,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "nao",
          alerta:
            "O sistema elaborará automaticamente o esboço da Nota de Exigência, enumerando em ordem cada uma das exigências apontadas neste checklist.",
        },
        {
          quando: "sim",
          filhos: [
            {
              id: "E-3-1",
              texto: "Deseja elaborar agora o esboço dos atos a serem praticados?",
              tipo: "sim_nao",
              efeitos: [
                {
                  quando: "sim",
                  filhos: [
                    {
                      id: "E-3-1-1",
                      texto: "Esboço dos atos a serem praticados:",
                      tipo: "texto",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const SECAO_F: Secao = {
  id: "F",
  titulo: "Comunicações ao COAF",
  coaf: true,
  itens: [
    coaf(
      "F-951",
      "A operação aparenta não resultar de atividades ou negócios usuais do cliente ou de seu ramo de negócio?",
      G_F1,
    ),
    coaf(
      "F-952",
      "A operação tem origem ou fundamentação econômica ou legal que não sejam claramente aferíveis ou identificáveis?",
      G_F1,
    ),
    coaf(
      "F-953",
      "A operação é incompatível com o patrimônio ou capacidade econômica do cliente?",
      G_F1,
    ),
    coaf(
      "F-954",
      "Trata-se de operação em que não tenha sido possível identificar o beneficiário final?",
      G_F1,
    ),
    coaf(
      "F-955",
      "A operação envolve pessoa jurídica domiciliada em jurisdição considerada pelo GAFI como de Alto Risco ou com deficiências estratégicas de prevenção e combate à lavagem de dinheiro e financiamento de terrorismo?",
      G_F1,
    ),
    coaf(
      "F-956",
      "A operação envolve países ou dependências considerados pela Receita Federal como sendo de tributação favorecida ou de regime fiscal privilegiado, conforme lista pública?",
      G_F1,
    ),
    coaf(
      "F-957",
      "A operação envolve pessoa jurídica cujo beneficiário final, sócios, acionistas, procuradores, etc. sejam domiciliados em jurisdição considerada pelo GAFI como de Alto Risco ou com deficiências estratégicas de prevenção e combate à lavagem de dinheiro e financiamento de terrorismo?",
      G_F1,
    ),
    coaf(
      "F-958",
      "O cliente ou demais envolvidos na operação OFERECERAM RESISTÊNCIA em fornecer informações solicitadas para registro ou preenchimento de cadastro?",
      G_F1,
    ),
    coaf(
      "F-959",
      "O cliente ou demais envolvidos na operação PRESTARAM INFORMAÇÕES FALSAS ou de DIFÍCIL VERIFICAÇÃO ou de ONEROSA VERIFICAÇÃO para registro da operação ou preenchimento de cadastro?",
      G_F1,
    ),
    coaf(
      "F-960",
      "A operação é injustificadamente complexa ou com custos mais elevados, que visem DIFICULTAR O RASTREAMENTO dos recursos ou a identificação do seu real objetivo?",
      G_F1,
    ),
    coaf(
      "F-961",
      "A operação é FICTÍCIA ou com INDÍCIOS DE VALORES INCOMPATÍVEIS COM AS PRATICADAS NO MERCADO?",
      G_F1,
    ),
    { id: "F-961-a", texto: "Valor declarado (R$):", grupo: G_F1, tipo: "numero" },
    { id: "F-961-b", texto: "Valor aproximado de mercado (R$):", grupo: G_F1, tipo: "numero" },
    {
      id: "F-961-c",
      texto: "Tipo de Imóvel:",
      grupo: G_F1,
      tipo: "opcoes",
      opcoes: [
        { id: "a", rotulo: "Terreno ou lote urbano" },
        { id: "b", rotulo: "Terreno com edificação" },
        { id: "c", rotulo: "Terra nua rural" },
        { id: "d", rotulo: "Imóvel rural com benfeitorias" },
      ],
    },
    { id: "F-961-d", texto: "Fonte de pesquisa:", grupo: G_F1, tipo: "texto" },
    coaf(
      "F-962",
      "A operação contém cláusulas que estabeleçam CONDIÇÕES INCOMPATÍVEIS COM AS PRATICADAS NO MERCADO?",
      G_F1,
    ),
    coaf(
      "F-963",
      "Houve qualquer tentativa de BURLAR os controles e registros exigidos pela legislação de prevenção à lavagem de dinheiro e ao financiamento do terrorismo, através de FRACIONAMENTO, PAGAMENTO EM ESPÉCIE ou por meio de TÍTULO AO PORTADOR?",
      G_F1,
    ),
    coaf(
      "F-964",
      "A operação se consubstanciou em registro de DOCUMENTO ESTRANGEIRO, nos termos do artigo 129, §6º, combinado com o artigo 48, da Lei 6.015/73?",
      G_F1,
    ),
    coaf("F-965", "A operação se refere a AUMENTO DE CAPITAL em curto período de tempo?", G_F1),
    coaf(
      "F-966",
      "A operação envolveu OUTORGA OU UTILIZAÇÃO DE PROCURAÇÃO ao mandatário com poderes de administração, gerência, ou movimentação de conta-corrente de EMPRESÁRIO INDIVIDUAL, SOCIEDADE EMPRESÁRIA ou COOPERATIVA?",
      G_F1,
    ),
    coaf(
      "F-967",
      "A operação se refere a AUMENTO DE CAPITAL com possíveis indícios de que este aumento não possua correspondência com o valor ou o patrimônio da empresa?",
      G_F1,
    ),
    coaf(
      "F-968",
      "Tendo em vista as PARTES, DEMAIS ENVOLVIDOS, VALORES, MODO DE REALIZAÇÃO E FORMA DE PAGAMENTO, a operação pode ser considerada suspeita de configurar SÉRIOS INDÍCIOS de ocorrência de lavagem de dinheiro ou financiamento de terrorismo?",
      G_F1,
    ),
    {
      id: "F-969",
      texto:
        "A operação se enquadra em outras situações previstas como suspeita em INSTRUÇÕES COMPLEMENTARES (do próprio COAF, bem como do CNJ ou CGJ/SP)?",
      grupo: G_F1,
      tipo: "sim_nao",
      efeitos: [
        {
          quando: "sim",
          alerta: "Comunicação ao COAF — F-969: outras situações previstas como suspeitas.",
          filhos: [
            { id: "F-969-1", texto: "Descreva a situação identificada:", tipo: "texto" },
          ],
        },
      ],
    },
    coaf(
      "F-981",
      "A operação se refere a registro de TRANSFERÊNCIA DE BENS IMÓVEIS, TRANSFERÊNCIA DE COTAS ou PARTICIPAÇÕES SOCIETÁRIAS e de TRANSFERÊNCIA DE BENS MÓVEIS, de valor superior a R$ 30.000,00 (trinta mil reais)?",
      G_F2,
    ),
    coaf(
      "F-982",
      "A operação se refere a MÚTUO (empréstimo concedido ou contraído) ou DOAÇÃO (concedida ou recebida), de valor superior a R$ 30.000,00 (trinta mil reais)?",
      G_F2,
    ),
    coaf(
      "F-983",
      "A operação se refere a participações, investimentos ou representações de pessoas naturais ou jurídicas BRASILEIRAS em ENTIDADES ESTRANGEIRAS, especialmente “trusts” ou fundações?",
      G_F2,
    ),
    coaf(
      "F-984",
      "A operação se refere a instrumento que preveja CESSÃO DE DIREITOS DE TÍTULO DE CRÉDITO ou de TÍTULO PÚBLICO, de valor igual ou superior a R$ 500.000,00 (quinhentos mil reais)?",
      G_F2,
    ),
  ],
};

export const SECOES_RCPJ: Secao[] = [SECAO_A, SECAO_B, SECAO_C, SECAO_D, SECAO_E, SECAO_F];

/** Naturezas de título do RCPJ e as seções variáveis correspondentes. */
export const TIPOS_TITULO_RCPJ: { id: string; rotulo: string; secoes: string[] }[] = [
  { id: "associacao_registro", rotulo: "Registro de Associação ou Organização Religiosa", secoes: ["B"] },
  { id: "sociedade_simples_registro", rotulo: "Registro de Sociedade Simples", secoes: ["C"] },
  { id: "alteracao_estatuto", rotulo: "Averbação de alteração de Estatuto", secoes: ["B"] },
  { id: "eleicao_posse", rotulo: "Averbação de Eleição e Posse", secoes: ["B"] },
  {
    id: "dissolucao_associacao",
    rotulo: "Averbação de dissolução de associação ou organização religiosa",
    secoes: ["B"],
  },
  { id: "distrato_social", rotulo: "Distrato Social", secoes: ["C"] },
  {
    id: "livros_contabeis",
    rotulo: "Registro e Autenticação de Livros Contábeis de pessoas jurídicas",
    secoes: ["D"],
  },
  { id: "outro", rotulo: "Outro título (somente seções comuns)", secoes: [] },
];

export const SECOES_COMUNS_INICIAIS_RCPJ: string[] = ["A"];
export const SECOES_COMUNS_FINAIS_RCPJ: string[] = ["E", "F"];
