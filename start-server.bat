@echo off
title Ehky Ya Misr - Local Server
echo ========================================================
echo   Ehky Ya Misr (احكي يا مصر) - Local Server
echo ========================================================
echo   [1] Frontend only  : http://localhost:8000
echo       (static site - works even if backend is off)
echo   [2] Backend API    : http://localhost:5000
echo       (optional - start separately with: cd backend ^&^& npm start)
echo ========================================================
cd /d "%~dp0"
echo Starting static server on port 8000...
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8000"
python -m http.server 8000
pause
