# Panduan Deploy ke Vercel

## Setup Auto-Deploy dari GitHub ke Vercel

### Langkah 1: Login ke Vercel
1. Buka [vercel.com](https://vercel.com)
2. Login menggunakan akun GitHub Anda

### Langkah 2: Import Project
1. Klik tombol "Add New..." → "Project"
2. Pilih repository: `shafiradev62-bit/candrapoultryfarm`
3. Klik "Import"

### Langkah 3: Configure Project
Vercel akan otomatis mendeteksi konfigurasi dari `vercel.json`:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Langkah 4: Environment Variables
Tambahkan environment variables yang diperlukan:
1. Klik "Environment Variables"
2. Tambahkan variabel dari file `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Dan variabel lainnya yang diperlukan

### Langkah 5: Deploy
1. Klik "Deploy"
2. Tunggu proses build selesai (biasanya 1-3 menit)
3. Setelah selesai, aplikasi akan tersedia di URL Vercel

## Auto-Deploy
Setelah setup awal, setiap kali Anda push ke branch `main` di GitHub:
- Vercel akan otomatis mendeteksi perubahan
- Build dan deploy akan berjalan otomatis
- Aplikasi akan ter-update dengan versi terbaru

## Monitoring Deployment
- Dashboard Vercel menampilkan status setiap deployment
- Anda bisa melihat logs build jika ada error
- Preview deployment tersedia untuk setiap commit

## Custom Domain (Opsional)
Untuk menggunakan domain sendiri:
1. Buka Settings → Domains di dashboard Vercel
2. Tambahkan domain Anda
3. Update DNS records sesuai instruksi Vercel

## Troubleshooting
Jika build gagal:
1. Cek logs di Vercel dashboard
2. Pastikan semua environment variables sudah diset
3. Pastikan `package.json` memiliki semua dependencies yang diperlukan
4. Test build lokal dengan `npm run build`
