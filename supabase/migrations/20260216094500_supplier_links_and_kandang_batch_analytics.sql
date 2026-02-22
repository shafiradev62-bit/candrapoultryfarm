create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  whatsapp text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.suppliers enable row level security;
create policy "Authenticated can view suppliers" on public.suppliers for select to authenticated using (true);
create policy "Logistics can manage suppliers" on public.suppliers for all to authenticated using (
  public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'farm_manager') or public.has_role(auth.uid(), 'logistik')
);

create table if not exists public.inventory_item_suppliers (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.inventory_item_suppliers enable row level security;
create policy "Authenticated can view item suppliers" on public.inventory_item_suppliers for select to authenticated using (true);
create policy "Logistics can manage item suppliers" on public.inventory_item_suppliers for all to authenticated using (
  public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'farm_manager') or public.has_role(auth.uid(), 'logistik')
);

insert into public.suppliers (id, name, phone, whatsapp, is_active)
values
  ('12121212-1212-1212-1212-121212121212', 'PT Pakan Sejahtera', '021-4447788', '6281234567891', true),
  ('13131313-1313-1313-1313-131313131313', 'CV Nutrisi Unggas', '021-5558899', '6281234567892', true)
on conflict (id) do nothing;

insert into public.inventory_item_suppliers (id, item_id, supplier_id, is_primary)
values
  ('14141414-1414-1414-1414-141414141414', '99999999-9999-9999-9999-999999999999', '12121212-1212-1212-1212-121212121212', true),
  ('15151515-1515-1515-1515-151515151515', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '13131313-1313-1313-1313-131313131313', true),
  ('16161616-1616-1616-1616-161616161616', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '12121212-1212-1212-1212-121212121212', true)
on conflict (id) do nothing;

create or replace view public.inventory_item_supplier_preferred as
select distinct on (iis.item_id)
  iis.item_id,
  s.id as supplier_id,
  s.name as supplier_name,
  s.phone as supplier_phone,
  s.whatsapp as supplier_whatsapp
from public.inventory_item_suppliers iis
join public.suppliers s on s.id = iis.supplier_id and s.is_active = true
order by iis.item_id, iis.is_primary desc, iis.created_at desc;

create or replace view public.analytics_inventory_forecast as
with latest_date as (
  select max(record_date)::date as record_date from public.daily_records
),
usage as (
  select
    avg(feed_corn_kg) as avg_corn,
    avg(feed_concentrate_kg) as avg_concentrate,
    avg(feed_bran_kg) as avg_bran
  from public.daily_records
  where record_date >= (select record_date - interval '6 day' from latest_date)
),
items as (
  select
    i.id as item_id,
    i.name as item_name,
    i.current_stock,
    i.price_per_unit,
    case
      when lower(i.name) like '%jagung%' then (select avg_corn from usage)
      when lower(i.name) like '%konsentrat%' then (select avg_concentrate from usage)
      when lower(i.name) like '%dedak%' then (select avg_bran from usage)
      else null
    end as avg_daily_usage
  from public.inventory_items i
  where i.is_active = true
    and (
      lower(i.name) like '%jagung%' or
      lower(i.name) like '%konsentrat%' or
      lower(i.name) like '%dedak%'
    )
),
items_with_supplier as (
  select
    it.*,
    isp.supplier_name,
    isp.supplier_phone,
    isp.supplier_whatsapp
  from items it
  left join public.inventory_item_supplier_preferred isp on isp.item_id = it.item_id
)
select
  item_name,
  current_stock,
  avg_daily_usage,
  case when avg_daily_usage is null or avg_daily_usage = 0 or current_stock is null then null else current_stock / avg_daily_usage end as days_remaining,
  case
    when avg_daily_usage is null or avg_daily_usage = 0 or current_stock is null then null
    else concat(item_name, ' habis dalam: ', ceil(current_stock / avg_daily_usage), ' hari lagi. Order sekarang!')
  end as alert_message,
  supplier_name,
  supplier_phone,
  supplier_whatsapp,
  case
    when supplier_whatsapp is null then null
    else concat('https://wa.me/', supplier_whatsapp, '?text=Order%20', replace(item_name, ' ', '%20'))
  end as order_link
from items_with_supplier;

create or replace function public.analytics_daily_agg_param(p_kandang_id uuid default null, p_flock_id uuid default null)
returns table (
  record_date date,
  feed_kg numeric,
  feed_corn_kg numeric,
  feed_concentrate_kg numeric,
  feed_bran_kg numeric,
  eggs_total numeric,
  eggs_kg numeric,
  mortality numeric,
  population_start numeric
)
language sql
stable
as $$
  select
    record_date::date,
    sum(feed_kg)::numeric,
    sum(feed_corn_kg)::numeric,
    sum(feed_concentrate_kg)::numeric,
    sum(feed_bran_kg)::numeric,
    sum(eggs_total)::numeric,
    sum(eggs_kg)::numeric,
    sum(mortality)::numeric,
    sum(population_start)::numeric
  from public.daily_records
  where (p_kandang_id is null or kandang_id = p_kandang_id)
    and (p_flock_id is null or flock_id = p_flock_id)
  group by record_date::date
