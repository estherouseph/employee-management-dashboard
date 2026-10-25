@echo off
echo ========================================================
echo   Starting Employee Management Dashboard (ICTAK Project)
echo ========================================================
echo.
echo [1/2] Starting Backend API Server on http://localhost:5000 ...
start "Employee API Backend" cmd /k "node app.js"
echo.
echo [2/2] Starting Frontend React Client ...
start "Employee Dashboard Frontend" cmd /k "npm.cmd run dev"
echo.
echo Both applications are running!
echo Access the frontend in your browser at: http://localhost:5173
echo ========================================================
