-- Public membership pricing tiers (Starter / Signature / Archivist)
create table if not exists public.subscription_tiers (
  id text primary key,
  name text not null,
  price numeric not null,
  items_per_month integer not null,
  positioning text not null,
  features text[] not null,
  is_featured boolean not null default false,
  display_order integer not null
);

alter table public.subscription_tiers enable row level security;

drop policy if exists "Allow all for now" on public.subscription_tiers;

create policy "Allow all for now"
  on public.subscription_tiers
  for all
  using (true)
  with check (true);

comment on table public.subscription_tiers is 'Public membership pricing tiers (Starter / Signature / Archivist)';

grant select, insert, update, delete on table public.subscription_tiers to anon, authenticated, service_role;

insert into public.subscription_tiers (id, name, price, items_per_month, positioning, features, is_featured, display_order) values
('starter', 'Starter', 49, 3, 'Entry rotation, casual staples', ARRAY['Monthly swap', 'Free shipping both ways', 'Cancel anytime'], false, 1),
('signature', 'Signature', 99, 5, 'Core offering — mix of outerwear and everyday pieces', ARRAY['Monthly swap', 'Free shipping both ways', 'Priority sizing support', 'Cancel anytime'], true, 2),
('archivist', 'Archivist', 159, 7, 'Priority access to Grade-A rare pieces', ARRAY['Monthly swap', 'Free shipping both ways', 'First access to new intake', 'Dedicated concierge', 'Cancel anytime'], false, 3)
on conflict (id) do nothing;
