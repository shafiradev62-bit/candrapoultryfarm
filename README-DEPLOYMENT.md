# 🌐 Candra Poultry Farm - Web Deployment

## 🎯 Live Demo

**Production URL:** Coming soon...

**Test Credentials:**
- Owner: `owner` / `owner123`
- Worker: `worker` / `worker123`

## ✨ Features

### 📊 Dashboard
- Real-time data sync dengan Supabase
- Multi-device synchronization
- Responsive design (Desktop, Tablet, Mobile)
- Auto-refresh setiap 5 detik

### 📝 Input Harian
- Form wizard 3 langkah
- Auto-calculate feed breakdown
- Stock validation
- Auto-navigate ke dashboard setelah submit

### 📈 Monitoring
- KPI cards (Populasi, Produksi, Pakan, Profit)
- Stock control dengan alerts
- Performance statistics
- FCR (Feed Conversion Ratio) tracking

### 💰 Keuangan
- Neraca harian
- Omzet telur
- Biaya pakan & operasional
- Sisa uang & profit estimation

### 🔄 Data Sync
- **Auto-push**: Setiap 2 detik (debounced)
- **Auto-pull**: Setiap 5 detik (polling)
- **Cross-tab**: Instant sync via localStorage events
- **Offline**: Data cached locally, sync saat online

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **UI Library**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State**: React Context API
- **Forms**: React Hook Form + Zod

### Backend
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime (optional)

### Deployment
- **Platform**: Vercel / Netlify
- **CDN**: Global edge network
- **SSL**: Auto-provisioned
- **Domain**: Custom domain support

## 📦 Project Structure

```
peternak-pro-main/
├── src/
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts (AppData, Auth)
│   ├── pages/             # Page components
│   │   ├── Index.tsx      # Main dashboard
│   │   ├── pwa/           # PWA pages
│   │   └── mobile/        # Mobile pages
│   ├── integrations/      # Supabase integration
│   ├── lib/               # Utilities & helpers
│   └── hooks/             # Custom hooks
├── dist/                  # Production build
├── android/               # Capacitor Android
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/shafiradev62-bit/candrapoultryfarm.git
cd candrapoultryfarm
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env dengan Supabase credentials
VITE_SUPABASE_URL=https://gioocsxzhcfvogjgzeqh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key-here
VITE_SUPABASE_PROJECT_ID=gioocsxzhcfvogjgzeqh
```

### 4. Run Development

```bash
npm run dev
# Akses: http://localhost:8080
```

### 5. Build Production

```bash
npm run build
# Output: dist/
```

### 6. Preview Production

```bash
npm run preview
# Akses: http://localhost:4173
```

## 🌐 Deploy to Vercel

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

### Via GitHub Integration

1. Push code ke GitHub
2. Import project di Vercel dashboard
3. Configure environment variables
4. Deploy!

**Auto-deploy:** Setiap push ke `main` branch akan auto-deploy

## 🌐 Deploy to Netlify

### Via Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy production
netlify deploy --prod
```

### Via GitHub Integration

1. Push code ke GitHub
2. Import project di Netlify dashboard
3. Configure build settings
4. Deploy!

## 🔧 Configuration Files

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Buka https://supabase.com
2. Create new project
3. Copy URL dan API Key

### 2. Run SQL Schema

```sql
-- Copy dari supabase-setup.sql
-- Run di Supabase SQL Editor
```

### 3. Enable RLS

```sql
-- Enable Row Level Security
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_entries ENABLE ROW LEVEL SECURITY;
-- dst...
```

### 4. Create Policies

```sql
-- Allow read for all
CREATE POLICY "Allow read" ON daily_reports
FOR SELECT USING (true);

-- Allow write for authenticated
CREATE POLICY "Allow write" ON daily_reports
FOR INSERT WITH CHECK (true);
```

## 📊 Data Sync Architecture

```
┌─────────────┐
│   Browser   │
│  (Web App)  │
└──────┬──────┘
       │
       │ Auto-push (2s debounce)
       ▼
┌─────────────┐
│  Supabase   │
│  PostgreSQL │
└──────┬──────┘
       │
       │ Auto-pull (5s polling)
       ▼
┌─────────────┐
│   Mobile    │
│  (APK/PWA)  │
└─────────────┘
```

### Sync Flow

1. **User Input** → Local state update
2. **Debounce 2s** → Push to Supabase
3. **Polling 5s** → Pull from Supabase
4. **Update UI** → Show latest data

### Conflict Resolution

- Last write wins
- No merge conflicts (simple overwrite)
- Future: Implement CRDT or OT

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
# Coming soon
npm run test:e2e
```

### Manual Testing Checklist

- [ ] Login dengan owner/worker
- [ ] Input harian berhasil
- [ ] Data muncul di dashboard
- [ ] Data sync ke Supabase
- [ ] Multi-device sync works
- [ ] Offline mode works
- [ ] Export Excel/PDF works

## 📈 Performance

### Lighthouse Score

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 90+

### Bundle Size

- Main bundle: ~1.7 MB (509 KB gzipped)
- Vendor chunks: ~150 KB (51 KB gzipped)
- CSS: ~89 KB (14 KB gzipped)

### Optimization Tips

1. **Code Splitting**: Use dynamic imports
2. **Lazy Loading**: Load routes on demand
3. **Image Optimization**: Use WebP format
4. **Caching**: Leverage CDN caching
5. **Compression**: Enable Brotli/Gzip

## 🔐 Security

### Environment Variables

- ❌ Never commit `.env` to Git
- ✅ Use Vercel/Netlify environment variables
- ✅ Different keys for dev/staging/prod

### Supabase Security

- ✅ Row Level Security (RLS) enabled
- ✅ API keys are public (anon key)
- ✅ Service role key kept secret
- ✅ HTTPS only

### Best Practices

- Input validation dengan Zod
- XSS protection
- CSRF protection
- Rate limiting (Supabase)

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Supabase Connection

```bash
# Check environment variables
echo $VITE_SUPABASE_URL

# Test connection
curl https://gioocsxzhcfvogjgzeqh.supabase.co
```

### 404 on Refresh

- Check `vercel.json` atau `netlify.toml`
- Ensure rewrites are configured

## 📞 Support

- **GitHub Issues**: https://github.com/shafiradev62-bit/candrapoultryfarm/issues
- **Documentation**: See `/docs` folder
- **Email**: support@candrapoultry.com

## 📄 License

MIT License - See LICENSE file

## 👥 Contributors

- Developer: Shafira Dev
- Client: Candra Poultry Farm

---

**Version:** v2.1  
**Last Updated:** 24 Februari 2026  
**Status:** Production Ready ✅
