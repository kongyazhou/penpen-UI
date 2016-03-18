@Echo Off&Setlocal Enabledelayedexpansion
call :addPlatforms
For /f "tokens=*" %%i in (plugins.txt) do (call :addPlugins %%i)
Pause
exit
:addPlugins
Set n=%1
call :alertBlue %1
call cordova plugin add !n!
goto :eof
:alertBlue
echo.
echo ================================================
echo Dowlowding %1...
echo ================================================
echo.
goto :eof
:addPlatforms
call cordova platform add android
goto :eof