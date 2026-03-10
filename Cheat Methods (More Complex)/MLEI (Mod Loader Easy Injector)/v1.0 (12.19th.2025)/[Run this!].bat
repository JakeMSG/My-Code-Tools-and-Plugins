
@echo off 
:begin
title Mod Loader Easy Injector
color 0a

echo Type the number (1, 2, 3, etc) of the option you choose, then press ENTER

echo.
echo 0. Delete the MV Mod Loader (from Plugins, you'll have to delete the files yourself)
echo 1. Enable the MV Mod Loader

echo 4. [EXIT]
echo.

set /p answer=
IF %answer%==0 (
    "(''xchang32'' cmd utility).exe" "www\js\plugins.js" ",,^10^123^34name^34:^34^49d51ModLoader^34,,^34status^34:true,,^34description^34:^34A simple mod loader for RPG Maker MV.^34,,^34parameters^34:^123^125^125" "" & goto begin 
)
IF %answer%==1 (
    "(''xchang32'' cmd utility).exe" "www\js\plugins.js" "^125^125^10^93^59" "^125^125,,^10^123^34name^34:^34^49d51ModLoader^34,,^34status^34:true,,^34description^34:^34A simple mod loader for RPG Maker MV.^34,,^34parameters^34:^123^125^125^10^93^59" & goto begin 
)
IF %answer%==4 ( goto exit )

@REM for reference: https://stackoverflow.com/questions/9307512/create-a-batch-file-with-multiple-options

:exit
@exit

