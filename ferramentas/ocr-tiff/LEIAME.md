# OCR em massa de TIFF → PDF pesquisável (Windows nativo)

Converte pastas inteiras de imagens TIFF (inclusive TIFF multipágina) em PDFs
com camada de texto pesquisável, **100% local, sem consumir créditos de IA**.
Depois de OCRizados, os PDFs podem ser enviados ao CheckIndex para extração dos
dados estruturados — também sem custo de IA, porque o texto já existe no arquivo.

## 1. Instalação (só uma vez, na máquina dedicada)

Abra o **PowerShell como Administrador** e rode:

```powershell
winget install --id Python.Python.3.12 -e
winget install --id UB-Mannheim.TesseractOCR -e
winget install --id ArtifexSoftware.GhostScript -e
```

Instale o OCRmyPDF e o otimizador de imagens:

```powershell
pip install --upgrade ocrmypdf pikepdf
```

Adicione o Tesseract ao PATH (se o comando `tesseract -v` não responder):

```powershell
setx /M PATH "$env:PATH;C:\Program Files\Tesseract-OCR"
```

Instale o idioma português: no instalador do Tesseract marque
**Additional language data → Portuguese**, ou copie `por.traineddata` para
`C:\Program Files\Tesseract-OCR\tessdata`.

Feche e reabra o PowerShell e confira:

```powershell
ocrmypdf --version
tesseract --list-langs
```

## 2. Como rodar

**Opção simples (duplo clique):** abra `Rodar-OCR.bat` no Bloco de Notas, ajuste
as duas linhas `set ORIGEM=` e `set DESTINO=` com as suas pastas, salve e dê
duplo clique no arquivo.

**Opção linha de comando:**

```powershell
powershell -ExecutionPolicy Bypass -File .\ocr-tiff.ps1 -Origem "D:\MATRICULAS_TIFF" -Destino "D:\MATRICULAS_PDF"
```

Parâmetros opcionais:

| Parâmetro   | Para que serve                                              |
|-------------|-------------------------------------------------------------|
| `-Paralelo` | Quantos arquivos ao mesmo tempo (padrão: núcleos − 1)        |
| `-Idioma`   | Idioma do OCR (padrão `por`; use `por+eng` se houver inglês) |
| `-Refazer`  | Reprocessa também os que já têm PDF gerado                   |

Exemplo em máquina de 8 núcleos:

```powershell
powershell -ExecutionPolicy Bypass -File .\ocr-tiff.ps1 -Origem "D:\MATRICULAS_TIFF" -Destino "D:\MATRICULAS_PDF" -Paralelo 7
```

## 3. O que o script faz

- Percorre a pasta de origem **e todas as subpastas**, preservando a estrutura no destino.
- Endireita a página (`--deskew`), corrige rotação (`--rotate-pages`) e limpa ruído (`--clean`).
- **Pula arquivos já convertidos** — pode interromper (Ctrl+C) e retomar depois sem perder trabalho.
- Grava logs em `<DESTINO>\_logs\`: `processados-*.log` e `erros-*.log`.

## 4. Desempenho esperado

Cerca de 2 a 6 segundos por página por núcleo. Numa máquina de 8 núcleos, 22 mil
matrículas (média de 3 páginas) levam tipicamente de 6 a 12 horas — ideal deixar
rodando à noite. Requer PowerShell 7+ para o processamento paralelo
(`winget install --id Microsoft.PowerShell -e`); no PowerShell 5 use `-Paralelo 1`.

## 5. Depois do OCR

Suba os PDFs no módulo **CheckIndex** do e-Qualifica. Como já têm camada de
texto, a extração dos dados (matrícula, proprietários, atos, ônus, áreas…) é
feita por leitura direta do texto, **sem chamada a modelo de IA e sem custo por página**.
