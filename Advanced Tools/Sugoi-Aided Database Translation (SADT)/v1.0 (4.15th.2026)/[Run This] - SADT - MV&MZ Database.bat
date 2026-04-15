@echo off
setlocal EnableExtensions

cd /d "%~dp0"

set "HOLD_OPEN=1"
if /I "%~1"=="--run" set "HOLD_OPEN=0"

echo.
echo ================================================
echo   Translate MV/MZ Database in "data\*.json" (optionally, also translate and rename the Assets)
echo ================================================
echo.
echo Select your desired option:
echo   1^) RPG Maker MV database (no Plugins)
echo   2^) RPG Maker MV database (no Plugins) + translate+rename Assets (can cause issues with certain plugin uses)
echo.
echo   3^) RPG Maker MZ database (no Plugins)
echo   4^) RPG Maker MZ database (no Plugins) + translate+rename Assets (can cause issues with certain plugin uses)
echo.
echo.
echo   5^) Restore original Asset names (requires the previously-created "AssetNamesBackup" within the folder "data - TRBackup")
choice /c 12345 /n /m "Enter choice [1/2/3/4/5]: "

set "MODE=Database"
set "TRANSLATE_ASSETS=0"

if errorlevel 5 (
	set "MODE=RestoreAssetNames"
) else if errorlevel 4 (
	set "ENGINE=MZ"
	set "TRANSLATE_ASSETS=1"
) else if errorlevel 3 (
	set "ENGINE=MZ"
) else if errorlevel 2 (
	set "ENGINE=MV"
	set "TRANSLATE_ASSETS=1"
) else (
	set "ENGINE=MV"
)

echo.
if "%MODE%"=="RestoreAssetNames" (
	echo Running mode: Restore original Asset names
) else (
	echo Running mode: Database translation
	echo Engine: %ENGINE%
	if "%TRANSLATE_ASSETS%"=="1" (
		echo Translate^+Rename Asset names: YES
	) else (
		echo Translate^+Rename Asset names: NO
	)
)
echo.
if not exist "%~dp0SADT.ps1" (
	echo ERROR: Missing helper script "SADT.ps1".
	echo Please keep SADT.ps1 in the same folder as this .bat file.
	set "EXIT_CODE=1"
	goto :afterRun
)

if "%MODE%"=="RestoreAssetNames" (
	powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SADT.ps1" -Mode RestoreAssetNames -RootDir "%~dp0."
) else (
	if "%TRANSLATE_ASSETS%"=="1" (
		powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SADT.ps1" -Mode Database -Engine "%ENGINE%" -TranslateAssets -RootDir "%~dp0."
	) else (
		powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SADT.ps1" -Mode Database -Engine "%ENGINE%" -RootDir "%~dp0."
	)
)

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
