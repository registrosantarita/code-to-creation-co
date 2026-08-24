# Numeração das perguntas por subseção

Hoje o número exibido em cada pergunta é o próprio identificador interno do nó (ex.: `A-3-1`, onde o `3` é a ordem da pergunta na seção, não a subseção). Você renumerou o Word por subseção, então a numeração passará a ser calculada como **Seção – Subseção – Pergunta**.

## Formato

- `A-1-1` = Seção A, 1ª subseção, 1ª pergunta dessa subseção
- `A-2-4` = Seção A, 2ª subseção, 4ª pergunta
- Perguntas condicionais (filhas) recebem sufixo com ponto: `A-2-4.1`, `A-2-4.2`, e um segundo nível `A-2-4.1.1`
- Perguntas sem subseção (seções que não têm grupos) continuam como `Seção-Pergunta`: `Q-1`, `R-3`
- As alternativas seguem como já estão: `a)`, `b)`, `c)`…

A ordem das subseções é a ordem em que aparecem na seção (a mesma da barra lateral de seleção), então espelha a sequência do Word.

## Comportamento

- A numeração é fixa por posição na estrutura: não muda quando subseções são desmarcadas nem quando perguntas condicionais aparecem/desaparecem.
- Os números aparecem na caixa da pergunta e continuam sendo usados nas listas de alertas e exigências e na Nota de Exigência.

## Detalhes técnicos

- `numerosDaSecao` em `src/lib/question-check-engine.ts` passa a percorrer a seção **não filtrada** (para estabilidade), agrupando os nós de topo por `grupo`, numerando subseções na ordem de primeira aparição e perguntas dentro de cada subseção; nós `info` não recebem número, mas os filhos numerados herdam o prefixo do pai.
- `src/routes/_authenticated/questioncheck.$id.tsx` continua chamando `numerosDaSecao`, mas com a seção base (sem filtro de subseções), para que o número não mude conforme a seleção.
