@echo off
cd /d "%~dp0"
echo Limpando processos anteriores...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul
SET PATH=C:\Program Files\nodejs;%PATH%
python main.py
pause
