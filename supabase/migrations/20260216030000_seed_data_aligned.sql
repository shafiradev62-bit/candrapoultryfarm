-- =============================================
-- SEED DATA ALIGNED WITH INDONESIAN LIVESTOCK FARMING
-- =============================================

-- Insert default farm
INSERT INTO public.farms (id, name, address, phone, logo_url)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'CANDRA POULTRY FARM',
  'Jl. Raya Peternakan No. 123, Jakarta',
  '021-1234567',
  '/logo.png'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample kandang (coops)
INSERT INTO public.kandang (id, farm_id, code, name, capacity, type, is_active)
VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'K001', 'Kandang Utama', 5000, 'cage', true),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'K002', 'Kandang Barat', 3000, 'cage', true),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'K003', 'Kandang Timur', 2500, 'floor', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample flocks (batch/ayam)
INSERT INTO public.flocks (id, kandang_id, batch_code, breed, doc_date, initial_population, current_population, stage, is_active)
VALUES
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'BATCH-001', 'Lohmann Brown', '2026-01-15', 5000, 4850, 'layer', true),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'BATCH-002', 'Hy-Line Brown', '2026-02-01', 3000, 2950, 'layer', true),
  ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'BATCH-003', 'ISA Brown', '2026-02-10', 2500, 2480, 'grower', true)
ON CONFLICT (id) DO NOTHING;

-- Insert inventory items (barang)
INSERT INTO public.inventory_items (id, code, name, category, unit, current_stock, min_stock, price_per_unit, is_active)
VALUES
  ('88888888-8888-8888-8888-888888888888', 'BRS-001', 'Beras Kualitas Premium', 'bahan_baku', 'kg', 1500, 200, 12500, true),
  ('99999999-9999-9999-9999-999999999999', 'JAG-001', 'Jagung Giling', 'bahan_baku', 'kg', 2000, 300, 8500, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'KON-001', 'Konsentrat Ayam Petelur', 'bahan_baku', 'kg', 800, 100, 18500, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'BRA-001', 'Dedak Halus', 'bahan_baku', 'kg', 1200, 150, 6500, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'VIT-001', 'Vitamin ABC', 'obat_vitamin', 'pcs', 50, 10, 25000, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'OBAT-001', 'Obat Anti Gumboro', 'obat_vitamin', 'pcs', 30, 5, 35000, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'PLS-001', 'Plastik Telur', 'kemasan', 'pcs', 10000, 1000, 150, true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'KRT-001', 'Karton Telur', 'kemasan', 'pcs', 5000, 500, 3500, true)
ON CONFLICT (id) DO NOTHING;

-- Insert products (produk telur)
INSERT INTO public.products (id, code, name, category, unit, base_price, egg_size, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'TEL-A', 'Telur Ayam Grade A', 'telur', 'butir', 2500, 'sedang', true),
  ('00000000-0000-0000-0000-000000000002', 'TEL-B', 'Telur Ayam Grade B', 'telur', 'butir', 2200, 'sedang', true),
  ('00000000-0000-0000-0000-000000000003', 'TEL-C', 'Telur Ayam Grade C', 'telur', 'butir', 1800, 'sedang', true),
  ('00000000-0000-0000-0000-000000000004', 'TEL-BR', 'Telur Pecah/Rusak', 'telur', 'butir', 500, 'sedang', true)
ON CONFLICT (id) DO NOTHING;

