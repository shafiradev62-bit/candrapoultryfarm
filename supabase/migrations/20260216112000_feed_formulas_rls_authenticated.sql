ALTER TABLE public.feed_formulas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feed_formulas'
      AND policyname = 'Allow all for authenticated users'
  ) THEN
    EXECUTE 'DROP POLICY "Allow all for authenticated users" ON public.feed_formulas';
  END IF;
END
$$;

CREATE POLICY "Allow all for authenticated users"
ON public.feed_formulas
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
