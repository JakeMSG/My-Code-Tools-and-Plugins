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
if /I "%~x1"==".jpg" goto :ArgIsJPG
if /I "%~x1"==".jpeg" goto :ArgIsJPG
echo Skipping non-JPG file: "%~1"
set /a skipped+=1
exit /b

:ArgIsFolder
call :ProcessFolder "%~f1"
exit /b

:ArgIsJPG
call :ProcessFile "%~f1"
exit /b

:Done
echo Summary: Converted=%converted% Skipped=%skipped%
exit /b

:ProcessFolder
for /r "%~1" %%n in (*) do call :HandleFolderFile "%%~fn"
exit /b

:HandleFolderFile
if /I "%~x1"==".jpg" goto :FolderIsJPG
if /I "%~x1"==".jpeg" goto :FolderIsJPG
echo Skipping non-JPG file: "%~f1"
set /a skipped+=1
exit /b

:FolderIsJPG
call :ProcessFile "%~f1"
exit /b

:ProcessFile
echo "%~dpn1.png"
set "CONV_SRC=%~f1"
set "CONV_DST=%~dpn1.png"
set "CONV_MODE=jpg2png"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%toolPath%"
if errorlevel 1 goto :ConvertFail
del /f "%~1" >nul 2>&1
if errorlevel 1 del /f "\\?\%~f1" >nul 2>&1
set /a converted+=1
exit /b

:ConvertFail
echo Failed to convert: "%~1"
exit /b

:PathExists
if exist "%~1" exit /b 0
if exist "\\?\%~f1" exit /b 0
exit /b 1

:PathIsFolder
if exist "%~1\*" exit /b 0
if exist "\\?\%~f1\*" exit /b 0
exit /b 1
