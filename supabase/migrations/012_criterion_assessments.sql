-- FEE Kuwait — audit workflow slice 2: per-criterion assessment
-- Additive migration — safe to run on the existing database (no reset).

create table if not exists public.criterion_assessments (
  id             uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications on delete cascade not null,
  criterion_ref  text not null,
  result         text default 'pending' check (result in ('pending', 'pass', 'no_pass')),
  note           text,
  updated_by     uuid references public.users,
  updated_at     timestamptz default now(),
  unique (application_id, criterion_ref)
);
alter table public.criterion_assessments enable row level security;

-- The assigned auditor records the results.
create policy "Auditor manages assessments on assigned applications" on public.criterion_assessments
  for all
  using (exists (select 1 from public.applications a where a.id = application_id and a.auditor_id = auth.uid()))
  with check (exists (select 1 from public.applications a where a.id = application_id and a.auditor_id = auth.uid()));

-- Staff read all; CB reads its assigned; the applicant reads their own.
create policy "Staff read assessments" on public.criterion_assessments
  for select using (public.is_staff());

create policy "CB reads assessments on assigned applications" on public.criterion_assessments
  for select using (exists (select 1 from public.applications a where a.id = application_id and a.cb_id = auth.uid()));

create policy "Applicant reads own assessments" on public.criterion_assessments
  for select using (exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid()));

create index if not exists criterion_assessments_application_id_idx on public.criterion_assessments (application_id);
