@echo off
REM EduS-X Project Startup Script for Windows

echo.
echo ================================
echo   EduS-X Project Startup
echo ================================
echo.

echo Waiting for Docker daemon to be ready...
echo.

:wait_docker
timeout /t 1 /nobreak >nul
docker ps >nul 2>&1
if errorlevel 1 (
    echo Still waiting for Docker...
    goto wait_docker
)

echo Docker is ready!
echo.

echo Building Docker images...
cd /d "%~dp0"
docker-compose build

if errorlevel 1 (
    echo.
    echo Build failed. Check errors above.
    pause
    exit /b 1
)

echo.
echo ================================
echo   Build Successful!
echo ================================
echo.

echo Starting services...
echo (This takes 30-60 seconds as MySQL initializes)
echo.

docker-compose up

echo.
echo ================================
echo   Project Stopped
echo ================================
echo.
pause
