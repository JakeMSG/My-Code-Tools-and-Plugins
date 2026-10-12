@echo off
if /I "%~1"=="--run" goto :RunNow
cmd /k ""%~f0" --run %*"
exit /b

:RunNow
shift /1
setlocal EnableExtensions

set "lamePath=%~dp0lame.exe"

set /a converted=0
set /a skipped=0

if exist "%lamePath%" goto :ToolOk
echo Error: lame.exe not found next to this script.
echo Expected at: %lamePath%
goto :Done

:ToolOk

set "quality=5"
set /p "qualityInput=Enter MP3 quality (0-9) (lower=better) (default (press Enter for it): 5): "
if not "%qualityInput%"=="" set "quality=%qualityInput%"

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
if /I "%~x1"==".wav" goto :ArgIsWAV
echo Skipping non-WAV file: %~1
set /a skipped+=1
exit /b

:ArgIsFolder
call :ProcessFolder "%~f1"
exit /b

:ArgIsWAV
call :ProcessFile "%~f1"
exit /b

:Done
echo Summary: Converted=%converted% Skipped=%skipped%
exit /b

:ProcessFolder
for /r "%~1" %%n in (*) do call :HandleFolderFile "%%~fn"
exit /b

:HandleFolderFile
if /I "%~x1"==".wav" goto :FolderIsWAV
echo Skipping non-WAV file: %~f1
set /a skipped+=1
exit /b

:FolderIsWAV
call :ProcessFile "%~f1"
exit /b

:ProcessFile
echo %~dpn1.mp3
"%lamePath%" -V%quality% --vbr-new "%~1" "%~dpn1.mp3"
if errorlevel 1 "%lamePath%" -V%quality% --vbr-new "\\?\%~f1" "\\?\%~dpn1.mp3"
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
