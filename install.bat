@echo off
set PATH=%~dp0node_dist\node-v20.11.1-win-x64;%PATH%
echo Installing dependencies...
call npm install
echo Done.
pause