$$;

create or replace function public.analytics_ews_param(p_kandang_id uuid default null, p_flock_id uuid default null)
returns table (
  record_date date,
  feed_kg numeric,
  eggs_total numeric,
  eggs_kg numeric,
  avg_feed_3d numeric,
  avg_eggs_3d numeric,
  feed_change_ratio numeric,
  mortality_rate numeric,
  feed_alert boolean,
  mortality_alert boolean,
  health_level text,
  health_message text
)
language sql
stable
as $$
  with base as (
    select
      record_date,
      feed_kg,
      eggs_total,
      eggs_kg,
      mortality,
      population_start,
      avg(feed_kg) over (order by record_date rows between 3 preceding and 1 preceding) as avg_feed_3d,
      avg(eggs_total) over (order by record_date rows between 3 preceding and 1 preceding) as avg_eggs_3d
    from public.analytics_daily_agg_param(p_kandang_id, p_flock_id)
  ),
  calc as (
    select
      record_date,
      feed_kg,
      eggs_total,
      eggs_kg,
      avg_feed_3d,
      avg_eggs_3d,
      case when avg_feed_3d is null or avg_feed_3d = 0 then null else (feed_kg - avg_feed_3d) / avg_feed_3d end as feed_change_ratio,
      case when population_start is null or population_start = 0 then null else mortality / population_start end as mortality_rate
    from base
  )
  select
    record_date,
    feed_kg,
    eggs_total,
    eggs_kg,
    avg_feed_3d,
    avg_eggs_3d,
    feed_change_ratio,
    mortality_rate,
    case when feed_change_ratio <= -0.05 then true else false end as feed_alert,
    case when mortality_rate > 0.001 then true else false end as mortality_alert,
    case
      when feed_change_ratio <= -0.05 then 'danger'
      when mortality_rate > 0.001 then 'warning'
      else 'safe'
    end as health_level,
    case
      when feed_change_ratio <= -0.05 then 'Bahaya: Nafsu Makan Turun! Cek Kesehatan Ayam.'
      when mortality_rate > 0.001 then 'Warning: Indikasi Wabah/Penyakit.'
      else 'Aman: Kondisi stabil.'
    end as health_message
  from calc
$$;

create or replace function public.analytics_ews_latest_param(p_kandang_id uuid default null, p_flock_id uuid default null)
returns table (
  record_date date,
  feed_kg numeric,
  eggs_total numeric,
  eggs_kg numeric,
  avg_feed_3d numeric,
  avg_eggs_3d numeric,
  feed_change_ratio numeric,
  mortality_rate numeric,
  feed_alert boolean,
  mortality_alert boolean,
  health_level text,
  health_message text
)
language sql
stable
as $$
  select * from public.analytics_ews_param(p_kandang_id, p_flock_id)
  order by record_date desc
  limit 1
$$;

