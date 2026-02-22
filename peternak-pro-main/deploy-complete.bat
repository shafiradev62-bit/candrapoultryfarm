@echo off
echo 🚀 Deploying CANDRA POULTRY FARM to Vercel
echo ========================================
echo.

echo Step 1: Building the application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Error building the application!
    pause
    exit /b %errorlevel%
)
echo ✅ Build successful!

echo.
echo Step 2: Deploying to Vercel...
echo Please follow these steps:
echo.
echo 1. Install Vercel CLI (if not installed):
echo    npm install -g vercel
echo.
echo 2. Login to Vercel:
echo    vercel login
echo.
echo 3. Deploy to production:
echo    vercel --prod
echo.
echo Alternative: Deploy via Vercel Dashboard
echo 1. Go to https://vercel.com/new
echo 2. Import your GitHub repository: https://github.com/shafiradev62-bit/peternak-pro
echo 3. Use these settings:
echo    - Framework: Vite
echo    - Build Command: npm run build
echo    - Output Directory: dist
echo    - Install Command: npm install
echo.
echo Your GitHub repository is now available at:
echo https://github.com/shafiradev62-bit/peternak-pro
echo.
pause