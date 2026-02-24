# Supabase Real-Time Sync Setup

## 🎯 Overview

Data sekarang sync via **Supabase Database** untuk cross-device synchronization. APK di HP dan Web di laptop akan share data yang sama melalui Supabase.

## 📋 Setup Steps

### Step 1: Run SQL di Supabase

1. Buka Supabase Dashboard: https://gioocsxzhcfvogjgzeqh.supabase.co
2. Go to **SQL Editor**
3. Copy semua isi file `supabase-setup.sql`
4. Paste dan **Run** di SQL Editor
5. Verify tables created:
   - `app_data` (stores all data)
   - `sync_log` (logs sync activities)

### Step 2: Update Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update/Add these variables:
   ```
   VITE_SUPABASE_URL=https://gioocsxzhcfvogjgzeqh.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpb29jc3h6aGNmdm9namd6ZXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0ODExNjYsImV4cCI6MjA4NzA1NzE2Nn0.mJj312NsZcj_6rpJ4Nb1nu_1ZbOoVhaZvhhJLWuZQlM
   ```
3. Redeploy Vercel

### Step 3: Rebuild APK (Important!)

APK perlu di-rebuild dengan .env yang baru:

```bash
# 1. Build PWA dengan Supabase credentials baru
npm run build:pwa

# 2. Copy index.html
Copy-Item dist-pwa/index.pwa.html dist-pwa/index.html

# 3. Swap config
Copy-Item capacitor.config.ts capacitor.config.backup.ts
Copy-Item capacitor.config.pwa.ts capacitor.config.ts

# 4. Sync Capacitor
npx cap sync

# 5. Build APK
cd android
.\gradlew assembleDebug

# 6. Copy APK
Copy-Item android/app/build/outputs/apk/debug/app-debug.apk ../candra-farm-pwa-NEW.apk

# 7. Restore config
Copy-Item capacitor.config.backup.ts capacitor.config.ts
```

### Step 4: Install New APK

1. Uninstall APK lama dari HP
2. Install `candra-farm-pwa-NEW.apk`
3. Login dan test input data

## 🔄 How It Works

### Data Flow

```
APK (HP) → LocalStorage → Supabase Database ← Web (Laptop)
   ↓                            ↓                    ↓
Auto-push (2s)          Central Storage      Auto-pull (5s)
```

### Sync Timeline

1. **App Start**: Pull data from Supabase
2. **User Input**: Save to LocalStorage
3. **After 2 seconds**: Auto-push to Supabase
4. **Every 5 seconds**: Poll Supabase for updates
5. **If changes**: Update local state

### Example Scenario

1. Input daily report di APK (HP)
2. Data saved to LocalStorage
3. **After 2 seconds**: Data pushed to Supabase
4. Web dashboard polling Supabase every 5 seconds
5. **Within 5-7 seconds**: Data appears in web dashboard
6. Sync indicator turns green

## 📊 Database Schema

### app_data Table
```sql
- id: UUID (primary key)
- user_id: TEXT (default 'default')
- data_type: TEXT ('daily_reports', 'warehouse', 'sales', etc)
- data: JSONB (actual data array)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ (auto-updated)
```

### sync_log Table
```sql
- id: UUID (primary key)
- user_id: TEXT
- action: TEXT ('push', 'pull', 'error')
- data_type: TEXT
- message: TEXT
- created_at: TIMESTAMPTZ
```

## 🧪 Testing

### Test 1: APK → Web Sync

1. Open web dashboard: https://your-vercel-url.vercel.app
2. Input data di APK
3. Wait 5-10 seconds
4. Check web dashboard
5. ✅ Data should appear

### Test 2: Web → APK Sync

1. Open APK
2. Input data di web dashboard
3. Wait 5-10 seconds
4. Refresh APK (pull down)
5. ✅ Data should appear

### Test 3: Check Supabase

1. Go to Supabase Dashboard
2. Table Editor → app_data
3. Check `updated_at` timestamp
4. Verify data in JSONB column

## 🔍 Debugging

### Check Console Logs

**On Push:**
```
📤 Pushing daily_reports to Supabase...
✅ daily_reports pushed successfully
✅ All data synced to Supabase
```

**On Pull:**
```
🔄 Polling Supabase for updates...
📥 Pulling daily_reports from Supabase...
✅ daily_reports pulled successfully
🔄 Auto-sync: New data detected from Supabase
```

### Check Supabase Logs

1. Supabase Dashboard → Logs
2. Filter by table: `app_data`
3. Check INSERT/UPDATE operations

### Common Issues

**Data not syncing:**
- Check Supabase credentials in .env
- Verify SQL tables created
- Check console for errors
- Rebuild APK with new .env

**Slow sync:**
- Normal delay: 5-10 seconds
- Polling interval: 5 seconds
- Push debounce: 2 seconds

**APK not connecting:**
- Rebuild APK with new Supabase credentials
- Check internet connection
- Verify Supabase URL accessible

## 📱 Environment Variables

### Local Development (.env)
```env
VITE_SUPABASE_PROJECT_ID="gioocsxzhcfvogjgzeqh"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpb29jc3h6aGNmdm9namd6ZXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0ODExNjYsImV4cCI6MjA4NzA1NzE2Nn0.mJj312NsZcj_6rpJ4Nb1nu_1ZbOoVhaZvhhJLWuZQlM"
VITE_SUPABASE_URL="https://gioocsxzhcfvogjgzeqh.supabase.co"
```

### Vercel (Production)
Same as above, set in Vercel dashboard.

## 🎯 Key Changes

### Before (LocalStorage Only)
- ❌ Data only on same device/browser
- ❌ No cross-device sync
- ❌ APK and Web separate data

### After (Supabase Sync)
- ✅ Data syncs across all devices
- ✅ APK and Web share same data
- ✅ Real-time updates (5-10 seconds)
- ✅ Persistent cloud storage
- ✅ Automatic backup

## 🚀 Next Steps

1. ✅ Run SQL in Supabase
2. ✅ Update Vercel env vars
3. ✅ Rebuild APK
4. ✅ Test sync APK → Web
5. ✅ Test sync Web → APK
6. ✅ Verify in Supabase dashboard

## 📞 Support

If sync not working:
1. Check console logs (F12)
2. Check Supabase logs
3. Verify .env credentials
4. Rebuild APK
5. Clear browser cache

---

**Important**: APK HARUS di-rebuild dengan .env baru agar bisa connect ke Supabase yang benar!
