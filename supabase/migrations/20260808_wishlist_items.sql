-- Wishlist: items a subscriber saved for the next rotation
create table if not exists public.wishlist_items (
  id bigint generated always as identity primary key,
  subscriber_id text not null references public.subscribers(id) on delete cascade,
  item_id text not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (subscriber_id, item_id)
);

create index if not exists wishlist_items_subscriber_id_idx
  on public.wishlist_items (subscriber_id);

alter table public.wishlist_items enable row level security;

drop policy if exists "Allow all for now" on public.wishlist_items;

create policy "Allow all for now"
  on public.wishlist_items
  for all
  using (true)
  with check (true);

comment on table public.wishlist_items is 'Items saved for next rotation by a subscriber';

grant select, insert, update, delete on table public.wishlist_items to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
