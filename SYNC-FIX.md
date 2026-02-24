# Fix: Data Sync PWA ↔️ Web Dashboard

## Masalah
Data yang diinput di PWA mobile tidak muncul di dashboard web.

## Penyebab
1. LocalStorage tidak ter-sync otomatis antar tab/window
2. Context tidak ter-update ketika data berubah dari aplikasi lain

## Solusi yang Diterapkan

### 1. Auto-Sync Listener (AppDataContext.tsx)
Menambahkan event listener untuk mendeteksi perubahan LocalStorage dari tab/window lain:

```typescript
// Listen for storage changes from other tabs/windows (PWA <-> Web sync)
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      // Auto-reload data dari LocalStorage
      const newData = JSON.parse(e.newValue);
      setWarehouseEntries(newData.warehouseEntries || []);
      setSalesEntries(newData.salesEntries || []);
      setOperationalEntries(newData.operationalEntries || []);
      setDailyReports(newData.dailyReports || []);
      setFinanceEntries(newData.financeEntries || []);
      setFeedFormulas(newData.feedFormulas || []);
    }
  };
  
  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);
```

### 2. Manual Refresh Button (Index.tsx)
Menambahkan tombol "Refresh" di dashboard web untuk reload data secara manual:

```typescript
const handleRefreshData = () => {
  window.location.reload();
  toast({ title: "Data Diperbarui", description: "Dashboard telah dimuat ulang" });
};
```

## Cara Menggunakan

### Otomatis (Antar Tab/Window)
1. Buka web dashboard di satu tab: `http://localhost:5173`
2. Buka PWA di tab lain: `http://localhost:5174`
3. Input data di PWA
4. **Web dashboard akan otomatis ter-update** ketika kamu kembali ke tab web

### Manual (Tombol Refresh)
1. Setelah input data di PWA
2. Buka web dashboard
3. Klik tombol **"Refresh"** di header (sebelah tombol "Kirim Laporan")
4. Data akan ter-reload dari LocalStorage

## Catatan Penting

⚠️ **Storage Event Limitation**: 
- `storage` event hanya trigger antar tab/window yang berbeda
- Jika PWA dan Web dibuka di browser yang sama, event akan bekerja
- Jika PWA dibuka sebagai standalone app (installed PWA), perlu manual refresh

✅ **Best Practice**:
- Gunakan tombol Refresh setelah input data di PWA
- Atau buka PWA dan Web di tab berbeda dalam satu browser untuk auto-sync

## Testing

1. **Test Auto-Sync**:
   ```bash
   # Terminal 1 - Web
   npm run dev
   
   # Terminal 2 - PWA
   npm run dev:pwa
   ```
   - Buka `localhost:5173` (web) di tab 1
   - Buka `localhost:5174` (pwa) di tab 2
   - Input daily report di PWA
   - Switch ke tab web → data otomatis muncul

2. **Test Manual Refresh**:
   - Input data di PWA
   - Buka web dashboard
   - Klik tombol "Refresh"
   - Data muncul

## Storage Key
Kedua aplikasi menggunakan LocalStorage key yang sama:
```typescript
const STORAGE_KEY = "candra-appdata-v1";
```

Ini memastikan data tersimpan di tempat yang sama dan bisa diakses oleh web dan PWA.
