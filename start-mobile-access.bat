@echo off
echo ================================================
echo   TravelQuest - Mobile Access Server Startup
echo ================================================
echo.

REM Get local IP address
echo Finding your local IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1 delims= " %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found
    )
)

:found
echo.
echo ================================================
echo   Your Local IP: %LOCAL_IP%
echo ================================================
echo.
echo To access from your phone:
echo   Frontend: http://%LOCAL_IP%:5173
echo   Backend:  http://%LOCAL_IP%:8000
echo.
echo IMPORTANT: Make sure your phone is on the SAME WiFi!
echo ================================================
echo.

REM Start Laravel Backend
echo Starting Laravel Backend on 0.0.0.0:8000...
start "TravelQuest Backend" cmd /k "cd /d e:\laragon\www\web_system_II\laravel-backend && php artisan serve --host=0.0.0.0 --port=8000"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start React Frontend
echo Starting React Frontend with network access...
start "TravelQuest Frontend" cmd /k "cd /d e:\laragon\www\web_system_II\react-frontend && npm run dev -- --host"

echo.
echo ================================================
echo   Both servers are starting!
echo ================================================
echo.
echo Two terminal windows will open:
echo   1. Laravel Backend (port 8000)
echo   2. React Frontend (port 5173)
echo.
echo Access URLs:
echo   Laptop:  http://localhost:5173
echo   Phone:   http://%LOCAL_IP%:5173
echo.
echo Press any key to see detailed instructions...
pause >nul

echo.
echo ================================================
echo   Mobile Access Instructions
echo ================================================
echo.
echo 1. Make sure phone and laptop are on SAME WiFi
echo 2. Open phone browser
echo 3. Go to: http://%LOCAL_IP%:5173
echo 4. Login to admin panel
echo 5. Go to Map tab
echo 6. Click "Use My GPS" - phone GPS is super accurate!
echo.
echo Troubleshooting:
echo   - Cannot connect? Check Windows Firewall
echo   - Wrong IP? Run: ipconfig
echo   - Still issues? See MOBILE_ACCESS_GUIDE.md
echo.
echo Press any key to exit...
pause >nul
