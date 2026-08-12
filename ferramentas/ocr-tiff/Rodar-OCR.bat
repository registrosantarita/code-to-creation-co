@echo off
REM e-Qualifica - OCR em massa de TIFF para PDF pesquisavel (sem creditos de IA)
REM Edite as duas linhas abaixo com as suas pastas e de duplo clique neste arquivo.

set ORIGEM=D:\MATRICULAS_TIFF
set DESTINO=D:\MATRICULAS_PDF

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0ocr-tiff.ps1" -Origem "%ORIGEM%" -Destino "%DESTINO%"
pause
