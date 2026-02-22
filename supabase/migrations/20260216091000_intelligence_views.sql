create or replace view public.analytics_daily_agg as
select
  record_date::date as record_date,
  sum(feed_kg)::numeric as feed_kg,
  sum(feed_corn_kg)::numeric as feed_corn_kg,
  sum(feed_concentrate_kg)::numeric as feed_concentrate_kg,
  sum(feed_bran_kg)::numeric as feed_bran_kg,
  sum(eggs_total)::numeric as eggs_total,
  sum(eggs_kg)::numeric as eggs_kg,
  sum(mortality)::numeric as mortality,
  sum(population_start)::numeric as population_start
from public.daily_records
group by record_date::date;

create or replace view public.analytics_ews_daily as
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
  from public.analytics_daily_agg
),
calc as (
  select
    record_date,
    feed_kg,
    eggs_total,
    eggs_kg,
    mortality,
    population_start,
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
from calc;

create or replace view public.analytics_ews_latest as
select *
from public.analytics_ews_daily
where record_date = (select max(record_date) from public.analytics_ews_daily);

create or replace view public.analytics_profitability_daily as
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
  from public.analytics_daily_agg da
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
from base;

create or replace view public.analytics_profitability_latest as
select *
from public.analytics_profitability_daily
where record_date = (select max(record_date) from public.analytics_profitability_daily);

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
    'Jagung Giling' as item_name,
    (select current_stock from public.inventory_items where lower(name) like '%jagung%' and is_active = true order by updated_at desc limit 1) as current_stock,
    (select price_per_unit from public.inventory_items where lower(name) like '%jagung%' and is_active = true order by updated_at desc limit 1) as unit_price,
    (select avg_corn from usage) as avg_daily_usage
  union all
  select
    'Konsentrat Ayam Petelur',
    (select current_stock from public.inventory_items where lower(name) like '%konsentrat%' and is_active = true order by updated_at desc limit 1),
    (select price_per_unit from public.inventory_items where lower(name) like '%konsentrat%' and is_active = true order by updated_at desc limit 1),
    (select avg_concentrate from usage)
  union all
  select
    'Dedak Halus',
    (select current_stock from public.inventory_items where lower(name) like '%dedak%' and is_active = true order by updated_at desc limit 1),
    (select price_per_unit from public.inventory_items where lower(name) like '%dedak%' and is_active = true order by updated_at desc limit 1),
    (select avg_bran from usage)
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
  concat('https://wa.me/6281234567890?text=Order%20', replace(item_name, ' ', '%20')) as order_link
from items;

create or replace view public.analytics_fcr_daily as
select
  record_date,
  feed_kg,
  eggs_kg,
  case when eggs_kg is null or eggs_kg = 0 then null else feed_kg / eggs_kg end as fcr
from public.analytics_daily_agg;

create or replace view public.analytics_fcr_latest as
select
  record_date,
  feed_kg,
  eggs_kg,
  fcr,
  case
    when fcr is null then 'unknown'
    when fcr < 2.2 then 'green'
    when fcr < 2.4 then 'yellow'
    else 'red'
  end as fcr_zone,
  case
    when fcr is null then 'Data belum cukup.'
    when fcr < 2.2 then 'Efisien! Pakan Hemat.'
    when fcr < 2.4 then 'Perlu perhatian.'
    else 'Boros Pakan! Cek Kebocoran/Kualitas Pakan.'
  end as fcr_message
from public.analytics_fcr_daily
where record_date = (select max(record_date) from public.analytics_fcr_daily);
