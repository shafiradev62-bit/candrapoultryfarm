# 📊 Visual Guide - Two APK Setup

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   CANDRA POULTRY FARM                       │
│                    Single Codebase                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│   MONITORING APP      │       │   INPUT DATA APP      │
│   (Landscape Only)    │       │   (Full Features)     │
└───────────────────────┘       └───────────────────────┘
            │                               │
            │                               │
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│  dist-monitoring/     │       │  dist-input/          │
│  (React Build) ✅     │       │  (React Build) ✅     │
└───────────────────────┘       └───────────────────────┘
            │                               │
            │                               │
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│  android-monitoring/  │       │  android-input/       │
│  (Capacitor) ⏳       │       │  (Capacitor) ⏳       │
└───────────────────────┘       └───────────────────────┘
            │                               │
            │                               │
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│  app-debug.apk        │       │  app-debug.apk        │
│  (5-8 MB) ⏳          │       │  (8-12 MB) ⏳         │
└───────────────────────┘       └───────────────────────┘
```

## 📱 App Comparison

```
┌─────────────────────────────────────────────────────────────┐
│                    MONITORING APP                           │
├─────────────────────────────────────────────────────────────┤
│  📱 Orientation: LANDSCAPE ONLY                             │
│  🔓 Login: NO (Direct to dashboard)                         │
│  📊 Features: Read-only monitoring                          │
│  🎯 Target: Tablet/TV display                               │
│  📦 Size: ~5-8 MB                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🖥️  DASHBOARD (Landscape)                          │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ 🏢 CANDRA POULTRY FARM                      │   │   │
│  │  ├─────────────────────────────────────────────┤   │   │
│  │  │ 📊 KPI Cards                                │   │   │
│  │  │ [Populasi] [Produksi] [Pakan] [% Prod]     │   │   │
│  │  ├─────────────────────────────────────────────┤   │   │
│  │  │ 📦 Stock Status (with alerts)               │   │   │
│  │  │ [Jagung] [Konsentrat] [Dedak]              │   │   │
│  │  ├─────────────────────────────────────────────┤   │   │
│  │  │ 💰 Financial Summary                        │   │   │
│  │  │ [Revenue] [Cost] [Profit]                  │   │   │
│  │  ├─────────────────────────────────────────────┤   │   │
│  │  │ 📈 Performance Stats                        │   │   │
│  │  ├─────────────────────────────────────────────┤   │   │
│  │  │ 📋 Recent Reports Table (7 days)           │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ Portrait Mode: Shows blocking overlay                  │
│     "Silakan putar perangkat ke mode Landscape"            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    INPUT DATA APP                           │
├─────────────────────────────────────────────────────────────┤
│  📱 Orientation: Portrait & Landscape                       │
│  🔐 Login: YES (Email + Password)                           │
│  ✏️ Features: Full CRUD operations                          │
│  🎯 Target: Mobile phone/tablet                             │
│  📦 Size: ~8-12 MB                                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔐 LOGIN SCREEN                                    │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │        🏢 CANDRA POULTRY FARM               │   │   │
│  │  │                                             │   │   │
│  │  │        📧 Email: _______________            │   │   │
│  │  │        🔒 Password: ___________             │   │   │
│  │  │                                             │   │   │
│  │  │        [  Masuk  ]                          │   │   │
│  │  │                                             │   │   │
│  │  │        Belum punya akun? Daftar            │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 MAIN APP (After Login)                          │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ 📂 Sidebar Navigation                       │   │   │
│  │  │  • Dashboard                                │   │   │
│  │  │  • Daily Report                             │   │   │
│  │  │  • Warehouse                                │   │   │
│  │  │  • Penjualan                                │   │   │
│  │  │  • Operasional                              │   │   │
│  │  │  • Finance                                  │   │   │
│  │  │  • Pengaturan                               │   │   │
│  │  ├─────────────────────────────────────────────┤   │   │
│  │  │ 📝 Forms with Calendar Pickers              │   │   │
│  │  │ 📊 Tables with CRUD operations              │   │   │
│  │  │ 📄 Export PDF                               │   │   │
│  │  │ 💾 Backup & Restore                         │   │   │
│  │  │ ⚠️ Low Stock Alerts                         │   │   │
│  │  │ ⌨️ Keyboard Shortcuts                       │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA FLOW                              │
└─────────────────────────────────────────────────────────────┘

    📱 INPUT DATA APP (Mobile)
         │
         │ User inputs:
         │ • Daily reports
         │ • Warehouse entries
         │ • Sales data
         │ • Operational costs
         │
         ▼
    ☁️ SUPABASE BACKEND
         │ • PostgreSQL Database
         │ • Real-time subscriptions
         │ • Authentication
         │ • Row Level Security
         │
         ▼
    🖥️ MONITORING APP (Tablet/Display)
         │
         │ Auto-refresh displays:
         │ • Latest KPIs
         │ • Stock status
         │ • Financial summary
         │ • Recent reports
         │
         ▼
    👀 REAL-TIME MONITORING
