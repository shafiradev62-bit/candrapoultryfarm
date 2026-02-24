# Real Test Instructions - Auto-Sync Verification

## 🧪 Test Setup

Saya sudah membuat test page yang bisa kamu gunakan untuk verify auto-sync bekerja dengan benar.

## Method 1: Test dengan Test Page (Recommended)

### Step 1: Buka Test Page
```bash
# Di browser, buka file:
peternak-pro-main/test-auto-sync.html
```

Atau buka langsung di browser dengan path:
```
file:///C:/Users/Lenovo/Downloads/peternak-pro-main (1)/peternak-pro-main/test-auto-sync.html
```

### Step 2: Test Single Tab
1. Input data di panel kiri (Simulate APK Input)
2. Klik "Simpan ke LocalStorage"
3. **Dalam 1 detik**, data akan muncul di panel kanan (Web Dashboard View)
4. Cek sync indicator berubah hijau (pulsing)
5. Cek "Last Sync" dan "Sync Count" bertambah

### Step 3: Test Cross-Tab Sync
1. Buka test page di 2 tab berbeda
2. Input data di Tab 1
3. **Instant**, data muncul di Tab 2 (storage event)
4. Coba sebaliknya, input di Tab 2, muncul di Tab 1

### Expected Results:
- ✅ Data muncul dalam 1 detik
- ✅ Sync indicator berubah hijau
- ✅ Last Sync timestamp update
- ✅ Sync Count bertambah
- ✅ Cross-tab sync instant (0ms delay)

## Method 2: Test dengan Real App

### Step 1: Run PWA Mobile
```bash
cd peternak-pro-main
npm run dev:pwa
```
Buka: `http://localhost:5174`

### Step 2: Run Web Dashboard (Tab Baru)
```bash
cd peternak-pro-main
npm run dev
```
Buka: `http://localhost:5173`

### Step 3: Test Input
1. Login di PWA (localhost:5174)
2. Login di Web (localhost:5173)
3. Input daily report di PWA
4. **Dalam 3 detik**, cek web dashboard
5. Data harus muncul otomatis

### Expected Results:
- ✅ Data dari PWA muncul di web dalam 3 detik
- ✅ Sync indicator di web berubah hijau
- ✅ Text "Baru saja" muncul
- ✅ Dashboard update tanpa refresh

## Method 3: Test dengan APK Real

### Step 1: Install APK
```bash
# Copy APK ke HP Android
candra-farm-pwa-debug.apk

# Install di HP
```

### Step 2: Open Web Dashboard
```bash
# Di laptop/PC, buka:
https://your-vercel-url.vercel.app

# Atau localhost:
npm run dev
# Buka: http://localhost:5173
```

### Step 3: Test Input
1. Login di APK (HP Android)
2. Login di Web (Laptop/PC)
3. Input daily report di APK
4. **Tunggu 3-10 detik**
5. Klik "Refresh" di web dashboard
6. Data harus muncul

### Expected Results:
- ✅ Data dari APK tersimpan ke LocalStorage
- ✅ Web dashboard detect perubahan (polling)
- ✅ Data muncul setelah refresh
- ✅ Sync indicator update

## Verification Checklist

### ✅ LocalStorage Check
1. Buka DevTools (F12)
2. Go to Application > Local Storage
3. Find key: `candra-appdata-v1`
4. Verify data structure:
```json
{
  "warehouseEntries": [...],
  "salesEntries": [...],
  "operationalEntries": [...],
  "dailyReports": [...],  // Check this array
  "financeEntries": [...],
  "feedFormulas": [...]
}
```

### ✅ Console Logs Check
Open Console (F12) and look for:
```
🔄 Auto-sync: New data detected from APK
✅ Data saved to LocalStorage
⚡ Storage event detected (cross-tab sync)
```

### ✅ Visual Indicators Check
- Green pulsing dot when syncing
- Gray dot when idle
- "Baru saja" text after sync
- "X detik lalu" after some time

## Troubleshooting

### Data tidak muncul
1. Check LocalStorage key: `candra-appdata-v1`
2. Check console for errors
3. Try manual refresh button
4. Clear browser cache and retry

### Sync terlalu lambat
1. Check polling interval (default 3 seconds)
2. Check browser performance
3. Close unused tabs

### Cross-tab tidak work
1. Pastikan same browser
2. Check storage event listener
3. Try different browser

## Real Test Results

Setelah test, catat hasil:

### Test 1: Single Tab
- [ ] Data muncul dalam 1 detik
- [ ] Sync indicator berubah hijau
- [ ] Stats update (Last Sync, Sync Count)

### Test 2: Cross-Tab
- [ ] Data sync instant antar tab
- [ ] Storage event triggered
- [ ] Both tabs update

### Test 3: PWA <-> Web
- [ ] Data dari PWA muncul di web
- [ ] Polling detect perubahan
- [ ] Dashboard update otomatis

### Test 4: APK <-> Web
- [ ] Data dari APK tersimpan
- [ ] Web detect perubahan
- [ ] Manual refresh work

## Conclusion

Jika semua test passed, maka auto-sync bekerja dengan benar! ✅

Jika ada yang fail, check:
1. LocalStorage key sama
2. Polling interval running
3. Storage event listener active
4. Console logs untuk error
