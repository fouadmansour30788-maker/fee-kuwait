-- FEE Kuwait — Stage 1: Pre-screening Assessment Form
-- Additive migration — safe to run on the existing database (no reset).
--
-- Eligibility survey + main-category/sub-category assignment + operational
-- filters. One record per application. The applicant completes and submits it;
-- it locks on submission; the National Operator reviews eligibility; the result
-- drives which criteria apply (dynamic criteria display).

create table if not exists public.pre_screening (
  id                uuid default uuid_generate_v4() primary key,
  application_id    uuid references public.applications on delete cascade not null unique,
  answers           jsonb not null default '{}'::jsonb,
  eligible          boolean,
  ineligible_reason text,
  main_category     text,
  sub_categories    text[] default '{}',
  flags             jsonb not null default '{}'::jsonb,
  status            text default 'draft' check (status in ('draft', 'submitted', 'eligible', 'rejected')),
  submitted_at      timestamptz,
  reviewed_by       uuid references public.users,
  reviewed_at       timestamptz,
  review_note       text,
  unlock_reason     text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
alter table public.pre_screening enable row level security;

-- The applicant manages the pre-screening on their own application.
create policy "Applicant manages own pre-screening" on public.pre_screening
  for all
  using (exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid()))
  with check (exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid()));

-- Staff (National Operator) manage all pre-screening records.
create policy "Staff manage pre-screening" on public.pre_screening
  for all using (public.is_staff()) with check (public.is_staff());

-- Auditor and CB read the pre-screening of applications assigned to them.
create policy "Auditor reads pre-screening on assigned applications" on public.pre_screening
  for select using (exists (select 1 from public.applications a where a.id = application_id and a.auditor_id = auth.uid()));

create policy "CB reads pre-screening on assigned applications" on public.pre_screening
  for select using (exists (select 1 from public.applications a where a.id = application_id and a.cb_id = auth.uid()));

create index if not exists pre_screening_application_id_idx on public.pre_screening (application_id);
