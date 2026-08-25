@echo off
setlocal
cd /d "%~dp0"
title Icon Manipulator for RPG Maker - v1.0

echo Icon Manipulator for RPG Maker - v1.0
echo First launch may download Node.js 18+ and program files.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\ensure-runtime.ps1"
set "APP_EXIT=%ERRORLEVEL%"

if not "%APP_EXIT%"=="0" (
  echo.
  echo Setup or launch failed.
  pause
)

endlocal & exit /b %APP_EXIT%
