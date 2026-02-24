# Deployment Guide - Candra Poultry Farm

## Overview

Project ini memiliki 3 versi aplikasi yang berbeda:

1. **Web Dashboard** (Desktop) - Deploy ke Vercel
2. **Monitoring APK** (Landscape Mobile) - Android APK
3. **PWA Mobile** (Portrait Mobile) - Android APK

## 1. Web Dashboard (Vercel)

### File Entry Point
- **index.html** → loads `src/main.tsx` → `App.tsx`
- Build command: `npm run build`
- Output directory: `dist`

### Features
- Desktop-optimized dashboard
- Landscape mode untuk mobile (dengan overlay portrait warning)
- Full management features (Dashboard, Daily Report, Warehouse, Sales, Operational, Finance, Settings)
- Role-based access (Owner, Worker)

### Vercel Deployment
```bash
# Automatic deployment on push to main branch
git push origin main

# Vercel will:
# 1. Run: npm install
# 2. Run: npm run build
# 3. Deploy: dist folder
```

### Environment Variables (Vercel)
Set these in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 2. Monitoring APK (Landscape)

### File Entry Point
- **index.monitoring.html** → loads `src/main-monitoring.tsx` → `AppMonitoring.tsx`
- Build command: `npm run build:monitoring`
- Output directory: `dist-monitoring`

### Features
- Landscape-only orientation
- Real-time monitoring dashboard
- Simplified UI for field workers
- QR code scanning

### Build APK
```bash
# 1. Build monitoring
npm run build:monitoring

# 2. Sync Capacitor (using android-monitoring folder)
npx cap sync

# 3. Build APK
cd android-monitoring
.\gradlew assembleDebug

# APK location: android-monitoring/app/build/outputs/apk/debug/app-debug.apk
```

## 3. PWA Mobile (Portrait)

### File Entry Point
- **index.pwa.html** → loads `src/main-pwa.tsx` → `AppPWA.tsx`
- Build command: `npm run build:pwa`
- Output directory: `dist-pwa`

### Features
- Portrait-only orientation
- Bottom navigation (5 tabs)
- iOS-style clean design
- +/- increment buttons
- LocalStorage sync with web dashboard

### Build APK
```bash
# 1. Build PWA
npm run build:pwa

# 2. Copy index.html
Copy-Item dist-pwa/index.pwa.html dist-pwa/index.html

# 3. Swap config temporarily
Copy-Item capacitor.config.ts capacitor.config.backup.ts
Copy-Item capacitor.config.pwa.ts capacitor.config.ts

# 4. Sync Capacitor
npx cap sync

# 5. Build APK
cd android
.\gradlew assembleDebug

# 6. Copy APK
Copy-Item android/app/build/outputs/apk/debug/app-debug.apk ../candra-farm-pwa-debug.apk

# 7. Restore original config
Copy-Item capacitor.config.backup.ts capacitor.config.ts
```

**Output**: `candra-farm-pwa-debug.apk` (~6.16 MB)

## File Structure

```
peternak-pro-main/
├── index.html                    # Web (Vercel) - main.tsx
├── index.monitoring.html         # Monitoring APK - main-monitoring.tsx
├── index.pwa.html               # PWA Mobile APK - main-pwa.tsx
├── src/
│   ├── main.tsx                 # Web entry point
│   ├── main-monitoring.tsx      # Monitoring entry point
│   ├── main-pwa.tsx            # PWA entry point
│   ├── App.tsx                  # Web app
│   ├── AppMonitoring.tsx       # Monitoring app
│   └── AppPWA.tsx              # PWA app
├── capacitor.config.ts          # Monitoring config (default)
├── capacitor.config.pwa.ts     # PWA config
├── vite.config.ts              # Web build config
├── vite.config.monitoring.ts   # Monitoring build config
└── vite.config.pwa.ts          # PWA build config
```

## Important Notes

### ⚠️ Vercel Deployment
- **ALWAYS** ensure `index.html` loads `src/main.tsx` (web version)
- If accidentally changed to `main-pwa.tsx`, Vercel will deploy mobile version
- Check `index.html` before pushing to main branch

### 🔄 Data Sync
- Web dashboard and PWA mobile share LocalStorage key: `"candra-appdata-v1"`
- Data syncs automatically between web and PWA when opened in same browser
- Manual refresh button available in web dashboard

### 📱 APK Distribution
- Monitoring APK: For field workers (landscape mode)
- PWA APK: For mobile management (portrait mode)
- Both are debug APKs (unsigned, no signing key required)

## Quick Commands

```bash
# Development
npm run dev              # Web (localhost:5173)
npm run dev:pwa          # PWA (localhost:5174)

# Build
npm run build            # Web for Vercel
npm run build:monitoring # Monitoring APK
npm run build:pwa        # PWA APK

# Deploy
git push origin main     # Auto-deploy to Vercel
```

## Troubleshooting

### Vercel shows mobile version
**Problem**: Vercel deploys PWA mobile instead of web dashboard

**Solution**:
```bash
# Check index.html
# Should have: <script type="module" src="/src/main.tsx"></script>
# NOT: <script type="module" src="/src/main-pwa.tsx"></script>

# Restore from git
git checkout origin/main -- index.html
git push origin main
```

### APK build fails
**Problem**: Gradle build error

**Solution**:
```bash
# Clean gradle cache
cd android  # or android-monitoring
.\gradlew clean
.\gradlew assembleDebug
```

### Data not syncing between PWA and Web
**Problem**: Input in PWA doesn't show in web

**Solution**:
1. Open both in same browser (different tabs)
2. Click "Refresh" button in web dashboard
3. Check LocalStorage key: `candra-appdata-v1`
