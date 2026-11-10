@echo off
title Ehky Ya Misr - Local Offline Server
echo ========================================================
echo   Starting Ehky Ya Misr (احكي يا مصر) Local Server...
echo ========================================================
cd /d "%~dp0"
start http://localhost:8000
python -m http.server 8000
pause
