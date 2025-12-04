@echo off
echo ================================================
echo   TravelQuest - Internet Access Setup (ngrok)
echo ================================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] ngrok is not installed!
    echo.
    echo Please install ngrok:
    echo   choco install ngrok -y
    echo.
    echo Or download from: https://ngrok.com/download
    echo.
    pause
    exit /b
)

echo Starting servers...
echo.

REM Start Laravel Backend
echo [1/3] Starting Laravel Backend on port 8000...
start "TravelQuest Backend" cmd /k "cd /d e:\laragon\www\web_system_II\laravel-backend && php artisan serve --host=127.0.0.1 --port=8000"
timeout /t 3 /nobreak >nul

REM Start React Frontend
echo [2/3] Starting React Frontend on port 5173...
start "TravelQuest Frontend" cmd /k "cd /d e:\laragon\www\web_system_II\react-frontend && npm run dev"
timeout /t 5 /nobreak >nul

REM Start ngrok tunnel
echo [3/3] Creating ngrok tunnel for internet access...
echo.
echo ================================================
echo   IMPORTANT: Keep this window open!
echo ================================================
echo.
echo Your TravelQuest app will be accessible from ANYWHERE via ngrok URL
echo - Works on mobile data
echo - Works on any WiFi
echo - Camera works (HTTPS enabled!)
echo.
echo Copy the "Forwarding" URL and share it!
echo Example: https://abc123.ngrok.io
echo.
echo ================================================
echo.

ngrok http 5173

echo.
echo Tunnel closed. Press any key to exit...
pause >nul
