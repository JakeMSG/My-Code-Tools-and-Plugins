@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found in PATH.
  echo Install Node.js 18+ then run this file again.
  pause
  exit /b 1
)

if /I "%~1"=="web" (
  echo Starting web mode on http://localhost:47842 ...
  node "%~dp0src\server.js" --port 47842
  endlocal
  exit /b %errorlevel%
)

if not exist "%~dp0node_modules\electron" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    endlocal
    exit /b 1
  )
)

echo Starting JakeMSG_PluginAndParameterManager desktop app...
call npm run start

endlocal
