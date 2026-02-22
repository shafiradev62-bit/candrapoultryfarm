# Build APK - Candra Poultry Farm

## Status Build ✅

Kedua aplikasi React sudah berhasil di-build:
- ✅ Monitoring App → `dist-monitoring/`
- ✅ Input App → `dist-input/`

## Langkah Selanjutnya

### 1. Install Java Development Kit (JDK) 17

Sebelum build APK, pastikan JDK 17 sudah terinstall:

**Download JDK 17:**
https://adoptium.net/temurin/releases/?version=17

**Setelah install, set JAVA_HOME:**
```cmd
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot"
```

**Verifikasi instalasi:**
```cmd
java -version
```

Harus menampilkan versi 17.x.x

### 2. Build APK Monitoring

Jalankan batch script:
```cmd
build-monitoring-apk.bat
```

Script ini akan:
1. ✅ Build React app (sudah selesai)
2. Initialize Capacitor Android project
3. Sync web assets ke Android
4. Build APK debug dengan Gradle

**Lokasi APK hasil:**
```
android-monitoring/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Build APK Input Data

Jalankan batch script:
```cmd
build-input-apk.bat
```

Script ini akan:
1. ✅ Build React app (sudah selesai)
2. Initialize Capacitor Android project
3. Sync web assets ke Android
4. Build APK debug dengan Gradle

**Lokasi APK hasil:**
```
android-input/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

### Error: JAVA_HOME not set
**Solusi:** Install JDK 17 dan set environment variable seperti di atas

### Error: gradlew.bat not found
**Solusi:** Jalankan `npm run cap:init:monitoring` atau `npm run cap:init:input` terlebih dahulu

### Error: SDK not found
**Solusi:** Gradle akan otomatis download Android SDK. Pastikan koneksi internet stabil dan tunggu proses download selesai (bisa 10-30 menit untuk pertama kali)

### Build gagal dengan error lain
**Solusi:**
1. Pastikan tidak ada antivirus yang memblokir Gradle
2. Coba hapus folder `android-monitoring` atau `android-input` dan build ulang
3. Pastikan disk space cukup (minimal 5GB free)

## Informasi Aplikasi

### Monitoring App
- **App ID**: com.candra.monitoring
- **App Name**: Candra Monitoring
- **Orientasi**: Landscape only
- **Fitur**: Read-only dashboard monitoring
- **Size**: ~5-8 MB

### Input Data App
- **App ID**: com.candra.input
- **App Name**: Candra Input Data
- **Orientasi**: Portrait & Landscape
- **Fitur**: Full CRUD dengan login
- **Size**: ~8-12 MB

## Install APK ke Device

1. Copy file APK ke perangkat Android (via USB, email, atau cloud)
2. Buka file APK di perangkat
3. Izinkan instalasi dari sumber tidak dikenal (jika diminta)
4. Tap "Install"

## Update Aplikasi

Jika ada perubahan code dan ingin rebuild APK:

```cmd
# Untuk monitoring
npm run build:monitoring
npm run cap:sync:monitoring
cd android-monitoring && gradlew.bat assembleDebug && cd ..

# Untuk input
npm run build:input
npm run cap:sync:input
cd android-input && gradlew.bat assembleDebug && cd ..
```

Atau cukup jalankan batch script lagi:
```cmd
build-monitoring-apk.bat
build-input-apk.bat
```

## Dokumentasi Lengkap

- **Panduan Build**: `PANDUAN_BUILD_APK.md`
- **Perbedaan Dua APK**: `PERBEDAAN_DUA_APK.md`
- **Fitur Baru**: `FITUR_BARU.md`
- **Landscape Mobile**: `LANDSCAPE_MOBILE_GUIDE.md`

## Support

Jika mengalami kesulitan, pastikan:
1. ✅ Node.js terinstall (versi 18+)
2. ✅ JDK 17 terinstall dan JAVA_HOME sudah di-set
3. ✅ Koneksi internet stabil
4. ✅ Disk space cukup (minimal 5GB)
5. ✅ Antivirus tidak memblokir Gradle

---

**Next Step:** Install JDK 17, lalu jalankan `build-monitoring-apk.bat` dan `build-input-apk.bat`
