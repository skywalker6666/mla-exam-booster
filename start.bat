@echo off
set PATH=%~dp0node_dist\node-v20.11.1-win-x64;%PATH%
echo Starting MLA Exam Booster (Server + Client)...
call npm run dev
pause
