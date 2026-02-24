# Candra Poultry Farm - Mobile App Guide

## Overview
Aplikasi mobile Candra Poultry Farm dibangun dengan React + Vite + Capacitor dalam satu codebase dengan versi web. Data tersinkronisasi melalui LocalStorage yang sama.

## Fitur Mobile App

### 1. Login Screen
- **UI**: Logo di tengah, form dengan rounded corners besar
- **Behavior**: Simpan session di LocalStorage, redirect ke Dashboard
- **Credentials**:
  - Owner: `owner` / `owner123`
  - Worker: `worker` / `worker123`

### 2. Dashboard Mobile
- **Layout**: 2 kolom grid untuk metrik
- **Fitur**:
  - Stok Jagung, Konsentrat, Dedak (kg)
  - Total Telur (butir/tray)
  - Populasi Ayam
  - Alert merah jika stok < threshold
  - Laporan terakhir

### 3. Input Harian (Step-by-Step)
- **Step 1: Info Ayam**
  - Tanggal
  - Ayam Mati
  - Ayam Dijual
  - Preview populasi baru
  
- **Step 2: Produksi Telur**
  - Produksi Telur (Butir)
  - Telur Reject
  - Preview telur bagus & % produksi
  
- **Step 3: Pakan**
  - Pilih Formula Pakan
  - Total Pakan (kg)
  - Komposisi otomatis (Jagung/Konsentrat/Dedak)
  - Validasi stok real-time
  - Vitamin/Obat (opsional)
  - Keterangan (opsional)

**Validasi**: Error "Stok tidak cukup" jika pakan melebihi stok di LocalStorage

### 4. Manajemen Stok
- **Stok Telur**:
  - Display besar dengan gradient
  - Bottom Sheet untuk pengurangan
  - Quick select: 1, 2, 3, 5, 10, 20 tray
  - Input manual dengan keterangan
  
- **Stok Pakan**:
  - List dengan tombol (+) besar
  - Quick add: +10, +50, +100 kg
  - Alert visual jika stok menipis

### 5. Penjualan
- **UI**: Vertical form per kategori telur
- **Kategori**: SS, S(M), M(L), L(XL), XL(XXL), Reject
- **Input**: Jumlah (Tray) & Harga/Tray
- **Fitur**:
  - Validasi stok tersedia
  - Ringkasan total butir & harga
  - Otomatis potong stok di LocalStorage

### 6. Profil
- **Info**: Username, Role, Status
- **Menu**: Informasi Akun, Keamanan, Tentang
- **Logout**: Dengan konfirmasi dialog

## Bottom Navigation
- Dashboard (Home icon)
- Input (PlusCircle icon)
- Stok (Package icon)
- Penjualan (ShoppingCart icon)
- Profil (User icon)

## Teknologi

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component Library
- **Lucide React** - Icons

### Mobile
- **Capacitor 6** - Native Wrapper
- **Android SDK** - Android Build

### State Management
- **React Context** - Global State
- **LocalStorage** - Data Persistence
- **Sync Logic** - Shared dengan Web

## Data Sync
- Menggunakan `AppDataContext` yang sama dengan web
- Data disimpan di LocalStorage browser
- Sinkronisasi otomatis antar platform
- Tidak ada Supabase dependency

## Development

### Prerequisites
```bash
Node.js >= 18
npm atau bun
Android Studio (untuk build APK)
```

### Setup
```bash
# Install dependencies
npm install

# Run mobile dev server
npm run dev:mobile

# Access di browser
http://localhost:8080
```

### Build APK

#### Method 1: Using Batch Script (Windows)
```bash
# Run build script
build-mobile-apk.bat
```

