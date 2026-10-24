-- AURUM storefront schema. Run in the Supabase SQL editor (or `supabase db push`).

-- ───────────────────────── Profiles & roles ─────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'customer' check (role in ('customer', 'admin', 'super_admin')),
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'));
$$;

-- ───────────────────────── Catalog ─────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  category    text not null check (category in ('fragrance', 'leather', 'home')),
  tagline     text not null default '',
  description text not null default '',
  badge       text,
  featured    boolean not null default false,
  active      boolean not null default true,
  notes       text[] not null default '{}',
  details     text[] not null default '{}',
  art         jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.product_variants (
  id                   uuid primary key default gen_random_uuid(),
  product_id           uuid not null references public.products (id) on delete cascade,
  label                text not null default 'Standard',
  sku                  text unique,
  price                numeric(10, 2) not null check (price >= 0),
  stock                integer not null default 0 check (stock >= 0),
  low_stock_threshold  integer not null default 5 check (low_stock_threshold >= 0),
  position             integer not null default 0,
  unique (product_id, label)
);
create index if not exists product_variants_product_idx on public.product_variants (product_id, position);

-- ───────────────────────── Sales ─────────────────────────
create table if not exists public.orders (
  id              text primary key,
  user_id         uuid references auth.users (id) on delete set null,
  email           text not null,
  name            text not null,
  address         jsonb not null,
  shipping_method text not null check (shipping_method in ('standard', 'express')),
  status          text not null default 'paid'
                  check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_last4   text,
  promo_code      text,
  subtotal        numeric(10, 2) not null,
  discount        numeric(10, 2) not null default 0,
  shipping        numeric(10, 2) not null default 0,
  tax             numeric(10, 2) not null default 0,
  total           numeric(10, 2) not null,
  tracking_number text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_email_idx on public.orders (email);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      text not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  variant_id    uuid references public.product_variants (id) on delete set null,
  product_slug  text not null,
  name          text not null,
  variant_label text,
  unit_price    numeric(10, 2) not null,
  qty           integer not null check (qty > 0),
  total         numeric(10, 2) not null
);
create index if not exists order_items_order_idx on public.order_items (order_id);

create table if not exists public.inventory_movements (
  id           bigint generated always as identity primary key,
  variant_id   uuid not null references public.product_variants (id) on delete cascade,
  delta        integer not null,
  stock_after  integer not null,
  reason       text not null,
  order_id     text,
  actor        uuid,
  created_at   timestamptz not null default now()
);
create index if not exists inventory_movements_variant_idx on public.inventory_movements (variant_id, created_at desc);

