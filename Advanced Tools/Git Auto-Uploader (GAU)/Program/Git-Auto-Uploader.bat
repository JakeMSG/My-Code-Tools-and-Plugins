@echo off
setlocal DisableDelayedExpansion
title Git Auto-Uploader

rem Folder names like "(GAU)" are cmd/PowerShell grouping syntax.
rem Do not use powershell -File with this path, and do not expand the
rem path unquoted inside parentheses blocks.

set "GAU_HOME=%~dp0"
if "%GAU_HOME:~-1%"=="\" set "GAU_HOME=%GAU_HOME:~0,-1%"

pushd "%GAU_HOME%"
if errorlevel 1 goto FAIL_DIR

where powershell >nul 2>&1
if errorlevel 1 goto FAIL_PS

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath $env:GAU_HOME; & (Join-Path $env:GAU_HOME 'Git-Auto-Uploader.ps1')"
set "ERR=%ERRORLEVEL%"
if not "%ERR%"=="0" goto FAIL_RUN
exit /b 0

:FAIL_DIR
echo Could not open the Git Auto-Uploader folder.
pause
exit /b 1

:FAIL_PS
echo PowerShell was not found on PATH.
pause
exit /b 1

:FAIL_RUN
echo.
echo Git Auto-Uploader exited with code %ERR%.
pause
exit /b %ERR%
