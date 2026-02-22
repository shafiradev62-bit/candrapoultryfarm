@echo off
echo Deploying CANDRA POULTRY FARM to Vercel...
echo.

echo Step 1: Building the application...
npm run build
if %errorlevel% neq 0 (
    echo Error building the application!
    pause
    exit /b %errorlevel%
)

echo Step 2: Deploying to Vercel...
echo Make sure you have Vercel CLI installed and logged in.
echo Run: npm install -g vercel
echo Then run: vercel login
echo Finally run: vercel --prod

echo.
echo Alternative: You can also deploy using the Vercel dashboard:
echo 1. Go to https://vercel.com
echo 2. Sign in or create an account
echo 3. Click "New Project"
echo 4. Import your GitHub repository or upload the files
echo 5. Configure the project settings:
echo    - Framework: Vite
echo    - Build Command: npm run build
echo    - Output Directory: dist
echo    - Install Command: npm install

echo.
echo Project is ready for deployment!
pause