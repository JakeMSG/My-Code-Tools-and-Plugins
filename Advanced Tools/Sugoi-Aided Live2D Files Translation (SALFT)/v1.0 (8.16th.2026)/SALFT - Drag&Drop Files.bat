@echo off
setlocal EnableExtensions

cd /d "%~dp0"

set "HOLD_OPEN=1"
if /I "%~1"=="--run" (
	set "HOLD_OPEN=0"
	shift /1
)

echo.
echo ================================================
echo   SALFT Live2D Files Translator
echo ================================================
echo.

if "%~1"=="" (
	echo ERROR: No files or folders were provided.
	echo Drag files/folders onto this batch file, or use Send To.
	echo Targeted files: .json, .cmo3, .can3
	set "EXIT_CODE=1"
	goto :afterRun
)

if not exist "%~dp0SALFT.ps1" (
	echo ERROR: Missing helper script "SALFT.ps1".
	echo Please keep SALFT.ps1 in the same folder as this .bat file.
	set "EXIT_CODE=1"
	goto :afterRun
)

set "INPUT_LIST_FILE=%TEMP%\SALFT-InputPaths-%RANDOM%-%RANDOM%.txt"
break > "%INPUT_LIST_FILE%"

:collectArgs
if "%~1"=="" goto :argsReady
>>"%INPUT_LIST_FILE%" echo;"%~f1"
shift /1
goto :collectArgs

:argsReady
set "POWERSHELL_EXE=powershell"
where pwsh >nul 2>nul
if not errorlevel 1 set "POWERSHELL_EXE=pwsh"

"%POWERSHELL_EXE%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0SALFT.ps1" -Mode DragDrop -RootDir "%~dp0." -InputListFile "%INPUT_LIST_FILE%"
set "EXIT_CODE=%errorlevel%"

if exist "%INPUT_LIST_FILE%" del /f "%INPUT_LIST_FILE%" >nul 2>nul

:afterRun
echo.
if not "%EXIT_CODE%"=="0" (
	echo Script failed with exit code %EXIT_CODE%.
) else (
	echo Script completed successfully.
)

echo.
if "%HOLD_OPEN%"=="1" (
	echo Output review mode: this console will stay open.
	echo Type EXIT when you are done reviewing.
	cmd /k
)

exit /b %EXIT_CODE%
