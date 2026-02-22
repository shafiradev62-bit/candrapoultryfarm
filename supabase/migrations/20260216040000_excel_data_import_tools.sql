-- =============================================
-- EXCEL DATA IMPORT TOOLS & STRUCTURE ALIGNMENT
-- =============================================

-- Create a temporary import table that matches common Excel livestock farm formats
CREATE TABLE IF NOT EXISTS public.excel_import_temp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Basic farm info
  tanggal DATE,
  kandang_code TEXT,
  batch_code TEXT,
  
  -- Population data
  populasi_awal INTEGER,
  kematian INTEGER DEFAULT 0,
  penyebab_kematian TEXT,
  terjual INTEGER DEFAULT 0,
  
  -- Egg production
  telur_total INTEGER,
  telur_kg NUMERIC(10,2),
  telur_grade_a INTEGER,
  telur_grade_b INTEGER,
  telur_grade_c INTEGER,
  telur_pecah INTEGER,
  telur_kotor INTEGER,
  
  -- Feed consumption
  pakan_kg NUMERIC(10,2),
  jenis_pakan TEXT,
  vitamin_obat TEXT,
  
  -- Utilities
  air_liter NUMERIC(10,2),
  listrik_kwh NUMERIC(10,2),
  
  -- Notes
  catatan TEXT,
  
  -- Processing fields
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient importing
CREATE INDEX IF NOT EXISTS idx_excel_import_tanggal ON public.excel_import_temp(tanggal);
CREATE INDEX IF NOT EXISTS idx_excel_import_kandang ON public.excel_import_temp(kandang_code);
CREATE INDEX IF NOT EXISTS idx_excel_import_processed ON public.excel_import_temp(processed);

-- Function to process imported Excel data and map to proper tables
CREATE OR REPLACE FUNCTION public.process_excel_import()
RETURNS TABLE(processed_records INTEGER, error_records INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  v_processed_count INTEGER := 0;
  v_error_count INTEGER := 0;
  v_record RECORD;
  v_kandang_id UUID;
  v_flock_id UUID;
  v_farm_id UUID;
BEGIN
  -- Get default farm
  SELECT id INTO v_farm_id FROM public.farms LIMIT 1;
  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'No farm found. Please create a farm first.';
  END IF;
  
  -- Process each unprocessed record
  FOR v_record IN 
    SELECT * FROM public.excel_import_temp 
    WHERE processed = false 
    ORDER BY tanggal, kandang_code
  LOOP
    BEGIN
      -- Find or create kandang
      SELECT id INTO v_kandang_id 
      FROM public.kandang 
      WHERE code = v_record.kandang_code AND farm_id = v_farm_id;
      
      IF v_kandang_id IS NULL THEN
        INSERT INTO public.kandang (farm_id, code, name, capacity, type)
        VALUES (v_farm_id, v_record.kandang_code, 'Kandang ' || v_record.kandang_code, 5000, 'cage')
        RETURNING id INTO v_kandang_id;
      END IF;
      
      -- Find or create flock
      SELECT id INTO v_flock_id
      FROM public.flocks
      WHERE kandang_id = v_kandang_id 
      AND batch_code = v_record.batch_code
      AND is_active = true;
      
      IF v_flock_id IS NULL THEN
        INSERT INTO public.flocks (
          kandang_id, batch_code, breed, doc_date, 
          initial_population, current_population, stage
        )
        VALUES (
          v_kandang_id, v_record.batch_code, 'Lohmann Brown', 
          v_record.tanggal - INTERVAL '24 weeks', -- Assuming 24 weeks old
          COALESCE(v_record.populasi_awal, 5000),
          COALESCE(v_record.populasi_awal, 5000) - COALESCE(v_record.kematian, 0) - COALESCE(v_record.terjual, 0),
          'layer'
        )
        RETURNING id INTO v_flock_id;
      END IF;
      
      -- Insert daily record
      INSERT INTO public.daily_records (
        kandang_id, flock_id, record_date, population_start,
        mortality, mortality_cause, culled,
        eggs_total, eggs_kg, eggs_grade_a, eggs_grade_b, eggs_grade_c, eggs_broken, eggs_dirty,
        feed_kg, feed_type, water_liters, electricity_kwh,
        medicine_notes, notes, usia_minggu, jual_ayam, vitamin_obat
      )
      VALUES (
        v_kandang_id, v_flock_id, v_record.tanggal, COALESCE(v_record.populasi_awal, 0),
        COALESCE(v_record.kematian, 0), v_record.penyebab_kematian, COALESCE(v_record.terjual, 0),
        COALESCE(v_record.telur_total, 0), COALESCE(v_record.telur_kg, 0),
        COALESCE(v_record.telur_grade_a, 0), COALESCE(v_record.telur_grade_b, 0),
        COALESCE(v_record.telur_grade_c, 0), COALESCE(v_record.telur_pecah, 0),
        COALESCE(v_record.telur_kotor, 0),
        COALESCE(v_record.pakan_kg, 0), v_record.jenis_pakan,
        COALESCE(v_record.air_liter, 0), COALESCE(v_record.listrik_kwh, 0),
        v_record.vitamin_obat, v_record.catatan,
        -- Calculate age in weeks (assuming DOC date is 24 weeks ago)
        24, COALESCE(v_record.terjual, 0), v_record.vitamin_obat
      );
      
      -- Mark as processed
      UPDATE public.excel_import_temp 
      SET processed = true, processed_at = now()
      WHERE id = v_record.id;
      
      v_processed_count := v_processed_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error and continue
      UPDATE public.excel_import_temp 
      SET error_message = SQLERRM, processed = true, processed_at = now()
      WHERE id = v_record.id;
      
      v_error_count := v_error_count + 1;
    END;
  END LOOP;
  
  RETURN QUERY SELECT v_processed_count, v_error_count;
END;
$$;

-- Function to clear import table
CREATE OR REPLACE FUNCTION public.clear_excel_import_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.excel_import_temp WHERE processed = true;
END;
$$;

-- Grant necessary permissions
GRANT ALL ON public.excel_import_temp TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_excel_import() TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_excel_import_data() TO authenticated;

-- Create view for monitoring import status
CREATE OR REPLACE VIEW public.excel_import_status AS
SELECT 
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE processed = true AND error_message IS NULL) as successfully_processed,
  COUNT(*) FILTER (WHERE processed = true AND error_message IS NOT NULL) as errors,
  COUNT(*) FILTER (WHERE processed = false) as pending
FROM public.excel_import_temp;