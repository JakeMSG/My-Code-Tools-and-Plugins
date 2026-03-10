
@echo off 
:begin
title Turn Splash Screens Off
color 0a

echo Type the number (1, 2, 3, etc) of the option you choose, then press ENTER

echo.
echo 0. Revert all changes (Re-enables all Splash Screens)
echo 1. Disable the MV Splash Screen
echo 2. Disable the Dieselmine circle Splash Screen
echo 3. Disable the Clipboard_llule plugin
echo 4. [EXIT]
echo.

set /p answer=
IF %answer%==0 (
    "(''xchang32'' cmd utility).exe" "www\js\plugins.js" "^34name^34:^34MadeWithMv^34,,^34status^34:false,," "^34name^34:^34MadeWithMv^34,,^34status^34:true,," & "(''xchang32'' cmd utility).exe" "www\js\plugins.js" "^34name^34:^34splash^34,,^34status^34:false,," "^34name^34:^34splash^34,,^34status^34:true,," & "(''xchang32'' cmd utility).exe" "www\js\plugins.js" "^34name^34:^34Clipboard_llule^34,,^34status^34:false,," "^34name^34:^34Clipboard_llule^34,,^34status^34:true,," & goto begin 
)
IF %answer%==1 (
    "(''xchang32'' cmd utility).exe" "www\js\plugins.js" "^34name^34:^34MadeWithMv^34,,^34status^34:true,," "^34name^34:^34MadeWithMv^34,,^34status^34:false,," & goto begin 
)
IF %answer%==2 (
    "(''xchang32'' cmd utility).exe" "www\js\plugins.js" "^34name^34:^34splash^34,,^34status^34:true,," "^34name^34:^34splash^34,,^34status^34:false,," & goto begin 
)
IF %answer%==3 (
    "(''xchang32'' cmd utility).exe" "www\js\plugins.js" "^34name^34:^34Clipboard_llule^34,,^34status^34:true,," "^34name^34:^34Clipboard_llule^34,,^34status^34:false,," & goto begin 
)
IF %answer%==4 ( goto exit )

@REM for reference: https://stackoverflow.com/questions/9307512/create-a-batch-file-with-multiple-options

:exit
@exit