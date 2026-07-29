-- FEE Kuwait — Stage 2e: selective criterion reopen + frozen version snapshots
-- Additive migration — safe to run on the existing database (no reset).
--
--   reopened_criteria — the criteria the operator reopened for a rectification /
--                       corrective-action period. Only these are editable by the
--                       establishment while the rest of the board stays locked.
--   application_versions — a frozen snapshot of the criterion assessments captured
--                       when the application is submitted / returned, for traceability.

alter table public.applications add column if not exists reopened_criteria text[] not null default '{}';

create table if not exists public.application_versions (
  id             uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications on delete cascade not null,
  label          text not null,          -- e.g. "Submitted to CB", "Rectification round 1"
  status         text,                   -- application status at snapshot time
  snapshot       jsonb not null default '{}'::jsonb,
  created_by     uuid references public.users,
  created_at     timestamptz default now()
);
alter table public.application_versions enable row level security;

create policy "Staff read application versions" on public.application_versions
  for select using (public.is_staff());
create policy "Applicant reads own application versions" on public.application_versions
  for select using (exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid()));
create policy "Auditor/CB read assigned application versions" on public.application_versions
  for select using (exists (select 1 from public.applications a where a.id = application_id and (a.auditor_id = auth.uid() or a.cb_id = auth.uid())));

create index if not exists application_versions_application_id_idx on public.application_versions (application_id);
