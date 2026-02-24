# 📱 Cara Install APK Candra Poultry Farm v2.1

## 🎯 Fitur Utama v2.1
- ✅ **Auto-Navigate**: Otomatis ke dashboard setelah input harian
- ✅ **Real-time Sync**: Data sync otomatis setiap 5 detik
- ✅ **Cross-Platform**: Sync antara Web, PWA, dan Mobile App
- ✅ **Offline Support**: Data tersimpan lokal dan sync saat online

## 📥 Download APK

**File APK:** `CandraPoultryFarm-v2-20260224-2041.apk`

**Lokasi:**
- GitHub: https://github.com/shafiradev62-bit/candrapoultryfarm
- Folder: Root directory

**Ukuran:** ~6.3 MB

## 🔧 Cara Install

### 1. Download APK
```
1. Buka GitHub repository
2. Download file: CandraPoultryFarm-v2-20260224-2041.apk
3. Simpan di folder Downloads
```

### 2. Enable Unknown Sources (Jika Belum)
```
1. Buka Settings → Security
2. Enable "Unknown Sources" atau "Install from Unknown Sources"
3. Pilih browser/file manager yang akan digunakan
```

### 3. Install APK
```
1. Buka File Manager
2. Cari file CandraPoultryFarm-v2-20260224-2041.apk
3. Tap file APK
4. Tap "Install"
5. Tunggu proses instalasi selesai
6. Tap "Open" atau buka dari app drawer
```

### 4. Login & Sync Data
```
1. Buka aplikasi
2. Login dengan akun:
   - Owner: owner / owner123
   - Worker: worker / worker123
3. Data akan otomatis di-pull dari Supabase
4. Tunggu beberapa detik untuk sync pertama kali
```

## ⚠️ Catatan Penting

### Uninstall Versi Lama
Jika sudah install versi sebelumnya:
```
1. Uninstall aplikasi lama terlebih dahulu
2. Install APK baru
3. Login kembali
4. Data akan otomatis sync dari Supabase
```

### Koneksi Internet
- **Wajib** untuk sync data pertama kali
- **Wajib** untuk push/pull data ke/dari Supabase
- Offline mode: Data tersimpan lokal, sync saat online

### Permissions
APK memerlukan permissions:
- ✅ Internet Access (untuk sync data)
- ✅ Storage (untuk cache data)

## 🔄 Cara Kerja Sync

### Auto-Sync Mechanism
```
1. Input Data → Simpan ke Local State
2. Auto-push ke Supabase (delay 2 detik)
3. Auto-pull dari Supabase (setiap 5 detik)
4. Update UI dengan data terbaru
```

### Multi-Device Sync
```
Device A: Input data → Push to Supabase
Device B: Auto-pull (5 detik) → Update UI
Device C: Auto-pull (5 detik) → Update UI
```

## 🐛 Troubleshooting

### Data Tidak Muncul
```
1. Pastikan koneksi internet aktif
2. Tunggu 5-10 detik untuk auto-sync
3. Refresh dengan pull-down gesture
4. Logout dan login kembali
```

### APK Tidak Bisa Install
```
1. Pastikan "Unknown Sources" sudah enabled
2. Hapus APK lama jika ada
3. Download ulang APK
4. Cek storage space (minimal 50 MB free)
```

### Sync Lambat
```
1. Cek koneksi internet
2. Pastikan Supabase tidak down
3. Clear app cache
4. Reinstall aplikasi
```

## 📊 Testing

APK sudah ditest pada:
- ✅ Android 8.0+ (Oreo)
- ✅ Android 9.0 (Pie)
- ✅ Android 10 (Q)
- ✅ Android 11 (R)
- ✅ Android 12+ (S)

## 🔐 Security

- Data encrypted saat transit (HTTPS)
- Supabase Row Level Security (RLS) enabled
- Local storage encrypted
- Session management dengan JWT

## 📞 Support

Jika ada masalah:
1. Cek CHANGELOG-v2.1.md untuk detail update
2. Cek CARA-CEK-DATA-SYNC.md untuk troubleshooting sync
3. Contact developer

## 🚀 Next Version

Fitur yang akan datang:
- Push notifications untuk data changes
- Offline queue untuk sync
- Conflict resolution
- Export data to Excel/PDF
- Backup & restore

---

**Version:** v2.1  
**Build Date:** 24 Februari 2026  
**Build Time:** 20:41  
**APK Size:** 6.3 MB  
**Min Android:** 8.0 (API 26)  
**Target Android:** 14 (API 34)
