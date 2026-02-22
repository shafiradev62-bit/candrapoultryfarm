CREATE TABLE IF NOT EXISTS public.daily_reports (
  record_date date PRIMARY KEY,
  age_weeks integer NOT NULL,
  population integer NOT NULL,
  mortality integer NOT NULL,
  feed_total_kg numeric(10, 2) NOT NULL,
  feed_corn_kg numeric(10, 2) NOT NULL,
  feed_conc_kg numeric(10, 2) NOT NULL,
  feed_bran_kg numeric(10, 2) NOT NULL,
  eggs_collected integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.inventory (
  log_date date NOT NULL,
  item text NOT NULL,
  in_qty numeric(12, 2) NOT NULL,
  current_stock numeric(12, 2) NOT NULL,
  PRIMARY KEY (log_date, item)
);

CREATE TABLE IF NOT EXISTS public.operational (
  expense_date date NOT NULL,
  item text NOT NULL,
  qty integer NOT NULL,
  unit text NOT NULL,
  price numeric(14, 2) NOT NULL,
  total numeric(14, 2) NOT NULL,
  PRIMARY KEY (expense_date, item)
);

DELETE FROM public.daily_reports;
DELETE FROM public.inventory;
DELETE FROM public.operational;

INSERT INTO public.daily_reports (
  record_date, age_weeks, population, mortality,
  feed_total_kg, feed_corn_kg, feed_conc_kg, feed_bran_kg,
  eggs_collected
)
VALUES
  ('2024-05-12', 15, 1009, 0, 70.63, 31.78, 22.60, 16.24, 0),
  ('2024-05-13', 15, 1009, 0, 70.63, 31.78, 22.60, 16.24, 0),
  ('2024-05-14', 15, 1009, 0, 70.63, 31.78, 22.60, 16.24, 0),
  ('2024-05-19', 16, 1009, 0, 72.65, 32.69, 23.24, 16.70, 0),
  ('2024-05-20', 16, 1009, 1, 72.65, 32.69, 23.24, 16.70, 0),
  ('2024-05-26', 17, 1008, 0, 75.60, 34.02, 24.19, 17.38, 0),
  ('2024-06-02', 18, 1008, 0, 80.64, 36.28, 25.80, 18.54, 0),
  ('2024-06-09', 19, 1008, 0, 85.68, 42.84, 28.27, 14.56, 0);

INSERT INTO public.inventory (log_date, item, in_qty, current_stock)
VALUES
  ('2024-05-12', 'Jagung', 1000.0, 1000.0),
  ('2024-05-12', 'Konsentrat', 700.0, 700.0),
  ('2024-05-12', 'Dedak', 65.0, 65.0),
  ('2024-05-14', 'Dedak', 130.0, 162.51),
  ('2024-05-26', 'Dedak', 260.0, 353.25),
  ('2024-06-06', 'Jagung', 350.0, 511.02),
  ('2024-06-06', 'Konsentrat', 250.0, 353.39),
  ('2024-06-08', 'Dedak', 260.0, 379.09);

INSERT INTO public.operational (expense_date, item, qty, unit, price, total)
VALUES
  ('2024-07-07', 'Tray Telur', 2, 'ball', 80000, 160000),
  ('2024-07-07', 'KLK 36', 6, 'sak', 510000, 3060000),
  ('2024-10-07', 'Koleridin', 2, 'botol', 10000, 20000),
  ('2024-12-07', 'Vaksin ND IB Kill', 1, 'botol', 420000, 420000);
