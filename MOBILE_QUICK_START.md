# 📱 Mobile App - Quick Start Guide

## 🚀 Cara Cepat Build APK

### Windows (Recommended)
```bash
# 1. Double-click file ini:
build-mobile-apk.bat

# 2. Tunggu sampai selesai
# 3. APK ada di: candra-mobile-debug.apk
```

### Manual (Semua OS)
```bash
# 1. Build web app
npm run build:mobile

# 2. Sync ke Android
npx cap sync android --config capacitor.config.mobile.ts

# 3. Build APK
cd android-mobile
./gradlew assembleDebug
cd ..

# 4. APK ada di:
# android-mobile/app/build/outputs/apk/debug/app-debug.apk
```

## 🧪 Testing di Browser

```bash
# Jalankan dev server
npm run dev:mobile

# Buka browser
http://localhost:8080

# Gunakan Chrome DevTools:
# F12 > Toggle Device Toolbar (Ctrl+Shift+M)
# Pilih device: iPhone 12 Pro atau Pixel 5
```

## 📲 Install di HP

### Via USB
```bash
# 1. Enable USB Debugging di HP
# 2. Sambungkan HP ke PC
# 3. Install APK
adb install candra-mobile-debug.apk
```

### Via File Transfer
```bash
# 1. Copy file candra-mobile-debug.apk ke HP
# 2. Buka file di HP
# 3. Install (allow unknown sources jika diminta)
```

## 🎯 Fitur Utama

### 1. Login
- Username: `owner` atau `worker`
- Password: `owner123` atau `worker123`

### 2. Dashboard
- Lihat stok real-time
- Alert jika stok menipis
- Laporan terakhir

### 3. Input Harian (3 Steps)
- **Step 1**: Info ayam (mati, jual)
- **Step 2**: Produksi telur
- **Step 3**: Pakan (dengan validasi stok)

### 4. Stok
- **Telur**: Bottom sheet untuk kurangi stok
  - Quick select: 1-20 tray
  - Input manual
- **Pakan**: Quick add +10, +50, +100 kg

### 5. Penjualan
- Input per kategori (SS, M, L, XL, XXL, Reject)
- Auto-calculate total
- Auto-reduce stock

### 6. Profil
- Info user
- Logout

## 💾 Data Sync

### Cara Kerja
- Data disimpan di **LocalStorage** browser
- Sama dengan versi web
- Otomatis sync antar platform
- Tidak perlu internet (offline-first)

### Backup Data
```bash
# Di browser/app:
# 1. Buka DevTools (jika di browser)
# 2. Application > Local Storage
# 3. Copy semua data
# 4. Simpan ke file .json
```

## 🐛 Troubleshooting

### APK tidak bisa install
```bash
# Solusi:
# 1. Enable "Install from Unknown Sources"
# 2. Settings > Security > Unknown Sources
```

### Data hilang
```bash
# Solusi:
# 1. Jangan clear app data
# 2. Jangan uninstall app
# 3. Backup LocalStorage secara berkala
```

### Build error
```bash
# Solusi:
# 1. Delete folder android-mobile
# 2. Run: npx cap sync android --config capacitor.config.mobile.ts
# 3. Build ulang
```

### Gradle error
```bash
# Solusi:
# 1. Update Android Studio
# 2. Update Android SDK
# 3. Clean project: cd android-mobile && ./gradlew clean
```

## 📝 Tips

### Development
- Gunakan browser untuk testing cepat
- Hot reload otomatis saat dev
- Check console untuk error

### Production
- Test di real device sebelum deploy
- Backup data sebelum update
- Versioning APK untuk tracking

### Performance
- Clear cache jika app lambat
- Restart app jika ada masalah
- Update ke versi terbaru

## 🔧 Konfigurasi

### Port Development
```typescript
// vite.config.mobile.ts
server: {
  port: 8080  // Ubah jika port bentrok
}
```

### App ID
```typescript
// capacitor.config.mobile.ts
appId: 'com.candra.poultryfarm.mobile'  // Ubah untuk custom
```

### Theme Color
```typescript
// index.mobile.html
<meta name="theme-color" content="#10b981" />  // Ubah warna
```

## 📚 Resources

- **Full Guide**: MOBILE_APP_GUIDE.md
- **Web Version**: README.md
- **Build APK**: CARA_BUILD_APK.md

## ✅ Checklist Build

- [ ] Install dependencies: `npm install`
- [ ] Test di browser: `npm run dev:mobile`
- [ ] Build production: `npm run build:mobile`
- [ ] Sync Capacitor: `npx cap sync android --config capacitor.config.mobile.ts`
- [ ] Build APK: `build-mobile-apk.bat`
- [ ] Test APK di device
- [ ] Verify data sync
- [ ] Check all features
- [ ] Ready to deploy! 🎉

## 🆘 Need Help?

1. Check MOBILE_APP_GUIDE.md untuk detail
2. Check console untuk error messages
3. Clear cache dan rebuild
4. Contact developer

---

**Happy Coding! 🚀**