-- Insert customers (pelanggan)
INSERT INTO public.customers (id, code, name, type, address, phone, email, pricing_tier, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111112', 'CUST-001', 'Toko Sembako Makmur', 'toko', 'Jl. Merdeka No. 45, Jakarta', '021-9876543', 'makmur@gmail.com', 'standard', true),
  ('11111111-1111-1111-1111-111111111113', 'CUST-002', 'Supermarket Sejahtera', 'supermarket', 'Jl. Sudirman No. 100, Jakarta', '021-8765432', 'sejahtera@supermarket.co.id', 'premium', true),
  ('11111111-1111-1111-1111-111111111114', 'CUST-003', 'Pasar Tradisional Mulya', 'pasar', 'Pasar Mulya Blok A12, Jakarta', '021-7654321', 'mulya@pasar.go.id', 'standard', true),
  ('11111111-1111-1111-1111-111111111115', 'CUST-004', 'Restoran Ayam Kremes', 'restoran', 'Jl. Kebon Jeruk No. 78, Jakarta', '021-6543210', 'ayamkremes@resto.com', 'bulk', true)
ON CONFLICT (id) DO NOTHING;

-- Insert chart of accounts (COA)
INSERT INTO public.chart_of_accounts (id, code, name, type, is_active)
VALUES
  -- Assets
  ('22222222-2222-2222-2222-222222222223', '1000', 'AKTIVA', 'asset', true),
  ('22222222-2222-2222-2222-222222222224', '1100', 'Kas dan Bank', 'asset', true),
  ('22222222-2222-2222-2222-222222222225', '1200', 'Piutang Dagang', 'asset', true),
  ('22222222-2222-2222-2222-222222222226', '1300', 'Persediaan', 'asset', true),
  ('22222222-2222-2222-2222-222222222227', '1400', 'Aktiva Tetap', 'asset', true),
  
  -- Liabilities
  ('33333333-3333-3333-3333-333333333334', '2000', 'KEWAJIBAN', 'liability', true),
  ('33333333-3333-3333-3333-333333333335', '2100', 'Hutang Dagang', 'liability', true),
  ('33333333-3333-3333-3333-333333333336', '2200', 'Hutang Pajak', 'liability', true),
  
  -- Equity
  ('44444444-4444-4444-4444-444444444445', '3000', 'EKUITAS', 'equity', true),
  ('44444444-4444-4444-4444-444444444446', '3100', 'Modal', 'equity', true),
  ('44444444-4444-4444-4444-444444444447', '3200', 'Laba Ditahan', 'equity', true),
  
  -- Revenue
  ('55555555-5555-5555-5555-555555555556', '4000', 'PENDAPATAN', 'revenue', true),
  ('55555555-5555-5555-5555-555555555557', '4100', 'Penjualan Telur', 'revenue', true),
  ('55555555-5555-5555-5555-555555555558', '4200', 'Penjualan Ayam', 'revenue', true),
  
  -- Expenses
  ('66666666-6666-6666-6666-666666666667', '5000', 'BIAYA', 'expense', true),
  ('66666666-6666-6666-6666-666666666668', '5100', 'Biaya Pakan', 'expense', true),
  ('66666666-6666-6666-6666-666666666669', '5200', 'Biaya Tenaga Kerja', 'expense', true),
  ('66666666-6666-6666-6666-666666666670', '5300', 'Biaya Obat & Vitamin', 'expense', true),
  ('66666666-6666-6666-6666-666666666671', '5400', 'Biaya Listrik', 'expense', true),
  ('66666666-6666-6666-6666-666666666672', '5500', 'Biaya Air', 'expense', true),
  ('66666666-6666-6666-6666-666666666673', '5600', 'Biaya Maintenance', 'expense', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample daily records
INSERT INTO public.daily_records (
  id, kandang_id, flock_id, record_date, population_start, mortality, 
  eggs_total, eggs_kg, eggs_grade_a, eggs_grade_b, eggs_grade_c, eggs_broken, eggs_dirty,
  feed_kg, feed_type, water_liters, electricity_kwh, medicine_notes, notes,
  usia_minggu, jual_ayam, vitamin_obat
)
VALUES
  (
    '77777777-7777-7777-7777-777777777778',
    '22222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555',
    '2026-02-16',
    4850, 2, 'Docility cause',
    4500, 400.00, 4000, 400, 50, 30, 20,
    1200.00, 'Campuran Layer', 2500.00, 350.00, 'Vitamin A-B-C diberikan', 'Kondisi kandang baik',
    24, 0, 'Vitamin ABC'
  ),
  (
    '77777777-7777-7777-7777-777777777779',
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666666',
    '2026-02-16',
    2950, 1, 'Respiratory issue',
    2800, 250.00, 2500, 200, 30, 15, 10,
    750.00, 'Layer Premium', 1800.00, 280.00, 'Obat anti Gumboro', 'Produksi stabil',
    22, 0, 'Obat Gumboro'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample inventory transactions
INSERT INTO public.inventory_transactions (
  id, item_id, tx_type, quantity, unit_price, reference_type, tx_date, notes
)
VALUES
  ('88888888-8888-8888-8888-888888888889', '88888888-8888-8888-8888-888888888888', 'purchase', 1000, 12500, 'purchase_order', '2026-02-15', 'Pembelian beras bulan ini'),
  ('88888888-8888-8888-8888-888888888890', '99999999-9999-9999-9999-999999999999', 'purchase', 1500, 8500, 'purchase_order', '2026-02-15', 'Pembelian jagung'),
  ('88888888-8888-8888-8888-888888888891', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'purchase', 500, 18500, 'purchase_order', '2026-02-15', 'Pembelian konsentrat'),
  ('88888888-8888-8888-8888-888888888892', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'purchase', 800, 6500, 'purchase_order', '2026-02-15', 'Pembelian dedak')
ON CONFLICT (id) DO NOTHING;

-- Insert sample purchase orders
INSERT INTO public.purchase_orders (id, po_number, supplier_name, status, total_amount, order_date, expected_date)
VALUES
  ('99999999-9999-9999-9999-999999999990', 'PO-001', 'PT. Pakan Ternak Sejahtera', 'received', 55250000, '2026-02-15', '2026-02-17'),
  ('99999999-9999-9999-9999-999999999991', 'PO-002', 'CV. Bahan Baku Peternakan', 'approved', 31200000, '2026-02-16', '2026-02-20')
ON CONFLICT (id) DO NOTHING;

-- Insert sample purchase order items
INSERT INTO public.po_items (id, po_id, item_id, quantity, unit_price, subtotal)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '99999999-9999-9999-9999-999999999990', '88888888-8888-8888-8888-888888888888', 1000, 12500, 12500000),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', '99999999-9999-9999-9999-999999999990', '99999999-9999-9999-9999-999999999999', 1500, 8500, 12750000),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', '99999999-9999-9999-9999-999999999990', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 500, 18500, 9250000),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae', '99999999-9999-9999-9999-999999999990', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 800, 6500, 5200000),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaf', '99999999-9999-9999-9999-999999999991', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 20, 25000, 500000),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaag', '99999999-9999-9999-9999-999999999991', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 15, 35000, 525000)
ON CONFLICT (id) DO NOTHING;

