-- FEE Kuwait — audit history (on-site / off-site cycles)
-- Additive migration — safe to run on the existing database (no reset).
--
-- Green Key cadence: an on-site audit every 2 years and an off-site audit every
-- year, with a new auditor assigned every 2 years. Each completed audit is
-- archived here as a snapshot (auditor name, type, period, and that auditor's
-- per-criterion results + feedback), so every party can view each auditor's
-- results and feedback separately. The *live* audit still lives in
-- criterion_assessments (unchanged) — this table is purely additive.

create table if not exists public.audits (
  id             uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications on delete cascade not null,
  auditor_id     uuid references public.users,
  auditor_name   text,
  type           text not null check (type in ('onsite', 'offsite')),
  period         int  not null,
  results        jsonb not null default '{}'::jsonb,  -- { "<ref>": { "result": "...", "note": "..." } }
  created_at     timestamptz default now(),
  created_by     uuid references public.users
);
alter table public.audits enable row level security;

-- Staff (operator) create and manage archived audits.
create policy "Staff manage audits" on public.audits
  for all using (public.is_staff()) with check (public.is_staff());

-- The assigned auditor and CB can read the audit history of their applications.
create policy "Auditor reads audits on assigned applications" on public.audits
  for select using (exists (select 1 from public.applications a where a.id = application_id and a.auditor_id = auth.uid()));

create policy "CB reads audits on assigned applications" on public.audits
  for select using (exists (select 1 from public.applications a where a.id = application_id and a.cb_id = auth.uid()));

-- The establishment reads the audit history of its own application.
create policy "Applicant reads own audits" on public.audits
  for select using (exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid()));

create index if not exists audits_application_id_idx on public.audits (application_id);
