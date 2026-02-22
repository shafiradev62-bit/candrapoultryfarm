@echo off
echo ========================================
echo Building Candra Input Data APK
echo ========================================
echo.

REM Step 1: Build React app
echo [1/6] Building React app...
call npm run build:input
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b %errorlevel%
)
echo.

REM Step 2: Copy index.html
echo [2/6] Preparing index.html...
copy /Y dist-input\index.input.html dist-input\index.html
echo.

REM Step 3: Copy capacitor config
echo [3/6] Setting up Capacitor config...
copy /Y capacitor.config.input.ts capacitor.config.ts
echo.

REM Step 4: Initialize or sync Capacitor
echo [4/6] Initializing Capacitor Android...
if not exist "android" (
    call npx cap add android
    if %errorlevel% neq 0 (
        echo ERROR: Capacitor init failed!
        pause
        exit /b %errorlevel%
    )
) else (
    call npx cap sync android
    if %errorlevel% neq 0 (
        echo ERROR: Sync failed!
        pause
        exit /b %errorlevel%
    )
)
echo.

REM Step 5: Build APK
echo [5/6] Building APK with Gradle...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: APK build failed!
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..
echo.

REM Step 6: Rename android folder
echo [6/6] Saving android folder...
if exist "android-input" rmdir /s /q android-input
move android android-input
echo.

echo ========================================
echo SUCCESS! Input Data APK built!
echo ========================================
echo.
echo APK Location:
echo android-input\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
