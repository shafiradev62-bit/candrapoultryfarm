@echo off
echo ========================================
echo Building Candra Poultry Farm Mobile APK
echo ========================================
echo.

echo [1/5] Building Vite project for mobile...
call npm run build:mobile
if errorlevel 1 (
    echo ERROR: Vite build failed!
    pause
    exit /b 1
)
echo.

echo [2/5] Syncing Capacitor for mobile...
call npx cap sync android --config capacitor.config.mobile.ts
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo.

echo [3/5] Copying assets to android-mobile...
if not exist "android-mobile\app\src\main\assets\public" mkdir "android-mobile\app\src\main\assets\public"
xcopy /E /I /Y "dist-mobile\*" "android-mobile\app\src\main\assets\public\"
echo.

echo [4/5] Building Android APK...
cd android-mobile
call gradlew assembleDebug
if errorlevel 1 (
    echo ERROR: Gradle build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo [5/5] Copying APK to root folder...
copy "android-mobile\app\build\outputs\apk\debug\app-debug.apk" "candra-mobile-debug.apk"
echo.

echo ========================================
echo BUILD SUCCESS!
echo ========================================
echo APK Location: candra-mobile-debug.apk
echo.
pause
