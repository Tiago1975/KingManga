@echo off

echo Iniciando Frontend...

start /b python -m http.server 8080 --bind 127.0.0.1

timeout /t 2 > nul

start http://127.0.0.1:8080/index.html

cmd /k

