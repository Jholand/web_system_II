@echo off
echo ============================================
echo TravelQuest - Redis Setup Helper
echo ============================================
echo.

REM Check if Redis is already installed
sc query "Redis" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Redis service found!
    echo Starting Redis...
    net start Redis
    echo.
    echo [SUCCESS] Redis is running!
    goto :test_redis
)

echo [INFO] Redis service not found.
echo.
echo ============================================
echo Redis Installation Options:
echo ============================================
echo.
echo Option 1: Use Database Caching (No installation needed)
echo   - Works immediately with MySQL
echo   - Still provides caching benefits
echo   - Good for development
echo.
echo Option 2: Install Redis for Windows
echo   - Download: https://github.com/microsoftarchive/redis/releases
echo   - Install: Redis-x64-3.0.504.msi
echo   - Much faster than database caching
echo.
echo Option 3: Install Memurai (Modern Redis)
echo   - Download: https://www.memurai.com/
echo   - Better Windows support
echo   - Drop-in Redis replacement
echo.
echo Option 4: Use Docker
echo   - Command: docker run -d -p 6379:6379 --name redis redis:alpine
echo.
echo ============================================
echo Choose an option:
echo ============================================
echo.
echo [1] Continue with DATABASE caching (works now)
echo [2] Open Redis download page and exit
echo [3] Open Memurai download page and exit
echo [4] Show Docker command and exit
echo [5] Test existing Redis connection
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo [ACTION] Switching to database caching...
    cd laravel-backend
    
    REM Update .env to use database cache
    powershell -Command "(Get-Content .env) -replace 'CACHE_STORE=redis', 'CACHE_STORE=database' | Set-Content .env"
    
    echo [SUCCESS] Changed to database caching!
    echo.
    echo Your application will now use database caching instead of Redis.
    echo This is slower than Redis but requires no additional setup.
    echo.
    goto :end
)

if "%choice%"=="2" (
    echo Opening Redis download page...
    start https://github.com/microsoftarchive/redis/releases
    echo.
    echo After installing Redis:
    echo 1. Run this script again
    echo 2. Or manually start Redis service
    echo.
    goto :end
)

if "%choice%"=="3" (
    echo Opening Memurai download page...
    start https://www.memurai.com/get-memurai
    echo.
    echo After installing Memurai:
    echo 1. Run this script again
    echo 2. Service starts automatically
    echo.
    goto :end
)

if "%choice%"=="4" (
    echo.
    echo Docker Command for Redis:
    echo =========================================
    echo docker run -d -p 6379:6379 --name redis redis:alpine
    echo =========================================
    echo.
    echo Run this command if you have Docker installed.
    goto :end
)

if "%choice%"=="5" (
    goto :test_redis
)

echo Invalid choice!
goto :end

:test_redis
echo.
echo ============================================
echo Testing Redis Connection...
echo ============================================
cd laravel-backend
php -r "try { $redis = new Redis(); $redis->connect('127.0.0.1', 6379); echo '[SUCCESS] Redis is working!\n'; $redis->ping(); } catch (Exception $e) { echo '[ERROR] Redis connection failed: ' . $e->getMessage() . '\n'; }"
echo.

:end
echo.
echo ============================================
echo Setup complete! Check REDIS_CACHING_IMPLEMENTATION.md for details.
echo ============================================
pause
