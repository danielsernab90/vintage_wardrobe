-- =============================================================================
-- Admin Dashboard persistence — items, subscribers, incidents, activity_log
-- DO NOT auto-run: paste into Supabase SQL Editor and execute manually.
-- RLS: permissive "allow all for now" (same approach as conversations/messages).
-- Tighten once real auth exists.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- items
-- ---------------------------------------------------------------------------
create table if not exists public.items (
  id text primary key,
  name text not null,
  era text not null,
  fabric text not null,
  category text not null,
  size text not null,
  grade text not null check (grade in ('A', 'B', 'C')),
  cycles integer not null default 0,
  status text not null,
  price numeric not null,
  cost numeric not null,
  original_price numeric null,
  discount_active boolean not null default false,
  decision text null check (
    decision is null
    or decision in ('keep_as_is', 'repair', 'discount', 'retire')
  ),
  primary_photo_url text not null,
  created_at timestamptz not null default now()
);

comment on table public.items is 'Inventory specimens for the Admin Dashboard';
comment on column public.items.original_price is 'Base price while a discount is active; null when undiscounted';
comment on column public.items.decision is 'Latest return decision: keep_as_is | repair | discount | retire';

-- ---------------------------------------------------------------------------
-- subscribers
-- ---------------------------------------------------------------------------
create table if not exists public.subscribers (
  id text primary key,
  name text not null,
  tier text not null,
  join_date date not null,
  items_out integer not null default 0,
  status text not null default 'Active'
);

comment on table public.subscribers is 'Subscriber roster (SUB-001 …); aligns with conversations.subscriber_id';

-- ---------------------------------------------------------------------------
-- incidents
-- ---------------------------------------------------------------------------
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  item_id text not null references public.items (id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists incidents_item_id_idx on public.incidents (item_id);
create index if not exists incidents_created_at_idx on public.incidents (created_at desc);

comment on table public.incidents is 'Damage / return notes attached to inventory items';

-- ---------------------------------------------------------------------------
-- activity_log
-- ---------------------------------------------------------------------------
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_created_at_idx on public.activity_log (created_at desc);

comment on table public.activity_log is 'Operator activity feed for the Admin Dashboard';

-- ---------------------------------------------------------------------------
-- Row Level Security — enable + permissive allow-all (demo / pre-auth)
-- ---------------------------------------------------------------------------
alter table public.items enable row level security;
alter table public.subscribers enable row level security;
alter table public.incidents enable row level security;
alter table public.activity_log enable row level security;

-- Drop prior demo policies if re-running this script
drop policy if exists "Allow all for now" on public.items;
drop policy if exists "Allow all for now" on public.subscribers;
drop policy if exists "Allow all for now" on public.incidents;
drop policy if exists "Allow all for now" on public.activity_log;

create policy "Allow all for now"
  on public.items
  for all
  using (true)
  with check (true);

create policy "Allow all for now"
  on public.subscribers
  for all
  using (true)
  with check (true);

create policy "Allow all for now"
  on public.incidents
  for all
  using (true)
  with check (true);

create policy "Allow all for now"
  on public.activity_log
  for all
  using (true)
  with check (true);
