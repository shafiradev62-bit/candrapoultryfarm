
-- Feed formulation presets table
CREATE TABLE public.feed_formulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  corn_pct numeric NOT NULL DEFAULT 45,
  concentrate_pct numeric NOT NULL DEFAULT 33,
  bran_pct numeric NOT NULL DEFAULT 22,
  is_active boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add validation trigger (percentages must sum to 100)
CREATE OR REPLACE FUNCTION public.validate_feed_formula()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.corn_pct + NEW.concentrate_pct + NEW.bran_pct) != 100 THEN
    RAISE EXCEPTION 'Feed formula percentages must sum to 100. Got: %', (NEW.corn_pct + NEW.concentrate_pct + NEW.bran_pct);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_feed_formula_trigger
BEFORE INSERT OR UPDATE ON public.feed_formulas
FOR EACH ROW EXECUTE FUNCTION public.validate_feed_formula();

-- Only one active formula at a time
CREATE OR REPLACE FUNCTION public.ensure_single_active_formula()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.feed_formulas SET is_active = false WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_single_active_formula_trigger
BEFORE INSERT OR UPDATE ON public.feed_formulas
FOR EACH ROW EXECUTE FUNCTION public.ensure_single_active_formula();

-- Add updated_at trigger
CREATE TRIGGER update_feed_formulas_updated_at
BEFORE UPDATE ON public.feed_formulas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS
ALTER TABLE public.feed_formulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view formulas"
ON public.feed_formulas FOR SELECT
USING (true);

CREATE POLICY "Managers can manage formulas"
ON public.feed_formulas FOR ALL
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'farm_manager'));

-- Add feed formula reference to daily_records
ALTER TABLE public.daily_records 
  ADD COLUMN feed_formula_id uuid REFERENCES public.feed_formulas(id),
  ADD COLUMN feed_corn_kg numeric NOT NULL DEFAULT 0,
  ADD COLUMN feed_concentrate_kg numeric NOT NULL DEFAULT 0,
  ADD COLUMN feed_bran_kg numeric NOT NULL DEFAULT 0;

-- Add columns to daily_records matching Excel
ALTER TABLE public.daily_records
  ADD COLUMN usia_minggu integer NOT NULL DEFAULT 0,
  ADD COLUMN jual_ayam integer NOT NULL DEFAULT 0,
  ADD COLUMN vitamin_obat text;

-- Add egg size column for sales matching Excel
ALTER TABLE public.products
  ADD COLUMN egg_size text;
