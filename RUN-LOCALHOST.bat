@echo off
title Candra Poultry Farm - Development Server
color 0B

echo.
echo  ╔════════════════════════════════════════════╗
echo  ║   CANDRA POULTRY FARM - DEV SERVER        ║
echo  ╚════════════════════════════════════════════╝
echo.

echo  [1/2] Checking dependencies...
if not exist "node_modules\vite" (
    echo  Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo  [X] ERROR: npm install failed!
        pause
        exit /b %errorlevel%
    )
)
echo  [√] Dependencies OK
echo.

echo  [2/2] Starting development server...
echo  ────────────────────────────────────────────
echo.
echo  Server akan buka di: http://localhost:5173
echo  Tekan Ctrl+C untuk stop server
echo.
call npm run dev

pause
