CREATE TABLE IF NOT EXISTS public.app_afkir_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal TEXT NOT NULL,
  kandang TEXT NOT NULL,
  fcr NUMERIC(10, 2) NOT NULL,
  feed_kg NUMERIC(12, 2) NOT NULL,
  eggs_kg NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
