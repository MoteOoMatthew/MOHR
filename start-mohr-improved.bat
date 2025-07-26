@echo off
title MOHR HR System - Improved
echo.
echo ========================================
echo    MOHR HR Management System
echo    Improved Startup Script
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    echo Please ensure Node.js is properly installed
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

:: Fix PowerShell execution policy
echo 🔧 Fixing PowerShell execution policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PowerShell execution policy fixed
) else (
    echo ⚠️ Could not fix PowerShell execution policy automatically
    echo This may cause issues with npm scripts
)
echo.

:: Stop any existing Node.js processes
echo 🔄 Stopping existing processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Existing processes stopped
) else (
    echo ℹ️ No existing processes found
)
echo.

:: Check if dependencies are installed
echo 📦 Checking dependencies...

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
) else (
    echo ✅ Backend dependencies found
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
) else (
    echo ✅ Frontend dependencies found
)

echo.

:: Build frontend if needed
echo 🔨 Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)
cd ..
echo ✅ Frontend built successfully
echo.

:: Set environment for local network access
set NODE_ENV=local_network

:: Start the backend server
echo 🚀 Starting MOHR HR System...
echo.

:: Start the backend server in a new window
start "MOHR Backend Server" cmd /k "cd backend && npm start"

:: Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

:: Check if backend is running
echo Checking if backend is running...
timeout /t 2 /nobreak >nul

:: Try to access the health endpoint
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running successfully
) else (
    echo ⚠️ Backend may still be starting up
)

echo.
echo ========================================
echo    MOHR HR System is starting...
echo ========================================
echo.
echo 🌐 Web Application: http://localhost:5000
echo 📱 Mobile Access: http://YOUR_IP:5000
echo    (Replace YOUR_IP with your computer's IP address)
echo.
echo 🔐 Default login credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo 💻 To launch desktop version:
echo    node scripts/deploy-improved.js desktop
echo.
echo Press any key to open the web application...
pause >nul

:: Open the application in default browser
start http://localhost:5000

echo.
echo 🎉 MOHR HR System is ready!
echo.
echo 💡 Tips:
echo    - The application runs in the background
echo    - Close the backend window to stop the server
echo    - Use Ctrl+C in the backend window to stop gracefully
echo.
pause 