create table if not exists public.promo_codes (
  code        text primary key,
  pct         numeric(5, 4) not null check (pct > 0 and pct <= 1),
  active      boolean not null default true,
  max_uses    integer,
  uses        integer not null default 0,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.subscribers (
  email       text primary key,
  created_at  timestamptz not null default now()
);

-- ───────────────────────── Row level security ─────────────────────────
-- The Next.js server uses the service-role key for writes and admin reads; these policies protect
-- direct access with the public (anon / authenticated) keys.
alter table public.profiles            enable row level security;
alter table public.products            enable row level security;
alter table public.product_variants    enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.promo_codes         enable row level security;
alter table public.subscribers         enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_admin());

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (active or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "variants public read" on public.product_variants;
create policy "variants public read" on public.product_variants for select
  using (public.is_admin() or exists (select 1 from public.products p where p.id = product_id and p.active));
drop policy if exists "variants admin write" on public.product_variants;
create policy "variants admin write" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders own read" on public.orders;
create policy "orders own read" on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders admin write" on public.orders;
create policy "orders admin write" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order items read" on public.order_items;
create policy "order items read" on public.order_items for select
  using (public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "movements admin" on public.inventory_movements;
create policy "movements admin" on public.inventory_movements for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "promos admin" on public.promo_codes;
create policy "promos admin" on public.promo_codes for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "subscribers admin" on public.subscribers;
create policy "subscribers admin" on public.subscribers for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Transactional functions (service role only) ─────────────────────────

-- Places an order atomically: locks each variant row, verifies stock, decrements it, writes the order,
-- its line items and the inventory audit trail. Raises INSUFFICIENT_STOCK:<name> / UNKNOWN_ITEM:<slug>.
create or replace function public.place_order(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare
  it  jsonb;
  r   record;
  q   integer;
  oid text := p ->> 'id';
begin
  insert into public.orders (id, user_id, email, name, address, shipping_method, status, payment_last4,
                             promo_code, subtotal, discount, shipping, tax, total)
  values (oid, nullif(p ->> 'user_id', '')::uuid, p ->> 'email', p ->> 'name', p -> 'address',
          p ->> 'shipping_method', 'paid', p ->> 'payment_last4', nullif(p ->> 'promo_code', ''),
          (p ->> 'subtotal')::numeric, (p ->> 'discount')::numeric, (p ->> 'shipping')::numeric,
          (p ->> 'tax')::numeric, (p ->> 'total')::numeric);

  for it in select * from jsonb_array_elements(p -> 'items') loop
    q := (it ->> 'qty')::integer;

    select v.id as vid, v.stock as stock, v.label as label, pr.id as pid, pr.name as pname, pr.slug as pslug
      into r
      from public.product_variants v
      join public.products pr on pr.id = v.product_id
     where pr.slug = it ->> 'slug'
       and pr.active
       and (nullif(it ->> 'variant', '') is null or v.label = it ->> 'variant')
     order by v.position
     limit 1
       for update of v;

    if not found then
      raise exception 'UNKNOWN_ITEM:%', it ->> 'slug';
    end if;
    if r.stock < q then
      raise exception 'INSUFFICIENT_STOCK:%', r.pname;
    end if;

    update public.product_variants set stock = stock - q where id = r.vid;
    insert into public.inventory_movements (variant_id, delta, stock_after, reason, order_id)
    values (r.vid, -q, r.stock - q, 'sale', oid);
    insert into public.order_items (order_id, product_id, variant_id, product_slug, name, variant_label,
                                    unit_price, qty, total)
    values (oid, r.pid, r.vid, r.pslug, r.pname, r.label, (it ->> 'unit_price')::numeric, q,
            (it ->> 'unit_price')::numeric * q);
  end loop;

  if nullif(p ->> 'promo_code', '') is not null then
    update public.promo_codes set uses = uses + 1 where code = p ->> 'promo_code';
  end if;
  return oid;
end $$;

-- Changes an order's status. Cancelling or refunding returns the items to stock (once).
create or replace function public.set_order_status(p_id text, p_status text, p_actor uuid, p_tracking text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  cur text;
  r   record;
  s   integer;
begin
  if p_status not in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') then
    raise exception 'INVALID_STATUS';
  end if;
  select status into cur from public.orders where id = p_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if cur in ('cancelled', 'refunded') then raise exception 'TERMINAL'; end if;

  if p_status in ('cancelled', 'refunded') then
    for r in select variant_id, qty from public.order_items where order_id = p_id and variant_id is not null loop
      update public.product_variants set stock = stock + r.qty where id = r.variant_id returning stock into s;
      insert into public.inventory_movements (variant_id, delta, stock_after, reason, order_id, actor)
      values (r.variant_id, r.qty, s, 'restock:' || p_status, p_id, p_actor);
    end loop;
  end if;

  update public.orders
     set status = p_status, tracking_number = coalesce(nullif(p_tracking, ''), tracking_number), updated_at = now()
   where id = p_id;
end $$;

-- Manual stock adjustment with an audit trail. Never lets stock go below zero.
create or replace function public.adjust_stock(p_variant uuid, p_delta integer, p_reason text, p_actor uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare s integer;
begin
  update public.product_variants set stock = stock + p_delta
   where id = p_variant and stock + p_delta >= 0
  returning stock into s;
  if not found then raise exception 'INSUFFICIENT_STOCK:adjustment'; end if;
  insert into public.inventory_movements (variant_id, delta, stock_after, reason, actor)
  values (p_variant, p_delta, s, coalesce(nullif(p_reason, ''), 'manual adjustment'), p_actor);
  return s;
end $$;

revoke all on function public.place_order(jsonb) from public, anon, authenticated;
revoke all on function public.set_order_status(text, text, uuid, text) from public, anon, authenticated;
revoke all on function public.adjust_stock(uuid, integer, text, uuid) from public, anon, authenticated;
grant execute on function public.place_order(jsonb) to service_role;
grant execute on function public.set_order_status(text, text, uuid, text) to service_role;
grant execute on function public.adjust_stock(uuid, integer, text, uuid) to service_role;
