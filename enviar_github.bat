@echo off
title Enviar DEX Juridico para o GitHub
cd /d "%~dp0"

echo ======================================================
echo    Enviando projeto DEX para o GitHub...
echo    Repositorio: https://github.com/ottonluis15/dexjuridico.git
echo ======================================================
echo.

echo 1. Adicionando alteracoes no Git...
git add -A

echo.
echo 2. Criando commit com as modificacoes...
git commit -m "feat: atualizacoes do sistema DEX Juridico" 2>nul
if %errorlevel% equ 0 (
    echo    Commit registrado com sucesso!
) else (
    echo    Sem novos arquivos para commitar, enviando commits pendentes...
)

echo.
echo 3. Enviando para o repositorio remoto (git push)...
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ======================================================
    echo   [SUCESSO] Projeto enviado para o GitHub com exito!
    echo   A Vercel atualizara o site automaticamente em instantes!
    echo ======================================================
) else (
    echo ======================================================
    echo   [AVISO] Ocorreu um erro no envio. Verifique acima.
    echo ======================================================
)
echo.
pause
