# Auto-Sync Guide - Real-Time Data Synchronization

## Overview

Web dashboard sekarang memiliki **auto-sync real-time** yang otomatis mendeteksi perubahan data dari APK mobile dalam hitungan detik.

## How It Works

### 1. Polling Mechanism (Every 3 Seconds)
```typescript
// AppDataContext.tsx
setInterval(() => {
  // Check LocalStorage for changes
  // Compare with current data
  // Update if different
}, 3000); // Poll every 3 seconds
```

### 2. Storage Event Listener (Cross-Tab)
```typescript
window.addEventListener("storage", (e) => {
  // Triggered when LocalStorage changes in another tab/window
  // Instant sync for same browser
});
```

### 3. Visual Sync Indicator
- **Green dot (pulsing)**: Data sedang sync
- **Gray dot**: Idle
- **Text**: Menampilkan waktu sync terakhir
  - "Baru saja" (< 10 detik)
  - "X detik lalu" (< 60 detik)
  - "X menit lalu" (< 60 menit)
  - "HH:mm" (> 60 menit)

## Features

### ✅ Real-Time Sync (3 Second Interval)
- Web dashboard otomatis cek perubahan setiap 3 detik
- Tidak perlu refresh manual
- Data dari APK langsung muncul di web

### ✅ Smart Change Detection
- Menggunakan hash comparison untuk efisiensi
- Hanya update jika data benar-benar berubah
- Menghindari re-render yang tidak perlu

### ✅ Visual Feedback
- Sync indicator di header dashboard
- Menampilkan status sync real-time
- Timestamp last sync

### ✅ Manual Refresh Button
- Tombol "Refresh" tetap tersedia
- Untuk force reload jika diperlukan
- Reload seluruh halaman

## Usage Scenarios

### Scenario 1: Input dari APK
1. User input daily report di APK mobile
2. Data tersimpan ke LocalStorage
3. **Dalam 3 detik**, web dashboard otomatis detect perubahan
4. Dashboard update dengan data baru
5. Sync indicator berubah jadi hijau (pulsing)
6. Text menampilkan "Baru saja"

### Scenario 2: Multiple Devices
1. APK di HP Android (LocalStorage device A)
2. Web di laptop (LocalStorage device B)
3. Keduanya menggunakan browser yang sama (Chrome)
4. Data sync via cloud/shared storage
5. Web polling detect perubahan setiap 3 detik

### Scenario 3: Same Browser Different Tabs
1. APK PWA di tab 1 (localhost:5174)
2. Web dashboard di tab 2 (localhost:5173 atau Vercel)
3. Input di tab 1
4. **Instant sync** ke tab 2 via storage event
5. Backup polling setiap 3 detik

## Technical Details

### LocalStorage Key
```typescript
const STORAGE_KEY = "candra-appdata-v1";
```

### Data Structure
```typescript
{
  warehouseEntries: WarehouseRow[],
  salesEntries: SalesRow[],
  operationalEntries: OperationalRow[],
  dailyReports: DailyReportRow[],
  financeEntries: FinanceRow[],
  feedFormulas: FeedFormulaRow[]
}
```

### Sync Interval
- **Polling**: 3 seconds (3000ms)
- **Storage Event**: Instant (0ms delay)
- **Visual Indicator**: 1 second animation

### Performance Optimization
1. **Hash Comparison**: Quick check sebelum parse JSON
2. **Deep Comparison**: Hanya update jika data berbeda
3. **Debounced Updates**: Menghindari multiple re-renders
4. **Cleanup**: Clear interval on unmount

## Configuration

### Change Polling Interval
Edit `AppDataContext.tsx`:
```typescript
const pollInterval = setInterval(() => {
  // ... sync logic
}, 3000); // Change this value (in milliseconds)

// Examples:
// 1000 = 1 second (very fast, high CPU usage)
// 3000 = 3 seconds (recommended)
// 5000 = 5 seconds (slower but less CPU)
// 10000 = 10 seconds (slow but minimal CPU)
```

### Disable Auto-Sync
Comment out the polling effect in `AppDataContext.tsx`:
```typescript
// Real-time polling sync for APK <-> Web (every 3 seconds)
/*
useEffect(() => {
  // ... polling code
}, [warehouseEntries, ...]);
*/
```

## Monitoring & Debugging

### Console Logs
```typescript
// When data syncs from another tab/window
console.log("🔄 Data synced from another tab/window");

// When polling detects changes
console.log("🔄 Auto-sync: New data detected from APK");

// On error
console.error("Polling sync error:", error);
```

### Browser DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Select Local Storage
4. Find key: `candra-appdata-v1`
5. Watch for changes in real-time

### Network Tab
- No network requests for LocalStorage sync
- All sync happens client-side
- Very fast and efficient

## Troubleshooting

### Data not syncing
**Problem**: Input di APK tapi tidak muncul di web

**Solutions**:
1. Check LocalStorage key sama: `candra-appdata-v1`
2. Pastikan APK dan web di device yang sama
3. Cek console untuk error messages
4. Klik tombol "Refresh" manual
5. Restart browser

### Sync too slow
**Problem**: Data butuh waktu lama untuk muncul

**Solutions**:
1. Reduce polling interval (dari 3s ke 1s)
2. Check browser performance
3. Clear browser cache
4. Close unused tabs

### High CPU usage
**Problem**: Browser menggunakan banyak CPU

**Solutions**:
1. Increase polling interval (dari 3s ke 5s atau 10s)
2. Disable auto-sync jika tidak diperlukan
3. Use manual refresh button instead

## Best Practices

### For Development
- Use 3 second interval (default)
- Monitor console logs
- Test with multiple tabs

### For Production
- Keep 3 second interval (good balance)
- Monitor user feedback
- Adjust based on usage patterns

### For Low-End Devices
- Increase to 5-10 seconds
- Reduce visual animations
- Use manual refresh more often

## Future Improvements

### Possible Enhancements
1. **WebSocket Integration**: Real-time push instead of polling
2. **Service Worker**: Background sync when offline
3. **Conflict Resolution**: Handle simultaneous edits
4. **Sync History**: Track all sync events
5. **Selective Sync**: Only sync changed tables

### Cloud Sync (Optional)
- Integrate with Supabase Realtime
- Sync across different devices
- Backup to cloud storage
- Multi-user collaboration

## Summary

✅ Auto-sync setiap 3 detik
✅ Visual indicator di dashboard
✅ Smart change detection
✅ Efficient performance
✅ Manual refresh available
✅ Cross-tab instant sync
✅ Console logging for debugging

Data dari APK sekarang otomatis muncul di web dashboard dalam hitungan detik! 🚀
