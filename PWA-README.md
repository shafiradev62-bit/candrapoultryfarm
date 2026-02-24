# Candra Poultry Farm - PWA Mobile App

Aplikasi mobile PWA (Progressive Web App) untuk manajemen peternakan ayam petelur.

## Fitur

- **Dashboard**: Monitoring stok pakan, telur, dan populasi ayam
- **Input Harian**: Form 3 langkah untuk input laporan harian
- **Manajemen Stok**: Pengurangan stok telur dengan bottom sheet, quick actions untuk pakan
- **Penjualan**: Input penjualan per kategori telur dengan auto sync stok
- **Profil**: Informasi user dan logout

## Karakteristik

- ✅ Portrait orientation only
- ✅ Bottom navigation (5 tabs)
- ✅ NO sidebar
- ✅ Clean design, NO AI-ish styling
- ✅ Step-by-step input form (3 steps)
- ✅ Bottom sheet for modals
- ✅ Quick action buttons
- ✅ Auto stock sync with LocalStorage
- ✅ Same data sync as web app

## Development

### Run PWA di Localhost

```bash
npm run dev:pwa
```

Aplikasi akan berjalan di: `http://localhost:5174`

### Build PWA

```bash
npm run build:pwa
```

Output akan ada di folder `dist-pwa/`

### Preview Build

```bash
npm run preview:pwa
```

## Login Credentials

- **Owner**: username: `owner`, password: `owner123`
- **Worker**: username: `worker`, password: `worker123`

## Struktur File PWA

```
src/
├── AppPWA.tsx                 # Root PWA app dengan routing
├── main-pwa.tsx              # Entry point PWA
├── components/
│   └── PWALayout.tsx         # Layout dengan bottom navigation
└── pages/pwa/
    ├── PWALogin.tsx          # Login screen
    ├── PWADashboard.tsx      # Dashboard dengan 2 kolom grid
    ├── PWAInput.tsx          # Form 3 langkah input harian
    ├── PWAStok.tsx           # Manajemen stok dengan bottom sheet
    ├── PWAPenjualan.tsx      # Input penjualan per kategori
    └── PWAProfil.tsx         # Profil user & logout

index.pwa.html                # HTML entry point
vite.config.pwa.ts            # Vite config untuk PWA
public/manifest.pwa.json      # PWA manifest
```

## Data Sync

PWA menggunakan `AppDataContext` yang sama dengan web app, sehingga data tersimpan di LocalStorage dan tersinkronisasi otomatis.

## Testing di Mobile

1. Jalankan `npm run dev:pwa`
2. Buka di browser mobile: `http://[YOUR_IP]:5174`
3. Atau gunakan Chrome DevTools > Toggle device toolbar untuk simulasi mobile

## Notes

- Aplikasi ini TERPISAH dari monitoring APK (landscape)
- PWA ini adalah aplikasi ke-3: (1) Web App, (2) Monitoring APK, (3) PWA Mobile
- Menggunakan portrait orientation only
- Bottom navigation untuk navigasi utama
- Clean & simple design