#### Method 2: Manual Steps
```bash
# 1. Build Vite
npm run build:mobile

# 2. Sync Capacitor
npx cap sync android --config capacitor.config.mobile.ts

# 3. Open Android Studio
npx cap open android --config capacitor.config.mobile.ts

# 4. Build APK di Android Studio
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### Output
- **Development**: `dist-mobile/`
- **APK**: `candra-mobile-debug.apk`
- **Android Project**: `android-mobile/`

## File Structure
```
peternak-pro-main/
├── src/
│   ├── pages/mobile/          # Mobile pages
│   │   ├── MobileLogin.tsx
│   │   ├── MobileDashboard.tsx
│   │   ├── MobileInput.tsx
│   │   ├── MobileStok.tsx
│   │   ├── MobilePenjualan.tsx
│   │   └── MobileProfil.tsx
│   ├── components/
│   │   └── MobileLayout.tsx   # Bottom nav layout
│   ├── hooks/
│   │   └── usePlatform.ts     # Platform detection
│   ├── AppMobile.tsx          # Mobile app root
│   └── main-mobile.tsx        # Mobile entry point
├── index.mobile.html          # Mobile HTML
├── vite.config.mobile.ts      # Mobile Vite config
├── capacitor.config.mobile.ts # Mobile Capacitor config
└── build-mobile-apk.bat       # Build script
```

## UI/UX Guidelines

### Mobile-First Design
- **Portrait orientation** only
- **Thumb-friendly** - buttons min 44px height
- **Large touch targets** - 48px recommended
- **Rounded corners** - 12px (rounded-xl)
- **Bottom sheet** - for modals (Drawer component)
- **Safe areas** - respect notch/home indicator

### Colors
- **Primary**: Green (#10b981)
- **Destructive**: Red for alerts
- **Muted**: Gray for secondary info
- **Gradient**: Primary to Primary/80

### Typography
- **Headings**: text-lg to text-2xl, font-bold
- **Body**: text-sm to text-base
- **Labels**: text-xs, text-muted-foreground

### Spacing
- **Container**: p-4 (16px)
- **Cards**: p-4 to p-6
- **Gaps**: gap-3 to gap-6
- **Bottom nav**: pb-20 (80px clearance)

## Testing

### Browser Testing
```bash
npm run dev:mobile
# Open http://localhost:8080 in mobile browser
# Or use Chrome DevTools mobile emulation
```

### Device Testing
```bash
# Build and install APK
build-mobile-apk.bat

# Install on device
adb install candra-mobile-debug.apk
```

## Troubleshooting

### Build Errors
1. **Gradle error**: Update Android Studio & SDK
2. **Capacitor sync error**: Delete `android-mobile` and re-sync
3. **Vite build error**: Clear `dist-mobile` and rebuild

### Runtime Errors
1. **LocalStorage not working**: Check browser permissions
2. **Navigation not working**: Check route paths
3. **Data not syncing**: Clear LocalStorage and reload

## Performance

### Optimization
- **Code splitting**: Lazy load routes
- **Image optimization**: Use WebP format
- **Bundle size**: < 500KB gzipped
- **First load**: < 3 seconds

### Best Practices
- Use `useMemo` for expensive calculations
- Debounce input handlers
- Virtualize long lists
- Optimize re-renders with `React.memo`

## Security

### Data Protection
- LocalStorage encrypted (browser-level)
- No sensitive data in plain text
- Session timeout after inactivity
- Secure password validation

### API Security
- No external API calls (offline-first)
- Data stays on device
- No cloud sync (by design)

## Deployment

### Production Build
```bash
# Build optimized APK
npm run build:mobile
npx cap sync android --config capacitor.config.mobile.ts

# Sign APK (for Play Store)
# Use Android Studio > Build > Generate Signed Bundle/APK
```

### Distribution
- **Internal**: Share APK file directly
- **Play Store**: Follow Google Play guidelines
- **Enterprise**: Use MDM solution

## Roadmap

### Future Features
- [ ] Offline mode with sync queue
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Export to PDF
- [ ] Photo upload for reports
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Backup to cloud (optional)

## Support
- **Documentation**: This file
- **Issues**: GitHub Issues
- **Contact**: [Your contact info]

## License
Proprietary - Candra Poultry Farm © 2026
