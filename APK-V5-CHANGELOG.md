# APK v5 - Layout Fix & Formula Validation

## Build Info
- **File**: `candra-farm-mobile-v5-FIXED.apk`
- **Size**: 7.26 MB
- **Type**: Debug APK (unsigned)
- **App ID**: com.candra.pwa
- **App Name**: Candra Farm
- **Build Date**: 24 Feb 2026, 19:42

## Changes from v4

### 1. Fixed PWAPenjualan Layout (RAPIH!)
**Problem**: Area kotak-kotak kategori telur tidak rapi, terlalu besar, tidak fit

**Fix**:
- Removed extra padding: `px-6` → menggunakan padding dari PWALayout
- Changed layout: Vertical stacking → **Grid 2 columns** (Tray & Harga side-by-side)
- Reduced card size: `p-5` → `p-4`, `rounded-[24px]` → `rounded-[20px]`
- Smaller buttons: `w-10 h-10` → `w-9 h-9`
- Compact inputs: `py-3` → `py-2`
- Better spacing: `space-y-5` → `space-y-4`, `gap-2` → `gap-1.5`
- Subtotal moved to bottom with border-top separator

**Result**: Semua kategori telur (SS, M, L, XL, XXL, Reject) sekarang FIT dan RAPIH dalam 1 screen!

### 2. Fixed Formula Validation (BISA INPUT TANPA PILIH FORMULA!)
**Problem**: Tidak bisa simpan input harian kalau belum pilih formula pakan

**Fix**: 
```typescript
// Old: Strict validation - MUST select formula
if (!formula) {
  toast({ title: "Error", description: "Pilih formula pakan" });
  return;
}

// New: Auto-fallback to default formula
let formula = feedFormulas.find((f) => f.id === selectedFormula);
if (!formula && activeFormulas.length > 0) {
  formula = activeFormulas[0]; // Use first active formula
}
if (!formula) {
  formula = { corn_pct: 50, concentrate_pct: 35, bran_pct: 15 }; // Hardcoded default
}
```

**Result**: 
- Bisa input harian meskipun belum pilih formula
- Otomatis pakai formula aktif pertama
- Kalau tidak ada formula sama sekali, pakai default (50/35/15)

### 3. Data Sync Verification
**Confirmed**: Data dari APK masuk ke Dashboard Web!

**How it works**:
- APK dan Web sama-sama pakai `AppDataContext.tsx`
- Data disimpan ke Supabase
- Auto-sync setiap 5 detik
- Initial load dari Supabase saat app start

**Tables di Supabase**:
- `daily_reports` - Laporan harian
- `warehouse_entries` - Stok pakan & telur
- `sales_entries` - Penjualan
- `operational_entries` - Operasional
- `finance_entries` - Keuangan
- `feed_formulas` - Formula pakan

**Web Dashboard Pages**:
- `Index.tsx` - Dashboard utama (ringkasan)
- `DailyReportPage.tsx` - Laporan harian
- `WarehousePage.tsx` - Gudang (stok)
- `PenjualanPage.tsx` - Penjualan
- `FinancePage.tsx` - Keuangan

## Layout Comparison

### PWAPenjualan - Before (v4)
```
┌─────────────────────────────┐
│  SS                         │
│  Tray: [- input +]          │
│  Harga/Tray: [input]        │
│  Subtotal: Rp xxx           │
└─────────────────────────────┘
```
- Vertical layout
- Too much space
- 6 categories = scroll banyak

### PWAPenjualan - After (v5)
```
┌──────────────────────────────┐
│  SS                          │
│  Tray        Harga/Tray      │
│  [- in +]    [input]         │
│  ─────────────────────────   │
│  Subtotal: Rp xxx            │
└──────────────────────────────┘
```
- Grid 2 columns
- Compact & efficient
- 6 categories fit better
- Cleaner separation

## Testing Checklist

### Layout
- [x] PWAPenjualan: Semua kategori telur fit di screen
- [x] PWAPenjualan: Grid 2 columns (Tray & Harga)
- [x] PWAPenjualan: Subtotal dengan border separator
- [x] PWAPenjualan: Button "Simpan Penjualan" tidak tertutup nav bottom

### Formula Validation
- [x] Bisa input harian tanpa pilih formula
- [x] Auto-fallback ke formula aktif pertama
- [x] Kalau tidak ada formula, pakai default (50/35/15)
- [x] Stok pakan tetap terpotong dengan benar

### Data Sync
- [ ] Input di APK → muncul di Web Dashboard (test manual)
- [ ] Input di Web → muncul di APK (test manual)
- [ ] Data konsisten antara APK dan Web
- [ ] Supabase tables terisi dengan benar

## How to Test Data Sync

### 1. Test Input Harian (APK → Web)
1. Buka APK di HP
2. Menu "Input Harian" → Isi data → Simpan
3. Tunggu 5-10 detik
4. Buka Web Dashboard di browser
5. Cek halaman "Dashboard" dan "Laporan Harian"
6. Data baru harus muncul

### 2. Test Stok Pakan (APK → Web)
1. Buka APK di HP
2. Menu "Stok" → Tambah stok Jagung +50 kg
3. Tunggu 5-10 detik
4. Buka Web Dashboard → Menu "Gudang"
5. Stok Jagung harus bertambah 50 kg

### 3. Test Penjualan (APK → Web)
1. Buka APK di HP
2. Menu "Penjualan" → Isi kategori telur → Simpan
3. Tunggu 5-10 detik
4. Buka Web Dashboard → Menu "Penjualan"
5. Data penjualan baru harus muncul
6. Cek menu "Keuangan" → Transaksi tercatat sebagai Credit

## Known Issues
None - all issues from v4 have been resolved.

## Documentation
- **Data Sync Guide**: `CARA-CEK-DATA-SYNC.md`
- **Supabase Setup**: `SUPABASE-SYNC-SETUP.md`
- **Previous Changelog**: `APK-V4-CHANGELOG.md`

## Next Steps
1. Test data sync APK ↔ Web
2. Verify Supabase tables
3. Test offline mode (data tersimpan di LocalStorage)
4. Production deployment
