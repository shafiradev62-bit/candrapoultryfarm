
-- =============================================
-- PETELURPRO DATABASE SCHEMA
-- =============================================

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('super_admin', 'farm_manager', 'kandang_supervisor', 'keuangan', 'logistik');
CREATE TYPE public.flock_stage AS ENUM ('doc', 'brooding', 'grower', 'layer', 'depopulation');
CREATE TYPE public.kandang_type AS ENUM ('cage', 'floor');
CREATE TYPE public.po_status AS ENUM ('draft', 'approved', 'received', 'cancelled');
CREATE TYPE public.so_status AS ENUM ('draft', 'confirmed', 'picking', 'packing', 'shipped', 'invoiced', 'cancelled');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.egg_grade AS ENUM ('A', 'B', 'C');
CREATE TYPE public.account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
CREATE TYPE public.inventory_tx_type AS ENUM ('purchase', 'usage', 'transfer_in', 'transfer_out', 'adjustment', 'sale');

-- 2. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. USER ROLES (separate table per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'kandang_supervisor',
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 4. FARMS
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view farms" ON public.farms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage farms" ON public.farms FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager'));

-- 5. KANDANG
CREATE TABLE public.kandang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  type kandang_type NOT NULL DEFAULT 'cage',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kandang ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view kandang" ON public.kandang FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage kandang" ON public.kandang FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager')
);

-- 6. FLOCKS
CREATE TABLE public.flocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kandang_id UUID NOT NULL REFERENCES public.kandang(id) ON DELETE CASCADE,
  batch_code TEXT NOT NULL,
  breed TEXT NOT NULL DEFAULT 'Isa Brown',
  doc_date DATE NOT NULL,
  initial_population INTEGER NOT NULL,
  current_population INTEGER NOT NULL,
  stage flock_stage NOT NULL DEFAULT 'doc',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.flocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view flocks" ON public.flocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage flocks" ON public.flocks FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager') OR public.has_role(auth.uid(), 'kandang_supervisor')
);

-- 7. DAILY RECORDS (per kandang per day)
CREATE TABLE public.daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kandang_id UUID NOT NULL REFERENCES public.kandang(id) ON DELETE CASCADE,
  flock_id UUID NOT NULL REFERENCES public.flocks(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  population_start INTEGER NOT NULL DEFAULT 0,
  mortality INTEGER NOT NULL DEFAULT 0,
  mortality_cause TEXT,
  culled INTEGER NOT NULL DEFAULT 0,
  transferred INTEGER NOT NULL DEFAULT 0,
  eggs_total INTEGER NOT NULL DEFAULT 0,
  eggs_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  eggs_grade_a INTEGER NOT NULL DEFAULT 0,
  eggs_grade_b INTEGER NOT NULL DEFAULT 0,
  eggs_grade_c INTEGER NOT NULL DEFAULT 0,
  eggs_broken INTEGER NOT NULL DEFAULT 0,
  eggs_dirty INTEGER NOT NULL DEFAULT 0,
  feed_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  feed_type TEXT,
  water_liters NUMERIC(10,2) DEFAULT 0,
  electricity_kwh NUMERIC(10,2) DEFAULT 0,
  medicine_notes TEXT,
  vaccination_notes TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(kandang_id, record_date)
);
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view records" ON public.daily_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage records" ON public.daily_records FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager') OR public.has_role(auth.uid(), 'kandang_supervisor')
);

-- 8. INVENTORY ITEMS (master barang)
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  current_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
  min_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_per_unit NUMERIC(14,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view inventory" ON public.inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Logistik can manage inventory" ON public.inventory_items FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager') OR public.has_role(auth.uid(), 'logistik')
);

