# Perbedaan Dua APK - Candra Poultry Farm

## Overview

Proyek ini menghasilkan 2 aplikasi Android terpisah dengan tujuan berbeda:

## 1. Candra Monitoring (Monitoring APK)

### Karakteristik
- **App ID**: `com.candra.monitoring`
- **App Name**: Candra Monitoring
- **Mode Orientasi**: LANDSCAPE ONLY (portrait diblokir)
- **Akses**: Tidak perlu login (langsung ke dashboard)
- **Tujuan**: Monitoring real-time untuk display di tablet/TV

### Fitur
- Dashboard monitoring dengan auto-refresh
- KPI Cards (Populasi, Produksi, Pakan, % Produksi)
- Status Stok Pakan dengan alert visual
- Ringkasan Keuangan (Revenue, Cost, Profit)
- Statistik Performa (Total Produksi, FCR, Kematian)
- Tabel Laporan Harian (7 hari terakhir)
- READ-ONLY (tidak ada form input)

### Tampilan
- Landscape-only dengan viewport scaling
- Portrait mode menampilkan overlay: "Silakan putar perangkat ke mode Landscape"
- Optimized untuk tablet/device besar
- Auto-fit desktop layout ke mobile landscape

### Use Case
- Display monitoring di ruang kontrol
- Tablet yang dipasang di dinding
- Dashboard untuk owner/manager
- Real-time monitoring tanpa perlu login

---

## 2. Candra Input Data (Input APK)

### Karakteristik
- **App ID**: `com.candra.input`
- **App Name**: Candra Input Data
- **Mode Orientasi**: Portrait & Landscape (responsive)
- **Akses**: Perlu login (email + password)
- **Tujuan**: Input data harian oleh operator/worker

### Fitur
- Login/Register dengan Supabase Auth
- Role-based access (Owner, Worker)
- Full CRUD operations:
  - Daily Report (Laporan Harian)
  - Warehouse (Gudang Pakan)
  - Penjualan (Sales)
  - Operasional (Operational Costs)
  - Finance (Keuangan)
  - Pengaturan (Settings)
- Calendar picker untuk semua input tanggal
- Export PDF untuk laporan
- Backup & Restore data
- Keyboard shortcuts
- Low stock notifications

### Tampilan
- Sidebar navigation
- Responsive untuk semua orientasi
- Form input dengan validasi
- Tabel dengan sorting & filtering
- Dashboard dengan charts (Recharts)

### Use Case
- Input data harian oleh operator
- Pencatatan penjualan
- Manajemen stok pakan
- Pencatatan biaya operasional
- Analisis keuangan

---

## Persamaan Kedua Aplikasi

### Branding
- Logo: CANDRA POULTRY FARM (sama persis)
- Color scheme: Primary theme konsisten
- Typography: Font family sama
- Logo file: `/logo.png` (sama)

### Data Source
- Menggunakan Supabase sebagai backend
- Real-time sync antar device
- Data yang diinput di Input App langsung muncul di Monitoring App

### Technology Stack
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS + shadcn/ui
- Capacitor untuk Android
- Supabase untuk backend

---

## Kapan Menggunakan Aplikasi Mana?

### Gunakan Monitoring App Jika:
- Ingin display monitoring di tablet/TV
- Tidak perlu input data
- Hanya perlu lihat status real-time
- Device dalam mode landscape permanent

### Gunakan Input App Jika:
- Perlu input data harian
- Perlu akses semua fitur CRUD
- Operator/worker yang mencatat data
- Perlu analisis dan laporan detail

---

## Instalasi Bersamaan

Kedua APK dapat diinstall bersamaan di satu device karena:
- App ID berbeda (`com.candra.monitoring` vs `com.candra.input`)
- App Name berbeda
- Icon bisa dibedakan (opsional)

---

## Build Commands

### Build Monitoring APK
```cmd
build-monitoring-apk.bat
```
atau
```cmd
npm run build:monitoring
npm run cap:sync:monitoring
cd android-monitoring && gradlew.bat assembleDebug
```

### Build Input APK
```cmd
build-input-apk.bat
```
atau
```cmd
npm run build:input
npm run cap:sync:input
cd android-input && gradlew.bat assembleDebug
```

---

## File Structure

```
peternak-pro-main/
├── src/
│   ├── App.tsx                    # Input App (full features)
│   ├── AppMonitoring.tsx          # Monitoring App (read-only)
│   ├── main-input.tsx             # Entry point Input
│   ├── main-monitoring.tsx        # Entry point Monitoring
│   └── pages/
│       ├── MonitoringDashboard.tsx  # Monitoring page
│       ├── AuthPage.tsx             # Login page (Input only)
│       ├── Index.tsx                # Dashboard (Input)
│       └── ...                      # Other pages (Input only)
├── index.input.html               # HTML entry Input
├── index.monitoring.html          # HTML entry Monitoring
├── capacitor.config.input.ts      # Capacitor config Input
├── capacitor.config.monitoring.ts # Capacitor config Monitoring
├── vite.config.input.ts           # Vite config Input
├── vite.config.monitoring.ts      # Vite config Monitoring
├── android-input/                 # Android project Input
└── android-monitoring/            # Android project Monitoring
```

---

## Kesimpulan

Dua aplikasi ini dirancang untuk use case berbeda:
- **Monitoring**: Display-only, landscape, no login
- **Input**: Full-featured, responsive, with login

Keduanya share data yang sama melalui Supabase, sehingga data yang diinput di Input App langsung terlihat di Monitoring App secara real-time.
