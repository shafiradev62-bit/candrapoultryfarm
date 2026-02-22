# Panduan Build APK - Candra Poultry Farm

## Dua Aplikasi Android

Proyek ini menghasilkan 2 APK terpisah:

1. **Candra Monitoring** - Aplikasi monitoring landscape-only (read-only dashboard)
2. **Candra Input Data** - Aplikasi lengkap dengan login dan semua fitur CRUD

## Persyaratan

Sebelum build APK, pastikan sudah terinstall:

1. **Node.js** (versi 18 atau lebih baru)
2. **Java Development Kit (JDK)** versi 17
   - Download: https://adoptium.net/
   - Set JAVA_HOME environment variable
3. **Android SDK** (akan otomatis didownload oleh Gradle saat pertama kali build)

## Cara Build APK

### Opsi 1: Menggunakan Batch Script (PALING MUDAH)

#### Build Monitoring APK:
```cmd
build-monitoring-apk.bat
```

#### Build Input Data APK:
```cmd
build-input-apk.bat
```

Script ini akan otomatis:
- Build React app
- Initialize Capacitor Android (jika belum ada)
- Sync web assets ke Android
- Build APK debug

### Opsi 2: Manual Step-by-Step

#### Untuk Monitoring APK:

```cmd
# 1. Build React app
npm run build:monitoring

# 2. Initialize Android (hanya sekali, skip jika sudah ada folder android-monitoring)
npm run cap:init:monitoring

# 3. Sync web assets
npm run cap:sync:monitoring

# 4. Build APK
cd android-monitoring
gradlew.bat assembleDebug
cd ..
```

#### Untuk Input Data APK:

```cmd
# 1. Build React app
npm run build:input

# 2. Initialize Android (hanya sekali, skip jika sudah ada folder android-input)
npm run cap:init:input

# 3. Sync web assets
npm run cap:sync:input

# 4. Build APK
cd android-input
gradlew.bat assembleDebug
cd ..
```

## Lokasi APK Hasil Build

Setelah build berhasil, APK akan berada di:

- **Monitoring APK**: `android-monitoring/app/build/outputs/apk/debug/app-debug.apk`
- **Input Data APK**: `android-input/app/build/outputs/apk/debug/app-debug.apk`

## Install APK ke Device

1. Copy file APK ke perangkat Android
2. Buka file APK di perangkat
3. Izinkan instalasi dari sumber tidak dikenal (jika diminta)
4. Install aplikasi

## Troubleshooting

### Error: JAVA_HOME not set

Solusi:
1. Install JDK 17 dari https://adoptium.net/
2. Set environment variable:
   ```cmd
   setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot"
   ```
3. Restart command prompt

### Error: gradlew.bat not found

Solusi: Jalankan `npm run cap:init:monitoring` atau `npm run cap:init:input` terlebih dahulu

### Error: Build failed - SDK not found

Solusi: Gradle akan otomatis download Android SDK saat pertama kali build. Pastikan koneksi internet stabil.

### Error: npm run build gagal

Solusi:
1. Hapus folder `node_modules`
2. Jalankan `npm install`
3. Coba build lagi

## Update APK Setelah Perubahan Code

Jika ada perubahan pada code React:

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

## Perbedaan Kedua Aplikasi

### Candra Monitoring
- **Mode**: Landscape only (portrait diblokir dengan overlay)
- **Fitur**: Read-only dashboard monitoring
- **Tampilan**: Dashboard dengan KPI cards, tabel, grafik
- **Target**: Untuk monitoring di tablet/device landscape

### Candra Input Data
- **Mode**: Portrait & Landscape (responsive)
- **Fitur**: Full CRUD - Login, Daily Report, Warehouse, Sales, Operational
- **Tampilan**: Sidebar navigation, semua halaman lengkap
- **Target**: Untuk input data harian oleh operator

## Branding

Kedua aplikasi menggunakan branding yang sama:
- Logo: CANDRA POULTRY FARM
- Warna: Primary theme yang sama
- Font: Konsisten di kedua aplikasi

## Catatan Penting

- APK yang dihasilkan adalah **DEBUG APK** (tidak signed)
- Untuk production/publish ke Play Store, perlu build **RELEASE APK** dengan signing
- Kedua APK dapat diinstall bersamaan di satu device (berbeda App ID)
- File size APK sekitar 5-10 MB per aplikasi

## Support

Jika ada masalah saat build, pastikan:
1. Node.js terinstall dengan benar
2. JDK 17 terinstall dan JAVA_HOME sudah di-set
3. Koneksi internet stabil (untuk download dependencies)
4. Tidak ada antivirus yang memblokir Gradle
