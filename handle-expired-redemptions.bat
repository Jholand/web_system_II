@echo off
echo ========================================
echo Handle Expired Redemptions
echo ========================================
echo.

cd "c:\xampp\htdocs\Jeyeeem's files\web_system_II\laravel-backend"

echo Running expired redemptions handler...
php artisan redemptions:handle-expired

echo.
echo ========================================
echo Done!
echo ========================================
pause
