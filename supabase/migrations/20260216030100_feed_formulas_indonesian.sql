-- =============================================
-- FEED FORMULA PRESETS FOR INDONESIAN LIVESTOCK
-- =============================================

-- Insert standard feed formulas used in Indonesian poultry farming
INSERT INTO public.feed_formulas (id, name, corn_pct, concentrate_pct, bran_pct, is_active, created_by)
VALUES
  (
    'feed-formula-standard-1',
    'Formula Layer Standard Indonesia',
    50,  -- 50% Jagung
    35,  -- 35% Konsentrat
    15,  -- 15% Dedak
    true,
    NULL
  ),
  (
    'feed-formula-premium-1',
    'Formula Layer Premium',
    55,  -- 55% Jagung (lebih tinggi untuk energi)
    30,  -- 30% Konsentrat
    15,  -- 15% Dedak
    false,
    NULL
  ),
  (
    'feed-formula-grower-1',
    'Formula Grower (Penggemukan)',
    45,  -- 45% Jagung
    40,  -- 40% Konsentrat (lebih tinggi protein)
    15,  -- 15% Dedak
    false,
    NULL
  ),
  (
    'feed-formula-brooder-1',
    'Formula Brooder (Anak)',
    40,  -- 40% Jagung
    45,  -- 45% Konsentrat (tinggi protein untuk pertumbuhan)
    15,  -- 15% Dedak
    false,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Update existing daily records to reference the active feed formula
UPDATE public.daily_records 
SET feed_formula_id = 'feed-formula-standard-1'
WHERE feed_formula_id IS NULL;

-- Add some sample feed usage records with detailed breakdown
UPDATE public.daily_records 
SET 
  feed_corn_kg = feed_kg * 0.50,
  feed_concentrate_kg = feed_kg * 0.35,
  feed_bran_kg = feed_kg * 0.15
WHERE id IN (
  '77777777-7777-7777-7777-777777777778',
  '77777777-7777-7777-7777-777777777779'
);