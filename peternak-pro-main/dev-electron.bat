@echo off
echo Starting CANDRA POULTRY FARM in development mode...
echo.

echo Starting Vite development server...
start "" npm run dev

timeout /t 10 /nobreak >nul

echo Starting Electron app...
npx electron .