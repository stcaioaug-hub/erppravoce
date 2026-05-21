create extension if not exists "pgcrypto";

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  sku text not null unique,
  name text not null,
  description text default '',
  category text default '',
  barcode text default '',
  cost_price numeric(12,2) not null default 0,
  sale_price numeric(12,2) not null default 0,
  margin numeric(8,2) not null default 0,
  current_stock numeric(12,3) not null default 0,
  min_stock numeric(12,3) not null default 0,
  unit text not null default 'UN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  document text default '',
  email text default '',
  phone text default '',
  address text default '',
  total_spent numeric(12,2) not null default 0,
  last_purchase timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  cnpj text default '',
  email text default '',
  phone text default '',
  category text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id text primary key default gen_random_uuid()::text,
  sale_date timestamptz not null default now(),
  customer_id text references public.customers(id) on delete set null,
  customer_name text default 'Consumidor Final',
  total_before_discount numeric(12,2) not null default 0,
  total_discount numeric(12,2) not null default 0,
  final_total numeric(12,2) not null default 0,
  payment_method text not null,
  status text not null,
  seller_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id text primary key default gen_random_uuid()::text,
  sale_id text not null references public.sales(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  quantity numeric(12,3) not null,
  price numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id text primary key default gen_random_uuid()::text,
  product_id text not null references public.products(id) on delete cascade,
  movement_date timestamptz not null default now(),
  type text not null check (type in ('IN', 'OUT', 'ADJUST')),
  quantity numeric(12,3) not null,
  reason text not null,
  user_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.financial_entries (
  id text primary key default gen_random_uuid()::text,
  description text not null,
  type text not null,
  category text not null,
  amount numeric(12,2) not null,
  due_date timestamptz not null,
  payment_date timestamptz,
  status text not null,
  reference_id text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.financial_entries enable row level security;

drop policy if exists "App users can manage products" on public.products;
drop policy if exists "App users can manage customers" on public.customers;
drop policy if exists "App users can manage suppliers" on public.suppliers;
drop policy if exists "App users can manage sales" on public.sales;
drop policy if exists "App users can manage sale items" on public.sale_items;
drop policy if exists "App users can manage stock movements" on public.stock_movements;
drop policy if exists "App users can manage financial entries" on public.financial_entries;

create policy "App users can manage products" on public.products
  for all to anon, authenticated using (true) with check (true);
create policy "App users can manage customers" on public.customers
  for all to anon, authenticated using (true) with check (true);
create policy "App users can manage suppliers" on public.suppliers
  for all to anon, authenticated using (true) with check (true);
create policy "App users can manage sales" on public.sales
  for all to anon, authenticated using (true) with check (true);
create policy "App users can manage sale items" on public.sale_items
  for all to anon, authenticated using (true) with check (true);
create policy "App users can manage stock movements" on public.stock_movements
  for all to anon, authenticated using (true) with check (true);
create policy "App users can manage financial entries" on public.financial_entries
  for all to anon, authenticated using (true) with check (true);

insert into public.products (id, sku, name, description, category, barcode, cost_price, sale_price, margin, current_stock, min_stock, unit)
values
  ('p1', 'BEB-001', 'Coca-Cola 2L', 'Refrigerante de cola 2 litros', 'Bebidas', '7891234560012', 6.50, 12.00, 45.8, 48, 20, 'UN'),
  ('p2', 'LIM-002', 'Detergente Ype 500ml', 'Detergente liquido neutro', 'Limpeza', '7891234560029', 1.80, 3.50, 48.5, 12, 24, 'UN'),
  ('p3', 'ALI-003', 'Arroz Tio Joao 5kg', 'Arroz agulhinha tipo 1', 'Alimentos', '7891234560036', 22.00, 32.90, 33.1, 15, 10, 'PCT'),
  ('p4', 'ALI-004', 'Feijao Carioca 1kg', 'Feijao carioca tipo 1', 'Alimentos', '7891234560043', 5.40, 8.90, 39.3, 30, 15, 'KG'),
  ('p5', 'PAD-005', 'Leite Integral 1L', 'Leite UHT integral caixa', 'Padaria', '7891234560050', 3.80, 5.50, 30.9, 8, 20, 'CX')
on conflict (id) do nothing;

insert into public.customers (id, name, document, email, phone, address, total_spent, last_purchase)
values
  ('c1', 'Maria Silva', '123.456.789-00', 'maria@gmail.com', '(11) 98765-4321', 'Rua das Flores, 123 - SP', 1250.40, now() - interval '2 days'),
  ('c2', 'Joao Pereira', '987.654.321-11', 'joao.p@outlook.com', '(11) 91234-5678', 'Av. Paulista, 1000 - SP', 450.20, now() - interval '15 days')
on conflict (id) do nothing;

insert into public.suppliers (id, name, cnpj, email, phone, category)
values
  ('s1', 'Distribuidora ABC', '12.345.678/0001-99', 'contato@abc.com', '(11) 4004-0000', 'Geral')
on conflict (id) do nothing;

-- === BUSINESS VISION SCHEMA ===

create table if not exists public.business_plan_sections (
  id text primary key default gen_random_uuid()::text,
  company_id text not null default 'default_company_1',
  title text not null,
  body text default '',
  updated_at timestamptz not null default now(),
  unique(company_id, title)
);

create table if not exists public.business_next_steps (
  id text primary key default gen_random_uuid()::text,
  company_id text not null default 'default_company_1',
  text text not null,
  completed boolean not null default false,
  "order" integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.business_simulations (
  id text primary key default gen_random_uuid()::text,
  company_id text not null default 'default_company_1',
  scenario_name text not null,
  is_active boolean not null default false,
  clients numeric(12,2) not null default 25,
  ticket numeric(12,2) not null default 197,
  fixed_cost numeric(12,2) not null default 3000,
  variable_cost numeric(12,2) not null default 18,
  initial_investment numeric(12,2) not null default 6000,
  tax_rate numeric(8,2) not null default 8,
  churn_rate numeric(8,2) not null default 3,
  growth_rate numeric(8,2) not null default 8,
  created_at timestamptz not null default now(),
  unique(company_id, scenario_name)
);

create table if not exists public.business_funnel (
  id text primary key default gen_random_uuid()::text,
  company_id text not null default 'default_company_1',
  leads numeric(12,2) not null default 80,
  meeting_conversion numeric(8,2) not null default 35,
  trial_conversion numeric(8,2) not null default 55,
  paid_conversion numeric(8,2) not null default 45,
  ticket numeric(12,2) not null default 197,
  updated_at timestamptz not null default now(),
  unique(company_id)
);

create table if not exists public.business_partners (
  id text primary key default gen_random_uuid()::text,
  company_id text not null default 'default_company_1',
  name text not null,
  role text not null,
  responsibilities text,
  share_percentage numeric(8,2) not null default 0,
  area text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.business_plan_sections enable row level security;
alter table public.business_next_steps enable row level security;
alter table public.business_simulations enable row level security;
alter table public.business_funnel enable row level security;
alter table public.business_partners enable row level security;

create policy "App users can manage business plan sections" on public.business_plan_sections for all to anon, authenticated using (true) with check (true);
create policy "App users can manage business next steps" on public.business_next_steps for all to anon, authenticated using (true) with check (true);
create policy "App users can manage business simulations" on public.business_simulations for all to anon, authenticated using (true) with check (true);
create policy "App users can manage business funnel" on public.business_funnel for all to anon, authenticated using (true) with check (true);
create policy "App users can manage business partners" on public.business_partners for all to anon, authenticated using (true) with check (true);

-- CLIENT ONBOARDING
create table if not exists public.client_onboarding (
  id text primary key default gen_random_uuid()::text,
  client_name text not null default '',
  company_name text not null default '',
  business_type text not null,
  need text not null,
  process text not null,
  experience text not null,
  goal text not null,
  created_at timestamptz not null default now()
);

alter table public.client_onboarding enable row level security;
create policy "App users can manage client onboarding" on public.client_onboarding for all to anon, authenticated using (true) with check (true);

