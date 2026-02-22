# Cara Build 2 APK - SIMPLE!

## Setup Sudah Selesai ✅

Semua code sudah siap. Tinggal build APK.

## Build APK

### 1. Build Monitoring APK (Landscape Only)

```cmd
build-monitoring-apk.bat
```

**Proses:**
- Build React app ✅ (sudah selesai)
- Copy index.html
- Setup Capacitor config
- Initialize Android project (pertama kali ~2-5 menit)
- Download Gradle & Android SDK (pertama kali ~10-30 menit, tergantung internet)
- Build APK debug (~2-5 menit)

**Hasil APK:**
```
android-monitoring\app\build\outputs\apk\debug\app-debug.apk
```

### 2. Build Input Data APK (Full Features)

```cmd
build-input-apk.bat
```

**Proses:**
- Build React app ✅ (sudah selesai)
- Copy index.html
- Setup Capacitor config
- Initialize Android project (~2-5 menit)
- Build APK debug (~2-5 menit, SDK sudah ada)

**Hasil APK:**
```
android-input\app\build\outputs\apk\debug\app-debug.apk
```

## Install APK

1. Copy file APK ke HP/Tablet Android
2. Buka file APK
3. Izinkan instalasi dari sumber tidak dikenal
4. Install

## Catatan Penting

- **Pertama kali build LAMA** (~15-30 menit) karena download Gradle & Android SDK
- **Build kedua CEPAT** (~3-5 menit) karena sudah ada cache
- Pastikan koneksi internet stabil untuk download dependencies
- Kedua APK bisa diinstall bersamaan (App ID berbeda)
- APK ini DEBUG version (tidak signed, untuk testing)

## Troubleshooting

### Build lama sekali
**Normal!** Pertama kali Gradle download ~2-3 GB dependencies. Tunggu sampai selesai.

### Error Java version
Kamu butuh Java 17. Cek dengan:
```cmd
java -version
```
Harus muncul: `java version "17.x.x"`

### Build gagal
1. Hapus folder `android`
2. Jalankan batch script lagi

## Perbedaan 2 APK

### Monitoring APK
- Landscape only (portrait diblokir)
- Tidak perlu login
- Dashboard monitoring (read-only)
- ~5-8 MB

### Input Data APK
- Portrait & Landscape
- Perlu login (email + password)
- Full CRUD operations
- ~8-12 MB

## Data Sync

Kedua aplikasi connect ke Supabase yang sama. Data yang diinput di Input App langsung muncul di Monitoring App secara real-time.

---

**Sekarang:** Jalankan `build-monitoring-apk.bat` dan tunggu sampai selesai!