-- 9. INVENTORY TRANSACTIONS
CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  tx_type inventory_tx_type NOT NULL,
  quantity NUMERIC(12,2) NOT NULL,
  unit_price NUMERIC(14,2) DEFAULT 0,
  reference_id UUID,
  reference_type TEXT,
  kandang_id UUID REFERENCES public.kandang(id),
  notes TEXT,
  tx_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view inv tx" ON public.inventory_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can create inv tx" ON public.inventory_transactions FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager') OR public.has_role(auth.uid(), 'logistik') OR public.has_role(auth.uid(), 'kandang_supervisor')
);

-- 10. PURCHASE ORDERS
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  status po_status NOT NULL DEFAULT 'draft',
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  received_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view POs" ON public.purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage POs" ON public.purchase_orders FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager') OR public.has_role(auth.uid(), 'logistik')
);

CREATE TABLE public.po_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  quantity NUMERIC(12,2) NOT NULL,
  unit_price NUMERIC(14,2) NOT NULL,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0
);
ALTER TABLE public.po_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view PO items" ON public.po_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage PO items" ON public.po_items FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager') OR public.has_role(auth.uid(), 'logistik')
);

-- 11. PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'telur',
  unit TEXT NOT NULL DEFAULT 'butir',
  base_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage products" ON public.products FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager')
);

-- 12. CUSTOMERS
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'toko',
  address TEXT,
  phone TEXT,
  email TEXT,
  pricing_tier TEXT DEFAULT 'standard',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales can manage customers" ON public.customers FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager')
);

-- 13. SALES ORDERS
CREATE TABLE public.sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  so_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  status so_status NOT NULL DEFAULT 'draft',
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view SOs" ON public.sales_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage SOs" ON public.sales_orders FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager')
);

CREATE TABLE public.so_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  so_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity NUMERIC(12,2) NOT NULL,
  unit_price NUMERIC(14,2) NOT NULL,
  discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0
);
ALTER TABLE public.so_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view SO items" ON public.so_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage SO items" ON public.so_items FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager')
);

-- 14. INVOICES
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  so_id UUID REFERENCES public.sales_orders(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  status invoice_status NOT NULL DEFAULT 'draft',
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  due_date DATE,
  paid_date DATE,
  paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Finance can manage invoices" ON public.invoices FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'farm_manager') OR public.has_role(auth.uid(), 'keuangan')
);

-- 15. CHART OF ACCOUNTS
CREATE TABLE public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type account_type NOT NULL,
  parent_id UUID REFERENCES public.chart_of_accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view COA" ON public.chart_of_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Finance can manage COA" ON public.chart_of_accounts FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'keuangan')
);

-- 16. JOURNAL ENTRIES
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number TEXT NOT NULL UNIQUE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  is_auto BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view journals" ON public.journal_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Finance can manage journals" ON public.journal_entries FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'keuangan')
);

CREATE TABLE public.journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  debit NUMERIC(14,2) NOT NULL DEFAULT 0,
  credit NUMERIC(14,2) NOT NULL DEFAULT 0,
  description TEXT
);
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view journal lines" ON public.journal_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Finance can manage journal lines" ON public.journal_lines FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'keuangan')
);

-- 17. AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 18. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_farms_updated_at BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_kandang_updated_at BEFORE UPDATE ON public.kandang FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_flocks_updated_at BEFORE UPDATE ON public.flocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_daily_records_updated_at BEFORE UPDATE ON public.daily_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_sales_orders_updated_at BEFORE UPDATE ON public.sales_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 19. INDEXES
CREATE INDEX idx_daily_records_date ON public.daily_records(record_date);
CREATE INDEX idx_daily_records_kandang ON public.daily_records(kandang_id);
CREATE INDEX idx_flocks_kandang ON public.flocks(kandang_id);
CREATE INDEX idx_inventory_tx_item ON public.inventory_transactions(item_id);
CREATE INDEX idx_inventory_tx_date ON public.inventory_transactions(tx_date);
CREATE INDEX idx_so_customer ON public.sales_orders(customer_id);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_journal_lines_entry ON public.journal_lines(entry_id);
CREATE INDEX idx_journal_lines_account ON public.journal_lines(account_id);
