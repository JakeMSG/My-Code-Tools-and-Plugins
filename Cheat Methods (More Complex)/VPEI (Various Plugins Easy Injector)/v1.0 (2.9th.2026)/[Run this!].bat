
@echo off 
:begin
title Various Plugins Easy Injector (RPGMaker MV/MZ)
color 0a

echo Type the number (1, 2, 3, etc) of the option you choose, then press ENTER

echo.
echo. ================ MV plugins
echo 1. Enable JakeMSG_SkipMoviesMV
echo.
echo. ================ MZ plugins
echo 5. Enable JakeMSG_SkipMoviesMZ
echo.
echo. ================ Remove All added Plugins
echo 0. Remove the plugins
echo.

set /p answer=
@REM ================================ MV plugins
IF %answer%==1 (
    "(''xchang32'' cmd utility).exe" "www\js\plugins.js" "^125^125^10^93^59" "^125^125,,^10^123^34name^34:^34JakeMSG_SkipMoviesMV^34,,^34status^34:true,,^34description^34:^34Adds the possibility to skip videos (Movie files) by pressing a key.^34,,^34parameters^34:^123^125^125^10^93^59" & goto begin 
)

@REM ================================ MZ plugins
IF %answer%==5 (
    "(''xchang32'' cmd utility).exe" "js\plugins.js" "^125^125^10^93^59" "^125^125,,^10^123^34name^34:^34JakeMSG_SkipMoviesMZ^34,,^34status^34:true,,^34description^34:^34Adds the possibility to skip videos (Movie files) by pressing a key.^34,,^34parameters^34:^123^125^125^10^93^59" & goto begin 
)

@REM ================================ Remove All Added Plugins
IF %answer%==0 (
    "(''xchang32'' cmd utility).exe" "www\js\plugins.js" ",,^10^123^34name^34:^34JakeMSG_SkipMoviesMV^34,,^34status^34:true,,^34description^34:^34Adds the possibility to skip videos (Movie files) by pressing a key.^34,,^34parameters^34:^123^125^125" ""
    "(''xchang32'' cmd utility).exe" "js\plugins.js" ",,^10^123^34name^34:^34JakeMSG_SkipMoviesMZ^34,,^34status^34:true,,^34description^34:^34Adds the possibility to skip videos (Movie files) by pressing a key.^34,,^34parameters^34:^123^125^125" ""
    goto begin    
)


@REM for reference: https://stackoverflow.com/questions/9307512/create-a-batch-file-with-multiple-options

:exit
@exit

