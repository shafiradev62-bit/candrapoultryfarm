# 🚀 Deployment Guide - Candra Poultry Farm Web App

## 📋 Prerequisites

- Node.js 18+ installed
- npm atau yarn
- Git
- Akun Vercel atau Netlify (gratis)
- Supabase project sudah setup

## 🔧 Environment Variables

Pastikan environment variables sudah di-set:

```env
VITE_SUPABASE_URL=https://gioocsxzhcfvogjgzeqh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=gioocsxzhcfvogjgzeqh
```

## 🌐 Deploy ke Vercel

### Option 1: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
cd peternak-pro-main
vercel

# Deploy production
vercel --prod
```

### Option 2: Via Vercel Dashboard

1. **Import Project**
   - Buka https://vercel.com/new
   - Import dari GitHub: `shafiradev62-bit/candrapoultryfarm`
   - Pilih branch: `main`

2. **Configure Project**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   ```
   VITE_SUPABASE_URL = https://gioocsxzhcfvogjgzeqh.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_PROJECT_ID = gioocsxzhcfvogjgzeqh
   ```

4. **Deploy**
   - Click "Deploy"
   - Tunggu build selesai (~2-3 menit)
   - Akses URL: `https://your-project.vercel.app`

## 🌐 Deploy ke Netlify

### Option 1: Via Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login ke Netlify
netlify login

# Deploy
cd peternak-pro-main
netlify deploy

# Deploy production
netlify deploy --prod
```

### Option 2: Via Netlify Dashboard

1. **Import Project**
   - Buka https://app.netlify.com/start
   - Connect to Git provider: GitHub
   - Select repository: `candrapoultryfarm`

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add:
     ```
     VITE_SUPABASE_URL = https://gioocsxzhcfvogjgzeqh.supabase.co
     VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     VITE_SUPABASE_PROJECT_ID = gioocsxzhcfvogjgzeqh
     ```

4. **Deploy**
   - Click "Deploy site"
   - Tunggu build selesai
   - Akses URL: `https://your-site.netlify.app`

## 🔄 Auto-Deploy dari GitHub

### Setup Auto-Deploy

1. **Connect Repository**
   - Vercel/Netlify akan otomatis detect push ke GitHub
   - Setiap push ke branch `main` akan trigger deploy

2. **Deploy Preview**
   - Setiap PR akan dapat preview URL
   - Test sebelum merge ke main

3. **Production Deploy**
   - Merge PR ke main → Auto deploy production
   - Rollback available jika ada issue

## 🧪 Testing Deployment

### 1. Test Local Build

```bash
# Build production
npm run build

# Preview production build
npm run preview

# Akses: http://localhost:4173
```

### 2. Test Deployed Site

```bash
# Test URL
curl https://your-site.vercel.app

# Test Supabase connection
# Buka browser console, cek:
# - "Supabase URL: https://gioocsxzhcfvogjgzeqh.supabase.co"
# - "Supabase Key exists: true"
```

### 3. Test Features

- ✅ Login (owner/worker)
- ✅ Input harian
- ✅ Dashboard menampilkan data
- ✅ Data sync ke Supabase
- ✅ Multi-device sync
- ✅ Offline support

## 🐛 Troubleshooting

### Build Failed

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working

```bash
# Check .env file
cat .env

# Rebuild with env
npm run build

# Verify in browser console
console.log(import.meta.env.VITE_SUPABASE_URL)
```

### Supabase Connection Error

1. Check Supabase URL dan Key
2. Check Supabase project status
3. Check RLS policies
4. Check browser console for errors

### 404 on Refresh

- Pastikan `vercel.json` atau `netlify.toml` sudah di-commit
- Rewrites harus redirect semua route ke `/index.html`

## 📊 Performance Optimization

### 1. Enable Compression

Vercel/Netlify otomatis enable:
- Gzip compression
- Brotli compression
- HTTP/2

### 2. CDN Caching

```json
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. Code Splitting

Vite otomatis split code:
- Vendor chunks
- Route-based splitting
- Dynamic imports

## 🔐 Security

### 1. Environment Variables

- ❌ Jangan commit `.env` ke Git
- ✅ Set di Vercel/Netlify dashboard
- ✅ Use different keys untuk dev/prod

### 2. Supabase RLS

```sql
-- Enable RLS
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Policy untuk read
CREATE POLICY "Allow read for all users"
ON daily_reports FOR SELECT
USING (true);

-- Policy untuk write
CREATE POLICY "Allow insert for authenticated users"
ON daily_reports FOR INSERT
WITH CHECK (true);
```

### 3. CORS

Supabase otomatis handle CORS untuk:
- `*.vercel.app`
- `*.netlify.app`
- Custom domain

## 📱 PWA Deployment

Web app sudah PWA-ready:
- ✅ Service Worker
- ✅ Offline support
- ✅ Install prompt
- ✅ App manifest

Test PWA:
1. Buka Chrome DevTools
2. Lighthouse → PWA audit
3. Score harus 90+

## 🔄 Update Deployment

### Manual Update

```bash
# Pull latest
git pull origin main

# Build
npm run build

# Deploy
vercel --prod
# atau
netlify deploy --prod
```

### Auto Update

- Push ke GitHub main branch
- Vercel/Netlify auto-deploy
- Check deployment status di dashboard

## 📈 Monitoring

### Vercel Analytics

- Enable di dashboard
- Track page views
- Monitor performance
- Check errors

### Netlify Analytics

- Enable di dashboard
- Track visitors
- Monitor bandwidth
- Check build times

## 🎯 Custom Domain

### Setup Custom Domain

1. **Add Domain**
   - Vercel: Settings → Domains
   - Netlify: Domain settings → Add custom domain

2. **Configure DNS**
   ```
   Type: CNAME
   Name: www
   Value: your-site.vercel.app
   ```

3. **SSL Certificate**
   - Auto-provisioned oleh Vercel/Netlify
   - HTTPS enabled otomatis

## 📞 Support

Jika ada masalah:
1. Check build logs di dashboard
2. Check browser console
3. Check Supabase logs
4. Contact developer

---

**Last Updated:** 24 Februari 2026  
**Version:** v2.1  
**Deployment Platform:** Vercel / Netlify  
**Framework:** Vite + React + TypeScript  
**Database:** Supabase PostgreSQL
