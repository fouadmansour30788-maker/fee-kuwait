-- FEE Kuwait — editable Green Key International partner logo wall
-- Additive migration — safe to run on the existing database (no reset).
--
-- The /partners "Green Key International Partners" wall was hardcoded. This
-- table lets the back office manage it (add/remove logos, rename, reorder,
-- hide). Until it's seeded (via the "Import current logos" button), the public
-- page falls back to the built-in list, so nothing disappears meanwhile.

create table if not exists public.gk_partners (
  id uuid primary key default gen_random_uuid(),
  group_id text not null,          -- hotels | corporate | ota | ngo
  name text,                       -- caption (may be blank for unlabelled logos)
  logo_url text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gk_partners_group_idx on public.gk_partners (group_id, sort_order);

alter table public.gk_partners enable row level security;

-- Public (anon + authenticated) may read active logos — it's a public page.
drop policy if exists "Anyone reads active gk partners" on public.gk_partners;
create policy "Anyone reads active gk partners" on public.gk_partners
  for select using (active = true or public.is_staff());

-- Staff manage everything.
drop policy if exists "Staff manage gk partners" on public.gk_partners;
create policy "Staff manage gk partners" on public.gk_partners
  for all using (public.is_staff()) with check (public.is_staff());