create or replace function public.analytics_profitability_param(p_kandang_id uuid default null, p_flock_id uuid default null)
returns table (
  record_date date,
  eggs_kg numeric,
  eggs_total numeric,
  feed_kg numeric,
  feed_cost numeric,
  operational_cost_daily numeric,
  modal_per_kg numeric,
  sell_price_per_kg numeric,
  profit_per_kg numeric
)
language sql
stable
as $$
  with price_map as (
    select
      max(case when lower(name) like '%jagung%' then price_per_unit end) as corn_price,
      max(case when lower(name) like '%konsentrat%' then price_per_unit end) as concentrate_price,
      max(case when lower(name) like '%dedak%' then price_per_unit end) as bran_price
    from public.inventory_items
    where is_active = true
  ),
  monthly_costs as (
    select
      date_trunc('month', je.entry_date) as month_start,
      sum(
        case
          when coa.name ilike '%tenaga kerja%' or coa.name ilike '%gaji%' then coalesce(jl.debit, 0) - coalesce(jl.credit, 0)
          else 0
        end
      ) as wages_month,
      sum(
        case
          when coa.name ilike '%listrik%' then coalesce(jl.debit, 0) - coalesce(jl.credit, 0)
          else 0
        end
      ) as electricity_month
    from public.journal_entries je
    join public.journal_lines jl on jl.entry_id = je.id
    left join public.chart_of_accounts coa on coa.id = jl.account_id or coa.code = jl.account_id
    group by date_trunc('month', je.entry_date)
  ),
  sales_daily as (
    select
      so.order_date::date as record_date,
      sum(si.subtotal) as sales_amount,
      sum(si.quantity) as qty_butir
    from public.sales_orders so
    join public.so_items si on si.so_id = so.id
    join public.products p on p.id = si.product_id
    where p.category = 'telur'
    group by so.order_date::date
  ),
  base as (
    select
      da.record_date,
      da.eggs_kg,
      da.eggs_total,
      da.feed_corn_kg,
      da.feed_concentrate_kg,
      da.feed_bran_kg,
      da.feed_kg,
      pm.corn_price,
      pm.concentrate_price,
      pm.bran_price,
      sd.sales_amount,
      sd.qty_butir,
      mc.wages_month,
      mc.electricity_month
    from public.analytics_daily_agg_param(p_kandang_id, p_flock_id) da
    cross join price_map pm
    left join sales_daily sd on sd.record_date = da.record_date
    left join monthly_costs mc on mc.month_start = date_trunc('month', da.record_date)
  )
  select
    record_date,
    eggs_kg,
    eggs_total,
    feed_kg,
    (coalesce(feed_corn_kg, 0) * coalesce(corn_price, 0) + coalesce(feed_concentrate_kg, 0) * coalesce(concentrate_price, 0) + coalesce(feed_bran_kg, 0) * coalesce(bran_price, 0)) as feed_cost,
    ((coalesce(wages_month, 0) + coalesce(electricity_month, 0)) / 30.0) as operational_cost_daily,
    case
      when eggs_kg is null or eggs_kg = 0 then null
      else
        ((coalesce(feed_corn_kg, 0) * coalesce(corn_price, 0) + coalesce(feed_concentrate_kg, 0) * coalesce(concentrate_price, 0) + coalesce(feed_bran_kg, 0) * coalesce(bran_price, 0)) + ((coalesce(wages_month, 0) + coalesce(electricity_month, 0)) / 30.0)) / eggs_kg
    end as modal_per_kg,
    case
      when eggs_total is null or eggs_total = 0 or qty_butir is null or qty_butir = 0 then null
      else (sales_amount / (qty_butir * (eggs_kg / eggs_total)))
    end as sell_price_per_kg,
    case
      when eggs_kg is null or eggs_kg = 0 then null
      when qty_butir is null or qty_butir = 0 then null
      when eggs_total is null or eggs_total = 0 then null
      else (sales_amount / (qty_butir * (eggs_kg / eggs_total))) -
        (((coalesce(feed_corn_kg, 0) * coalesce(corn_price, 0) + coalesce(feed_concentrate_kg, 0) * coalesce(concentrate_price, 0) + coalesce(feed_bran_kg, 0) * coalesce(bran_price, 0)) + ((coalesce(wages_month, 0) + coalesce(electricity_month, 0)) / 30.0)) / eggs_kg)
    end as profit_per_kg
  from base
$$;

create or replace function public.analytics_profitability_latest_param(p_kandang_id uuid default null, p_flock_id uuid default null)
returns table (
  record_date date,
  eggs_kg numeric,
  eggs_total numeric,
  feed_kg numeric,
  feed_cost numeric,
  operational_cost_daily numeric,
  modal_per_kg numeric,
  sell_price_per_kg numeric,
  profit_per_kg numeric
)
language sql
stable
as $$
  select * from public.analytics_profitability_param(p_kandang_id, p_flock_id)
  order by record_date desc
  limit 1
$$;

create or replace function public.analytics_fcr_param(p_kandang_id uuid default null, p_flock_id uuid default null)
returns table (
  record_date date,
  feed_kg numeric,
  eggs_kg numeric,
  fcr numeric,
  fcr_zone text,
  fcr_message text
)
language sql
stable
as $$
  select
    record_date,
    feed_kg,
    eggs_kg,
    case when eggs_kg is null or eggs_kg = 0 then null else feed_kg / eggs_kg end as fcr,
    case
      when eggs_kg is null or eggs_kg = 0 then 'unknown'
      when feed_kg / eggs_kg < 2.2 then 'green'
      when feed_kg / eggs_kg < 2.4 then 'yellow'
      else 'red'
    end as fcr_zone,
    case
      when eggs_kg is null or eggs_kg = 0 then 'Data belum cukup.'
      when feed_kg / eggs_kg < 2.2 then 'Efisien! Pakan Hemat.'
      when feed_kg / eggs_kg < 2.4 then 'Perlu perhatian.'
      else 'Boros Pakan! Cek Kebocoran/Kualitas Pakan.'
    end as fcr_message
  from public.analytics_daily_agg_param(p_kandang_id, p_flock_id)
$$;

create or replace function public.analytics_fcr_latest_param(p_kandang_id uuid default null, p_flock_id uuid default null)
returns table (
  record_date date,
  feed_kg numeric,
  eggs_kg numeric,
  fcr numeric,
  fcr_zone text,
  fcr_message text
)
language sql
stable
as $$
  select * from public.analytics_fcr_param(p_kandang_id, p_flock_id)
  order by record_date desc
  limit 1
$$;