-- Insert sample sales orders
INSERT INTO public.sales_orders (id, so_number, customer_id, status, total_amount, order_date, delivery_date)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', 'SO-001', '11111111-1111-1111-1111-111111111112', 'confirmed', 12500000, '2026-02-16', '2026-02-17'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'SO-002', '11111111-1111-1111-1111-111111111113', 'picking', 25000000, '2026-02-16', '2026-02-18')
ON CONFLICT (id) DO NOTHING;

-- Insert sample sales order items
INSERT INTO public.so_items (id, so_id, product_id, quantity, unit_price, discount_pct, subtotal)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc00', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', '00000000-0000-0000-0000-000000000001', 5000, 2500, 0, 12500000),
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '00000000-0000-0000-0000-000000000001', 8000, 2500, 2, 19600000),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '00000000-0000-0000-0000-000000000002', 2000, 2200, 2, 4312000)
ON CONFLICT (id) DO NOTHING;

-- Insert sample invoices
INSERT INTO public.invoices (id, invoice_number, so_id, customer_id, status, subtotal, tax_amount, total_amount, due_date)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddd00', 'INV-001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', '11111111-1111-1111-1111-111111111112', 'sent', 12500000, 1250000, 13750000, '2026-03-16'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd01', 'INV-002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111113', 'draft', 23912000, 2391200, 26303200, '2026-03-18')
ON CONFLICT (id) DO NOTHING;

-- Insert sample journal entries (automatic from transactions)
INSERT INTO public.journal_entries (id, entry_number, entry_date, description, reference_type, reference_id, is_auto)
VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee00', 'JE-001', '2026-02-16', 'Pembelian bahan baku', 'purchase_order', '99999999-9999-9999-9999-999999999990', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'JE-002', '2026-02-16', 'Penjualan telur', 'sales_order', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample journal lines
INSERT INTO public.journal_lines (id, entry_id, account_id, debit, credit, description)
VALUES
  -- JE-001: Purchase entry
  ('ffffffff-ffff-ffff-ffff-ffffffffff00', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee00', '22222222-2222-2222-2222-222222222224', 0, 55250000, 'Kas keluar untuk pembelian'),
  ('ffffffff-ffff-ffff-ffff-ffffffffff01', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee00', '1300', 55250000, 0, 'Persediaan bertambah'),
  
  -- JE-002: Sales entry
  ('ffffffff-ffff-ffff-ffff-ffffffffff02', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', '1100', 12500000, 0, 'Kas masuk dari penjualan'),
  ('ffffffff-ffff-ffff-ffff-ffffffffff03', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', '55555555-5555-5555-5555-555555555557', 0, 12500000, 'Pendapatan penjualan')
ON CONFLICT (id) DO NOTHING;