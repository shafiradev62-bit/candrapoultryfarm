# Build APK PWA - Candra Farm Mobile

## APK Info
- **File**: `candra-farm-pwa-debug.apk`
- **Size**: ~6.16 MB
- **Type**: Debug APK (unsigned)
- **App Name**: Candra Farm
- **Package**: com.candra.pwa
- **Icon**: Logo dari login page (logo.png)

## Build Steps (Already Done)

### 1. Setup Capacitor Config
```bash
# Created capacitor.config.pwa.ts with:
# - appId: com.candra.pwa
# - appName: Candra Farm
# - webDir: dist-pwa
```

### 2. Build PWA
```bash
npm run build:pwa
```

### 3. Add Android Platform
```bash
# Temporarily use PWA config
npx cap add android
```

### 4. Copy Logo to Android Resources
```bash
# Copied logo.png to all mipmap folders:
# - mipmap-mdpi
# - mipmap-hdpi
# - mipmap-xhdpi
# - mipmap-xxhdpi
# - mipmap-xxxhdpi
```

### 5. Sync Capacitor
```bash
npx cap sync
```

### 6. Build APK Debug (NO ANDROID STUDIO)
```bash
cd android
.\gradlew assembleDebug
```

### 7. Copy APK to Root
```bash
# APK location: android/app/build/outputs/apk/debug/app-debug.apk
# Copied to: candra-farm-pwa-debug.apk
```

## How to Rebuild APK

If you need to rebuild the APK in the future:

```bash
# 1. Build PWA
npm run build:pwa

# 2. Copy index.html
Copy-Item dist-pwa/index.pwa.html dist-pwa/index.html

# 3. Swap config temporarily
Copy-Item capacitor.config.ts capacitor.config.backup.ts
Copy-Item capacitor.config.pwa.ts capacitor.config.ts

# 4. Sync Capacitor
npx cap sync

# 5. Build APK
cd android
.\gradlew assembleDebug

# 6. Copy APK
Copy-Item android/app/build/outputs/apk/debug/app-debug.apk ../candra-farm-pwa-debug.apk

# 7. Restore original config
Copy-Item capacitor.config.backup.ts capacitor.config.ts
```

## Install APK on Android Device

### Method 1: USB Cable
1. Enable Developer Options on Android
2. Enable USB Debugging
3. Connect phone to PC
4. Run: `adb install candra-farm-pwa-debug.apk`

### Method 2: Direct Transfer
1. Copy `candra-farm-pwa-debug.apk` to phone
2. Open file manager on phone
3. Tap the APK file
4. Allow "Install from Unknown Sources" if prompted
5. Install the app

## Features in APK

✅ Portrait orientation only
✅ Bottom navigation (5 tabs)
✅ iOS-style clean design
✅ Forest Green (#1B4332) color scheme
✅ iOS-style date picker
✅ +/- increment buttons for all inputs
✅ LocalStorage data persistence
✅ Offline-capable PWA

## App Pages

1. **Login** - Local authentication
2. **Dashboard** - Overview with greeting and stats
3. **Input** - Daily report input (3-step form)
4. **Stok** - Stock management with quick actions
5. **Penjualan** - Sales entry with category breakdown
6. **Profil** - User profile and logout

## Notes

- This is a DEBUG APK (unsigned)
- No signing key required
- Built with Capacitor CLI only (NO Android Studio)
- Logo matches the one in PWA login page
- Data syncs with web dashboard via LocalStorage
