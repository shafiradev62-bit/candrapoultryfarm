@echo off
echo Building CANDRA POULTRY FARM executable for Windows...
echo.

echo Step 1: Building React app...
npm run build
if %errorlevel% neq 0 (
    echo Error building React app!
    pause
    exit /b %errorlevel%
)

echo Step 2: Building Electron app...
npx electron-builder
if %errorlevel% neq 0 (
    echo Error building Electron app!
    pause
    exit /b %errorlevel%
)

echo.
echo Build completed successfully!
echo EXE file is located in dist-electron directory
echo.
pause