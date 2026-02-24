# Rebuild APK Mobile PWA - Updated Version

## Yang Sudah Diupdate:
✅ Logo Capacitor diganti dengan logo login (semua densitas)
✅ Layout mobile responsive dengan safe-area-inset
✅ Viewport-fit=cover untuk full screen
✅ Bottom navigation dengan safe area support
✅ Compact layout untuk semua ukuran HP
✅ Calendar modal fixed center (tidak terpotong)
✅ Supabase sync sudah terintegrasi di AppDataContext

## Cara Rebuild APK:

### 1. Build PWA Production
```bash
npm run build:pwa
```

### 2. Sync ke Capacitor
```bash
npx cap sync
```

### 3. Build APK Debug
```bash
cd android
./gradlew assembleDebug
```

### 4. APK Location
APK akan ada di:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Copy APK ke Root (Opsional)
```bash
copy android\app\build\outputs\apk\debug\app-debug.apk candra-farm-pwa-v2.apk
```

## Atau Gunakan Script Otomatis:

### Windows:
```bash
.\build-mobile-apk.bat
```

Script akan otomatis:
1. Build PWA production
2. Sync Capacitor
3. Build APK debug
4. Copy APK ke root folder

## Fitur Mobile PWA v2:

### Layout & Responsive:
- ✅ Safe area inset untuk notch/home indicator
- ✅ Viewport-fit=cover untuk full screen
- ✅ Bottom navigation tidak menutupi konten
- ✅ Compact layout untuk HP kecil
- ✅ No horizontal scroll
- ✅ Box-sizing: border-box untuk semua element

### Calendar:
- ✅ Modal portal dengan z-index tertinggi
- ✅ Fixed center position
- ✅ Tidak terpotong di HP kecil
- ✅ Backdrop blur effect

### Supabase Sync:
- ✅ Auto-pull on app start
- ✅ Auto-push setelah 2 detik inactivity
- ✅ Polling setiap 5 detik untuk update
- ✅ Real-time sync APK ↔ Web

### Icon & Branding:
- ✅ Logo sama dengan halaman login
- ✅ Semua densitas (hdpi, mdpi, xhdpi, xxhdpi, xxxhdpi)
- ✅ Round icon support
- ✅ Foreground icon support

## Testing Checklist:

### Layout Test:
- [ ] Buka di HP kecil (< 5 inch)
- [ ] Buka di HP besar (> 6 inch)
- [ ] Check bottom navigation tidak menutupi tombol
- [ ] Check tidak ada horizontal scroll
- [ ] Check semua input field visible

### Calendar Test:
- [ ] Buka date picker di Input page
- [ ] Calendar muncul di tengah layar
- [ ] Calendar tidak terpotong
- [ ] Bisa pilih tanggal dengan mudah
- [ ] Modal close dengan tap backdrop

### Supabase Sync Test:
- [ ] Input data di APK
- [ ] Tunggu 5-10 detik
- [ ] Buka web dashboard
- [ ] Data harus muncul di web
- [ ] Input data di web
- [ ] Refresh APK atau tunggu 5 detik
- [ ] Data harus muncul di APK

## Environment Variables:

Pastikan `.env` sudah ada dengan Supabase credentials:
```
VITE_SUPABASE_URL=https://gioocsxzhcfvogjgzeqh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Troubleshooting:

### APK tidak connect ke Supabase:
1. Check `.env` file ada di root folder
2. Rebuild dengan `npm run build:pwa`
3. Sync ulang dengan `npx cap sync`
4. Build ulang APK

### Layout masih terlalu besar:
1. Check di Chrome DevTools mobile view
2. Pastikan viewport-fit=cover di index.pwa.html
3. Check PWALayout padding sudah pakai safe-area-inset

### Calendar terpotong:
1. Check PWACalendarModal z-index: 9999
2. Check createPortal ke document.body
3. Check modal position: fixed center

## Next Steps:

Setelah APK berhasil di-build:
1. Install di HP untuk testing
2. Test semua fitur (Input, Stok, Penjualan)
3. Test Supabase sync dengan web
4. Kalau OK, bisa distribute ke user
