@echo off
if /I "%~1"=="--run" goto :RunNow
cmd /k ""%~f0" --run %*"
exit /b

:RunNow
shift /1
setlocal EnableExtensions

set "toolPath=%~dp0ffmpeg.exe"

set /a converted=0
set /a skipped=0

if exist "%toolPath%" goto :ToolOk
echo Error: ffmpeg.exe not found next to this script.
echo Expected at: %toolPath%
goto :Done

:ToolOk

set "quality=4"
set /p "qualityInput=Enter OGG quality (0-10) (higher=better) (default (press Enter for it): 4): "
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
if /I "%~x1"==".mp3" goto :ArgIsMP3
echo Skipping non-MP3 file: %~1
set /a skipped+=1
exit /b

:ArgIsFolder
call :ProcessFolder "%~f1"
exit /b

:ArgIsMP3
call :ProcessFile "%~f1"
exit /b

:Done
echo Summary: Converted=%converted% Skipped=%skipped%
exit /b

:ProcessFolder
for /r "%~1" %%n in (*) do call :HandleFolderFile "%%~fn"
exit /b

:HandleFolderFile
if /I "%~x1"==".mp3" goto :FolderIsMP3
echo Skipping non-MP3 file: %~f1
set /a skipped+=1
exit /b

:FolderIsMP3
call :ProcessFile "%~f1"
exit /b

:ProcessFile
echo %~dpn1.ogg
"%toolPath%" -y -i "%~1" -c:a libvorbis -q:a %quality% "%~dpn1.ogg"
if errorlevel 1 "%toolPath%" -y -i "\\?\%~f1" -c:a libvorbis -q:a %quality% "\\?\%~dpn1.ogg"
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