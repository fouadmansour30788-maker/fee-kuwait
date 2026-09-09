-- FEE Kuwait — BeCause integration configuration
-- Additive migration — safe to run on the existing database (no reset).
--
-- Stores the IDs discovered from the BeCause API (framework, group, GK-ID custom
-- property, and the electricity/water/waste data-point + unit ids) so the
-- consumption import can build its upsert payload. Single row (id = 'default').

create table if not exists public.because_config (
  id             text primary key default 'default',
  framework_id   text,
  group_id       text,
  gk_property_id text,
  field_map      jsonb not null default '{}'::jsonb,  -- { electricity:{dataPointId,unitId}, water:{...}, waste:{...} }
  updated_at     timestamptz not null default now()
);

alter table public.because_config enable row level security;

create policy "Staff manage because config" on public.because_config
  for all using (public.is_staff()) with check (public.is_staff());
