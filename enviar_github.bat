@echo off
title Enviar DEX Juridico para o GitHub
echo ======================================================
echo    Enviando projeto DEX para o GitHub...
echo    Repositorio: https://github.com/ottonluis15/dexjuridico.git
echo ======================================================
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ======================================================
    echo   [SUCESSO] Projeto enviado para o GitHub com exito!
    echo ======================================================
) else (
    echo ======================================================
    echo   [AVISO] Verifique suas credenciais do GitHub acima.
    echo ======================================================
)
echo.
pause
