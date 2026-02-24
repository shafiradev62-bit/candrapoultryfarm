# Cara Cek Data Sync APK ke Dashboard Web

## Verifikasi Data Masuk ke Dashboard Web

### 1. Pastikan Supabase Credentials Sama
Cek file `.env` di root project:
```
VITE_SUPABASE_URL=https://gioocsxzhcfvogjgzeqh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Cara Test Sync APK → Web

#### A. Input Data di APK Mobile
1. Buka APK `candra-farm-mobile-v5-FIXED.apk` di HP
2. Login dengan akun yang sama
3. Input data di salah satu menu:
   - **Input Harian**: Tambah laporan harian
   - **Stok**: Tambah stok pakan atau kurangi telur
   - **Penjualan**: Tambah penjualan telur

#### B. Cek Data di Dashboard Web
1. Buka browser di komputer/laptop
2. Akses: `http://localhost:5173` (dev) atau URL production Vercel
3. Login dengan akun yang SAMA
4. Cek halaman yang sesuai:
   - **Dashboard** (Index.tsx): Lihat ringkasan data terbaru
   - **Laporan Harian** (DailyReportPage.tsx): Cek laporan yang baru diinput
   - **Gudang** (WarehousePage.tsx): Cek stok pakan dan telur
   - **Penjualan** (PenjualanPage.tsx): Cek transaksi penjualan

### 3. Cara Kerja Sync

#### Auto-Sync dari APK
- **Push**: Data di-push ke Supabase setelah 2 detik inactivity
- **Pull**: APK polling Supabase setiap 5 detik untuk update
- **Initial Load**: Saat app start, pull semua data dari Supabase

#### Auto-Sync dari Web
- **Push**: Data di-push ke Supabase setelah 2 detik inactivity
- **Pull**: Web polling Supabase setiap 5 detik untuk update
- **Initial Load**: Saat page load, pull semua data dari Supabase

### 4. Troubleshooting

#### Data Tidak Muncul di Web
1. **Cek Console Browser**:
   - Buka Developer Tools (F12)
   - Lihat tab Console
   - Cari log: `"✅ Data loaded from Supabase"` atau `"🔄 Auto-sync: New data detected"`

2. **Cek Network Tab**:
   - Buka Developer Tools → Network
   - Filter: `supabase`
   - Lihat request ke Supabase API

3. **Cek Supabase Dashboard**:
   - Login ke: https://supabase.com/dashboard
   - Pilih project: gioocsxzhcfvogjgzeqh
   - Buka Table Editor
   - Cek tables:
     - `daily_reports`
     - `warehouse_entries`
     - `sales_entries`
     - `operational_entries`
     - `finance_entries`
     - `feed_formulas`

#### Data Tidak Muncul di APK
1. **Cek Logcat Android**:
   ```bash
   adb logcat | grep -i "supabase\|sync"
   ```

2. **Force Refresh**:
   - Close app completely
   - Clear app data (Settings → Apps → Candra Farm → Clear Data)
   - Open app again
   - Login

### 5. Test Scenario

#### Scenario 1: Input Harian
1. **Di APK**:
   - Buka menu "Input Harian"
   - Isi data: Tanggal, Ayam Mati, Produksi Telur, Total Pakan
   - Klik "Simpan"
   - Tunggu 5 detik

2. **Di Web**:
   - Refresh halaman Dashboard
   - Cek "Laporan Terakhir" - harus muncul data baru
   - Buka menu "Laporan Harian"
   - Data baru harus ada di tabel

#### Scenario 2: Tambah Stok Pakan
1. **Di APK**:
   - Buka menu "Stok"
   - Pilih salah satu pakan (Jagung/Konsentrat/Dedak)
   - Klik tombol quick add (+10, +50, +100) atau Custom
   - Tunggu 5 detik

2. **Di Web**:
   - Refresh halaman Dashboard
   - Cek "Stok Pakan" - angka harus update
   - Buka menu "Gudang"
   - Cek tab "Stok Pakan" - data baru harus ada

#### Scenario 3: Penjualan Telur
1. **Di APK**:
   - Buka menu "Penjualan"
   - Isi kategori telur (SS, M, L, XL, dll) dengan tray dan harga
   - Klik "Simpan Penjualan"
   - Tunggu 5 detik

2. **Di Web**:
   - Refresh halaman Dashboard
   - Cek "Stok Telur" - harus berkurang
   - Buka menu "Penjualan"
   - Data penjualan baru harus ada di tabel
   - Buka menu "Keuangan"
   - Transaksi penjualan harus tercatat sebagai Credit

### 6. Expected Behavior

✅ **Data harus sync dalam 5-10 detik**
✅ **Tidak perlu refresh manual** (auto-polling setiap 5 detik)
✅ **Data konsisten** antara APK dan Web
✅ **Offline support**: Data tersimpan di LocalStorage, sync saat online

### 7. Verifikasi Supabase Tables

Buka Supabase Dashboard dan cek struktur tables:

#### daily_reports
- Columns: no, tanggal, usia, jumlahAyam, kematian, jualAyam, totalPakan, jagung, konsentrat, dedak, vitaminObat, prodButir, prodTray, reject, pctProduksi, keterangan

#### warehouse_entries
- Columns: no, tanggal, addJagung, addKonsentrat, addDedak, stokJagung, stokKonsentrat, stokDedak, telurButir, telurTray

#### sales_entries
- Columns: no, tanggal, ssTray, ssHarga, mTray, mHarga, lTray, lHarga, xlTray, xlHarga, xxlTray, xxlHarga, rejectTray, rejectHarga, ayam, ayamHarga, kohe, koheHarga, totalButir, totalRp, keterangan

#### feed_formulas
- Columns: id, name, corn_pct, concentrate_pct, bran_pct, is_active, created_at

## Kesimpulan

Jika semua langkah di atas sudah dilakukan dan data masih tidak sync:
1. Cek koneksi internet di HP dan komputer
2. Pastikan credentials Supabase benar
3. Cek Supabase Dashboard untuk melihat data langsung di database
4. Lihat console log untuk error messages
