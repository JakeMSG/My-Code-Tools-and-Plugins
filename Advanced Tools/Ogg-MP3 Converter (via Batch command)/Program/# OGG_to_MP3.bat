@echo off
if /I "%~1"=="--run" goto :RunNow
cmd /k ""%~f0" --run %*"
exit /b

:RunNow
shift /1
setlocal EnableExtensions

set "oggdecPath=%~dp0oggdec.exe"
set "lamePath=%~dp0lame.exe"

set /a converted=0
set /a skipped=0

if exist "%oggdecPath%" goto :CheckLame
echo Error: oggdec.exe not found next to this script.
echo Expected at: %oggdecPath%
goto :Done

:CheckLame
if exist "%lamePath%" goto :ToolOk
echo Error: lame.exe not found next to this script.
echo Expected at: %lamePath%
goto :Done

:ToolOk

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
echo Skipping missing path: %~1
set /a skipped+=1
exit /b

:ArgExists
call :PathIsFolder "%~1"
if not errorlevel 1 goto :ArgIsFolder
if /I "%~x1"==".ogg" goto :ArgIsOGG
echo Skipping non-OGG file: %~1
set /a skipped+=1
exit /b

:ArgIsFolder
call :ProcessFolder "%~f1"
exit /b

:ArgIsOGG
call :ProcessFile "%~f1"
exit /b

:Done
echo Summary: Converted=%converted% Skipped=%skipped%
exit /b

:ProcessFolder
for /r "%~1" %%n in (*) do call :HandleFolderFile "%%~fn"
exit /b

:HandleFolderFile
if /I "%~x1"==".ogg" goto :FolderIsOGG
echo Skipping non-OGG file: %~f1
set /a skipped+=1
exit /b

:FolderIsOGG
call :ProcessFile "%~f1"
exit /b

:ProcessFile
echo %~dpn1.mp3
"%oggdecPath%" "%~1" --stdout | "%lamePath%" -V5 --vbr-new - "%~dpn1.mp3"
if errorlevel 1 "%oggdecPath%" "\\?\%~f1" --stdout | "%lamePath%" -V5 --vbr-new - "\\?\%~dpn1.mp3"
if errorlevel 1 goto :ConvertFail
del /f "%~1" >nul 2>&1
if errorlevel 1 del /f "\\?\%~f1" >nul 2>&1
set /a converted+=1
exit /b

:ConvertFail
echo Failed to convert: %~1
exit /b

:PathExists
if exist "%~1" exit /b 0
if exist "\\?\%~f1" exit /b 0
exit /b 1

:PathIsFolder
if exist "%~1\*" exit /b 0
if exist "\\?\%~f1\*" exit /b 0
exit /b 1