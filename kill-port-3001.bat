@echo off
echo Cercando processi sulla porta 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Terminando processo PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo Terminando tutti i processi Java...
taskkill /F /IM java.exe >nul 2>&1
echo.
echo Porta 3001 dovrebbe essere ora libera.
echo Puoi avviare l'applicazione.
pause

