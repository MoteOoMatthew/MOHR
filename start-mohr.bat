@echo off
title MOHR HR System
echo.
echo ========================================
echo    MOHR HR Management System
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

echo Checking dependencies...

:: Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

:: Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo.
echo Starting MOHR HR System...
echo.

:: Set environment for local network access
set NODE_ENV=local_network

:: Start the backend server
echo Starting backend server...
start "MOHR Backend" cmd /k "cd backend && npm start"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start the frontend
echo Starting frontend...
start "MOHR Frontend" cmd /k "cd frontend && npm start"

:: Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    MOHR HR System is starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Network Access: http://YOUR_IP:5000
echo (Replace YOUR_IP with your computer's IP address)
echo.
echo Default login:
echo Username: admin
echo Password: admin123
echo.
echo Press any key to open the application...
pause >nul

:: Open the application in default browser
start http://localhost:3000

echo.
echo MOHR HR System is running!
echo Close this window when you're done.
echo.
pause 