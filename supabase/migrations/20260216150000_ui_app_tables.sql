CREATE TABLE IF NOT EXISTS public.app_daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no INTEGER UNIQUE NOT NULL,
  tanggal TEXT NOT NULL,
  usia INTEGER NOT NULL,
  jumlahAyam INTEGER NOT NULL,
  kematian INTEGER NOT NULL,
  jualAyam INTEGER NOT NULL,
  totalPakan NUMERIC(12, 2) NOT NULL,
  jagung NUMERIC(12, 2) NOT NULL,
  konsentrat NUMERIC(12, 2) NOT NULL,
  dedak NUMERIC(12, 2) NOT NULL,
  vitaminObat TEXT NOT NULL,
  prodButir INTEGER NOT NULL,
  prodTray TEXT NOT NULL,
  reject INTEGER NOT NULL,
  pctProduksi TEXT NOT NULL,
  keterangan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_warehouse_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no INTEGER UNIQUE NOT NULL,
  tanggal TEXT NOT NULL,
  addJagung NUMERIC(12, 2) NOT NULL,
  addKonsentrat NUMERIC(12, 2) NOT NULL,
  addDedak NUMERIC(12, 2) NOT NULL,
  stokJagung NUMERIC(12, 2) NOT NULL,
  stokKonsentrat NUMERIC(12, 2) NOT NULL,
  stokDedak NUMERIC(12, 2) NOT NULL,
  telurButir INTEGER NOT NULL,
  telurTray TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_sales_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no INTEGER UNIQUE NOT NULL,
  tanggal TEXT NOT NULL,
  ssTray NUMERIC(12, 2) NOT NULL,
  ssHarga NUMERIC(12, 2) NOT NULL,
  mTray NUMERIC(12, 2) NOT NULL,
  mHarga NUMERIC(12, 2) NOT NULL,
  lTray NUMERIC(12, 2) NOT NULL,
  lHarga NUMERIC(12, 2) NOT NULL,
  xlTray NUMERIC(12, 2) NOT NULL,
  xlHarga NUMERIC(12, 2) NOT NULL,
  xxlTray NUMERIC(12, 2) NOT NULL,
  xxlHarga NUMERIC(12, 2) NOT NULL,
  rejectTray NUMERIC(12, 2) NOT NULL,
  rejectHarga NUMERIC(12, 2) NOT NULL,
  ayam NUMERIC(12, 2) NOT NULL,
  ayamHarga NUMERIC(12, 2) NOT NULL,
  kohe NUMERIC(12, 2) NOT NULL,
  koheHarga NUMERIC(12, 2) NOT NULL,
  totalButir NUMERIC(12, 2) NOT NULL,
  totalRp NUMERIC(14, 2) NOT NULL,
  keterangan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_operational_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no INTEGER UNIQUE NOT NULL,
  tanggal TEXT NOT NULL,
  objek TEXT NOT NULL,
  jumlah NUMERIC(12, 2) NOT NULL,
  uom TEXT NOT NULL,
  hargaSatuan NUMERIC(14, 2) NOT NULL,
  totalHarga NUMERIC(14, 2) NOT NULL,
  keterangan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_finance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no INTEGER UNIQUE NOT NULL,
  tanggal TEXT NOT NULL,
  credit NUMERIC(14, 2) NOT NULL,
  debit NUMERIC(14, 2) NOT NULL,
  saldo NUMERIC(14, 2) NOT NULL,
  keterangan TEXT NOT NULL,
  sourceType TEXT,
  sourceNo INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
