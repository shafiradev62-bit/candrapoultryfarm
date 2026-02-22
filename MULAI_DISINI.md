# 🚀 MULAI DISINI - Build 2 APK Candra Poultry Farm

## ✅ Yang Sudah Selesai

Semua kode sudah siap! Tinggal build APK saja.

## 📋 Yang Perlu Dilakukan

### Langkah 1: Install Java (JDK 17)

**Download:**
https://adoptium.net/temurin/releases/?version=17

**Pilih:**
- Operating System: Windows
- Architecture: x64
- Package Type: JDK
- Version: 17 (LTS)

**Setelah install, buka Command Prompt dan jalankan:**
```cmd
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot"
```
(Sesuaikan path dengan versi yang terinstall)

**Restart Command Prompt, lalu cek:**
```cmd
java -version
```
Harus muncul: `openjdk version "17.x.x"`

---

### Langkah 2: Build APK Monitoring

**Buka Command Prompt di folder ini, lalu jalankan:**
```cmd
build-monitoring-apk.bat
```

**Proses:**
1. ✅ Build React app (sudah selesai)
2. ⏳ Initialize Android project (pertama kali ~5 menit)
3. ⏳ Download Android SDK (pertama kali ~10-20 menit)
4. ⏳ Build APK (~2-5 menit)

**Hasil APK:**
```
android-monitoring\app\build\outputs\apk\debug\app-debug.apk
```

---

### Langkah 3: Build APK Input Data

**Jalankan:**
```cmd
build-input-apk.bat
```

**Proses:**
1. ✅ Build React app (sudah selesai)
2. ⏳ Initialize Android project (~5 menit)
3. ⏳ Build APK (~2-5 menit, SDK sudah ada dari langkah 2)

**Hasil APK:**
```
android-input\app\build\outputs\apk\debug\app-debug.apk
```

---

### Langkah 4: Install APK ke HP/Tablet

1. Copy file APK ke perangkat Android
2. Buka file APK
3. Izinkan instalasi dari sumber tidak dikenal
4. Install

---

## 📱 Perbedaan 2 Aplikasi

### 🖥️ Candra Monitoring
- **Untuk**: Display monitoring di tablet/TV
- **Mode**: Landscape only (portrait diblokir)
- **Login**: Tidak perlu
- **Fitur**: Dashboard monitoring (read-only)
- **Ukuran**: ~5-8 MB

### 📝 Candra Input Data
- **Untuk**: Input data harian oleh operator
- **Mode**: Portrait & Landscape (responsive)
- **Login**: Perlu (email + password)
- **Fitur**: Semua fitur CRUD lengkap
- **Ukuran**: ~8-12 MB

---

## ⚠️ Troubleshooting

### Error: JAVA_HOME not set
**Solusi:** Install JDK 17 dan set JAVA_HOME seperti Langkah 1

### Error: gradlew.bat not found
**Solusi:** Jalankan `npm run cap:init:monitoring` atau `npm run cap:init:input`

### Build lama sekali (>30 menit)
**Normal!** Pertama kali build akan download Android SDK (~2-3 GB). Pastikan koneksi internet stabil.

### Error lain
**Cek dokumentasi lengkap:** `PANDUAN_BUILD_APK.md`

---

## 📚 Dokumentasi Lengkap

- `README_APK_BUILD.md` - Quick start guide
- `PANDUAN_BUILD_APK.md` - Panduan detail build APK
- `PERBEDAAN_DUA_APK.md` - Perbedaan kedua aplikasi
- `SUMMARY_TWO_APK_SETUP.md` - Technical summary
- `FITUR_BARU.md` - Fitur-fitur yang sudah ditambahkan
- `LANDSCAPE_MOBILE_GUIDE.md` - Panduan landscape mobile

---

## ✨ Fitur Aplikasi

### Monitoring App
- Dashboard real-time
- KPI Cards (Populasi, Produksi, Pakan, %)
- Status Stok dengan alert visual
- Ringkasan Keuangan
- Statistik Performa
- Tabel Laporan 7 hari terakhir

### Input Data App
- Login/Register
- Daily Report (Laporan Harian)
- Warehouse (Gudang Pakan)
- Penjualan
- Operasional
- Finance
- Pengaturan
- Export PDF
- Backup & Restore
- Low Stock Notifications
- Keyboard Shortcuts

---

## 🎯 Next Steps

1. ✅ Install JDK 17
2. ✅ Jalankan `build-monitoring-apk.bat`
3. ✅ Jalankan `build-input-apk.bat`
4. ✅ Install kedua APK ke device
5. ✅ Test aplikasi

---

## 💡 Tips

- Kedua APK bisa diinstall di device yang sama (App ID berbeda)
- Data yang diinput di Input App langsung muncul di Monitoring App
- Untuk update aplikasi, cukup build ulang dan install APK baru
- APK ini adalah DEBUG version (untuk testing)
- Untuk production/Play Store, perlu build RELEASE version

---

## 🆘 Butuh Bantuan?

Baca dokumentasi lengkap di:
- `PANDUAN_BUILD_APK.md` - Troubleshooting detail
- `README_APK_BUILD.md` - FAQ dan solusi

---

**Selamat mencoba! 🎉**
