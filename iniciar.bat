@echo off
title DEX Juridico - Servidor Local
echo ======================================================
echo    Iniciando DEX - Sistema de Gestao Juridica...
echo    Acesse no navegador: http://localhost:3000
echo ======================================================

if not exist "%~dp0node_modules\" (
    echo.
    echo Dependencias nao encontradas. Instalando agora via npm...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias do projeto.
        pause
        exit /b %errorlevel%
    )
)

call npm run dev
pause

