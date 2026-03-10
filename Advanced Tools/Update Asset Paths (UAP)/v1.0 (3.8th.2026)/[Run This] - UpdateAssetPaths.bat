@echo off
setlocal EnableExtensions

cd /d "%~dp0"

set "HOLD_OPEN=1"
if /I "%~1"=="--run" set "HOLD_OPEN=0"

echo.
echo ================================================
echo   Update RPG Maker MV/MZ Asset Paths in "data\*.json" files
echo ================================================
echo.
echo Select engine to process:
echo   1^) RPG Maker MV
echo   2^) RPG Maker MZ
choice /c 12 /n /m "Enter choice [1/2]: "
if errorlevel 2 (
	set "ENGINE=MZ"
) else (
	set "ENGINE=MV"
)

echo.
echo Running for engine: %ENGINE%
echo.
if not exist "%~dp0UpdateAssetPaths.ps1" (
	echo ERROR: Missing helper script "UpdateAssetPaths.ps1".
	echo Please keep UpdateAssetPaths.ps1 in the same folder as this .bat file.
	set "EXIT_CODE=1"
	goto :afterRun
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0UpdateAssetPaths.ps1" -Engine "%ENGINE%" -RootDir "%~dp0."

set "EXIT_CODE=%errorlevel%"
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
