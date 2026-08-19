# CheckTítulo com a mesma estrutura do GeoConfronto

Hoje o CheckTítulo tem uma conferência única e automática: todos os documentos do conjunto entram numa só tabela, e não existe classificação, comparações salvas nem relatórios. O GeoConfronto tem análise → documentos classificados → várias comparações salvas → validação humana → relatórios PDF/XLSX → exclusão de comparações (só admin, com trilha de auditoria).

A proposta é levar essa mesma estrutura para o CheckTítulo, reaproveitando o que já existe.

## 1. Classificação do documento carregado

- Ao enviar (arquivo ou texto), o sistema sugere a espécie do documento a partir do próprio texto: matrícula, escritura pública, instrumento particular, requerimento, título judicial, certidão, procuração, outro.
- Após o envio, a espécie e o papel (título / matrícula) ficam editáveis num seletor em cada documento da lista, como no GeoConfronto.
- Etiqueta colorida com a espécie no cartão do documento.

## 2. Comparações por critérios, várias por conferência

- Novo painel "Nova comparação" dentro da conferência, onde o usuário escolhe:
  - documento paradigma e um ou mais documentos comparáveis (comparação múltipla);
  - quais blocos de critérios entram: Partes, Documentos de identificação, Estado civil e regime de bens, Endereço, Cadastros do imóvel, Cadeia registral, Ônus e direitos reais.
- Cada comparação é gravada com seu resultado (linhas conformes, divergentes, inválidas, não comparadas), resumo e data.
- A conferência passa a listar todas as comparações feitas, com badge de situação; a tabela de resultado (lado a lado / empilhado) e as validações passam a ser por comparação.
- Validações e oposições continuam iguais, porém vinculadas à comparação.

## 3. Exclusão

- Botão de excluir em cada comparação, visível apenas para o perfil administrador, com confirmação e registro em trilha de auditoria (mesmo padrão do GeoConfronto).
- Exclusão da conferência inteira já existe na lista e será mantida, passando a apagar também as comparações vinculadas.

## 4. Relatórios

- Painel "Relatórios" no topo e repetido ao final da página, com:
  - geração de PDF do relatório completo da comparação (dados das partes, cadastros, cadeia registral, ônus, achados, validações do Oficial e rodapé de que o sistema não substitui a qualificação jurídica);
  - exportação XLSX dos dados conferidos;
  - seleção múltipla para excluir relatórios/comparações.

## Detalhes técnicos

- Migração: nova tabela `qualification_comparisons` (conjunto, paradigma, comparáveis, critérios, resultado JSON, resumo, classificação, validações, autor, datas) com GRANTs e RLS pelo dono do conjunto ou admin; colunas `doc_species` em `qualification_docs`.
- Server functions novas em `src/lib/qualificacao.functions.ts`: criar/listar/obter/excluir comparação, salvar validações por comparação, atualizar espécie/papel do documento. Exclusão por admin passa por `src/lib/admin.functions.ts` com `audit_logs`.
- Comparação: `src/lib/qualificacao-compare.ts` ganha filtro por blocos de critérios e ordenação paradigma-primeiro.
- Relatórios: novo `src/lib/export-qualificacao.ts` reaproveitando o `shrinkOnOverflow` e o layout do `export-registral.ts`; novo componente `RelatoriosQualificacao.tsx` espelhando `RelatoriosAnalise.tsx`.
- `qualificacao.$id.tsx` é reorganizado em seções: envio → documentos → comparações → resultado da comparação selecionada → validações → relatórios.
