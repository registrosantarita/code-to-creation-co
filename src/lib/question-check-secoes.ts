// Transcrição estruturada do Checklist de Qualificação Registral (Seções A–R).
// Cada nó preserva o texto original das perguntas, alertas e exigências.
import type { Secao } from "./question-check-types";

export const SECOES: Secao[] = [
 {
  "id": "A",
  "titulo": "Itens comuns a todos os títulos",
  "itens": [
   {
    "id": "A-1",
    "texto": "O título / processo foi prenotado?",
    "grupo": "Princípio da Prioridade e Contraditório",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Título não prenotado e sem prioridade sobre quaisquer outros!"
     }
    ]
   },
   {
    "id": "A-2",
    "texto": "Os dados pessoais e do imóvel, constantes do título, foram cadastrados no Controle de Contraditório?",
    "grupo": "Princípio da Prioridade e Contraditório",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Cadastrar dados no Controle do Contraditório."
     }
    ]
   },
   {
    "id": "A-3",
    "texto": "O Controle do Contraditório foi executado?",
    "grupo": "Princípio da Prioridade e Contraditório",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Controle do Contraditório não executado – risco ao princípio da prioridade!"
     },
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "A-3-1",
        "texto": "Foi encontrada alguma ocorrência?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "alerta": "Anote todas as ocorrências (ex.: indisponibilidades, bloqueios, direitos reais, gravames, etc.)"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "A-4",
    "texto": "A matrícula foi analisada por inteiro, desde a abertura até o último ato, para verificação de eventuais gravames, bloqueios, graus de hipotecas, etc.?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Analisar a Matrícula por inteiro."
     }
    ]
   },
   {
    "id": "A-5",
    "texto": "Existe alguma anotação ou observação junto à imagem digitalizada ou no envelope plástico da matrícula física?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "Analisar com atenção e cuidado as anotações encontradas."
     }
    ]
   },
   {
    "id": "A-6",
    "texto": "A numeração dos atos da matrícula está corretamente sequencial?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Corrigir por averbação retificativa a numeração dos atos da Matrícula."
     }
    ]
   },
   {
    "id": "A-7",
    "texto": "Selecione a natureza do título;",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "opcoes",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Escritura Pública"
     },
     {
      "id": "b",
      "rotulo": "Instrumento Particular"
     },
     {
      "id": "c",
      "rotulo": "Cédula de Crédito"
     },
     {
      "id": "d",
      "rotulo": "Título Judicial (Ofício, Mandado, Carta de Sentença, Carta de Alienação, Carta de Arrematação, Carta de Adjudicação, Formal de Partilha)"
     },
     {
      "id": "e",
      "rotulo": "Requerimento"
     }
    ],
    "efeitos": [
     {
      "quando": "opcao:a",
      "filhos": [
       {
        "id": "A-7-1",
        "texto": "Qual o formato da Escritura Pública?",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Papel"
         },
         {
          "id": "b",
          "rotulo": "Eletrônica"
         }
        ],
        "efeitos": [
         {
          "quando": "opcao:a",
          "filhos": [
           {
            "id": "A-7-1-1",
            "texto": "Foi assinada pelo Tabelião ou preposto autorizado?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "A Escritura Pública não foi assinada."
             }
            ]
           }
          ]
         },
         {
          "quando": "opcao:b",
          "filhos": [
           {
            "id": "A-7-1-2",
            "texto": "A Escritura foi lavrada eletronicamente no ambiente do e-Notariado?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "A Escritura Pública Eletrônica deve ser lavrada e assinada no ambiente do e-Notariado."
             }
            ]
           }
          ]
         }
        ]
       },
       {
        "id": "A-7-2",
        "texto": "Consta da Escritura a data da lavratura, identificação do Tabelião, Livro e Folhas?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Faltaram os elementos de identificação da Escritura Pública (mencionar)."
         }
        ]
       },
       {
        "id": "A-7-3",
        "texto": "Foi verificado se o nome das partes no campo de assinaturas coincide com o preâmbulo da Escritura?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Os nomes das partes descritos ao final da Escritura não coincidem com o preâmbulo."
         }
        ]
       },
       {
        "id": "A-7-4",
        "texto": "Consta da Escritura a dispensa das certidões elencadas na Lei 7.433/85, regulamentada pelo Decreto 93.240/86?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "A-7-4-1",
            "texto": "Consta da Escritura que as certidões foram apresentadas ao Tabelião?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Não consta dispensa expressa das Certidões a que a alude a Lei 7.433/85 e sua apresentação não foi mencionada na Escritura."
             }
            ]
           }
          ]
         }
        ]
       },
       {
        "id": "A-7-5",
        "texto": "Foi mencionado o Código Hash da Central de Indisponibilidades?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "A-7-5-1",
            "texto": "A Escritura foi lavrada antes do Provimento que criou a Central de Indisponibilidades?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Não constou o Código Hash da Central de Indisponibilidades."
             }
            ]
           }
          ]
         }
        ]
       },
       {
        "id": "A-7-6",
        "texto": "A Escritura Pública foi lavrada em outra Comarca?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "A-7-6-1",
            "texto": "Foi consultada a Censec?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "alerta": "Consultar a Censec para verificação da autenticidade da Escritura e de quem a lavrou."
             }
            ]
           }
          ]
         }
        ]
       },
       {
        "id": "A-7-7",
        "texto": "Consta da Escritura que já foi ou será emitida a DOI?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Não consta do título informação de que a DOI já foi ou será emitida a DOI."
         }
        ]
       }
      ]
     },
     {
      "quando": "opcao:b",
      "filhos": [
       {
        "id": "A-7-8",
        "texto": "Qual o formato do Instrumento Particular?",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Papel"
         },
         {
          "id": "b",
          "rotulo": "Eletrônico"
         }
        ],
        "efeitos": [
         {
          "quando": "opcao:a",
          "filhos": [
           {
            "id": "A-7-8-1",
            "texto": "Foi assinado pelas partes contratantes com firma reconhecida?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "filhos": [
               {
                "id": "A-7-8-1-1",
                "texto": "Trata-se de algum caso de dispensa legal de reconhecimento de firma?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Necessário reconhecimento da firma dos signatários"
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         },
         {
          "quando": "opcao:b",
          "filhos": [
           {
            "id": "A-7-8-2",
            "texto": "Qual o tipo de formato eletrônico?",
            "tipo": "opcoes",
            "opcoes": [
             {
              "id": "a",
              "rotulo": "Digital Nativo"
             },
             {
              "id": "b",
              "rotulo": "Digitalizado"
             }
            ],
            "efeitos": [
             {
              "quando": "opcao:a",
              "filhos": [
               {
                "id": "A-7-8-2-1",
                "texto": "Consta assinatura eletrônica das partes, na modalidade qualificada (ICP-Brasil) ou avançada (GOV)?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "A modalidade de assinatura eletrônica utilizada não é permitida o ingresso do título no Registro de Imóveis"
                 }
                ]
               }
              ]
             },
             {
              "quando": "opcao:b",
              "filhos": [
               {
                "id": "A-7-8-2-2",
                "texto": "Constam os requisitos do Decreto 10.278/20 e mais assinatura eletrônica de uma das partes, na modalidade qualificada (ICP-Brasil) ou avançada (GOV)?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Faltam os requisitos do Decreto 10.278/20"
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     },
     {
      "quando": "opcao:c",
      "filhos": [
       {
        "id": "A-7-9",
        "texto": "Qual o formato da Cédula de Crédito?",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Papel"
         },
         {
          "id": "b",
          "rotulo": "Eletrônico"
         }
        ],
        "efeitos": [
         {
          "quando": "opcao:a",
          "filhos": [
           {
            "id": "A-7-9-1",
            "texto": "Foi assinada pelas partes contratantes?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "A Cédula não foi assinada pelas partes, o que é necessário, sendo dispensado apenas o reconhecimento de firma."
             }
            ]
           }
          ]
         },
         {
          "quando": "opcao:b",
          "filhos": [
           {
            "id": "A-7-9-2",
            "texto": "Qual o tipo de formato eletrônico?",
            "tipo": "opcoes",
            "opcoes": [
             {
              "id": "a",
              "rotulo": "Digital Nativo"
             },
             {
              "id": "b",
              "rotulo": "Digitalizado"
             }
            ],
            "efeitos": [
             {
              "quando": "opcao:a",
              "filhos": [
               {
                "id": "A-7-9-2-1",
                "texto": "Consta assinatura eletrônica das partes, na modalidade qualificada (ICP-Brasil) ou avançada (GOV)?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "A modalidade de assinatura eletrônica utilizada não é permitida o ingresso do título no Registro de Imóveis"
                 }
                ]
               }
              ]
             },
             {
              "quando": "opcao:b",
              "filhos": [
               {
                "id": "A-7-9-2-2",
                "texto": "Constam os requisitos do Decreto 10.278/20 e mais assinatura eletrônica de uma das partes, na modalidade qualificada (ICP-Brasil) ou avançada (GOV)?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Faltam os requisitos do Decreto 10.278/20"
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     },
     {
      "quando": "opcao:d",
      "filhos": [
       {
        "id": "A-7-10",
        "texto": "Qual o formato do título judicial?",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Papel"
         },
         {
          "id": "b",
          "rotulo": "Eletrônico"
         }
        ],
        "efeitos": [
         {
          "quando": "opcao:a",
          "filhos": [
           {
            "id": "A-7-10-1",
            "texto": "Foi assinado pelo Juiz ou Escrivão competente?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Não constou do título a assinatura do Juiz ou do Escrivão competente."
             }
            ]
           }
          ]
         },
         {
          "quando": "opcao:b",
          "filhos": [
           {
            "id": "A-7-10-2",
            "texto": "Foi verificada, no Tribunal respectivo, a autenticidade do título judicial e das respectivas peças apresentadas?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Não foi possível validar a autenticidade do título judicial no site do Tribunal que o expediu."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     },
     {
      "quando": "opcao:e",
      "filhos": [
       {
        "id": "A-7-11",
        "texto": "Qual o formato do Instrumento Particular?",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Papel"
         },
         {
          "id": "b",
          "rotulo": "Eletrônico"
         }
        ],
        "efeitos": [
         {
          "quando": "opcao:a",
          "filhos": [
           {
            "id": "A-7-11-1",
            "texto": "Foi assinado pelas partes contratantes com firma reconhecida?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "filhos": [
               {
                "id": "A-7-11-1-1",
                "texto": "Trata-se de algum caso de dispensa legal de reconhecimento de firma?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Necessário reconhecimento da firma dos signatários"
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         },
         {
          "quando": "opcao:b",
          "filhos": [
           {
            "id": "A-7-11-2",
            "texto": "Qual o tipo de formato eletrônico?",
            "tipo": "opcoes",
            "opcoes": [
             {
              "id": "a",
              "rotulo": "Digital Nativo"
             },
             {
              "id": "b",
              "rotulo": "Digitalizado"
             }
            ],
            "efeitos": [
             {
              "quando": "opcao:a",
              "filhos": [
               {
                "id": "A-7-11-2-1",
                "texto": "Consta assinatura eletrônica das partes, na modalidade qualificada (ICP-Brasil) ou avançada (GOV)?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "A modalidade de assinatura eletrônica utilizada não é permitida o ingresso do título no Registro de Imóveis"
                 }
                ]
               }
              ]
             },
             {
              "quando": "opcao:b",
              "filhos": [
               {
                "id": "A-7-11-2-2",
                "texto": "Constam os requisitos do Decreto 10.278/20 e mais assinatura eletrônica de uma das partes, na modalidade qualificada (ICP-Brasil) ou avançada (GOV)?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Faltam os requisitos do Decreto 10.278/20"
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "A-8",
    "texto": "O nome das partes no campo de assinaturas coincide com o preâmbulo do título?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O nome das partes constante do campo das assinaturas não coincide com o preâmbulo do título."
     }
    ]
   },
   {
    "id": "A-9",
    "texto": "Foram apresentadas Certidões e Documentos Oficiais?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "A-9-1",
        "texto": "Foram confirmadas sua autenticidade, sejam em papel, sejam eletrônicos?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Não foi possível a confirmação da autenticidade das Certidões e Documentos apresentados"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "A-10",
    "texto": "Foram confirmados os selos dos reconhecimentos de firma e das autenticações dos documentos apresentados, no site do Portal Extrajudicial?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não foi possível a confirmação dos selos de autenticidade dos reconhecimentos de firma e autenticações dos documentos apresentados."
     }
    ]
   },
   {
    "id": "A-11",
    "texto": "Há menção sobre o registro anterior, sobre como foi havido o imóvel, etc.?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "A-11-1",
        "texto": "Trata-se de título para o qual este requisito seja desnecessário ou dispensado (ex.: penhora, Requerimentos, retificações, etc.)?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "O modo como foi havido o imóvel não foi mencionado no título, o que é necessário"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "A-12",
    "texto": "Os Outorgantes são credores, exequentes ou titulares do direito real que pretendem constituir?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O(s) Outorgante(s) do título não consta(m) da Matrícula como titular(es) de direito real sobre o imóvel, o que é necessário em razão do princípio da continuidade e disponibilidade."
     }
    ]
   },
   {
    "id": "A-13",
    "texto": "O título se refere a uma TRANSMISSÃO?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "A-13-1",
        "texto": "Os Outorgantes Transmitentes são proprietários do imóvel?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "O(s) outorgante(s) não consta(m) da Matrícula como proprietário(s) do imóvel, o que é necessário em razão do princípio da continuidade."
         }
        ]
       },
       {
        "id": "A-13-2",
        "texto": "Há algum Outorgante Transmitente MENOR DE IDADE?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "A-13-2-1",
            "texto": "Consta da Escritura que tenha(m) sido REPRESENTADO(s) (menores de 16 anos) ou ASSISTIDO(S) (maiores de 16 e menores de 18 anos) por seus pais ou responsáveis?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Necessário o comparecimento do(s) representante(s) ou assistente(s) dos adquirentes menores de idade."
             },
             {
              "quando": "sim",
              "filhos": [
               {
                "id": "A-13-2-1-1",
                "texto": "Foi transcrito ou apresentado o alvará judicial?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Apresentar alvará judicial ou retificar o título para constar sua transcrição"
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       },
       {
        "id": "A-13-3",
        "texto": "O Outorgante Transmitente é casado sob regime de bens que exija outorga conjugal?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "A-13-3-1",
            "texto": "A outorga conjugal foi prestada?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Necessária outorga conjugal em razão do regime de bens do transmitente"
             }
            ]
           }
          ]
         }
        ]
       },
       {
        "id": "A-13-4",
        "texto": "O Outorgante Transmitente é ASCENDENTE do Outorgado Adquirente?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "A-13-4-1",
            "texto": "Consta interveniência dos demais descendentes?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "filhos": [
               {
                "id": "A-13-4-1-1",
                "texto": "Há algum caso de dispensa ou desnecessidade (ex.: doação)?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Necessária interveniência dos demais descendentes"
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       },
       {
        "id": "A-13-5",
        "texto": "A Transmissão foi feita por ESPÓLIO?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "A-13-5-1",
            "texto": "consta o estado civil do de cujus por ocasião do falecimento e a transcrição integral do Alvará Judicial?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "O título deve mencionar a transcrição do Alvará Judicial e o estado civil do de cujus à época do seu falecimento."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "A-14",
    "texto": "Os Outorgados estão devidamente qualificados?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Necessária retificação do título ou apresentação de documento oficial para averbação ou para completar a qualificação do título."
     }
    ]
   },
   {
    "id": "A-15",
    "texto": "Há algum Outorgado Adquirente menor de idade?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "A-15-1",
        "texto": "Consta da Escritura que tenha(m) sido REPRESENTADO(s) (menores de 16 anos) ou ASSISTIDO(S) (maiores de 16 e menores de 18 anos) por seus pais ou responsáveis?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Necessário o comparecimento do(s) representante(s) ou assistente(s) dos adquirentes menores de idade."
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "A-15-1-1",
            "texto": "Foi transcrito ou apresentado o alvará judicial?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "filhos": [
               {
                "id": "A-15-1-1-1",
                "texto": "Consta que a compra tenha sido realizada mediante doação de numerário (doação modal)?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Apresentar alvará judicial ou retificar o título para constar sua transcrição."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "A-16",
    "texto": "Alguma das partes está representada por procurador?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "A-16-1",
        "texto": "Foi apresentada procuração outorgando poderes expressos e especiais para a venda do imóvel devidamente identificado, e válida na data do título?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Apresentar procuração vigente e válida para o ato."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "A-17",
    "texto": "Selecione a natureza do imóvel:",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "opcoes",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Urbano"
     },
     {
      "id": "b",
      "rotulo": "Rural"
     }
    ],
    "efeitos": [
     {
      "quando": "opcao:b",
      "filhos": [
       {
        "id": "A-17-1",
        "texto": "A denominação dada ao imóvel corresponde à denominação constante na matrícula?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "A-17-1-1",
            "texto": "No Requerimento consta pedido para alteração da denominação do imóvel?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "A denominação do imóvel constante da Matrícula não coincide com a que consta do título, e não há Requerimento para sua alteração, o que demanda esclarecimento."
             }
            ]
           }
          ]
         }
        ]
       },
       {
        "id": "A-17-2",
        "texto": "Foi apresentada a inscrição no CAR?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Apresentar o Recibo de Inscrição do Imóvel Rural no CAR, no qual tenha sido informada a proposta de Reserva Legal."
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "A-17-2-1",
            "texto": "Consta proposta de reserva legal no projeto de inscrição do imóvel no CAR?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "filhos": [
               {
                "id": "A-17-2-1-1",
                "texto": "O interessado apresentou declaração de dispensa fundamentada em dispositivo legal?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "No Recibo de Inscrição do Imóvel Rural no CAR não consta proposta de Reserva Legal, nem foi apresentada justificativa legal de eventual dispensa."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       },
       {
        "id": "A-17-3",
        "texto": "Há Certificação do georreferenciamento pelo Incra?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "A-17-3-1",
            "texto": "Foi confirmada a certificação?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "filhos": [
               {
                "id": "A-17-3-1-1",
                "texto": "A área do imóvel ainda está inserida no prazo de carência que permita retificação simples, sem certificação?",
                "tipo": "sim_nao",
                "efeitos": []
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "A-18",
    "texto": "A identificação e descrição do imóvel constantes do título são idênticas àquelas constantes da matrícula?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Apresentar o(s) seguinte(s) documento necessário à averbação precedente a respeito do imóvel: "
     }
    ]
   },
   {
    "id": "A-19",
    "texto": "Selecione os seguintes direitos reais ou gravames registrados na Matrícula;",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Bloqueio judicial da Matrícula"
     },
     {
      "id": "b",
      "rotulo": "Indisponibilidade"
     },
     {
      "id": "c",
      "rotulo": "Cláusula de inalienabilidade"
     },
     {
      "id": "d",
      "rotulo": "Propriedade fiduciária não cancelada"
     },
     {
      "id": "e",
      "rotulo": "Hipoteca constituída no âmbito do Sistema Financeiro da Habitação"
     },
     {
      "id": "f",
      "rotulo": "Hipoteca cedular rural sem anuência do credor ou baixa"
     },
     {
      "id": "g",
      "rotulo": "Hipoteca cedular industrial sem anuência do credor ou baixa"
     },
     {
      "id": "h",
      "rotulo": "Hipoteca cedular comercial sem anuência do credor ou baixa"
     },
     {
      "id": "i",
      "rotulo": "Hipoteca cedular à exportação sem anuência do credor ou baixa"
     }
    ],
    "efeitos": [
     {
      "quando": "alguma",
      "exigencia": "Pesa sobre o imóvel o seguinte direito real/ônus/gravame impeditivo do registro do título: "
     }
    ]
   },
   {
    "id": "A-20",
    "texto": "Pesa sobre o imóvel algum outro ônus ou direito real que NÃO IMPEÇA o ingresso do título ou que não seja com ele incompatível?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "A-20-1",
        "texto": "O adquirente manifestou ciência?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Necessário que o título mencione os ônus e gravames registrados / averbados na Matrícula do imóvel."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "A-21",
    "texto": "Consta do título a menção à CND Previdenciária ou Declaração substitutiva de que os outorgantes não são contribuintes?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Verificar situação atual da jurisprudência, uma vez que conforme as últimas decisões e normas de serviço, as certidões previdenciárias são inconstitucionais."
     }
    ]
   },
   {
    "id": "A-22",
    "texto": "Trata-se de imóvel da União?",
    "grupo": "Princípios da Continuidade, Especialidade e Título",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "Informar o sistema e realizar a comunicação no site oficial da SPU."
     }
    ]
   },
   {
    "id": "A-23",
    "texto": "Não esquecer de realizar as comunicações ao coaf, em sendo o caso",
    "grupo": "Outros alertas e lembretes",
    "tipo": "info",
    "ajuda": "Alerta"
   },
   {
    "id": "A-24",
    "texto": "não esquecer de realizar as comunicações ao incra, em se tratando de imóvel rural",
    "grupo": "Outros alertas e lembretes",
    "tipo": "info",
    "ajuda": "Alerta"
   },
   {
    "id": "A-25",
    "texto": "não esquecer de realizar as comunicações à corregedoria e ao incra, em se tratando de aquisição de imóvel rural por estrangeiro",
    "grupo": "Outros alertas e lembretes",
    "tipo": "info",
    "ajuda": "Alerta"
   }
  ]
 },
 {
  "id": "B",
  "titulo": "Promessas e/ou Transmissões Voluntárias Onerosas",
  "itens": [
   {
    "id": "B-1",
    "texto": "O negócio contém alguma cláusula especial?",
    "grupo": "Compra e Venda",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "B-1-1",
        "texto": "Selecione abaixo:",
        "tipo": "multipla",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Condição"
         },
         {
          "id": "b",
          "rotulo": "Termo (dia de início ou do final de vigência do negócio)"
         },
         {
          "id": "c",
          "rotulo": "Encargo"
         },
         {
          "id": "d",
          "rotulo": "Cláusula Resolutiva Expressa"
         },
         {
          "id": "e",
          "rotulo": "Subrogação de vínculos (ex.: transferir uma cláusula restritiva para outro imóvel)"
         },
         {
          "id": "f",
          "rotulo": "Exclusão ou subrogação de aquestos (bens comuns)"
         },
         {
          "id": "g",
          "rotulo": "Cláusula de Retrovenda"
         }
        ],
        "efeitos": [
         {
          "quando": "alguma",
          "alerta": "Não esquecer de escrever a condição no extrato do ato de registro."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "B-2",
    "texto": "Consta do título o valor da dívida?",
    "grupo": "Dação em Pagamento",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não constou do título o valor da dívida."
     }
    ]
   },
   {
    "id": "B-3",
    "texto": "Consta do título a manifestação livre da vontade do devedor em dar seu imóvel em pagamento da dívida?",
    "grupo": "Dação em Pagamento",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não constou expressamente do título que o devedor livremente dá seu imóvel em pagamento da dívida."
     }
    ]
   },
   {
    "id": "B-4",
    "texto": "A integralização de capital se refere a pessoa jurídica sujeita a registro no Registro Civil de Pessoas Jurídicas (sociedades simples, associações, organizações religiosas, etc.)?",
    "grupo": "Conferência de bens em integralização de capital social",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "B-4-1",
        "texto": "É sujeita ao Registro de Empresas Mercantis – Junta Comercial (empresas)?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "alerta": "Reveja suas respostas. Uma opção deve ser escolhida."
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "B-4-1-1",
            "texto": "Foi apresentada Ata ou Contrato Social devidamente registrado na Junta Comercial, em seu original ou em forma de certidão?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Apresentar o ato constitutivo que foi registrado na Junta Comercial."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "B-5",
    "texto": "Consta do título o número de inscrição da adquirente no CNPJ?",
    "grupo": "Conferência de bens em integralização de capital social",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Apresentar inscrição da empresa no CNPJ."
     }
    ]
   },
   {
    "id": "B-6",
    "texto": "Consta do título o domicílio da empresa adquirente?",
    "grupo": "Conferência de bens em integralização de capital social",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O título não faz menção ao domicílio da empresa. Necessário retificá-lo, ou, alternativamente, apresentar documento oficial que o mencione."
     }
    ]
   },
   {
    "id": "B-7",
    "texto": "Trata-se de sociedade formada por cônjuges entre si?",
    "grupo": "Conferência de bens em integralização de capital social",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "B-7-1",
        "texto": "o regime de bens entre os cônjuges é o da comunhão universal de bens ou separação obrigatória?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Os Cônjuges não podem constituir sociedade entre si quando o regime do seu casamento for o da comunhão universal de bens ou o da separação obrigatória, nos termos do art. 977, CC."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "B-8",
    "texto": "Foi apresentada guia de não-incidência do ITBI ou comprovante de seu recolhimento?",
    "grupo": "Conferência de bens em integralização de capital social",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Apresentar guia do ITBI devidamente recolhida ou anotada como isenta."
     }
    ]
   },
   {
    "id": "B-9",
    "texto": "Trata-se de imóvel loteado?",
    "grupo": "Compromisso de Compra e Venda",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "B-9-1",
        "texto": "Consta cláusula expressa de que o negócio é uma promessa de aquisição de imóvel?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "alerta": "Verificar se o contrato é uma compra e venda tendente a burlar a necessidade de Escritura Pública (art. 108, CC)."
         }
        ]
       }
      ]
     },
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "B-9-2",
        "texto": "O contrato de promessa de aquisição de lote foi datado de 28/12/2018 ou posteriormente?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "alerta": "Verificar se os requisitos do contrato-padrão (arts. 26-A e 32-A da Lei 6.766/79) estão presentes – Seção K.",
          "filhos": [
           {
            "id": "B-9-2-1",
            "texto": "Seu conteúdo é idêntico ao contrato-padrão depositado no processo do Loteamento Registrado?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "O título apresentado não coincide com o contrato-padrão depositado no processo do loteamento,"
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "B-10",
    "texto": "Consta que o compromisso seja irretratável e irrevogável, SEM cláusula de arrependimento além dos 7 dias (Direito do Consumidor) previsto no preâmbulo?",
    "grupo": "Compromisso de Compra e Venda",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "exigencia": "A registrabilidade do compromisso de compra e venda, para produzir o direito real de aquisição, não pode prever cláusula de arrependimento além daquela que decorre naturalmente do Direito do Consumidor. Deve ser irrevogável e irretratável, o que não se verifica no caso em tela."
     }
    ]
   }
  ]
 },
 {
  "id": "C",
  "titulo": "Promessas e/ou Transmissões Voluntárias Gratuitas",
  "itens": [
   {
    "id": "C-1",
    "texto": "Houve aceitação do donatário?",
    "grupo": "Doação",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O donatário precisa necessariamente declarar sua aceitação à doação."
     }
    ]
   },
   {
    "id": "C-2",
    "texto": "A doação é pura e simples?",
    "grupo": "Doação",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "C-2-1",
        "texto": "Consta que o doador tem outros bens suficientes à sua subsistência?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "C-2-1-1",
            "texto": "há reserva de usufruto?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Escrever aqui."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "C-3",
    "texto": "Em caso de reserva de usufruto, foi estipulado direito de acrescer?",
    "grupo": "Doação",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "Não esquecer de mencionar no extrato do ato."
     }
    ]
   },
   {
    "id": "C-4",
    "texto": "O negócio contém algum elemento acidental (ex.: condição)?",
    "grupo": "Doação",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "C-4-1",
        "texto": "Selecione as opções abaixo:",
        "tipo": "multipla",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Condição"
         },
         {
          "id": "b",
          "rotulo": "Termo (dia inicial ou final de vigência do negócio)"
         },
         {
          "id": "c",
          "rotulo": "Encargo"
         },
         {
          "id": "d",
          "rotulo": "Cláusula de Reversão"
         }
        ],
        "efeitos": [
         {
          "quando": "alguma",
          "alerta": "Não esquecer de mencionar no extrato do ato."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "C-5",
    "texto": "O negócio contém alguma cláusula restritiva?",
    "grupo": "Doação",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "C-5-1",
        "texto": "Selecione abaixo:",
        "tipo": "multipla",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Incomunicabilidade"
         },
         {
          "id": "b",
          "rotulo": "Impenhorabilidade"
         },
         {
          "id": "c",
          "rotulo": "Inalienabilidade"
         }
        ],
        "efeitos": [
         {
          "quando": "alguma",
          "filhos": [
           {
            "id": "C-5-1-1",
            "texto": "Foi mencionada a justa causa para imposição das cláusulas?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "filhos": [
               {
                "id": "C-5-1-1-1",
                "texto": "Há menção de que o imóvel doado integra a parte disponível do patrimônio do(s) doador(res)?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Tendo em vista que a doação deste imóvel importou em adiantamento de legítima e foram impostas cláusulas restritivas, necessária a menção da justa causa para sua imposição."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "D",
  "titulo": "Aquisições Forçadas",
  "itens": [
   {
    "id": "D-1",
    "texto": "A ação foi proposta contra TODOS OS PROPRIETÁRIOS do imóvel?",
    "grupo": "Adjudicação e Arrematação em Execução Judicial",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "D-1-1",
        "texto": "Houve alguma determinação judicial para que a ação prosseguisse sem participação de todos os proprietários (ex.: decretação de ineficácia de alienação)?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Escrever aqui. O título não demonstra a participação dos proprietários tabulares do imóvel, nem determinação judicial de eventual ineficácia da alienação, o que é necessário em razão do princípio da continuidade e disponibilidade."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "D-2",
    "texto": "O título executivo integra a carta (art. 703 CPC)?",
    "grupo": "Adjudicação e Arrematação em Execução Judicial",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "A Carta não contém o título executivo, o que é necessário."
     }
    ]
   },
   {
    "id": "D-3",
    "texto": "O auTo de ADJUDICAÇÃO/ARREMATAÇÃO integra a carta?",
    "grupo": "Adjudicação e Arrematação em Execução Judicial",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O auto de adjudicação/arrematação não constou do título, o que é necessário."
     },
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "D-3-1",
        "texto": "Foi assinada pelo Juiz (execuções comuns) ou pelo Curador Fiscal (ações de falência)?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "O auto de adjudicação/arrematação não foi assinado pelo Juiz (execuções comuns e fiscais) / Curador Fiscal (ações de falência), o que é necessário."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "D-4",
    "texto": "A execução foi de natureza fiscal ou trabalhista?",
    "grupo": "Adjudicação e Arrematação em Execução Judicial",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "Não esquecer de realizar a cobrança dos emolumentos relativos à penhora trabalhista/fiscal que foi registrada anteriormente, além dos emolumentos incidentes sobre o título ora analisado (arrematação/adjudicação + cancelamento da penhora)."
     }
    ]
   },
   {
    "id": "D-5",
    "texto": "O título trata de aquisição forçada por Condomínio Edilício?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "D-5-1",
        "texto": "Foi apresentada a ata de aprovação da aquisição, em assembleia convocada especialmente para este fim, e aprovação da unanimidade dos presentes?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Apresentar a Ata da Assembleia na qual tenha sido deliberada a aprovação unânime da adjudicação pelo Condomínio."
         }
        ]
       }
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "E",
  "titulo": "Separação e Divórcio com Partilha de Bens",
  "itens": [
   {
    "id": "E-1",
    "texto": "As partes estão representadas por mandatário?",
    "grupo": "Se o título for Escritura Pública:",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao"
     },
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "E-1-1",
        "texto": "Ambas as partes estão representadas pelo mesmo mandatário?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "exigencia": "Não é permitido que ambas as partes estejam representadas pelo mesmo mandatários"
         },
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "E-1-1-1",
            "texto": "O(s) mandatário(s) foi(foram) constituído(s) por instrumento público, com poderes especiais e prazo de validade de 30 dias?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "sim"
             },
             {
              "quando": "nao",
              "exigencia": "Não constou da Escritura que os mandatários das partes tenham sido constituídos por Instrumento Público, com poderes especiais e validade de 30 dias"
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "E-2",
    "texto": "As partes foram assistidas por advogado (que pode ser comum), regularmente inscrito na OAB?",
    "grupo": "Se o título for Escritura Pública:",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim"
     },
     {
      "quando": "nao",
      "exigencia": "Não constou da Escritura que as partes tenham sido assistidas por advogado regularmente inscrito na OAB."
     }
    ]
   },
   {
    "id": "E-3",
    "texto": "Consta da Escritura declaração de que os cônjuges não têm filhos, ou, havendo, que são absolutamente capazes?",
    "grupo": "Se o título for Escritura Pública:",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim"
     },
     {
      "quando": "nao",
      "exigencia": "Não constou da Escritura que as partes não tenham filhos, ou havendo, que sejam absolutamente capazes."
     }
    ]
   },
   {
    "id": "E-4",
    "texto": "Consta da Escritura que foi apresentada certidão de nascimento ou outro documento oficial dos filhos?",
    "grupo": "Se o título for Escritura Pública:",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim"
     },
     {
      "quando": "nao",
      "exigencia": "Não constou da Escritura a apresentação da certidão de nascimento dos filhos ou outro documento oficial."
     }
    ]
   },
   {
    "id": "E-5",
    "texto": "Consta da Escritura declaração das partes de que estão cientes das consequências da separação/divórcio, firmes no propósito de pôr fim à sociedade conjugal ou vínculo matrimonial, respectivamente, sem hesitação, com recusa de reconciliação?",
    "grupo": "Se o título for Escritura Pública:",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim"
     },
     {
      "quando": "nao",
      "exigencia": "Não constou da Escritura a declaração das partes acerca dos efeitos e consequências da separação / divórcio"
     }
    ]
   },
   {
    "id": "E-6",
    "texto": "Foi apresentada o original ou a cópia autenticada CERTIDÃO DE CASAMENTO para instruir a averbação da alteração do estado civil, constando a averbação da separação/divórcio?",
    "grupo": "Se o título for Escritura Pública:",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim"
     },
     {
      "quando": "nao",
      "exigencia": "Apresentar Certidão de Casamento devidamente atualizada com a averbação da separação / divórcio."
     }
    ]
   },
   {
    "id": "E-7",
    "texto": "Os cônjuges são os mesmos quando da aquisição do imóvel?",
    "grupo": "Se o título for Escritura Pública:",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim"
     },
     {
      "quando": "nao",
      "exigencia": "Apresentar Certidão(õs) de Casamento atualizada(s) do cônjuge Fulano de Tal, relativa(s) à(s) núpcia(s) anterior(es)."
     }
    ]
   },
   {
    "id": "E-8",
    "texto": "Consta da Escritura a distinção do patrimônio separado de cada cônjuge (se houver) do que é do patrimônio comum do casal?",
    "grupo": "Se o título for Escritura Pública:",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim"
     },
     {
      "quando": "nao",
      "exigencia": "Não constou da Escritura a menção aos bens aquestos e aos bens particulares de cada um dos ex-cônjuges."
     }
    ]
   },
   {
    "id": "E-9",
    "texto": "A partilha foi igualitária (50% para cada um)?",
    "grupo": "Se o título for Escritura Pública:",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim"
     },
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "E-9-1",
        "texto": "Houve reposição em dinheiro?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "alerta": "Preencher perguntas sobre ITBI na Seção correspondente."
         },
         {
          "quando": "nao",
          "alerta": "Preencher perguntas sobre ITCMD na Seção correspondente."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "E-10",
    "texto": "Há doação para os filhos do casal?",
    "grupo": "Se o Título for Judicial (Carta de Sentença ou Mandado):",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao"
     },
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "E-10-1",
        "texto": "Os filhos estão qualificados?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Os filhos do casal não estão devidamente qualificados no título, o que é necessário."
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "E-10-1-1",
            "texto": "houve aceitação da doação, quando cabível?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Os filhos donatários do casal são maiores de idade e não consta do título a sua aceitação."
             },
             {
              "quando": "sim",
              "filhos": [
               {
                "id": "E-10-1-1-1",
                "texto": "foi recolhido o ITCMD-Doação correspondente?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Apresentar o comprovante de recolhimento da guia do ITCMD-Doação, acompanhada da respectiva declaração assinada."
                 },
                 {
                  "quando": "sim"
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "E-11",
    "texto": "Houve homologação da partilha pelo juiz?",
    "grupo": "Se o Título for Judicial (Carta de Sentença ou Mandado):",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim"
     },
     {
      "quando": "nao",
      "exigencia": "Apresentar a sentença homologatória da partilha pelo juiz, devidamente transitada em julgado"
     }
    ]
   }
  ]
 },
 {
  "id": "F",
  "titulo": "Partilha Causa mortis",
  "itens": [
   {
    "id": "F-1",
    "texto": "O imóvel foi incluído por inteiro na partilha, inclusive no que se refere à meação do cônjuge sobrevivente?",
    "grupo": "Disposições gerais",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O(s) imóvel(eis) devem ser arrolados por inteiro, incluindo a meação do cônjuge sobrevivente, para somente depois realizar a partilha conforme o plano proposto."
     }
    ]
   },
   {
    "id": "F-2",
    "texto": "Consta do título a Certidão de Óbito do falecido?",
    "grupo": "Disposições gerais",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Apresentar Certidão de Óbito do de cujus"
     }
    ]
   },
   {
    "id": "F-3",
    "texto": "O falecido vivia em união estável?",
    "grupo": "Disposições gerais",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "F-3-1",
        "texto": "Consta do título a concordância de todos os herdeiros e interessados, no reconhecimento da meação?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Não constou menção expressa dos herdeiros sobre a concordância com a união estável do de cujus e consequente atribuição da meação ao(à) companheiro(a)"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "F-4",
    "texto": "Consta do título a nomeação de inventariante?",
    "grupo": "Disposições gerais",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não consta do título a comprovação de que houve a nomeação do Inventariante"
     }
    ]
   },
   {
    "id": "F-5",
    "texto": "Consta do título o grau de parentesco dos herdeiros?",
    "grupo": "Disposições gerais",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não constou menção expressa sobre o grau de parentesco entre o de cujus e seus herdeiros."
     }
    ]
   },
   {
    "id": "F-6",
    "texto": "Houve renúncia ou cessão?",
    "grupo": "Disposições gerais",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "F-6-1",
        "texto": "Consta anuência dos cônjuges dos herdeiros cedentes ou renunciantes, quando o regime de bens assim o exija?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Não constou anuência expressa dos cônjuges dos herdeiros sobre a renúncia / cessão realizada."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "F-7",
    "texto": "Caso as partes estejam representadas, consta que o procurador (mesmo que seja advogado) recebeu poderes especiais por instrumento público (art. 657, CC)?",
    "grupo": "Regras para Escritura Pública",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Os poderes outorgados ao procurador não são suficientes para o ato a ser praticado."
     }
    ]
   },
   {
    "id": "F-8",
    "texto": "Consta a participação de advogado inscrito na OAB?",
    "grupo": "Regras para Escritura Pública",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não consta da Escritura a participação de advogado inscrito na OAB, o que é necessário."
     }
    ]
   },
   {
    "id": "F-9",
    "texto": "Consta que o falecido não deixou testamento?",
    "grupo": "Regras para Escritura Pública",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não houve menção sobre eventual testamento deixado pelo falecido, o que é necessário."
     },
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "F-9-1",
        "texto": "Foi apresentada certidão comprobatória da inexistência de testamento (expedida pelo Registro Central de Testamentos mantido pelo CNB/SP) ou mencionada na Escritura?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Não houve menção sobre apresentação da Certidão Negativa de Testamento."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "F-10",
    "texto": "Consta da Escritura que as partes são maiores, capazes e concordes?",
    "grupo": "Regras para Escritura Pública",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não consta que as partes sejam maiores, capazes e concordes, o que é pressuposto da Escritura Pública de Inventário e Partilha."
     }
    ]
   },
   {
    "id": "F-11",
    "texto": "Selecione os seguintes documentos mencionados na Escritura que foram arquivados pelo Tabelião:",
    "grupo": "Regras para Escritura Pública",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Certidão de óbito do autor da herança"
     },
     {
      "id": "b",
      "rotulo": "Documento de identidade oficial com número do RG e CPF das partes e do autor da herança"
     },
     {
      "id": "c",
      "rotulo": "Certidões comprobatórias do vínculo de parentesco dos herdeiros"
     },
     {
      "id": "d",
      "rotulo": "Certidão de casamento do cônjuge sobrevivente e dos herdeiros casados"
     },
     {
      "id": "e",
      "rotulo": "Pacto antenupcial"
     },
     {
      "id": "f",
      "rotulo": "Certidão de propriedade atualizada (30 dias) e não anterior à data do óbito"
     },
     {
      "id": "g",
      "rotulo": "Certidão negativa de tributos municipais"
     },
     {
      "id": "h",
      "rotulo": "Certidão negativa conjunta da Receita Federal e PGFN (obs.: a existência de débitos impede a lavratura)"
     },
     {
      "id": "i",
      "rotulo": "Certidão comprobatória da inexistência de testamento (expedida pelo Registro Central de Testamentos mantido pelo CNB/SP)"
     },
     {
      "id": "k",
      "rotulo": "Certidão comprobatória do valor venal do imóvel do ano do falecimento ou do ano subsequente"
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "filhos": [
       {
        "id": "F-11-1",
        "texto": "Há itens que não foram selecionados. Trata-se de requisito facultativo, dispensável ou circunstancial?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Faltou a menção ao arquivamento, pelo Tabelião, do(s) seguinte(s) documento(s) obrigatório(s): (Instrução ao sistema: “O sistema deverá elaborar automaticamente: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "F-12",
    "texto": "Consta do título o termo de encerramento, com número de folhas?",
    "grupo": "Regras para Títulos Judiciais (Formal de Partilha, Carta de Adjudicação em Inventário)",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não constou do título a apresentação do Termo de Encerramento."
     }
    ]
   },
   {
    "id": "F-13",
    "texto": "Selecione a natureza da sentença:",
    "grupo": "Regras para Títulos Judiciais (Formal de Partilha, Carta de Adjudicação em Inventário)",
    "tipo": "opcoes",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Jurisdicional em processo contencioso"
     },
     {
      "id": "b",
      "rotulo": "Homologatória"
     }
    ],
    "efeitos": [
     {
      "quando": "opcao:b",
      "filhos": [
       {
        "id": "F-13-1",
        "texto": "Consta a menção de que “ficam ressalvados eventuais erros, omissões ou direitos de terceiros” (ou expressão semelhante)?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Não constou menção expressa de que ficam ressalvados eventuais erros, omissões ou direitos de terceiros” (ou expressão semelhante)."
         }
        ]
       }
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "G",
  "titulo": "Penhoras",
  "itens": [
   {
    "id": "G-1",
    "texto": "Os devedores executados são proprietários do imóvel?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "G-1-1",
        "texto": "Há decisão judicial de desconsideração da personalidade jurídica ou declaração de ineficácia da alienação?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Os executados não são proprietários do imóvel"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "G-2",
    "texto": "Há menção sobre o fato de que eventual intimação do cônjuge será analisada pelo juiz?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não constou do título a informação sobre a intimação do cônjuge do executado em relação à penhora"
     }
    ]
   },
   {
    "id": "G-3",
    "texto": "Trata-se de penhora de espólio?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "G-3-1",
        "texto": "Há certidão de óbito anexa ao Mandado ou certidão de penhora, ou, ainda, prévia averbação dessa notícia?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "A penhora recaiu sobre o espólio do executado e não consta averbação de seu óbito, nem tampouco apresentação da respectiva certidão"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "G-4",
    "texto": "Selecione os itens abaixo constantes do título:",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Nome do Juiz"
     },
     {
      "id": "b",
      "rotulo": "Número do processo"
     },
     {
      "id": "c",
      "rotulo": "Vara em que tramitou o processo"
     },
     {
      "id": "d",
      "rotulo": "Natureza da Ação"
     },
     {
      "id": "e",
      "rotulo": "Valor da causa"
     },
     {
      "id": "f",
      "rotulo": "Nome do depositário"
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Não constaram do título os seguintes requisitos obrigatórios."
     }
    ]
   },
   {
    "id": "G-5",
    "texto": "A penhora foi decretada em processo trabalhista ou de execução fiscal?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "A penhora trabalhista tem preferência sobre hipotecas cedulares, indisponibilidades, bens de família, etc."
     },
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "G-5-1",
        "texto": "Tratando-se de Execução Comum, pesa sobre imóvel alguma circunstância que impeça a penhora? Selecione abaixo:",
        "tipo": "multipla",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Cláusula de inalienabilidade"
         },
         {
          "id": "b",
          "rotulo": "Cláusula de impenhorabilidade"
         },
         {
          "id": "c",
          "rotulo": "Hipoteca cedular rural em dívida diversa em relação à execução"
         },
         {
          "id": "d",
          "rotulo": "Hipoteca oriunda de cédula de produto rural em dívida diversa em relação à execução"
         },
         {
          "id": "e",
          "rotulo": "Hipoteca cedular industrial em dívida diversa em relação à execução"
         },
         {
          "id": "f",
          "rotulo": "Hipoteca cedular à exportação em dívida diversa em relação à execução"
         },
         {
          "id": "g",
          "rotulo": "Hipoteca cedular comercial em dívida diversa em relação à execução"
         },
         {
          "id": "h",
          "rotulo": "Instituição de bem de família em dívida diversa em relação à execução"
         },
         {
          "id": "i",
          "rotulo": "Propriedade fiduciária em garantia em dívida diversa em relação à execução"
         }
        ],
        "efeitos": [
         {
          "quando": "alguma",
          "exigencia": "Consta(m) da Matrícula circunstância(s) impeditiva(s) da penhora pretendida:"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "G-6",
    "texto": "Consta do título o valor da execução?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não constou do título o valor da execução, o que é absolutamente necessário"
     }
    ]
   }
  ]
 },
 {
  "id": "H",
  "titulo": "Operações de Crédito e Garantias Reais",
  "itens": [
   {
    "id": "H-1",
    "texto": "Disposições gerais",
    "grupo": "Cédulas de Crédito",
    "tipo": "info",
    "ajuda": "O reconhecimento de firma é sempre dispensado;\nA Cédula de Crédito Industrial, Comercial e à Exportação são obrigatoriamente registradas no Livro 3, se a garantia estiver situada em Santa Rita do Passa Quatro, ainda que não inscritível no Livro 2;\nA Cédula de Crédito Rural e a de Produto Rural deixaram de ser registradas conforme Lei 13.986/20, sendo cabível apenas o registro da respectiva garantia:\n\tHavendo Hipoteca ou Propriedade Fiduciária, são registradas no Livro 2;\n\tHavendo Penhor, é registrado no Livro 3;\nA Cédula de Crédito Bancário não é registrada, conforme Lei 10.931/04;\n\tATENÇÃO PARA O DESCONTO: quando o financiamento for rural (atividade agrícola ou pecuária) haverá desconto, aplicando-se as regras da Cédula de Crédito Rural;\nA instituição credora deve integrar o Sistema Financeiro Nacional (Bancos ou Instituições Financeiras);\nO crédito deve ter a destinação conforme a espécie da cédula emitida;\nPermite-se garantia prestada por terceiro em qualquer hipótese, conforme decisão do STF;\nOs bens dados em garantia cedular não podem ser executados por dívida diversa, salvo os casos excetuados na lei (ex.: crédito trabalhista, tributário, etc.)."
   },
   {
    "id": "H-2",
    "texto": "A garantia foi constituída na própria cédula?",
    "grupo": "Cédulas de Crédito",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "H-2-1",
        "texto": "A cédula faz menção a esta circunstância?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Apresentar instrumento que constitua a garantia"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "H-3",
    "texto": "Foram apresentadas pelo menos uma via negociável e outra não negociável?",
    "grupo": "Cédulas de Crédito",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Apresentar a via negociável / não negociável da cédula."
     }
    ]
   },
   {
    "id": "H-4",
    "texto": "Selecione a espécie da cédula de crédito apresentada:",
    "grupo": "Cédulas de Crédito",
    "tipo": "opcoes",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Cédula de Crédito Industrial"
     },
     {
      "id": "b",
      "rotulo": "Cédula de Crédito Comercial"
     },
     {
      "id": "c",
      "rotulo": "Cédula de Crédito à Exportação"
     },
     {
      "id": "d",
      "rotulo": "Cédula de Crédito Bancário"
     },
     {
      "id": "e",
      "rotulo": "Cédula Rural Pignoratícia"
     },
     {
      "id": "f",
      "rotulo": "Cédula Rural Hipotecária"
     },
     {
      "id": "g",
      "rotulo": "Cédula Rural Pignoratícia e Hipotecária"
     },
     {
      "id": "h",
      "rotulo": "Cédula de Produto Rural"
     },
     {
      "id": "i",
      "rotulo": "Cédula de Produto Rural com Liquidação Financeira"
     }
    ],
    "efeitos": [
     {
      "quando": "nenhuma",
      "alerta": "Necessária a seleção de algum dos tipos de cédula acima elencados."
     }
    ]
   },
   {
    "id": "H-5",
    "texto": "Selecione os requisitos verificados:",
    "grupo": "Cédulas de Crédito",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Denominação da cédula, conforme sua espécie"
     },
     {
      "id": "b",
      "rotulo": "Promessa de pagamento (Cédulas de Crédito) ou entrega de coisa (CPR), conforme o caso"
     },
     {
      "id": "c",
      "rotulo": "Data do vencimento (Cédulas de Crédito) ou da entrega da coisa (CPR) e condições de pagamento"
     },
     {
      "id": "d",
      "rotulo": "Nome do credor e a cláusula à ordem"
     },
     {
      "id": "e",
      "rotulo": "Valor do crédito deferido"
     },
     {
      "id": "f",
      "rotulo": "Descrição dos dados em garantia e sua localização"
     },
     {
      "id": "g",
      "rotulo": "Taxa dos juros"
     },
     {
      "id": "h",
      "rotulo": "Lugar do pagamento ou da entrega da coisa"
     },
     {
      "id": "i",
      "rotulo": "Data e lugar da emissão"
     },
     {
      "id": "j",
      "rotulo": "Assinatura"
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Verifica-se a falta do(s) seguinte(s) elemento(s) essencial(ais) / requisito(s) obrigatório(s) no XXXX: (Instrução ao sistema: “O sistema deverá elaborar automaticamente: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   }
  ]
 },
 {
  "id": "I",
  "titulo": "Direitos Reais de Garantia",
  "itens": [
   {
    "id": "I-1",
    "texto": "Selecione a(s) garantia(s) constituída(s) pelo título:",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Penhor"
     },
     {
      "id": "b",
      "rotulo": "Hipoteca"
     },
     {
      "id": "c",
      "rotulo": "Propriedade Fiduciária em Garantia"
     }
    ],
    "efeitos": [
     {
      "quando": "nenhuma",
      "alerta": "Necessária a seleção de ao menos uma modalidade de garantia."
     }
    ]
   },
   {
    "id": "I-2",
    "texto": "Selecione os requisitos do contrato de penhor ou hipoteca que foram verificados:",
    "grupo": "Disposições comuns à Hipoteca e ao Penhor",
    "tipo": "multipla",
    "ajuda": "A Opção “a” é incompatível com as demais opções. Reveja a seleção das suas opções.",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Não se aplica"
     },
     {
      "id": "b",
      "rotulo": "Valor do crédito, sua estimação, ou valor máximo"
     },
     {
      "id": "c",
      "rotulo": "Prazo fixado para pagamento"
     },
     {
      "id": "d",
      "rotulo": "Taxa dos juros, se houver"
     },
     {
      "id": "e",
      "rotulo": "Especificações do bem dado em garantia"
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "filhos": [
       {
        "id": "I-2-1",
        "texto": "Há opções que não foram selecionadas. Trata-se de requisito facultativo, dispensável ou circunstancial?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Falta o seguinte requisito essencial do título:"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "I-3",
    "texto": "Consta do título cláusula que autoriza o credor a ficar com o objeto da garantia, se a dívida não for paga no vencimento?",
    "grupo": "Disposições comuns à Hipoteca e ao Penhor",
    "tipo": "opcoes",
    "opcoes": [
     {
      "id": "sim",
      "rotulo": "SIM"
     },
     {
      "id": "nao",
      "rotulo": "NÃO"
     },
     {
      "id": "nao_se_aplica",
      "rotulo": "Não se aplica"
     }
    ],
    "efeitos": [
     {
      "quando": "sim",
      "exigencia": "O título contém cláusula que autoriza o credor a ficar com a coisa garantida, se a dívida não for paga no vencimento, que é nula de pleno direito nos termos do art. 1.428, CC."
     }
    ]
   },
   {
    "id": "I-4",
    "texto": "Selecione a modalidade de penhor especial constante do título:",
    "grupo": "Disposições específicas para o Penhor",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Rural Agrícola"
     },
     {
      "id": "b",
      "rotulo": "Rural Pecuário"
     },
     {
      "id": "c",
      "rotulo": "Industrial ou Mercantil"
     }
    ],
    "efeitos": [
     {
      "quando": "opcao:a",
      "filhos": [
       {
        "id": "I-4-1",
        "texto": "Selecione os bens dados em penhor rural agrícola pelo título:",
        "tipo": "multipla",
        "opcoes": [
         {
          "id": "a.1",
          "rotulo": "Máquinas e instrumentos de agricultura"
         },
         {
          "id": "a.2",
          "rotulo": "Colheitas pendentes, ou em via de formação"
         },
         {
          "id": "a.3",
          "rotulo": "Frutos acondicionados ou armazenados"
         },
         {
          "id": "a.4",
          "rotulo": "Lenha cortada e carvão vegetal"
         },
         {
          "id": "a.5",
          "rotulo": "Animais do serviço ordinário de estabelecimento agrícola."
         }
        ],
        "efeitos": [
         {
          "quando": "nenhuma",
          "alerta": "Necessária a seleção de ao menos um bem dado em garantia ou, se não couber, verifique se a seleção da espécie do penhor está correta."
         },
         {
          "quando": "alguma",
          "filhos": [
           {
            "id": "I-4-1-1",
            "texto": "Há elementos de identificação dos referidos bens?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "O(s) bem(ns) dado(s) em garantia pignoratícia não foi(ram) devidamente especificado(s) no título."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     },
     {
      "quando": "opcao:b",
      "filhos": [
       {
        "id": "I-4-2",
        "texto": "Selecione os bens dados em penhor rural pecuário pelo título:",
        "tipo": "multipla",
        "opcoes": [
         {
          "id": "b.1",
          "rotulo": "Animais que integram a atividade pastoril, agrícola ou de laticínios."
         }
        ],
        "efeitos": [
         {
          "quando": "nenhuma",
          "alerta": "Necessária a seleção de ao menos um bem dado em garantia ou, se não couber, verifique se a seleção da espécie do penhor está correta."
         }
        ]
       }
      ]
     },
     {
      "quando": "opcao:c",
      "filhos": [
       {
        "id": "I-4-3",
        "texto": "Selecione os bens dados em penhor rural pecuário pelo título:",
        "tipo": "multipla",
        "opcoes": [
         {
          "id": "c.1",
          "rotulo": "Máquinas, aparelhos, materiais, instrumentos, instalados e em funcionamento, com os acessórios ou sem eles"
         },
         {
          "id": "c.2",
          "rotulo": "Animais utilizados na indústria"
         },
         {
          "id": "c.3",
          "rotulo": "Sal e bens destinados à exploração das salinas"
         },
         {
          "id": "c.4",
          "rotulo": "Produtos de suinocultura"
         },
         {
          "id": "c.5",
          "rotulo": "Animais destinados à industrialização de carnes e derivados"
         },
         {
          "id": "c.6",
          "rotulo": "Matérias-primas e produtos industrializados."
         }
        ],
        "efeitos": [
         {
          "quando": "nenhuma",
          "alerta": "Necessária a seleção de ao menos um bem dado em garantia ou, se não couber, verifique se a seleção da espécie do penhor está correta."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "I-5",
    "texto": "O(s) grau(s) da(s) garantia(s) pignoratícia(s) constante(s) do título obedece(m) a continuidade do(s) eventualmente constante(s) nos respectivos Livros de Registro Auxiliar?",
    "grupo": "Disposições específicas para o Penhor",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O(s) grau(s) da(s) garantia(s) pignoratícia(s) constante(s) do título não estão de acordo com as garantias já gravadas no(s) Livros de Registro Auxiliar desta Serventia."
     }
    ]
   },
   {
    "id": "I-6",
    "texto": "Há outra garantia constituída pelo título?",
    "grupo": "Disposições específicas para o Penhor",
    "tipo": "sim_nao",
    "efeitos": []
   },
   {
    "id": "I-7",
    "texto": "Selecione os bens dados em hipoteca em garantia da dívida, abaixo enumerados:",
    "grupo": "Disposições específicas para a Hipoteca",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Não se aplica"
     },
     {
      "id": "b",
      "rotulo": "Imóveis e seus acessórios"
     },
     {
      "id": "c",
      "rotulo": "Domínio direto"
     },
     {
      "id": "d",
      "rotulo": "Domínio útil"
     },
     {
      "id": "e",
      "rotulo": "Estradas de ferro"
     },
     {
      "id": "f",
      "rotulo": "Recursos naturais a que se refere o art. 1.230, independentemente do solo onde se acham"
     },
     {
      "id": "g",
      "rotulo": "Navios"
     },
     {
      "id": "h",
      "rotulo": "Aeronaves"
     },
     {
      "id": "i",
      "rotulo": "Direito de uso especial para fins de moradia"
     },
     {
      "id": "j",
      "rotulo": "Direito real de uso"
     },
     {
      "id": "k",
      "rotulo": "Propriedade superficiária"
     },
     {
      "id": "l",
      "rotulo": "Direitos oriundos da imissão provisória na posse, quando concedida à União, aos Estados, ao Distrito Federal, aos Municípios ou às suas entidades delegadas e a respectiva cessão e promessa de cessão."
     }
    ],
    "efeitos": [
     {
      "quando": "nenhuma",
      "alerta": "Necessária a seleção de ao menos um bem dado em garantia (ainda que seja a opção “Não se aplica”) ou, se não couber, verifique se a espécie da garantia foi corretamente selecionada."
     }
    ]
   },
   {
    "id": "I-8",
    "texto": "Consta do título cláusula que proíba o devedor proprietário de alienar o imóvel?",
    "grupo": "Disposições específicas para a Hipoteca",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "exigencia": "O título contém cláusula que proíbe o devedor proprietário de alienar o imóvel, que é nula de pleno direito nos termos do art. 1.475, CC."
     }
    ]
   },
   {
    "id": "I-9",
    "texto": "Os graus de eventuais hipotecas registradas na Matrícula são compatíveis (sequenciais e anteriores) ao grau da hipoteca ora constituída?",
    "grupo": "Disposições específicas para a Hipoteca",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O título não menciona o grau da hipoteca ora constituída."
     }
    ]
   },
   {
    "id": "I-10",
    "texto": "Selecione os requisitos do contrato de alienação fiduciária em garantia (art. 24 da Lei 9.514/97), abaixo enumerados:",
    "grupo": "Disposições específicas para Propriedade Fiduciária",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Valor da dívida, sua estimação ou seu valor máximo"
     },
     {
      "id": "b",
      "rotulo": "Prazo e as condições de reposição do empréstimo ou do crédito do fiduciário"
     },
     {
      "id": "c",
      "rotulo": "Taxa de juros e os encargos incidentes"
     },
     {
      "id": "d",
      "rotulo": "Cláusula de constituição da propriedade fiduciária, com a descrição do imóvel objeto da alienação fiduciária e a indicação do título e modo de aquisição"
     },
     {
      "id": "e",
      "rotulo": "Cláusula que assegure ao fiduciante a livre utilização, por sua conta e risco, do imóvel objeto da alienação fiduciária, exceto a hipótese de inadimplência"
     },
     {
      "id": "f",
      "rotulo": "Indicação, para efeito de venda em público leilão, do valor do imóvel e dos critérios para a respectiva revisão"
     },
     {
      "id": "g",
      "rotulo": "Cláusula que disponha sobre os procedimentos de que tratam os arts. 26-A, 27 e 27-A da Lei 9.514/947"
     },
     {
      "id": "h",
      "rotulo": "Não se aplica."
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "filhos": [
       {
        "id": "I-10-1",
        "texto": "Há itens que não foram selecionados. Trata-se de requisito facultativo, dispensável ou circunstancial?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Verifica-se a falta do(s) seguinte(s) requisito(s) obrigatório(s) no título: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
         }
        ]
       }
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "J",
  "titulo": "Usucapião Judicial",
  "itens": [
   {
    "id": "J-1",
    "texto": "Consta do título a sentença transitada em julgado?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Necessária a juntada da sentença com certificação do respectivo trânsito em julgado."
     }
    ]
   },
   {
    "id": "J-2",
    "texto": "Consta do título que os interessados tenham sido intimados, e que o eventual proprietário tabular tenha sido citado?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Necessária juntada de peças que comprovem a intimação dos interessados e do proprietário tabular."
     }
    ]
   },
   {
    "id": "J-3",
    "texto": "Consta do título o valor atribuído ao(s) imóvel(eis)?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Necessária atribuição de valor ao imóvel."
     }
    ]
   },
   {
    "id": "J-4",
    "texto": "O estado civil do usucapiente conforme consta do título é o mesmo quando da aquisição pelo início da posse?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Apresentar Certidão atualizada do estado civil do usucapiente para verificação de sua participação na aquisição da propriedade pelo tempo de posse."
     }
    ]
   }
  ]
 },
 {
  "id": "K",
  "titulo": "Loteamentos e Desmembramentos",
  "itens": [
   {
    "id": "K-1",
    "texto": "Trata-se de alguma hipótese de dispensa de parcelamento especial, na forma da Lei e das Normas de Serviço do Registro de Imóveis?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "K-1-1",
        "texto": "Selecione abaixo o enquadramento:",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Divisões \"intervivos\" celebradas anteriormente a 20/12/1979 – cujas glebas desmembradas sejam exatamente em mesmo número dos condôminos que pretendem dividi-las"
         },
         {
          "id": "b",
          "rotulo": "Divisões \"intervivos\" extintivas de condomínios formados antes da vigência da Lei nº 6.766, de 19 de dezembro de 1979 – cujas glebas desmembradas sejam exatamente em mesmo número dos condôminos que pretendem dividi-las"
         },
         {
          "id": "c",
          "rotulo": "Divisões consequentes de partilhas judiciais, qualquer que seja a época de sua homologação ou celebração"
         },
         {
          "id": "d",
          "rotulo": "Desmembramentos necessários para o registro de cartas de arrematação, de adjudicação ou cumprimento de Mandados"
         },
         {
          "id": "e",
          "rotulo": "Terrenos objeto de compromissos formalizados até 20 de dezembro de 1979, mesmo com antecessores"
         },
         {
          "id": "f",
          "rotulo": "Terrenos individualmente lançados para o pagamento de IPTU para o exercício de 1979, ou antes"
         },
         {
          "id": "g",
          "rotulo": "Nenhuma das hipóteses anteriores de dispensa"
         }
        ],
        "efeitos": [
         {
          "quando": "opcao:a",
          "alerta": "O projeto pode ser averbado como desdobro simples."
         },
         {
          "quando": "opcao:b",
          "alerta": "O projeto pode ser averbado como desdobro simples."
         },
         {
          "quando": "opcao:c",
          "alerta": "O projeto pode ser averbado como desdobro simples."
         },
         {
          "quando": "opcao:d",
          "alerta": "O projeto pode ser averbado como desdobro simples."
         },
         {
          "quando": "opcao:e",
          "alerta": "O projeto pode ser averbado como desdobro simples."
         },
         {
          "quando": "opcao:f",
          "alerta": "O projeto pode ser averbado como desdobro simples."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "K-2",
    "texto": "Trata-se de hipótese de dispensa, cujos requisitos cumulativos abaixo estejam presentes?",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Não implicar transferência de área para o domínio público"
     },
     {
      "id": "b",
      "rotulo": "Não tenha havido prévia e recente transferência de área ao Poder Público, destinada a arruamento, que tenha segregado o imóvel, permitido ou facilitado o acesso a ela, visando tangenciar as exigências da Lei 6.766/79"
     },
     {
      "id": "c",
      "rotulo": "Resulte até 10 lotes, mesmo sem infraestrutura básica)"
     },
     {
      "id": "d",
      "rotulo": "Resulte entre 11 e 20 lotes, mas seja servido por rede de água, esgoto, guias, sarjetas, energia e iluminação pública, o que deve ser comprovado mediante a apresentação de certidão da Prefeitura Municipal"
     },
     {
      "id": "e",
      "rotulo": "Nenhuma hipótese de dispensa"
     }
    ],
    "efeitos": [
     {
      "quando": "alguma",
      "alerta": "O projeto pode ser averbado como desdobro simples."
     }
    ]
   },
   {
    "id": "K-3",
    "texto": "O imóvel que se pretende parcelar é urbano?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "K-3-1",
        "texto": "Foi apresentado o protocolo do Requerimento de cancelamento junto ao Incra, acompanhado da Certidão Municipal de inclusão da área no cadastro imobiliário e/ou perímetro urbano?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Necessária apresentação do protocolo de cancelamento do cadastro rural junto ao Incra, bem como a Certidão de inclusão do imóvel no perímetro urbano."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "K-4",
    "texto": "Sendo urbano o imóvel que se pretende parcelar, consta que nos últimos cinco anos tenha sido considerado rural?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "K-4-1",
        "texto": "Foi apresentada a CND-ITR?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Necessária apresentação da CND relativa ao ITR, ou, alternativamente, apresentação das cinco últimas declarações de ITR devidamente recolhidas."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "K-5",
    "texto": "O imóvel que se pretende parcelar está situado em região metropolitana?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "K-5-1",
        "texto": "Foi apresentada a aprovação do órgão estadual competente?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Necessária apresentação da aprovação do órgão estadual competente."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "K-6",
    "texto": "Sendo urbano o imóvel, há certidão de aprovação expedida pelo Município, dentro do prazo de validade de 180 (cento e oitenta) dias?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Necessária apresentação da aprovação do Município dentro do prazo de validade de 180 (cento e ointenta) dias."
     }
    ]
   },
   {
    "id": "K-7",
    "texto": "Selecione a hipótese de parcelamento:",
    "tipo": "opcoes",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Loteamento"
     },
     {
      "id": "b",
      "rotulo": "Desmembramento"
     }
    ],
    "efeitos": [
     {
      "quando": "opcao:a",
      "filhos": [
       {
        "id": "K-7-1",
        "texto": "Há certificado de aprovação expedido pelo Graprohab, dentro do prazo de validade nele estampado?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Apresentar certificado de aprovação expedido pelo Graprohab, dentro do prazo de validade."
         }
        ]
       }
      ]
     },
     {
      "quando": "opcao:b",
      "filhos": [
       {
        "id": "K-7-2",
        "texto": "Há certificado de dispensa de aprovação expedido pelo Graprohab, dentro do prazo de validade nele estampado?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "K-7-2-1",
            "texto": "Trata-se de alguma hipótese de dispensa do art. 5º do Decreto Estadual 52.053/07?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Apresentar certificado de dispensa de aprovação expedido pelo Graprohab, dentro do prazo de validade."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "K-8",
    "texto": "O Requerimento contém mais de uma matrícula a ser objeto do mesmo empreendimento?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "K-8-1",
        "texto": "há Requerimento para unificação?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Apresentar Requerimento para unificação das Matrículas integrantes do mesmo empreendimento."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "K-9",
    "texto": "A área a ser loteada está situada em mais de uma circunscrição?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "A gleba-mãe deve ser objeto de abertura de Matrícula em cada uma das circunscrições, e as matrículas das unidades devem ser abertas onde estiverem situadas."
     }
    ]
   },
   {
    "id": "K-10",
    "texto": "Planta e Memorial Descritivo coincidem quanto ao conteúdo?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "A planta e o memorial descritivo não coincidem."
     }
    ]
   },
   {
    "id": "K-11",
    "texto": "Há Documento de Responsabilidade Técnica?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Apresentar documento de responsabilidade técnica do profissional."
     }
    ]
   },
   {
    "id": "K-12",
    "texto": "Há construção averbada na Matrícula-mãe da gleba a ser loteada?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "K-12-1",
        "texto": "Há menção da área construída no mapa e memorial e eventual informação para qual lote será transportado?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Necessária indicação no projeto técnico sobre qual lote receberá a construção averbada na Matrícula-mãe da gleba a ser loteada."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "K-13",
    "texto": "Trata-se de parcelamento requerido pela União, Estado, Municípios, CDHU, COHABs e assemelhados?",
    "grupo": "Certidões e Documentos (art. 18, da Lei 6.766/79)",
    "tipo": "sim_nao"
   },
   {
    "id": "K-14",
    "texto": "Selecione os documentos apresentados:",
    "grupo": "Certidões e Documentos (art. 18, da Lei 6.766/79)",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Título de propriedade do imóvel ou certidão de matrícula atualizada"
     },
     {
      "id": "b",
      "rotulo": "Histórico dos títulos de propriedade, com os respectivos comprovantes, relativos aos últimos vinte anos"
     },
     {
      "id": "c",
      "rotulo": "Certidões Negativas (detalhar no checklist de Controle de Certidões)"
     },
     {
      "id": "d1",
      "rotulo": "Termo de Verificação de Obras (TVO) expedido pelo Município, ou, alternativamente, Cronograma Físico-Financeiro para realização das referidas obras de infraestrutura, cuja duração não exceda a quatro anos, acompanhado do respectivo instrumento de garantia para execução das obras"
     },
     {
      "id": "d2",
      "rotulo": "Contrato-padrão de compromisso de compra e venda dos lotes objeto do loteamento"
     },
     {
      "id": "e",
      "rotulo": "Declaração de anuência do cônjuge do loteador quanto à realização do loteamento, quando for o caso (ou seja, quando for Pessoa Física)"
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "filhos": [
       {
        "id": "K-14-1",
        "texto": "Trata-se de hipótese de parcelamento popular, destinado a classes de menor renda, conforme artigo 18, §4º da Lei 6.766/79?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Apresentar o Título de Propriedade ou a Certidão atualizada da Matrícula a ser parcelada."
         }
        ]
       },
       {
        "id": "K-14-2",
        "texto": "Trata-se de requisito facultativo, dispensável ou circunstancial?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Apresentar declaração de anuência do cônjuge do loteador."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "K-15",
    "texto": "Foram expedidas as Certidões de Tributos Municipais, Estaduais e Federais; de Ônus Reais; do Distribuidor Cível, Criminal e de Execuções Criminais das esferas Estadual e Federal; da Justiça do Trabalho (TRT) e a CNDT (TST); e de Protesto de Títulos?",
    "grupo": "Certidões e Documentos (art. 18, da Lei 6.766/79)",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não foram apresentadas as Certidões Negativas de que trata o artigo 18, III e IV, da Lei 6.766/79"
     },
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "K-15-1",
        "texto": "Tais Certidões se referem a todas as pessoas que foram proprietárias do imóvel nos períodos a que se referem (10 anos)?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "As certidões devem se referir a todas as pessoas que foram proprietárias do imóvel loteando nos últimos dez anos, o que não se verifica no caso em análise."
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "K-15-1-1",
            "texto": "Tais certidões foram extraídas na Comarca da situação do imóvel E do domicílio do loteador e dos eventuais proprietários antecessores?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "As Certidões não foram extraídas na Comarca da situação do imóvel // OU do domicílio do loteador // OU dos proprietários antecessores, o que é necessário."
             },
             {
              "quando": "sim",
              "filhos": [
               {
                "id": "K-15-1-1-1",
                "texto": "As certidões estão dentro do prazo de validade (6 meses)?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Reapresentar as Certidões vencidas."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "K-16",
    "texto": "Foram confirmadas nos sites oficiais as autenticidades de certidões e documentos apresentados?",
    "grupo": "Certidões e Documentos (art. 18, da Lei 6.766/79)",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Confirmar autenticidade de Certidões e Documentos nos sites oficiais."
     }
    ]
   },
   {
    "id": "K-17",
    "texto": "Há protestos de títulos, ações reais envolvendo o imóvel ou ações pessoais contra a pessoa do loteador e/ou contra os proprietários dos últimos períodos legais verificados, noticiadas nas certidões apresentadas?",
    "grupo": "Certidões e Documentos (art. 18, da Lei 6.766/79)",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "K-17-1",
        "texto": "Foi apresentada certidão complementar esclarecedora (ex.: Certidão de Objeto e Pé), para saber o andamento da ação?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Apresentar Certidão esclarecedora ou de Objeto e Pé a respeito do Processo XXXXX."
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "K-17-1-1",
            "texto": "Há declaração firmada pelo loteador, acompanhada de documentos hábeis que comprovem que tais ações não prejudicarão futuros adquirentes dos lotes?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Apresentar justificativa de que as ações judiciais, protestos e tributos em aberto não prejudicarão os futuros adquirentes dos lotes."
             },
             {
              "quando": "sim",
              "filhos": [
               {
                "id": "K-17-1-1-1",
                "texto": "A justificativa e respectivos documentos juntados merecem acolhimento?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "A justificativa e os respectivos documentos não foram suficientes para convencer o registrador da ausência de risco de prejuízo aos futuros adquirentes dos lotes."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "K-18",
    "texto": "Alguma das ações indicadas nas Certidões se refere a crime contra o patrimônio ou contra a Administração Pública em que figure como réu o loteador ou algum dos proprietários anteriores, noticiadas nas certidões apresentadas?",
    "grupo": "Certidões e Documentos (art. 18, da Lei 6.766/79)",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "exigencia": "O Loteamento pretendido não pode ser registrado porquanto pesa contra o loteador ou proprietário tabular dos últimos 10 anos crime contra o patrimônio ou crime contra a Administração Pública"
     }
    ]
   },
   {
    "id": "K-19",
    "texto": "Selecione os requisitos do artigo 26-A e 32-A da Lei 6.766/79:",
    "grupo": "Contrato-padrão de Compromisso de Compra e Venda",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Preço total a ser pago pelo imóvel"
     },
     {
      "id": "b",
      "rotulo": "Valor referente à corretagem, suas condições de pagamento e a identificação precisa de seu beneficiário"
     },
     {
      "id": "c",
      "rotulo": "Forma de pagamento do preço, com indicação clara dos valores e vencimentos das parcelas"
     },
     {
      "id": "d",
      "rotulo": "Índices de correção monetária aplicáveis ao contrato e, quando houver pluralidade de índices, o período de aplicação de cada um"
     },
     {
      "id": "e",
      "rotulo": "Taxas de juros eventualmente aplicadas, se mensais ou anuais, se nominais ou efetivas, o seu período de incidência e o sistema de amortização"
     },
     {
      "id": "f",
      "rotulo": "Informações acerca da possibilidade do exercício, por parte do adquirente do imóvel, do direito de arrependimento previsto no Código de Defesa do Consumidor, em todos os contratos firmados em estandes de vendas e fora da sede do loteador ou do estabelecimento comercial"
     },
     {
      "id": "g",
      "rotulo": "Prazo para quitação das obrigações pelo adquirente após a obtenção do auto de conclusão da obra pelo incorporador"
     },
     {
      "id": "h",
      "rotulo": "Informações acerca dos ônus que recaiam sobre o imóvel"
     },
     {
      "id": "i",
      "rotulo": "Número do registro do loteamento ou do desmembramento, a matrícula do imóvel e a identificação do cartório de registro de imóveis competente"
     },
     {
      "id": "j",
      "rotulo": "Termo final para execução do projeto e a data do protocolo do pedido de emissão do Termo de Vistoria de Obras"
     },
     {
      "id": "k",
      "rotulo": "Consequências do desfazimento do contrato, seja por meio de distrato, seja por meio de resolução contratual motivada por inadimplemento de obrigação do adquirente ou do incorporador, com destaque negritado para as penalidades aplicáveis e para os prazos para devolução de valores ao adquirente (previstos no art. 32-A, da Lei 6.766/79, conforme transcrição abaixo):"
     },
     {
      "id": "k1",
      "rotulo": "I - os valores correspondentes à eventual fruição do imóvel, até o equivalente a 0,75% (setenta e cinco centésimos por cento) sobre o valor atualizado do contrato, cujo prazo será contado a partir da data da transmissão da posse do imóvel ao adquirente até sua restituição ao loteador"
     },
     {
      "id": "k2",
      "rotulo": "II - o montante devido por cláusula penal e despesas administrativas, inclusive arras ou sinal, limitado a um desconto de 10% (dez por cento) do valor atualizado do contrato"
     },
     {
      "id": "k3",
      "rotulo": "III - os encargos moratórios relativos às prestações pagas em atraso pelo adquirente"
     },
     {
      "id": "k4",
      "rotulo": "IV - os débitos de impostos sobre a propriedade predial e territorial urbana, contribuições condominiais, associativas ou outras de igual natureza que sejam a estas equiparadas e tarifas vinculadas ao lote, bem como tributos, custas e emolumentos incidentes sobre a restituição e/ou rescisão"
     },
     {
      "id": "k5",
      "rotulo": "V - a comissão de corretagem, desde que integrada ao preço do lote"
     },
     {
      "id": "k6",
      "rotulo": "§1º O pagamento da restituição ocorrerá em até 12 (doze) parcelas mensais, com início após o seguinte prazo de carência:"
     },
     {
      "id": "k7",
      "rotulo": "I - em loteamentos com obras em andamento: no prazo máximo de 180 (cento e oitenta) dias após o prazo previsto em contrato para conclusão das obras"
     },
     {
      "id": "k8",
      "rotulo": "II - em loteamentos com obras concluídas: no prazo máximo de 12 (doze) meses após a formalização da rescisão contratual"
     },
     {
      "id": "k9",
      "rotulo": "§2º Somente será efetuado registro do contrato de nova venda se for comprovado o início da restituição do valor pago pelo vendedor ao titular do registro cancelado na forma e condições pactuadas no distrato, dispensada essa comprovação nos casos em que o adquirente não for localizado ou não tiver se manifestado, nos termos do art. 32 desta Lei."
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Faltou o seguinte requisito obrigatório no contrato-padrão de compromisso de compra e venda das unidades autônomas: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "K-20",
    "texto": "Foi enviada comunicação à Prefeitura Municipal, mencionando que os documentos estão em ordem?",
    "grupo": "Comunicação ao Município e Publicação de Editais",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Comunicar o Município sobre o andamento do processo do Loteamento, que se encontra em ordem e que serão expedidos os Editais."
     }
    ]
   },
   {
    "id": "K-21",
    "texto": "Foi providenciada a publicação dos editais, com o pequeno desenho da área?",
    "grupo": "Comunicação ao Município e Publicação de Editais",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Expedir os Editais."
     }
    ]
   },
   {
    "id": "K-22",
    "texto": "Depois de registrado o parcelamento do solo, foi enviada comunicação à Prefeitura Municipal por meio de Certidão?",
    "grupo": "Comunicação ao Município e Publicação de Editais",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Comunicar o Município sobre o andamento do processo do Loteamento, que se encontra em ordem e que serão expedidos os editais."
     }
    ]
   }
  ]
 },
 {
  "id": "L",
  "titulo": "Incorporações Imobiliárias e Condomínios",
  "itens": [
   {
    "id": "L-1",
    "texto": "A documentação está na ordem estabelecida na Lei, conforme item 212, Cap. XX, das Normas do RI?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Organizar e numerar os arquivos PDF na pasta da prenotação."
     }
    ]
   },
   {
    "id": "L-2",
    "texto": "Selecione quem é o incorporador:",
    "tipo": "opcoes",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "O próprio dono do terreno constante do Registro de Imóveis"
     },
     {
      "id": "b",
      "rotulo": "O promitente comprador do terreno ou seu cessionário ou promitente cessionário"
     },
     {
      "id": "c",
      "rotulo": "O construtor das unidades autônomas"
     },
     {
      "id": "d",
      "rotulo": "Ente da Federação imitido na posse ou o cessionário deste."
     }
    ],
    "efeitos": [
     {
      "quando": "opcao:b",
      "filhos": [
       {
        "id": "L-2-1",
        "texto": "Nesta hipótese há outorga de mandato (procuração), por instrumento público, com menção à Lei 4.591/64?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Não foi apresentado o instrumento público de mandato (procuração)."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "L-3",
    "texto": "Há aprovação expedida pelo Município, dentro do prazo de validade de 180 (cento e oitenta) dias?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não foi apresentada a aprovação expedida pelo Município, dentro do prazo de validade de 180 dias."
     }
    ]
   },
   {
    "id": "L-4",
    "texto": "Há necessidade de aprovação pelo Graprohab?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "L-4-1",
        "texto": "Selecione a hipótese de cabimento:",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Condomínio horizontal ou misto com mais de 200 (duzentas) unidades"
         },
         {
          "id": "b",
          "rotulo": "Condomínio horizontal ou misto, cuja área do terreno seja superior a 50.000,00 metros quadrados, mesmo que haja menos de 200 (duzentas) unidades"
         },
         {
          "id": "c",
          "rotulo": "Condomínio vertical, com mais de 200 (duzentas) unidades"
         },
         {
          "id": "d",
          "rotulo": "Trata-se de condomínio vertical, cuja área do terreno seja superior a 50.000,00 metros quadrados, mesmo que haja menos de 200 (duzentas) unidades, e que não sejam servidos por redes de água e de coleta de esgotos, guias e sarjetas, energia e iluminação pública?"
         }
        ],
        "efeitos": []
       }
      ]
     }
    ]
   },
   {
    "id": "L-5",
    "texto": "Selecione as Certidões e Documentos verificados:",
    "grupo": "Certidões e Documentos do art. 32, da Lei 4.591/64",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Título de propriedade do terreno, ou de promessa irrevogável e irretratável de compra e venda, de cessão de direitos ou de permuta, com cláusula expressa de imissão na posse, consentimento para demolição e construção, e ausência impedimento à alienação do imóvel em frações ideais de condomínio"
     },
     {
      "id": "b",
      "rotulo": "Histórico dos títulos de propriedade dos últimos 20 anos (se transcrito), acompanhado dos respectivos comprovantes; ou Breve resumo dos títulos de propriedade dos últimos 20 anos (se matriculado há mais de 20 anos), acompanhado da certidão atualizada das Matrículas que completem esse período"
     },
     {
      "id": "c",
      "rotulo": "Projeto de construção devidamente aprovado pelas autoridades competentes"
     },
     {
      "id": "d",
      "rotulo": "Cálculo das áreas das edificações com discriminação das áreas construídas da parte global, das partes comuns e exclusivas"
     },
     {
      "id": "e",
      "rotulo": "Declaração instruída com plantas elucidativas ou croquis, que mencionem a quantidade de veículos comportados na garagem, e os locais destinados à sua guarda"
     },
     {
      "id": "f",
      "rotulo": "Certidão Negativa de Débitos Previdenciários, caso o titular do terreno seja o responsável por arrecadar as contribuições"
     },
     {
      "id": "g",
      "rotulo": "Memorial descritivo das especificações da obra projetada"
     },
     {
      "id": "h",
      "rotulo": "Avaliação do custo global da obra"
     },
     {
      "id": "i",
      "rotulo": "Avaliação do custo de construção de cada unidade"
     },
     {
      "id": "j",
      "rotulo": "Discriminação das frações ideais de terreno, com as unidades autônomas que corresponderão a ela"
     },
     {
      "id": "k",
      "rotulo": "Minuta da convenção do condomínio que regerá a edificação"
     },
     {
      "id": "l",
      "rotulo": "Declaração em que se determine a parcela do preço de que trata o artigo 39, II, da Lei 4.591/64 (pagamento do preço do terreno em unidades a serem construídas, se for o caso"
     },
     {
      "id": "m",
      "rotulo": "Certidão da Escritura pública de procuração, no caso do artigo 31, §1º, da Lei 4.591/64 (quando o construtor toma a iniciativa e assume a responsabilidade pelo empreendimento)"
     },
     {
      "id": "n",
      "rotulo": "Declaração expressa que fixe o prazo e as condições para que o incorporador desista do empreendimento (prazo de carência)"
     }
    ],
    "efeitos": []
   },
   {
    "id": "L-6",
    "texto": "Foram expedidas as Certidões de Tributos Municipais, Estaduais e Federais; de Ônus Reais; do Distribuidor Cível, Criminal e de Execuções Criminais das esferas Estadual e Federal; da Justiça do Trabalho (TRT) e a CNDT (TST); e de Protesto de Títulos?",
    "grupo": "Certidões e Documentos do art. 32, da Lei 4.591/64",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não foram apresentadas as Certidões Negativas de que trata o artigo 32, ‘b’, da Lei 4.591/64"
     },
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "L-6-1",
        "texto": "Tais Certidões se referem ao imóvel, ao alienante do terreno e ao incorporador?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "As certidões devem se referir ao alienante do terreno e ao incorporador, o que não se verifica no caso em análise."
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "L-6-1-1",
            "texto": "Tais Certidões foram extraídas na Comarca da situação do imóvel E dos domicílios do incorporador e do alienante do terreno?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "As certidões não foram extraídas na Comarca do domicílio do alienante do terreno // OU do incorporador // OU da situação do imóvel, o que é necessário."
             },
             {
              "quando": "sim",
              "filhos": [
               {
                "id": "L-6-1-1-1",
                "texto": "As certidões estão dentro do prazo de validade (6 meses)?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Reapresentar as Certidões vencidas."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "L-7",
    "texto": "Foram confirmadas nos sites oficiais as autenticidades de certidões e documentos apresentados?",
    "grupo": "Certidões e Documentos do art. 32, da Lei 4.591/64",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Confirmar autenticidade de Certidões e Documentos nos sites oficiais."
     }
    ]
   },
   {
    "id": "L-8",
    "texto": "Há protestos de títulos, ações reais envolvendo o imóvel ou ações pessoais contra a pessoa do incorporador e/ou contra o alienante do terreno, noticiados nas certidões apresentadas?",
    "grupo": "Certidões e Documentos do art. 32, da Lei 4.591/64",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "L-8-1",
        "texto": "Foi apresentada certidão complementar esclarecedora (ex.: Certidão de Objeto e Pé), para saber o andamento da ação?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Apresentar Certidão esclarecedora ou de Objeto e Pé a respeito do Processo XXXXX."
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "L-8-1-1",
            "texto": "Há declaração firmada pelo loteador, acompanhada de documentos hábeis que comprovem que tais ações não prejudicarão futuros adquirentes das unidades autônomas?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Apresentar justificativa de que as ações judiciais, protestos e tributos em aberto não prejudicarão os futuros adquirentes das unidades autônomas."
             },
             {
              "quando": "sim",
              "filhos": [
               {
                "id": "L-8-1-1-1",
                "texto": "A justificativa e respectivos documentos juntados merecem acolhimento?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "A justificativa e os respectivos documentos não foram suficientes para convencer o registrador da ausência de risco de prejuízo aos futuros adquirentes dos lotes."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "L-9",
    "texto": "O contrato é iniciado por quadro-resumo?",
    "grupo": "Contrato-padrão de Compromisso de Compra e Venda das futuras unidades autônomas:",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O contrato não inicia com quadro-resumo, nos termos do art. 35-A da Lei 4.591/64."
     }
    ]
   },
   {
    "id": "L-10",
    "texto": "Selecione os requisitos do artigo 35-A, da Lei 4.591/64:",
    "grupo": "Contrato-padrão de Compromisso de Compra e Venda das futuras unidades autônomas:",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Preço total a ser pago pelo imóvel"
     },
     {
      "id": "b",
      "rotulo": "Valor da parcela do preço a ser tratada como entrada, a sua forma de pagamento, com destaque para o valor pago à vista, e os seus percentuais sobre o valor total do contrato"
     },
     {
      "id": "c",
      "rotulo": "Valor referente à corretagem, suas condições de pagamento e a identificação precisa de seu beneficiário"
     },
     {
      "id": "d",
      "rotulo": "Forma de pagamento do preço, com indicação clara dos valores e vencimentos das parcelas"
     },
     {
      "id": "e",
      "rotulo": "Índices de correção monetária aplicáveis ao contrato e, quando houver pluralidade de índices, o período de aplicação de cada um"
     },
     {
      "id": "f",
      "rotulo": "Consequências do desfazimento do contrato, seja por meio de distrato, seja por meio de resolução contratual motivada por inadimplemento de obrigação do adquirente ou do incorporador, com destaque negritado para as penalidades aplicáveis e para os prazos para devolução de valores ao adquirente"
     },
     {
      "id": "g",
      "rotulo": "Taxas de juros eventualmente aplicadas, se mensais ou anuais, se nominais ou efetivas, o seu período de incidência e o sistema de amortização"
     },
     {
      "id": "h",
      "rotulo": "Informações acerca da possibilidade do exercício, por parte do adquirente do imóvel, do direito de arrependimento previsto no Código de Defesa do Consumidor, em todos os contratos firmados em estandes de vendas e fora da sede do incorporador ou do estabelecimento comercial"
     },
     {
      "id": "i",
      "rotulo": "Prazo para quitação das obrigações pelo adquirente após a obtenção do auto de conclusão da obra pelo incorporador"
     },
     {
      "id": "j",
      "rotulo": "Informações acerca dos ônus que recaiam sobre o imóvel, em especial quando o vinculem como garantia real do financiamento destinado à construção do investimento"
     },
     {
      "id": "k",
      "rotulo": "Número do registro do memorial de incorporação, a matrícula do imóvel e a identificação do cartório de registro de imóveis competente"
     },
     {
      "id": "l",
      "rotulo": "Termo final para obtenção do auto de conclusão da obra (habite-se) e os efeitos contratuais da intempestividade prevista no art. 43-A desta Lei"
     },
     {
      "id": "l.1",
      "rotulo": "Disposição do art. 43-A, §1º (Identificada a ausência de quaisquer das informações previstas no caput deste artigo, será concedido prazo de 30 (trinta) dias para aditamento do contrato e saneamento da omissão, findo o qual, essa omissão, se não sanada, caracterizará justa causa para rescisão contratual por parte do adquirente)"
     },
     {
      "id": "l.2",
      "rotulo": "Disposição do art. 43-A, §2º (A efetivação das consequências do desfazimento do contrato, referidas no inciso VI do caput deste artigo, dependerá de anuência prévia e específica do adquirente a seu respeito, mediante assinatura junto a essas cláusulas, que deverão ser redigidas conforme o disposto no § 4º do Código de Defesa do Consumidor)"
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Faltou o seguinte requisito obrigatório no contrato-padrão de compromisso de compra e venda das unidades autônomas: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "L-11",
    "texto": "Selecione abaixo os requisitos obrigatórios do Projeto Técnico:",
    "grupo": "Requisitos para todos os tipos de Condomínio",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Coincidência entre a área do terreno constante do Projeto e do Alvará"
     },
     {
      "id": "b",
      "rotulo": "Coincidência entre a descrição do imóvel constante do Memorial e da Planta;"
     },
     {
      "id": "c",
      "rotulo": "Coincidência entre a área e a descrição do terreno constantes da Matrícula, da Planta e do Memorial"
     },
     {
      "id": "d",
      "rotulo": "Menção da quantidade de unidades autônomas no Projeto Técnico"
     },
     {
      "id": "e",
      "rotulo": "Coincidência entre a confrontação das unidades autônomas constantes do Memorial e da Planta"
     },
     {
      "id": "f",
      "rotulo": "Identificação da espécie, quantidade e localização das vagas de garagem no Memorial e na Planta"
     },
     {
      "id": "g",
      "rotulo": "Documento de Responsabilidade Técnica do profissional que elaborou o projeto"
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Verifica-se a falta do(s) seguinte(s) requisito(s) obrigatório no Projeto Técnico: (Instrução ao sistema: “O sistema deverá elaborar automaticamente: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "L-12",
    "texto": "Selecione abaixo os requisitos obrigatórios do Projeto Técnico:",
    "grupo": "Regras específicas para Condomínio de unidades edificadas (Casas, Apartamentos, etc.)",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Quantidade de pavimentos constantes do Memorial e dos quadros da NBR"
     },
     {
      "id": "b",
      "rotulo": "Coincidência entre a descrição das unidades autônomas constantes do Memorial e dos quadros da NBR"
     },
     {
      "id": "c",
      "rotulo": "Área total correta, indicada pela soma das áreas constantes do Memorial"
     },
     {
      "id": "d",
      "rotulo": "Correção da totalidade (100%) das frações ideais do terreno quando somadas"
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Verifica-se a falta do(s) seguinte(s) requisito(s) obrigatório no Projeto Técnico: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "L-13",
    "texto": "Selecione abaixo os requisitos obrigatórios da Convenção de Condomínio (art. 9º da Lei 4.591/64):",
    "grupo": "Regras específicas para Condomínio de unidades edificadas (Casas, Apartamentos, etc.)",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Discriminação das partes exclusivas e comuns"
     },
     {
      "id": "b",
      "rotulo": "Destino das partes"
     },
     {
      "id": "c",
      "rotulo": "Modo de usar as coisas comuns"
     },
     {
      "id": "d",
      "rotulo": "Encargos e proporção das contribuições"
     },
     {
      "id": "e",
      "rotulo": "Modo de escolha do Síndico e Conselho Consultivo"
     },
     {
      "id": "f",
      "rotulo": "Atribuições do síndico"
     },
     {
      "id": "g",
      "rotulo": "Remuneração do síndico"
     },
     {
      "id": "h",
      "rotulo": "Modo e prazo de realização das assembleias"
     },
     {
      "id": "i",
      "rotulo": "Quórum das votações"
     },
     {
      "id": "j",
      "rotulo": "Forma de contribuição para o fundo de reserva"
     },
     {
      "id": "k",
      "rotulo": "Quórum para alteração da convenção"
     },
     {
      "id": "l",
      "rotulo": "Quórum para alteração do regimento interno, quando não incluído na convenção:"
     },
     {
      "id": "m",
      "rotulo": "Disposições especiais da incorporadora que podem ser prejudiciais aos condôminos (ex.: autorização perpétua para colocação de placa da incorporadora)"
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Verifica-se a falta do(s) seguinte(s) requisito(s) obrigatório na Convenção de Condomínio: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "L-14",
    "texto": "Foi requerida a instituição do patrimônio de afetação, nos termos do artigo 31-B, da Lei 4.591/64?",
    "grupo": "Regras específicas para Condomínio de unidades edificadas (Casas, Apartamentos, etc.)",
    "tipo": "sim_nao",
    "efeitos": []
   }
  ]
 },
 {
  "id": "M",
  "titulo": "Processo Extrajudicial de Retificação Perimetral",
  "itens": [
   {
    "id": "M-1",
    "texto": "A que título os requerentes são interessados?",
    "tipo": "opcoes",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Proprietários"
     },
     {
      "id": "b",
      "rotulo": "Herdeiros ou legatários"
     },
     {
      "id": "c",
      "rotulo": "Credores"
     },
     {
      "id": "d",
      "rotulo": "Titulares de direitos reais sobre o imóvel retificando"
     },
     {
      "id": "e",
      "rotulo": "Possuidores com título ainda não registrado"
     }
    ]
   },
   {
    "id": "M-2",
    "texto": "O projeto foi autuado, digitalizado e os PDFs numerados?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Autue o processo, numere corretamente os PDFs da pasta."
     }
    ]
   },
   {
    "id": "M-3",
    "texto": "Selecione abaixo os itens constantes no projeto:",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Memorial Descritivo"
     },
     {
      "id": "b",
      "rotulo": "Planta"
     },
     {
      "id": "c",
      "rotulo": "Documento de responsabilidade técnica (ART / RRT / TRT)"
     },
     {
      "id": "d",
      "rotulo": "Menção de Nome/Documento do confrontante e qualidade de sua confrontação (se proprietário, usufrutuário, ocupante usucapiente, etc)"
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Faltou o seguinte documento obritaório: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "M-4",
    "texto": "Houve alteração nominal de área mencionada no projeto em relação ao que consta da matrícula?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "M-4-1",
        "texto": "Selecione a opção abaixo que se enquadra no caso:",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Aumento"
         },
         {
          "id": "b",
          "rotulo": "Diminuição"
         }
        ]
       },
       {
        "id": "M-4-2",
        "texto": "Escreva a proporção:",
        "tipo": "numero"
       },
       {
        "id": "M-4-3",
        "texto": "Como você considera essa diferença de área?",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Aceitável"
         },
         {
          "id": "b",
          "rotulo": "Inaceitável"
         }
        ],
        "efeitos": [
         {
          "quando": "opcao:b",
          "exigencia": "O projeto ostenta diferença muito grande de área em relação à Matrícula, o que precisa ser esclarecido pelo profissional."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "M-5",
    "texto": "O Requerimento de retificação foi requerido somente para incluir coordenadas ou ângulos, sem nenhuma alteração de medidas de perímetro e/ou área (art. 213, I, da Lei 6.015/73)?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "Neste caso, não há necessidade de ouvir confrontantes."
     }
    ]
   },
   {
    "id": "M-6",
    "texto": "Consta altitude 0,0 m no projeto georreferenciado do Sigef?",
    "grupo": "Projeto Técnico",
    "tipo": "opcoes",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "SIM"
     },
     {
      "id": "b",
      "rotulo": "NÃO"
     },
     {
      "id": "c",
      "rotulo": "Não se aplica"
     }
    ],
    "efeitos": [
     {
      "quando": "opcao:a",
      "exigencia": "Consta altitude 0,00 metros, o que demanda esclarecimento por parte do profissional."
     }
    ]
   },
   {
    "id": "M-7",
    "texto": "O polígono foi plotado no Mapa do Registro de Imóveis do Brasil?",
    "grupo": "Projeto Técnico",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Necessário que o profissional alimente o banco de dados do Mapa do RI com a descrição dos polígonos."
     },
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "M-7-1",
        "texto": "O polígono se encaixa perfeitamente no Mapa?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "O polígono está deslocado em relação ao Mapa do RI."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "M-8",
    "texto": "Há evidência de sobreposição em relação a outro polígono?",
    "grupo": "Projeto Técnico",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "M-8-1",
        "texto": "Escreva a proporção:",
        "tipo": "numero"
       },
       {
        "id": "M-8-2",
        "texto": "Como você considera esta sobreposição?",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Aceitável"
         },
         {
          "id": "b",
          "rotulo": "Inaceitável"
         }
        ],
        "efeitos": [
         {
          "quando": "opcao:b",
          "exigencia": "O projeto evidencia uma sobreposição de imóveis em percentual muito grande em relação a outro já plotado no Mapa do RI, o que precisa ser esclarecido pelo profissional."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "M-9",
    "texto": "Do projeto consta área construída que ainda não tenha sido averbada na Matrícula?",
    "grupo": "Projeto Técnico",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "exigencia": "O projeto mencionou área construída que ainda não foi averbada na Matrícula. Regularizar a construção mediante apresentação de Habite-se e Certidão Negativa de Débitos Previdenciários, ou, alternativamente, requerer seja postergada essa averbação para tempo oportuno."
     }
    ]
   },
   {
    "id": "M-10",
    "texto": "Os imóveis indicados como confrontantes no projeto são REALMENTE CONFRONTANTES do imóvel que se pretende retificar (ou ao menos há indícios de que sejam)?",
    "grupo": "Projeto Técnico",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não foi possível verificar se os imóveis apontados como confrontantes no projeto sejam aqueles que constam da respectiva Matrícula."
     }
    ]
   },
   {
    "id": "M-11",
    "texto": "O imóvel confronta com imóvel público de qualquer espécie?",
    "grupo": "Projeto Técnico",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "M-11-1",
        "texto": "O projeto menciona e demonstra graficamente o respeito aos terrenos reservados às margens de rios navegáveis, bem como à faixa de domínio às margens de rodovias?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Não há menção no projeto que o imóvel retificando tenha respeitado os limites com áreas públicas – margem de rios navegáveis e faixas de domínio às margens de rodovia."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "M-12",
    "texto": "Há algum confrontante ou titular de direito que não tenha anuído expressamente?",
    "grupo": "Projeto Técnico",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "M-12-1",
        "texto": "Foram requeridas as suas notificações?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "M-12-1-1",
            "texto": "Trata-se de caso de dispensa de manifestação de anuência ou notificações?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Os confrontantes X, Y e Z não anuíram ao projeto, nem tampouco houve Requerimento de sua notificação e não se enquadram nas hipóteses de dispensa."
             },
             {
              "quando": "sim",
              "filhos": [
               {
                "id": "M-12-1-1-1",
                "texto": "Selecione as opções abaixo que se enquadram no caso analisado:",
                "tipo": "multipla",
                "opcoes": [
                 {
                  "id": "a",
                  "rotulo": "Em razão de certificação de georreferenciamento ao imóvel retificando (art. 213, II, §17, da Lei 6.015/73), sem alteração de medidas perimetrais"
                 },
                 {
                  "id": "b",
                  "rotulo": "Faixa de domínio às margens de via de circulação federal, estadual ou municipal"
                 },
                 {
                  "id": "c",
                  "rotulo": "Terreno reservado às margens de depósito hídrico, mares ou curso d’água navegável estadual ou federal"
                 },
                 {
                  "id": "d",
                  "rotulo": "Imóvel vizinho com georreferenciamento certificado, ainda que não averbado na respectiva matrícula, cuja linha divisória é coincidente"
                 }
                ],
                "efeitos": [
                 {
                  "quando": "alguma",
                  "alerta": "Anotar para justificar a dispensa na Sentença."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "M-13",
    "texto": "O projeto de retificação está cumulado com outra(s) hipótese(s) de alteração da figura geodésica do imóvel?",
    "grupo": "Regras específicas para cumulação de projetos",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "M-13-1",
        "texto": "Selecione abaixo conforme o caso.",
        "tipo": "multipla",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Unificação de imóveis urbanos ou rurais"
         },
         {
          "id": "b",
          "rotulo": "Desdobro de lote urbano / Desmembramento rural"
         },
         {
          "id": "c",
          "rotulo": "Desdobro e Anexação de imóveis urbanos ou rurais"
         }
        ]
       },
       {
        "id": "M-14",
        "texto": "O projeto menciona o passo a passo da situação inicial e final?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "O profissional precisa descrever a situação inicial, intermediária e final, conforme o caso."
         }
        ]
       },
       {
        "id": "M-15",
        "texto": "Há delimitação das divisas de cada polígono objeto da fusão ou destaque?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "As divisas entre os polígonos ora unificados / destacados não estão delimitadas."
         }
        ]
       },
       {
        "id": "M-16",
        "texto": "Há aprovação do órgão competente, quando cabível?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "M-16-1",
            "texto": "Trata-se de caso de dispensa?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Falta aprovação do projeto pelo órgão competente."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "N",
  "titulo": "Processo Extrajudicial de Usucapião",
  "itens": [
   {
    "id": "N-1",
    "texto": "O projeto foi devidamente autuado, e os arquivos PDF devidamente organizados e numerados?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Autuar o processo numerando os PDFs!"
     }
    ]
   },
   {
    "id": "N-2",
    "texto": "O procedimento teve início no Judiciário e as partes pediram desistência ou suspensão, tendo sido devidamente homologada a desistência ou deferida a suspensão pelo juiz?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "Possível a utilização das provas já produzidas na via judicial."
     }
    ]
   },
   {
    "id": "N-3",
    "texto": "O imóvel encontra-se matriculado ou transcrito?",
    "tipo": "sim_nao",
    "efeitos": []
   },
   {
    "id": "N-4",
    "texto": "O usucapiente é casado?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "N-4-1",
        "texto": "Casado desde o início da posse?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "alerta": "Cônjuge também será proprietário."
         },
         {
          "quando": "nao",
          "alerta": "Cônjuge não será proprietário."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "N-5",
    "texto": "Foi assinado por advogado, com prova de sua inscrição na OAB?",
    "grupo": "Disposições específicas do Requerimento",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Apresentar Requerimento assinado por advogado regularmente inscrito na OAB."
     }
    ]
   },
   {
    "id": "N-6",
    "texto": "Selecione os requisitos do Requerimento elencados abaixo:",
    "grupo": "Disposições específicas do Requerimento",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Modalidade de usucapião requerida e sua base legal ou constitucional",
      "obrigatorio": true
     },
     {
      "id": "b",
      "rotulo": "Origem e as características da posse, a existência de edificação, de benfeitoria ou de qualquer acessão no imóvel usucapiendo, com a referência às respectivas datas de ocorrência",
      "obrigatorio": true
     },
     {
      "id": "c",
      "rotulo": "Nome e estado civil de todos os possuidores anteriores cujo tempo de posse foi somado ao do requerente para completar o período aquisitivo"
     },
     {
      "id": "d",
      "rotulo": "Número da matrícula ou transcrição da área onde se encontra inserido o imóvel usucapiendo ou a informação de que não se encontra matriculado ou transcrito",
      "obrigatorio": true
     },
     {
      "id": "e",
      "rotulo": "Valor atribuído ao imóvel usucapiendo",
      "obrigatorio": true
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Falta o seguinte requisito essencial do Requerimento: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "N-7",
    "texto": "Selecione os documentos anexados ao Requerimento:",
    "grupo": "Disposições específicas do Requerimento",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Ata Notarial",
      "obrigatorio": true
     },
     {
      "id": "b",
      "rotulo": "Planta e memorial descritivo",
      "obrigatorio": true
     },
     {
      "id": "c",
      "rotulo": "Justo título, se for o caso"
     },
     {
      "id": "d",
      "rotulo": "Certidões negativas dos Distribuidores Cíveis e Criminais da Justiça Estadual do local da situação do imóvel usucapiendo, expedida nos últimos 30 dias?",
      "ajuda": "controlar pelo Checklist próprio para Certidões",
      "obrigatorio": true
     },
     {
      "id": "e",
      "rotulo": "Instrumento de mandato (PROCURAÇÃO), público ou particular, com poderes especiais e com firma reconhecida, por semelhança ou autenticidade, outorgado ao advogado pelo requerente e por seu cônjuge ou companheiro",
      "obrigatorio": true
     },
     {
      "id": "f",
      "rotulo": "Declaração do requerente, do seu cônjuge ou companheiro que outorgue ao defensor público a capacidade postulatória da usucapião"
     },
     {
      "id": "g",
      "rotulo": "Certidão dos órgãos municipais e/ou federais que demonstre a natureza urbana ou rural do imóvel usucapiendo",
      "obrigatorio": true
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Faltou o seguinte documento anexo ao Requerimento: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "N-8",
    "texto": "A Ata Notarial foi lavrada pelo tabelião da Comarca do imóvel ou de sua maior porção territorial?",
    "grupo": "Ata Notarial",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O Tabelião que lavrou a Ata Notarial não é territorialmente competente fazê-lo."
     }
    ]
   },
   {
    "id": "N-9",
    "texto": "Selecione os elementos constantes da Ata Notarial:",
    "grupo": "Ata Notarial",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Qualificação, endereço eletrônico, domicílio e residência do requerente e respectivo cônjuge ou companheiro",
      "obrigatorio": true
     },
     {
      "id": "b",
      "rotulo": "Qualificação, endereço eletrônico, domicílio e residência do titular do imóvel lançado na matrícula objeto da usucapião",
      "obrigatorio": true
     },
     {
      "id": "c",
      "rotulo": "Descrição do imóvel conforme consta na matrícula do registro em caso de bem individualizado ou a descrição da área em caso de não individualização, devendo ainda constar as características do imóvel, tais como a existência de edificação, de benfeitoria ou de qualquer acessão no imóvel usucapiendo",
      "obrigatorio": true
     },
     {
      "id": "d",
      "rotulo": "Tempo e as características da posse do requerente e de seus antecessores",
      "obrigatorio": true
     },
     {
      "id": "e",
      "rotulo": "Forma de aquisição da posse do imóvel usucapiendo pela parte requerente",
      "obrigatorio": true
     },
     {
      "id": "f",
      "rotulo": "Modalidade de usucapião pretendida e sua base legal ou constitucional",
      "obrigatorio": true
     },
     {
      "id": "g",
      "rotulo": "Número de imóveis atingidos pela pretensão aquisitiva e a localização: se estão situados em uma ou em mais circunscrições",
      "obrigatorio": true
     },
     {
      "id": "h",
      "rotulo": "Valor do imóvel",
      "obrigatorio": true
     },
     {
      "id": "i",
      "rotulo": "Informações que o tabelião de notas considere necessárias à instrução do procedimento, tais como depoimentos de testemunhas ou partes confrontantes",
      "obrigatorio": true
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Falta o seguinte requisito essencial da Ata Notarial: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "N-10",
    "texto": "Consta da Ata Notarial que o requerente foi cientificado de que a ata notarial não tem valor como confirmação ou estabelecimento de propriedade, servindo apenas para a instrução de Requerimento extrajudicial de usucapião para processamento perante o registrador de imóveis?",
    "grupo": "Ata Notarial",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Faltou constar da Ata Notarial a declaração de não tem valor como confirmação de propriedade."
     }
    ]
   },
   {
    "id": "N-11",
    "texto": "Há Planta e Memorial Descritivo?",
    "grupo": "Projeto Técnico",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "N-11-1",
        "texto": "Seu conteúdo comum é idêntico?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "O conteúdo constante da Planta não coincide com o Memorial Descritivo."
         }
        ]
       }
      ]
     },
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "N-11-2",
        "texto": "Trata-se de algum caso de dispensa (ex.: Lote oriundo de Loteamento registrado ou unidade imobiliária condominial)?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Apresentar planta e memorial descritivo relativo ao imóvel objeto da usucapião pretendida."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "N-12",
    "texto": "Foi apresentado Documento de Responsabilidade Técnica do profissional que elaborou o Projeto?",
    "grupo": "Projeto Técnico",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O Documento de Responsabilidade Técnica do profissional que elaborou o projeto não foi apresentado."
     }
    ]
   },
   {
    "id": "N-13",
    "texto": "Os proprietários tabulares e os demais titulares de direito real sobre o imóvel que se pretende usucapir prestaram sua anuência (seja no projeto técnico, seja em separado)?",
    "grupo": "Anuências dos titulares de direitos sobre o imóvel usucapiendo e sobre os imóveis confrontantes",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "N-13-1",
        "texto": "A falta da anuência se deve ao óbito dos referidos proprietários?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "N-13-1-1",
            "texto": "Nesse caso, os herdeiros anuíram no lugar do falecido?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "sim",
              "filhos": [
               {
                "id": "N-13-1-1-1",
                "texto": "Foi lavrada Escritura Pública Declaratória de Únicos Herdeiros, com nomeação de inventariante?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "exigencia": "Tendo em vista que os herdeiros dos proprietários tabulares prestaram a sua anuência sem o registro do respectivo inventário, necessária lavratura de Escritura Pública Declaratória de Únicos Herdeiros com nomeação de Inventariante."
                 }
                ]
               }
              ]
             },
             {
              "quando": "nao",
              "filhos": [
               {
                "id": "N-13-1-1-2",
                "texto": "Houve pedido de notificação dos proprietários tabulares?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "sim",
                  "alerta": "Providenciar as notificações."
                 },
                 {
                  "quando": "nao",
                  "exigencia": "Verifica-se que o proprietário tabular é falecido. Tendo em vista que não foi lavrada Escritura Pública de Declaração de Únicos Herdeiros com nomeação de Inventariante, necessário que os respectivos herdeiros sejam notificados, o que demanda pedido expresso nesse sentido."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         },
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "N-13-1-2",
            "texto": "O requerente apresentou justo título com prova da quitação das obrigações e apresentação das Certidões dos Distribuidores Cível e Criminal das esferas Estadual e Federal que demonstrem inexistência de ação tramitando?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Apresentar anuência de todos os proprietários tabulares ou apresentar documento que a supra (justo título) ou requerer sejam notificados."
             },
             {
              "quando": "sim",
              "filhos": [
               {
                "id": "N-13-1-2-1",
                "texto": "Há indícios de utilização da usucapião como burla ao ingresso normal deste título acima mencionado?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "alerta": "Em qualquer caso, necessária justificativa expressa."
                 },
                 {
                  "quando": "sim",
                  "exigencia": "O justo título apresentado pelo Requerente não pode ser utilizado para suprir anuência dos proprietários tabulares, uma vez que, tendo em vista seu inteiro teor, poderá ser regularmente registrado."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "N-14",
    "texto": "Os demais titulares de direito real sobre o imóvel que se pretende usucapir prestaram sua anuência (seja no projeto técnico, seja em separado)?",
    "grupo": "Anuências dos titulares de direitos sobre o imóvel usucapiendo e sobre os imóveis confrontantes",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "A usucapião extrajudicial, mesmo sendo aquisição originária, não extingue automaticamente os ônus, gravames e direitos reais",
      "filhos": [
       {
        "id": "N-14-1",
        "texto": "Foi apresentada anuência ao cancelamento do gravame, firmada pelo titular do direito real inscrito?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "alerta": "Transportar os ônus, direitos reais e gravames para a nova matrícula, após o registro da usucapião!"
         },
         {
          "quando": "sim",
          "alerta": "Transportar os ônus, direitos reais e gravames para a nova matrícula, após o registro da usucapião, e efetuar os respectivos cancelamentos – princípio da continuidade."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "N-15",
    "texto": "O imóvel usucapiendo está matriculado e com descrição precisa, havendo perfeita identidade entre a descrição tabular e a do projeto?",
    "grupo": "Anuências dos titulares de direitos sobre o imóvel usucapiendo e sobre os imóveis confrontantes",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "Neste caso, a abertura da Matrícula para a área usucapida não será obrigatória."
     },
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "N-15-1",
        "texto": "Há certeza de que os imóveis descritos no projeto são realmente confrontantes do imóvel que se pretende retificar (ou ao menos há indícios de que sejam)?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Não foi possível verificar com certeza se os imóveis indicados como confrontantes realmente o sejam. Necessários esclarecimentos por parte do profissional técnico."
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "N-15-1-1",
            "texto": "Os titulares de direito real registrado/averbado na matrícula/transcrição dos imóveis confrontantes (exemplos: proprietário, usufrutuário, credor hipotecário, credor fiduciário, titular de servidão, etc.) prestaram a sua anuência ao pedido de usucapião?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "filhos": [
               {
                "id": "N-15-1-1-1",
                "texto": "Houve pedido de notificação dos confrontantes?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "sim",
                  "alerta": "Providenciar as notificações."
                 },
                 {
                  "quando": "nao",
                  "exigencia": "Verifica-se que os titulares de direitos reais sobre os imóveis confrontantes não prestaram sua anuência, nem foi requerida a sua notificação, o que é necessário."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "N-16",
    "texto": "Tendo sido realizadas as diligências nas notificações dos titulares de direitos reais registrados ou averbados na matrícula/transcrição do imóvel usucapiendo e/ou dos imóveis confrontantes, foram encontradas as pessoas?",
    "grupo": "Notificações realizadas",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "N-16-1",
        "texto": "Foi certificada a circunstância de que a o notificado estava em lugar incerto, desconhecido ou inacessível?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "alerta": "Exigir novos endereços ao Requerente, ou, se for o caso, intimação por hora certa."
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "N-16-1-1",
            "texto": "Foram publicados os Editais, por duas vezes, em jornal local de grande circulação ou em meio eletrônico, pelo prazo de quinze dias cada um?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "alerta": "Providenciar os Editais."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "N-17",
    "texto": "Estando em ordem a documentação, foi dada ciência à União, Estados e Município sobre a usucapião requerida?",
    "grupo": "Comunicações aos Órgãos Públicos e Editais obrigatórios",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Providenciar a notificação dos entes públicos."
     }
    ]
   },
   {
    "id": "N-18",
    "texto": "Houve a publicação obrigatória de EDITAIS para ciência de terceiros interessados?",
    "grupo": "Comunicações aos Órgãos Públicos e Editais obrigatórios",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Providenciar o Edital de notificação de terceiros interessados."
     }
    ]
   },
   {
    "id": "N-19",
    "texto": "Houve impugnação?",
    "grupo": "Impugnações",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "N-19-1",
        "texto": "Houve conciliação?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "N-19-1-1",
            "texto": "Selecione a opção sobre a decisão do Juiz Corregedor Permanente:",
            "tipo": "opcoes",
            "opcoes": [
             {
              "id": "a",
              "rotulo": "Infundada"
             },
             {
              "id": "b",
              "rotulo": "Fundada"
             }
            ],
            "efeitos": [
             {
              "quando": "opcao:b",
              "alerta": "Proferir Sentença de arquivamento do processo extrajudicial de usucapião."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "N-20",
    "texto": "Pressupostos e finalidades:\n\tDelimitar os fatos que precisam ser demonstrados; \n\tVerificar quem são os interessados; \n\tDeterminar ou admitir a produção das provas pertinentes; \n\tOuvir testemunhas, quando necessário; \n\tFormular perguntas; \n\tPermitir que os interessados participem da produção; \n\tDocumentar integralmente os atos; \n\tAvaliar os elementos produzidos; \n\tFormar sua convicção exclusivamente quanto à qualificação do pedido registral.",
    "grupo": "Procedimento Especial de Justificação Administrativa em caso de ausência ou insuficiência de documentos",
    "tipo": "info"
   },
   {
    "id": "N-21",
    "texto": "Consta da petição o Requerimento para produção antecipação de provas com justificativa razoável, E o justo título ou os demais documentos que demonstram a posse em todos os seus aspectos (origem, natureza, continuidade, tempo, etc.) são insuficientes para constituição de prova?",
    "grupo": "Procedimento Especial de Justificação Administrativa em caso de ausência ou insuficiência de documentos",
    "tipo": "sim_nao",
    "efeitos": []
   },
   {
    "id": "N-22",
    "texto": "O requerente mencionou com precisão os fatos sobre os quais a prova há de recair?",
    "grupo": "Procedimento Especial de Justificação Administrativa em caso de ausência ou insuficiência de documentos",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "O Requerente não demonstrou suficientemente os fatos que dão motivo ao pedido de produção antecipada de provas."
     }
    ]
   },
   {
    "id": "N-23",
    "texto": "Foram notificados os terceiros eventualmente interessados na produção da prova ou no fato a ser provado, salvo se inexistente caráter contencioso?",
    "grupo": "Procedimento Especial de Justificação Administrativa em caso de ausência ou insuficiência de documentos",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Notificar os interessados!"
     }
    ]
   },
   {
    "id": "N-24",
    "texto": "Os autos da produção antecipada de provas foram separados dos autos do procedimento da usucapião extrajudicial?",
    "grupo": "Procedimento Especial de Justificação Administrativa em caso de ausência ou insuficiência de documentos",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Separar os autos da Usucapião Extrajudicial e do Procedimento de Justificação."
     }
    ]
   },
   {
    "id": "N-25",
    "texto": "Os autos da produção antecipada de provas permaneceram em cartório durante 1 (um) mês para extração de cópias e certidões por terceiros eventualmente interessados?",
    "grupo": "Procedimento Especial de Justificação Administrativa em caso de ausência ou insuficiência de documentos",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Disponibilizar os autos por 01 (um) mês para ciência e consulta de interessados."
     }
    ]
   },
   {
    "id": "N-26",
    "texto": "Escoado esse prazo, os autos foram disponibilizados ao requerente da medida, para que sejam retirados?",
    "grupo": "Procedimento Especial de Justificação Administrativa em caso de ausência ou insuficiência de documentos",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Disponibilizar os autos para o Requerente."
     }
    ]
   }
  ]
 },
 {
  "id": "O",
  "titulo": "Processos Extrajudiciais de Execução de Garantias",
  "itens": [
   {
    "id": "O-1",
    "texto": "Selecione os requisitos específicos e obrigatórios que correspondam ao conteúdo do Requerimento de Execução ora analisado",
    "grupo": "Disposições específicas do Requerimento",
    "tipo": "multipla",
    "ajuda": "qualquer que seja a modalidade de garantia a ser executada",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Número do CPF e nome do devedor (e de seu cônjuge, se for casado em regime de bens que exija a intimação), dispensada a indicação de outros dados qualificativos"
     },
     {
      "id": "b",
      "rotulo": "Endereço residencial atual do devedor;"
     },
     {
      "id": "c",
      "rotulo": "Residencial anterior do devedor, se houver"
     },
     {
      "id": "d",
      "rotulo": "Endereço comercial do devedor, se houver"
     },
     {
      "id": "e",
      "rotulo": "Declaração de que decorreu o prazo de carência estipulado no contrato"
     },
     {
      "id": "f",
      "rotulo": "Demonstrativo do débito e projeção de valores para pagamento da dívida, ou do valor total a ser pago pelo devedor por períodos de vencimento"
     },
     {
      "id": "g",
      "rotulo": "Número do CPF e nome do credor, dispensada a indicação de outros dados qualificativos"
     },
     {
      "id": "h",
      "rotulo": "Comprovante de representação legal do credor pelo signatário do Requerimento, quando for o caso"
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Verifica-se a falta do(s) seguinte(s) requisito(s) obrigatório(s) no Requerimento: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "O-2",
    "texto": "A execução se refere a garantia hipotecária constituída em razão de dívida relacionada com a atividade agropecuária?",
    "grupo": "Disposições específicas do Requerimento",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "exigencia": "Não é possível executar garantia hipotecária em razão de dívida relacionada com a atividade agropecuária"
     },
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "O-2-1",
        "texto": "O título constitutivo da hipoteca contém previsão expressa dos procedimentos executórios mencionados nos §§ 1º a 10 do artigo 9º da Lei 14.711?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "É requisito de validade ao título constitutivo da hipoteca a previsão expressa dos procedimentos executórios mencionados nos §§ 1º a 10 do artigo 9º da Lei 14.711."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "O-3",
    "texto": "O demonstrativo do débito e projeção da dívida contém datas suficientes, levando-se em conta que o prazo de intimação do(s) devedor(es) pode se estender?",
    "grupo": "Disposições específicas do Requerimento",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Apresentar o demonstrativo de projeção do débito que contenha data suficientemente longa em razão de eventual demora na intimação do devedor."
     }
    ]
   },
   {
    "id": "O-4",
    "texto": "O devedor é falecido?",
    "grupo": "Disposições específicas do Requerimento",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "O-4-1",
        "texto": "Há inventário em curso?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "O-4-1-1",
            "texto": "Foi apresentada Certidão de Óbito E do Testamento, ou da Certidão Negativa de Testamento, expedida pelo Colégio Notarial do Brasil?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Apresentar Certidão de Óbito E do Testamento, ou da Certidão Negativa de Testamento, expedida pelo Colégio Notarial do Brasil."
             }
            ]
           }
          ]
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "O-4-1-2",
            "texto": "Foi apresentada a Certidão de Óbito E o Termo de Compromisso de Inventariante, ou Certidão Judicial, ou Escritura Pública de Declaração de Inventariante?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Apresentar Certidão de Óbito E o Termo de Compromisso de Inventariante, ou Certidão Judicial, ou Escritura Pública de Declaração de Inventariante."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "O-5",
    "texto": "O credor forneceu endereços suficientes para que o Registro de Imóveis encontre o devedor?",
    "grupo": "Notificações aos Devedores",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Fornecer endereços suficientes para que o devedor seja encontrado."
     }
    ]
   },
   {
    "id": "O-6",
    "texto": "O devedor compareceu espontaneamente no Cartório antes que fosse expedida qualquer intimação, tomou ciência do processo e foi constituído em mora?",
    "grupo": "Notificações aos Devedores",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "O-6-1",
        "texto": "O devedor efetuou NO ATO, o pagamento da dívida?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "alerta": "Neste caso, não serão cobrados os emolumentos da intimação, nem o valor das diligências."
         },
         {
          "quando": "nao",
          "alerta": "Neste caso, serão cobrados os emolumentos da intimação, mas não os valores das diligências."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "O-7",
    "texto": "O(s) devedor(es) recebeu(ram) a notificação e foi(ram) constituído(s) em mora?",
    "grupo": "Notificações aos Devedores",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "O-7-1",
        "texto": "O devedor compareceu para pagar a dívida?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "O-7-1-1",
            "texto": "O credor foi intimado no prazo de três dias para receber os valores?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "alerta": "Intimar o credor para receber os valores"
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "O-8",
    "texto": "Não recebida a notificação, pelo resultado das diligências se pode entender que o devedor está em lugar incerto, inacessível ou ignorado?",
    "grupo": "Notificações aos Devedores",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Deverão ser realizadas novas diligências e os prazos controlados pelo Checklist próprio."
     },
     {
      "quando": "sim",
      "alerta": "Deverão ser expedidos os Editais e os prazos controlados pelo Checklist próprio."
     }
    ]
   },
   {
    "id": "O-9",
    "texto": "Para tratarmos sobre Consolidação e Apropriação dos imóveis garantidos, selecione abaixo a modalidade de garantia a ser executada:",
    "tipo": "opcoes",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Propriedade Fiduciária"
     },
     {
      "id": "b",
      "rotulo": "Hipoteca"
     }
    ],
    "efeitos": [
     {
      "quando": "opcao:a",
      "filhos": [
       {
        "id": "O-9-1",
        "texto": "Realizada a intimação, decorrido o prazo legal e o devedor não tenha comparecido para pagar a dívida, foi expedida a certidão de transcurso de prazo sem purgação da mora?",
        "grupo": "Disposições específicas sobre Consolidação da Garantia Fiduciária",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "alerta": "Expedir a Certidão de Transcurso do Prazo sem Purgação da Mora!"
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "O-9-1-1",
            "texto": "O credor foi intimado sobre essa certidão?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "alerta": "Intimar o credor para se manifestar sobre a Certidão e recolher o ITBI para que a consolidação seja realizada."
             }
            ]
           }
          ]
         }
        ]
       },
       {
        "id": "O-9-2",
        "texto": "Foi apresentada a guia de ITBI devidamente recolhida, dentro do prazo máximo de 120 (cento e vinte) dias após a Certidão de Transcurso de Prazo?",
        "grupo": "Disposições específicas sobre Consolidação da Garantia Fiduciária",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "alerta": "Proferir Sentença de deferimento do pedido e realizar a averbação da consolidação da propriedade ao Credor Fiduciário."
         },
         {
          "quando": "nao",
          "exigencia": "Tendo em vista que o ITBI não foi recolhido no prazo de 120 dias após a certificação do transcurso do prazo sem a purgação da mora, este processo deverá ser encerrado e novo Requerimento ensejará novo Processo."
         }
        ]
       }
      ]
     },
     {
      "quando": "opcao:b",
      "filhos": [
       {
        "id": "O-9-3",
        "texto": "Realizada a intimação, e constituído em mora o devedor hipotecário, o pedido para averbação da não-purgação da mora está dentro dos quinze dias seguintes ao dia final que o devedor tem para pagar a dívida?",
        "grupo": "Disposições específicas sobre Arrematação/Adjudicação/Venda Direta do Imóvel na Garantia Hipotecária",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "O pedido de averbação da não-purgação da mora é extemporâneo, uma vez que não foi realizado dentro dos quinze dias seguintes ao último dia que o devedor poderia ter pago a dívida."
         }
        ]
       },
       {
        "id": "O-9-4",
        "texto": "Decorrido o prazo legal e o devedor hipotecário não tenha purgado a mora, foi expedida a respectiva Certidão de Transcurso de Prazo?",
        "grupo": "Disposições específicas sobre Arrematação/Adjudicação/Venda Direta do Imóvel na Garantia Hipotecária",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "alerta": "Expedir a Certidão de Transcurso do Prazo sem Purgação da Mora!"
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "O-9-4-1",
            "texto": "O credor foi intimado sobre essa certidão?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "alerta": "Intimar o credor para se manifestar sobre a Certidão e providenciar os leilões"
             }
            ]
           }
          ]
         }
        ]
       },
       {
        "id": "O-9-5",
        "texto": "Os leilões deixaram de ser realizados em razão de remição da execução pelo devedor ou terceiro garantidor?",
        "grupo": "Disposições específicas sobre Arrematação/Adjudicação/Venda Direta do Imóvel na Garantia Hipotecária",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "alerta": "Os valores devem ser transferidos ao Credor no prazo de 3 (três) dias."
         }
        ]
       },
       {
        "id": "O-9-6",
        "texto": "Tendo sido realizados os leilões, houve lance vencedor?",
        "grupo": "Disposições específicas sobre Arrematação/Adjudicação/Venda Direta do Imóvel na Garantia Hipotecária",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "alerta": "Os autos do leilão e o processo de execução serão distribuídos a Tabelião de Notas da circunscrição do local do imóvel para lavratura de Ata Notarial de Arrematação."
         },
         {
          "quando": "nao",
          "alerta": "Deverão ser averbados os leilões negativos."
         }
        ]
       },
       {
        "id": "O-9-7",
        "texto": "Averbados os leilões negativos, selecione a opção que o Credor manifestou:",
        "grupo": "Disposições específicas sobre Arrematação/Adjudicação/Venda Direta do Imóvel na Garantia Hipotecária",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Adjudicação do imóvel em pagamento da dívida, pelo valor correspondente ao referencial mínimo devidamente atualizado, mediante Requerimento ao Oficial e apresentação do Imposto de Transmissão Intervivos (ITBI)."
         },
         {
          "id": "b",
          "rotulo": "Venda direta a terceiro, no prazo de até 180 (cento e oitenta) dias contados do último leilão, por valor não inferior ao referencial mínimo."
         }
        ],
        "efeitos": [
         {
          "quando": "opcao:a",
          "alerta": "O Oficial registrará os autos dos leilões negativos com a anotação da transmissão dominial em ato registral único, ficando dispensada a Ata Notarial de Especialização e a obrigação de restituição de quaisquer valores"
         },
         {
          "quando": "opcao:b",
          "alerta": "Não será preciso realizar mais nenhum leilão."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "O-10",
    "texto": "Há mais de um crédito garantido pelo mesmo imóvel objeto da execução?",
    "grupo": "Execução de garantias em Concurso de Credores",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "Todos os credores deverão ser intimados para habilitarem seus créditos após a consolidação da propriedade fiduciária ou após a averbação do início da execução da garantia hipotecária.",
      "filhos": [
       {
        "id": "O-10-1",
        "texto": "Os credores das dívidas vigentes foram intimados?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "alerta": "Proceder às intimações!"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "O-11",
    "texto": "Algum credor apresentou Requerimento de habilitação no prazo de 15 (quinze) dias, contados da data da intimação, contendo todos os requisitos?",
    "grupo": "Execução de garantias em Concurso de Credores",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "O-11-1",
        "texto": "O Oficial elaborou o Quadro de Credores, dele lavrou Certidão e expediu intimações para o garantidor e todos os credores?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "alerta": "Será responsabilidade do Credor Exequente a distribuição dos valores aos credores constantes do Quadro e a entrega ao devedor da quantia remanescente após o pagamento de todos os credores."
         },
         {
          "quando": "nao",
          "alerta": "Providenciar o Quadro de Credores, a Certidão e as intimações."
         }
        ]
       }
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "P",
  "titulo": "Processo Extrajudicial de Adjudicação Compulsória",
  "itens": [
   {
    "id": "P-1",
    "texto": "O procedimento teve início no Judiciário e as partes pediram desistência ou suspensão por no mínimo 90 (noventa) dias?",
    "tipo": "sim_nao"
   },
   {
    "id": "P-2",
    "texto": "Selecione os requisitos presentes no Requerimento (Artigo 440-L, do CNN/CNJ):",
    "grupo": "Disposições específicas sobre o Requerimento",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Identificação (mínimo de CPF ou CNPJ) e endereço do Requerente e do Requerido",
      "obrigatorio": true
     },
     {
      "id": "b",
      "rotulo": "Descrição do imóvel, sendo suficiente a menção ao número da matrícula ou transcrição",
      "obrigatorio": true
     },
     {
      "id": "c",
      "rotulo": "Quando houver cessão, o histórico de atos e negócios jurídicos que levaram à cessão ou à sucessão de titularidades, com menção circunstanciada dos instrumentos, valores, natureza das estipulações, existência ou não de direito de arrependimento e indicação específica de quem haverá de constar como requerido"
     },
     {
      "id": "d",
      "rotulo": "Declaração do requerente de que não há processo judicial pendente que possa impedir o registro da adjudicação compulsória, ou prova de que tenha sido extinto ou suspenso por mais de 90 (noventa) dias úteis",
      "obrigatorio": true
     },
     {
      "id": "e",
      "rotulo": "Pedido de que o requerido seja notificado a se manifestar em 15 (quinze) dias úteis",
      "obrigatorio": true
     },
     {
      "id": "f",
      "rotulo": "Pedido de deferimento da adjudicação compulsória e de lavratura do registro necessário para a transferência da propriedade",
      "obrigatorio": true
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Verifica-se a falta do(s) seguinte(s) requisito(s) obrigatório(s) no Requerimento de Adjudicação Compulsória: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "P-3",
    "texto": "Selecione os requisitos presentes na Ata Notarial (art. 440-G, do CNN/CNJ):",
    "grupo": "Ata Notarial",
    "tipo": "multipla",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "Referência à matrícula ou à transcrição e à descrição do imóvel com seus ônus e gravames",
      "obrigatorio": true
     },
     {
      "id": "b",
      "rotulo": "Identificação dos atos e negócios jurídicos que dão fundamento à adjudicação compulsória, incluído o histórico de todas as cessões e sucessões, bem como a relação de todos os que figurem nos respectivos instrumentos contratuais",
      "obrigatorio": true
     },
     {
      "id": "c",
      "rotulo": "Provas do adimplemento integral do preço ou do cumprimento da contraprestação à transferência do imóvel adjudicando",
      "obrigatorio": true
     },
     {
      "id": "d",
      "rotulo": "Identificação das providências que deveriam ter sido adotadas pelo requerido para a transmissão de propriedade e a verificação de seu inadimplemento",
      "obrigatorio": true
     },
     {
      "id": "e",
      "rotulo": "Valor venal atribuído ao imóvel adjudicando, na data do Requerimento inicial",
      "obrigatorio": true
     }
    ],
    "efeitos": [
     {
      "quando": "faltando",
      "exigencia": "Verifica-se a falta do(s) seguinte(s) requisito(s) obrigatório(s) na Ata Notarial: (Instrução ao sistema: “O sistema deverá mencionar automaticamente as opções não selecionadas”)."
     }
    ]
   },
   {
    "id": "P-4",
    "texto": "Consta da Ata Notarial que o requerente foi cientificado de que a ata notarial não tem valor de título de propriedade e que se presta à instrução de pedido de adjudicação compulsória perante o cartório de registro de imóveis, e que poderá ser aproveitada em processo judicial?",
    "grupo": "Ata Notarial",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não constou cientificação do requerente sobre o fato de que a Ata Notarial não tem valor de título de propriedade, servindo apenas como prova para o processo de adjudicação compulsória."
     }
    ]
   },
   {
    "id": "P-5",
    "texto": "Selecione a opção cabível ao caso analisado:",
    "grupo": "Notificações a serem realizadas",
    "tipo": "opcoes",
    "opcoes": [
     {
      "id": "a",
      "rotulo": "O requerido a ser notificado é Pessoa Física."
     },
     {
      "id": "b",
      "rotulo": "O requerido a ser notificado é Pessoa Jurídica."
     }
    ],
    "efeitos": [
     {
      "quando": "opcao:a",
      "filhos": [
       {
        "id": "P-5-1",
        "texto": "O requerido é falecido?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "P-5-1-1",
            "texto": "A pessoa reside em condomínio, loteamento fechado ou local de acesso controlado?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "sim",
              "alerta": "Será eficaz a entrega da notificação a pessoa com poderes de gerência geral ou de administração ou, ainda, a funcionário responsável pelo recebimento de correspondências, não havendo necessidade de procuração"
             },
             {
              "quando": "nao",
              "alerta": "A notificação deverá ser providenciada conforme solicitado pelo Requerente."
             }
            ]
           }
          ]
         },
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "P-5-1-2",
            "texto": "Há inventário judicial ou extrajudicial em andamento?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "sim",
              "filhos": [
               {
                "id": "P-5-1-2-1",
                "texto": "A notificação foi enviada apenas ao Inventariante?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "alerta": "Notificar o Inventariante."
                 }
                ]
               }
              ]
             },
             {
              "quando": "nao",
              "filhos": [
               {
                "id": "P-5-1-2-2",
                "texto": "Há comprovação sobre a identidade e a qualidade dos herdeiros e sobre a ocorrência do óbito?",
                "tipo": "sim_nao",
                "efeitos": [
                 {
                  "quando": "nao",
                  "alerta": "Deverão os requeridos serem notificados por Edital."
                 }
                ]
               }
              ]
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     },
     {
      "quando": "opcao:b",
      "filhos": [
       {
        "id": "P-5-2",
        "texto": "A pessoa jurídica está extinta?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "alerta": "Será eficaz a entrega da notificação a pessoa com poderes de gerência geral ou de administração ou, ainda, a funcionário responsável pelo recebimento de correspondências, não havendo necessidade de procuração"
         },
         {
          "quando": "sim",
          "alerta": "A notificação deverá será enviada ao liquidante ou ao último administrador conhecido. Se não forem conhecidos, será notificada por Edital"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "P-6",
    "texto": "Foi expedida a notificação aos requeridos?",
    "grupo": "Notificações a serem realizadas",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Providenciar a notificação dos requeridos, na forma como solicitada no Requerimento."
     }
    ]
   },
   {
    "id": "P-7",
    "texto": "Além da notificação, foi enviada mensagem eletrônica de notificação para o endereço eletrônico do requerido, se constante do Requerimento?",
    "grupo": "Notificações a serem realizadas",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Providenciar envio de mensagem eletrônica de notificação aos requeridos."
     }
    ]
   },
   {
    "id": "P-8",
    "texto": "Algum notificado deixou de ser intimado por não ter sido encontrado?",
    "grupo": "Notificações a serem realizadas",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "P-8-1",
        "texto": "Foi expedido o edital em duas publicações, com intervalo de 15 (quinze) dias úteis entre elas?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "alerta": "Providenciar a publicação dos Editais de notificação dos requeridos que não foram encontrados."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "P-9",
    "texto": "Algum notificado, depois de intimado, apresentou anuência expressa?",
    "grupo": "Anuências e Impugnações",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "P-9-1",
        "texto": "A anuência foi acompanhada de providências concretas para a outorga do título definitivo de propriedade?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "alerta": "O processo deverá ser suspenso até a comprovação da outorga da Escritura Pública definitiva em Cartório de Notas."
         },
         {
          "quando": "nao",
          "alerta": "O processo segue."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "P-10",
    "texto": "Algum requerido, depois de notificado, apresentou impugnação expressa e tempestiva?",
    "grupo": "Anuências e Impugnações",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "P-10-1",
        "texto": "Depois dos trâmites de praxe (intimações do requerente, eventual recurso do requerido, etc.), houve conciliação ou decisão do juiz afastando a impugnação?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "alerta": "O processo continua."
         },
         {
          "quando": "nao",
          "alerta": "O processo deverá ser extinto por Sentença."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "P-11",
    "texto": "O pedido foi deferido?",
    "grupo": "Deferimento do pedido e registro da Adjudicação",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "Deverá ser proferida Sentença de deferimento e em seguida registrada a adjudicação compulsória na Matrícula."
     },
     {
      "quando": "nao",
      "alerta": "O processo deverá ser extinto por Sentença."
     }
    ]
   }
  ]
 },
 {
  "id": "Q",
  "titulo": "Tributação do negócio jurídico objeto do título",
  "itens": [
   {
    "id": "Q-1",
    "texto": "Consta do título o valor declarado / atribuído ao negócio (Ex.: preço da venda, valor da adjudicação ou arrematação, valor da dívida, valor da execução, etc.)?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "Q-1-1",
        "texto": "Trata-se de desnecessidade, dispensa ou não-cabimento?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "O título não mencionou o valor atribuído ao negócio jurídico pelas partes."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "Q-2",
    "texto": "Consta do título o valor de avaliação judicial ou fiscal do imóvel?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "Q-2-1",
        "texto": "Trata-se de desnecessidade, dispensa ou não-cabimento?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Não constou do título o valor de avaliação do imóvel."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "Q-3",
    "texto": "Foi apresentada Declaração de Tributo ou Certidão de Valor Venal sobre o imóvel pelo órgão tributário competente?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "exigencia": "Não foi apresentada Certidão do Valor Venal / Declaração do ITR acompanhada do respectivo recibo de entrega à Receita Federal"
     }
    ]
   },
   {
    "id": "Q-4",
    "texto": "Houve transmissão onerosa sobre a qual incida ITBI?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "Q-4-1",
        "texto": "Foi devidamente recolhido conforme a base de cálculo prevista na lei municipal?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "Q-4-1-1",
            "texto": "Trata-se de caso de não-incidência (isenção ou imunidade)?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Não foi apresentada comprovação do recolhimento do ITBI incidente sobre o negócio jurídico, cuja base de cálculo deve ser XXXXXXX"
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "Q-5",
    "texto": "Houve transmissão gratuita sobre a qual incida ITCMD?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "Q-5-1",
        "texto": "Foi devidamente recolhido conforme a base de cálculo prevista na lei estadual?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "filhos": [
           {
            "id": "Q-5-1-1",
            "texto": "Trata-se de caso de não-incidência (isenção ou imunidade)?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "exigencia": "Não foi apresentada comprovação do recolhimento do ITCMD incidente sobre o negócio jurídico, cuja base de cáculo deve ser XXXXX"
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "R",
  "titulo": "Cobrança dos Emolumentos e Finalização",
  "itens": [
   {
    "id": "R-1",
    "texto": "Há alguma hipótese de gratuidade para os emolumentos?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "R-1-1",
        "texto": "Selecione as opções abaixo:",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Gratuidade Judiciária"
         },
         {
          "id": "b",
          "rotulo": "Isenção total (União, Estado de São Paulo, suas autarquias e fundações públicas)"
         },
         {
          "id": "c",
          "rotulo": "Isenção parcial (demais Estados da Federação, Distrito Federal e o Município de Santa Rita do Passa Quatro)"
         }
        ],
        "efeitos": [
         {
          "quando": "opcao:a",
          "filhos": [
           {
            "id": "R-1-1-1",
            "texto": "Consta expressamente das peças dos autos o nome do beneficiário e a determinação do juízo?",
            "grupo": "Gratuidade Judiciária",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "nao",
              "alerta": "COBRANÇA INTEGRAL!"
             },
             {
              "quando": "sim",
              "alerta": "EMOLUMENTOS GRATUITOS PARA QUEM FOI EXPRESSAMENTE BENEFICIADO, mas deve ser efetuada a busca nacional no ONR para verificar se eventual beneficiário tenha imóveis ou direitos reais registrados nos Cartórios do país. Se houver, estudar a melhor estratégia para reverter a gratuidade."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "R-2",
    "texto": "Trata-se de Incorporação Imobiliária da Lei 4.591/74 ou Instituição de Condomínio?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "R-2-1",
        "texto": "Custo global do empreendimento",
        "grupo": "Anote os seguintes valores:",
        "tipo": "numero",
        "ajuda": "Campo numérico de moeda, com separadores de milhar e duas casas decimais"
       },
       {
        "id": "R-2-2",
        "texto": "Valor venal do terreno",
        "grupo": "Anote os seguintes valores:",
        "tipo": "numero",
        "ajuda": "Campo numérico de moeda, com separadores de milhar e duas casas decimais"
       },
       {
        "id": "R-2-3",
        "texto": "Valor de aquisição do imóvel",
        "grupo": "Anote os seguintes valores:",
        "tipo": "numero",
        "ajuda": "Campo numérico de moeda, com separadores de milhar e duas casas decimais"
       },
       {
        "id": "R-2-4",
        "texto": "Valor da base de cálculo (a + (b ou c)",
        "grupo": "Anote os seguintes valores:",
        "tipo": "numero",
        "ajuda": "Campo numérico de moeda, com separadores de milhar e duas casas decimais"
       }
      ]
     }
    ]
   },
   {
    "id": "R-3",
    "texto": "Trata-se de Registro especial de Loteamento ou Desmembramento da Lei 6.766/79?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "R-3-1",
        "texto": "Quantidade de Lotes",
        "grupo": "Anote as seguintes informações:",
        "tipo": "numero",
        "ajuda": "Campo numérico, com separadores de milhar e sem casas decimais"
       },
       {
        "id": "R-3-2",
        "texto": "Quantidade de Áreas Institucionais",
        "grupo": "Anote as seguintes informações:",
        "tipo": "numero",
        "ajuda": "Campo numérico, com separadores de milhar e sem casas decimais"
       },
       {
        "id": "R-3-3",
        "texto": "Quantidade de Áreas Verdes",
        "grupo": "Anote as seguintes informações:",
        "tipo": "numero",
        "ajuda": "Campo numérico, com separadores de milhar e sem casas decimais"
       },
       {
        "id": "R-3-4",
        "texto": "Quantidade de Sistemas de Lazer",
        "grupo": "Anote as seguintes informações:",
        "tipo": "numero",
        "ajuda": "Campo numérico, com separadores de milhar e sem casas decimais"
       }
      ]
     }
    ]
   },
   {
    "id": "R-4",
    "texto": "O Requerimento autoriza abertura das matrículas individuais para cada unidade?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "R-4-1",
        "texto": "Quantas unidades?",
        "tipo": "numero",
        "ajuda": "Campo numérico com separador de milhar, sem casas decimais"
       }
      ]
     }
    ]
   },
   {
    "id": "R-5",
    "texto": "O Requerimento autoriza emissão das Certidões das matrículas das unidades?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "R-5-1",
        "texto": "Quantas certidões?",
        "tipo": "numero",
        "ajuda": "Campo numérico com separador de milhar, sem casas decimais"
       }
      ]
     }
    ]
   },
   {
    "id": "R-6",
    "texto": "A aquisição foi realizada por meio de consórcio?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "alerta": "Somente UM REGISTRO deve ser cobrado, embora praticados os atos de aquisição e garantia. Neste caso, ainda, deve ser cobrado o registro que tiver maior valor (conforme decisão da CGJ/SP)"
     }
    ]
   },
   {
    "id": "R-7",
    "texto": "A aquisição foi realizada no âmbito do Programa Minha Casa Minha Vida?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "R-7-1",
        "texto": "O imóvel é NOVO (não ainda habitado) E é o PRIMEIRO adquirido pelo comprador?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "R-7-1-1",
            "texto": "Esta circunstância foi CONFIRMADA por busca nacional no ONR?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "sim",
              "alerta": "Emolumentos com desconto de 50%."
             },
             {
              "quando": "nao",
              "alerta": "Emolumentos integrais."
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "R-8",
    "texto": "A aquisição foi realizada no âmbito do Sistema Financeiro da Habitação (SFH)?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "R-8-1",
        "texto": "Foi apresentada a declaração de que esta aquisição do imóvel pelo comprador é a sua PRIMEIRA FINANCIADA com recursos do SFH?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "R-8-1-1",
            "texto": "Esta circunstância foi CONFIRMADA por busca nacional no ONR?",
            "tipo": "sim_nao",
            "efeitos": [
             {
              "quando": "sim",
              "alerta": "Emolumentos com desconto de 50%, proporcional ao valor financiado (regra de 3)."
             },
             {
              "quando": "nao",
              "alerta": "Emolumentos integrais!"
             }
            ]
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "R-9",
    "texto": "A aquisição foi realizada no âmbito de algum programa de interesse social (item 14 da Tabela)?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "R-9-1",
        "texto": "Selecione abaixo:",
        "tipo": "opcoes",
        "opcoes": [
         {
          "id": "a",
          "rotulo": "Item 14.1 – Quando o título principal for um projeto de loteamento popular (ou regularização fundiária) e o contrato de compra e venda vier junto com ele, e o adquirente seja beneficiário de regularização fundiária de interesse social, promovida pelo Poder Público"
         },
         {
          "id": "b",
          "rotulo": "Item 14.2 – Registro de alienação e correspondentes garantias reais, em EMPREENDIMENTO DE INTERESSE SOCIAL promovidos pela COHAB, CDHU ou outra empresa pública/sociedade de economia mista, INDEPENDENTEMENTE DO NÚMERO DE ATOS PRATICADOS (ou seja, aquisição + garantia = ato único e valor fixo)"
         },
         {
          "id": "c",
          "rotulo": "Item 14.3 – PRIMEIRA ALIENAÇÃO do imóvel e correspondentes garantias reais, realizada em EMPREENDIMENTO HABITACIONAL DE INTERESSE SOCIAL, executado em parceria público-privada OU por associações e cooperativas habitacionais, e quando o imóvel for LOCALIZADO EM ZEIS (ZONA ESPECIAL DE INTERESSE SOCIAL), ASSIM DEFINIDA EM LEI DO MUNICÍPIO, e ainda quando o VALOR DO IMOVEL não ultrapassar 4.705 UFESPs"
         },
         {
          "id": "d",
          "rotulo": "Item 14.4 – PRIMEIRA ALIENAÇÃO em EMPREENDIMENTO HABITACIONAL, onde a AQUISIÇÃO do comprador foi financiada com RECURSOS DO FGTS (fundo gestor), e o VALOR DO IMÓVEL NÃO ULTRAPASSE 6.000 UFESPs"
         },
         {
          "id": "e",
          "rotulo": "Item 14.5 – PRIMEIRA ALIENAÇÃO financiada com RECURSOS DO FGTS quando não cabível o item 14.4 – ESTE ITEM É O MAIS COMUM, E O CÓDIGO DO SISTEMA É FGTS"
         },
         {
          "id": "f",
          "rotulo": "Item 14.6 – PRIMEIRA ALIENAÇÃO do imóvel e correspondentes garantias reais, realizada em EMPREENDIMENTO HABITACIONAL DE INTERESSE SOCIAL e quando o imóvel for LOCALIZADO EM ZEIS (ZONA ESPECIAL DE INTERESSE SOCIAL), ASSIM DEFINIDA EM LEI DO MUNICÍPIO, e ainda quando o VALOR DO IMOVEL não ultrapassar 4.705 UFESPs"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "R-10",
    "texto": "O depósito prévio foi realizado corretamente?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "filhos": [
       {
        "id": "R-10-1",
        "texto": "Foi feita a complementação de depósito prévio?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "nao",
          "exigencia": "Efetuar o complemento do depósito."
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "id": "R-11",
    "texto": "O conferente declara sob responsabilidade que leu integral e atentamente o título ora qualificado?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Declare expressamente que você leu integral atentamente o título."
     }
    ]
   },
   {
    "id": "R-12",
    "texto": "O título foi considerado APTO para registro?",
    "tipo": "sim_nao",
    "efeitos": [
     {
      "quando": "nao",
      "alerta": "Instrução ao sistema: O sistema deverá elaborar automaticamente o esboço da Nota de Exigência, enumerando em ordem cada uma das exigências apontadas nas respostas deste Checkist"
     },
     {
      "quando": "sim",
      "filhos": [
       {
        "id": "R-12-1",
        "texto": "Deseja elaborar agora o esboço dos atos a serem praticados?",
        "tipo": "sim_nao",
        "efeitos": [
         {
          "quando": "sim",
          "filhos": [
           {
            "id": "R-12-1-1",
            "texto": "Esboço dos atos a serem praticados",
            "tipo": "texto",
            "ajuda": "Campo de texto livre, sem limite de quantidade de caracteres"
           }
          ]
         }
        ]
       }
      ]
     }
    ]
   }
  ]
 }
];
