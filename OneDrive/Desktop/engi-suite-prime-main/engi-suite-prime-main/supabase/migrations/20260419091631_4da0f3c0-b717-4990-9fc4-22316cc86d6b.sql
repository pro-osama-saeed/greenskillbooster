
-- ============ CLIENTS ============
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ntn text,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_clients_name on public.clients (lower(name));
alter table public.clients enable row level security;

create trigger update_clients_updated_at
before update on public.clients
for each row execute function public.update_updated_at_column();

create policy "Authenticated can view clients"
  on public.clients for select to authenticated using (true);
create policy "Authenticated can insert clients"
  on public.clients for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated can update clients"
  on public.clients for update to authenticated using (true) with check (true);
create policy "Admins can delete clients"
  on public.clients for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ============ VENDORS ============
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  items_supplied text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_vendors_name on public.vendors (lower(name));
alter table public.vendors enable row level security;

create trigger update_vendors_updated_at
before update on public.vendors
for each row execute function public.update_updated_at_column();

create policy "Authenticated can view vendors"
  on public.vendors for select to authenticated using (true);
create policy "Authenticated can insert vendors"
  on public.vendors for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated can update vendors"
  on public.vendors for update to authenticated using (true) with check (true);
create policy "Admins can delete vendors"
  on public.vendors for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ============ INVENTORY CATEGORIES ============
create table public.inventory_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
alter table public.inventory_categories enable row level security;

create policy "Authenticated can view categories"
  on public.inventory_categories for select to authenticated using (true);
create policy "Admins can manage categories"
  on public.inventory_categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.inventory_categories (name) values
  ('Electrical'), ('Mechanical'), ('Civil'), ('Parts');

-- ============ INVENTORY ITEMS ============
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  item_code text not null unique,
  name text not null,
  category_id uuid references public.inventory_categories(id) on delete set null,
  unit text not null default 'pcs',
  current_stock numeric(14,3) not null default 0,
  last_rate numeric(14,2) not null default 0,
  reorder_level numeric(14,3) not null default 0,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_items_name on public.inventory_items (lower(name));
create index idx_items_category on public.inventory_items (category_id);
alter table public.inventory_items enable row level security;

create trigger update_items_updated_at
before update on public.inventory_items
for each row execute function public.update_updated_at_column();

create policy "Authenticated can view items"
  on public.inventory_items for select to authenticated using (true);
create policy "Authenticated can insert items"
  on public.inventory_items for insert to authenticated with check (auth.uid() = created_by);
create policy "Authenticated can update items"
  on public.inventory_items for update to authenticated using (true) with check (true);
create policy "Admins can delete items"
  on public.inventory_items for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ============ RATE HISTORY (audit-safe) ============
create table public.item_rate_history (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  document_type text,    -- 'quotation' | 'invoice' | 'manual' | 'bill'
  document_id uuid,
  rate numeric(14,2) not null,
  quantity numeric(14,3),
  recorded_by uuid references auth.users(id) on delete set null,
  recorded_at timestamptz not null default now()
);
create index idx_rate_item_recorded on public.item_rate_history (item_id, recorded_at desc);
create index idx_rate_client on public.item_rate_history (client_id);
alter table public.item_rate_history enable row level security;

create policy "Authenticated can view rate history"
  on public.item_rate_history for select to authenticated using (true);
create policy "Authenticated can insert rate history"
  on public.item_rate_history for insert to authenticated
  with check (auth.uid() = recorded_by);
-- intentionally NO update / delete policies → immutable audit log