```

## 🛠️ Build Process

```
┌─────────────────────────────────────────────────────────────┐
│                    BUILD PROCESS                            │
└─────────────────────────────────────────────────────────────┘

STEP 1: Install Prerequisites
    ├─ Node.js 18+ ✅
    ├─ JDK 17 ⏳ (Download from adoptium.net)
    └─ Set JAVA_HOME ⏳

STEP 2: Build React Apps
    ├─ npm run build:monitoring ✅ (DONE)
    │   └─ Output: dist-monitoring/
    │
    └─ npm run build:input ✅ (DONE)
        └─ Output: dist-input/

STEP 3: Initialize Capacitor (First time only)
    ├─ npm run cap:init:monitoring ⏳
    │   └─ Creates: android-monitoring/
    │
    └─ npm run cap:init:input ⏳
        └─ Creates: android-input/

STEP 4: Sync Web Assets
    ├─ npm run cap:sync:monitoring ⏳
    └─ npm run cap:sync:input ⏳

STEP 5: Build APK
    ├─ cd android-monitoring && gradlew.bat assembleDebug ⏳
    │   └─ Output: android-monitoring/app/build/outputs/apk/debug/app-debug.apk
    │
    └─ cd android-input && gradlew.bat assembleDebug ⏳
        └─ Output: android-input/app/build/outputs/apk/debug/app-debug.apk

OR USE BATCH SCRIPTS:
    ├─ build-monitoring-apk.bat (Does steps 3-5 for monitoring)
    └─ build-input-apk.bat (Does steps 3-5 for input)
```

## 📂 File Organization

```
peternak-pro-main/
│
├─ 📱 MONITORING APP
│  ├─ index.monitoring.html
│  ├─ capacitor.config.monitoring.ts
│  ├─ vite.config.monitoring.ts
│  ├─ src/
│  │  ├─ AppMonitoring.tsx
│  │  ├─ main-monitoring.tsx
│  │  └─ pages/MonitoringDashboard.tsx
│  ├─ dist-monitoring/ ✅
│  └─ android-monitoring/ ⏳
│
├─ 📱 INPUT DATA APP
│  ├─ index.input.html
│  ├─ capacitor.config.input.ts
│  ├─ vite.config.input.ts
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ main-input.tsx
│  │  └─ pages/
│  │     ├─ AuthPage.tsx
│  │     ├─ Index.tsx
│  │     ├─ DailyReportPage.tsx
│  │     ├─ WarehousePage.tsx
│  │     ├─ PenjualanPage.tsx
│  │     ├─ OperasionalPage.tsx
│  │     └─ ...
│  ├─ dist-input/ ✅
│  └─ android-input/ ⏳
│
├─ 🔧 BUILD SCRIPTS
│  ├─ build-monitoring-apk.bat
│  └─ build-input-apk.bat
│
└─ 📚 DOCUMENTATION
   ├─ MULAI_DISINI.md ⭐ (START HERE!)
   ├─ README_APK_BUILD.md
   ├─ PANDUAN_BUILD_APK.md
   ├─ PERBEDAAN_DUA_APK.md
   ├─ SUMMARY_TWO_APK_SETUP.md
   ├─ VISUAL_GUIDE.md (This file)
   ├─ FITUR_BARU.md
   └─ LANDSCAPE_MOBILE_GUIDE.md
```

## ✅ Checklist

```
SETUP COMPLETED:
✅ React code for both apps
✅ Capacitor configurations
✅ Vite build configurations
✅ HTML entry points
✅ Build scripts (batch files)
✅ Documentation (8 files)
✅ React builds (dist folders)

PENDING (User needs to do):
⏳ Install JDK 17
⏳ Run build-monitoring-apk.bat
⏳ Run build-input-apk.bat
⏳ Install APKs on devices
⏳ Test both apps
```

## 🎯 Quick Start

```
1. Install JDK 17
   → https://adoptium.net/temurin/releases/?version=17

2. Set JAVA_HOME
   → setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"

3. Build Monitoring APK
   → build-monitoring-apk.bat

4. Build Input APK
   → build-input-apk.bat

5. Install APKs
   → Copy to Android device and install

6. Done! 🎉
```

## 📖 Documentation Map

```
START HERE → MULAI_DISINI.md
    │
    ├─ Quick Guide → README_APK_BUILD.md
    │
    ├─ Detailed Guide → PANDUAN_BUILD_APK.md
    │
    ├─ App Differences → PERBEDAAN_DUA_APK.md
    │
    ├─ Technical Summary → SUMMARY_TWO_APK_SETUP.md
    │
    ├─ Visual Guide → VISUAL_GUIDE.md (This file)
    │
    ├─ Features → FITUR_BARU.md
    │
    └─ Landscape Guide → LANDSCAPE_MOBILE_GUIDE.md
```

---

**Ready to build? Start with `MULAI_DISINI.md`! 🚀**
