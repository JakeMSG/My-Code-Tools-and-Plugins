
@echo off 
:begin
title Enabling Renpy Developer Options
color 0a

echo Type the number (1, 2, 3, etc) of the option you choose, then press ENTER

echo.
echo 1. Enable just the Renpy Console
echo 2. Enable all the Developer Options
echo 3. Revert all (Disable all Developer Options previously Enabled)
echo 4. [EXIT]
echo.

set /p answer=
IF %answer%==1 ( "(Don't run this) (''Fart'' cmd utility).exe" "renpy\common\00console.rpy" "config.console = False" "config.console = True" & goto begin )
IF %answer%==2 (
    IF EXIST "game\options.rpy" (
        "(Don't run this) (''Fart'' cmd utility).exe" "game\options.rpy" "## Basics ######################################################################" "define config.developer = True" & goto begin 
	) ELSE (
	    @echo define config.developer = True > "game\options.rpy" & goto begin 
	)
)
IF %answer%==3 ( "(Don't run this) (''Fart'' cmd utility).exe" "renpy\common\00console.rpy" "config.console = True" "config.console = False" & "(Don't run this) (''Fart'' cmd utility).exe" "game\options.rpy" "define config.developer = True" "## Basics ######################################################################" & goto begin )
IF %answer%==4 ( goto exit )

@REM for reference: https://stackoverflow.com/questions/9307512/create-a-batch-file-with-multiple-options

:exit
@exit