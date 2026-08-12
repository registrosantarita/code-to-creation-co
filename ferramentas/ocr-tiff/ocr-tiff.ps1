<#
  e-Qualifica / CheckIndex
  OCR em massa de TIFF -> PDF pesquisavel, 100% local (OCRmyPDF + Tesseract).
  Nao consome creditos de IA.

  Uso:
    powershell -ExecutionPolicy Bypass -File .\ocr-tiff.ps1 -Origem "D:\TIFFS" -Destino "D:\PDFS"
    powershell -ExecutionPolicy Bypass -File .\ocr-tiff.ps1 -Origem "D:\TIFFS" -Destino "D:\PDFS" -Paralelo 8
#>

param(
  [Parameter(Mandatory = $true)][string]$Origem,
  [Parameter(Mandatory = $true)][string]$Destino,
  [int]$Paralelo = [Math]::Max(1, [Environment]::ProcessorCount - 1),
  [string]$Idioma = "por",
  [switch]$Refazer
)

$ErrorActionPreference = "Stop"

function Test-Comando($nome) {
  return [bool](Get-Command $nome -ErrorAction SilentlyContinue)
}

foreach ($dep in @("ocrmypdf", "tesseract")) {
  if (-not (Test-Comando $dep)) {
    Write-Host "ERRO: '$dep' nao encontrado no PATH." -ForegroundColor Red
    Write-Host "Veja o arquivo LEIAME.md para a instalacao." -ForegroundColor Yellow
    exit 1
  }
}

$Origem  = (Resolve-Path $Origem).Path
if (-not (Test-Path $Destino)) { New-Item -ItemType Directory -Path $Destino -Force | Out-Null }
$Destino = (Resolve-Path $Destino).Path

$logDir = Join-Path $Destino "_logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
$carimbo = Get-Date -Format "yyyyMMdd-HHmmss"
$logErros = Join-Path $logDir "erros-$carimbo.log"
$logOk    = Join-Path $logDir "processados-$carimbo.log"

$arquivos = Get-ChildItem -Path $Origem -Recurse -File -Include *.tif, *.tiff
if ($arquivos.Count -eq 0) {
  Write-Host "Nenhum TIFF encontrado em $Origem" -ForegroundColor Yellow
  exit 0
}

Write-Host "TIFFs encontrados: $($arquivos.Count)" -ForegroundColor Cyan
Write-Host "Saida: $Destino   |   Processos paralelos: $Paralelo" -ForegroundColor Cyan

$inicio = Get-Date

$arquivos | ForEach-Object -ThrottleLimit $Paralelo -Parallel {
  $origemRaiz = $using:Origem
  $destinoRaiz = $using:Destino
  $idioma = $using:Idioma
  $refazer = $using:Refazer
  $logErros = $using:logErros
  $logOk = $using:logOk

  $rel = $_.FullName.Substring($origemRaiz.Length).TrimStart('\')
  $saida = Join-Path $destinoRaiz ([IO.Path]::ChangeExtension($rel, ".pdf"))
  $pasta = Split-Path $saida -Parent
  if (-not (Test-Path $pasta)) { New-Item -ItemType Directory -Path $pasta -Force | Out-Null }

  if ((Test-Path $saida) -and -not $refazer) { return }

  $args = @(
    "--language", $idioma,
    "--image-dpi", "300",
    "--rotate-pages",
    "--deskew",
    "--clean",
    "--optimize", "1",
    "--output-type", "pdf",
    "--quiet",
    $_.FullName, $saida
  )

  try {
    $p = Start-Process -FilePath "ocrmypdf" -ArgumentList $args -NoNewWindow -Wait -PassThru `
         -RedirectStandardError (Join-Path $env:TEMP ("ocr-" + [guid]::NewGuid() + ".err"))
    if ($p.ExitCode -eq 0) {
      Add-Content -Path $logOk -Value $rel
      Write-Host "OK   $rel"
    } else {
      Add-Content -Path $logErros -Value "$rel  (exit $($p.ExitCode))"
      Write-Host "FALHA $rel" -ForegroundColor Red
    }
  } catch {
    Add-Content -Path $logErros -Value "$rel  ($($_.Exception.Message))"
    Write-Host "FALHA $rel" -ForegroundColor Red
  }
}

$fim = Get-Date
$okCount = if (Test-Path $logOk) { (Get-Content $logOk).Count } else { 0 }
$errCount = if (Test-Path $logErros) { (Get-Content $logErros).Count } else { 0 }

Write-Host ""
Write-Host "Concluido em $([math]::Round(($fim - $inicio).TotalMinutes, 1)) min" -ForegroundColor Green
Write-Host "Convertidos nesta execucao: $okCount   |   Falhas: $errCount"
if ($errCount -gt 0) { Write-Host "Log de erros: $logErros" -ForegroundColor Yellow }
