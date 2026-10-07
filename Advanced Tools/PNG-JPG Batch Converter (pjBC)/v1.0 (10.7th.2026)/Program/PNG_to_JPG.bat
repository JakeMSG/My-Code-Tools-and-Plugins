@echo off
if /I "%~1"=="--run" goto :RunNow
cmd /k ""%~f0" --run %*"
exit /b

:RunNow
shift /1
setlocal EnableExtensions

set "toolPath=%~dp0image-convert.ps1"

set /a converted=0
set /a skipped=0

if exist "%toolPath%" goto :ToolOk
echo Error: image-convert.ps1 not found next to this script.
echo Expected at: %toolPath%
goto :Done

:ToolOk

set "quality=80"
set /p "qualityInput=Enter JPG quality percentage (between '0' and '100') (default (press Enter for it): 80): "
if not "%qualityInput%"=="" set "quality=%qualityInput%"
call :ValidateQuality
if errorlevel 1 goto :Done

if not "%~1"=="" goto :ArgLoop
call :ProcessFolder "%cd%"
goto :Done

:ArgLoop
if "%~1"=="" goto :Done
call :HandleArg "%~1"
shift /1
goto :ArgLoop

:HandleArg
call :PathExists "%~1"
if not errorlevel 1 goto :ArgExists
echo Skipping missing path: "%~1"
set /a skipped+=1
exit /b

:ArgExists
call :PathIsFolder "%~1"
if not errorlevel 1 goto :ArgIsFolder
if /I "%~x1"==".png" goto :ArgIsPNG
echo Skipping non-PNG file: "%~1"
set /a skipped+=1
exit /b

:ArgIsFolder
call :ProcessFolder "%~f1"
exit /b

:ArgIsPNG
call :ProcessFile "%~f1"
exit /b

:Done
echo Summary: Converted=%converted% Skipped=%skipped%
exit /b

:ProcessFolder
for /r "%~1" %%n in (*) do call :HandleFolderFile "%%~fn"
exit /b

:HandleFolderFile
if /I "%~x1"==".png" goto :FolderIsPNG
echo Skipping non-PNG file: "%~f1"
set /a skipped+=1
exit /b

:FolderIsPNG
call :ProcessFile "%~f1"
exit /b

:ProcessFile
echo "%~dpn1.jpg"
set "CONV_SRC=%~f1"
set "CONV_DST=%~dpn1.jpg"
set "CONV_MODE=png2jpg"
set "CONV_QUALITY=%quality%"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%toolPath%"
if errorlevel 1 goto :ConvertFail
del /f "%~1" >nul 2>&1
if errorlevel 1 del /f "\\?\%~f1" >nul 2>&1
set /a converted+=1
exit /b

:ConvertFail
echo Failed to convert: "%~1"
exit /b

:ValidateQuality
if "%quality%"=="" goto :QualityInvalid
set "qualityProbe=%quality%"
:ProbeDigit
if "%qualityProbe%"=="" goto :ProbeDone
set "one=%qualityProbe:~0,1%"
if "%one%"=="0" goto :ProbeNext
if "%one%"=="1" goto :ProbeNext
if "%one%"=="2" goto :ProbeNext
if "%one%"=="3" goto :ProbeNext
if "%one%"=="4" goto :ProbeNext
if "%one%"=="5" goto :ProbeNext
if "%one%"=="6" goto :ProbeNext
if "%one%"=="7" goto :ProbeNext
if "%one%"=="8" goto :ProbeNext
if "%one%"=="9" goto :ProbeNext
goto :QualityInvalid
:ProbeNext
set "qualityProbe=%qualityProbe:~1%"
goto :ProbeDigit
:ProbeDone
if not "%quality:~3%"=="" goto :QualityInvalid
:StripLeadingZero
if "%quality%"=="0" goto :QualityRange
if not "%quality:~0,1%"=="0" goto :QualityRange
set "quality=%quality:~1%"
goto :StripLeadingZero
:QualityRange
set /a quality=%quality% >nul
if %quality% GTR 100 goto :QualityInvalid
exit /b 0

:QualityInvalid
echo JPG quality must be a whole number from 0 to 100.
exit /b 1

:PathExists
if exist "%~1" exit /b 0
if exist "\\?\%~f1" exit /b 0
exit /b 1

:PathIsFolder
if exist "%~1\*" exit /b 0
if exist "\\?\%~f1\*" exit /b 0
exit /b 1
