-- FEE Kuwait — Stage 7: Surveillance Activities
-- Additive migration — safe to run on the existing database (no reset).
--
-- Between the two-yearly on-site audits, the National Operator runs a
-- surveillance activity: it requests updates or documents on selected criteria,
-- the establishment responds (with evidence via application_documents for the
-- surveillance year), the NO reviews completeness, and the Certification Body
-- records a decision. No auditor is involved. Each activity is its own record,
-- connected to the application, tagged with its surveillance year.

create table if not exists public.surveillance_activities (
  id             uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications on delete cascade not null,
  period         int not null,                         -- surveillance year
  criteria       text[] not null default '{}',         -- requested criterion refs
  request_note   text,                                 -- what the operator requests
  response_note  text,                                 -- the establishment's response
  status         text default 'requested' check (status in ('requested', 'submitted', 'reviewed', 'certified', 'not_certified')),
  decision_note  text,                                 -- CB decision note
  created_by     uuid references public.users,
  reviewed_by    uuid references public.users,
  requested_at   timestamptz default now(),
  submitted_at   timestamptz,
  decided_at     timestamptz
);
alter table public.surveillance_activities enable row level security;

-- Staff (National Operator) create and manage surveillance activities.
create policy "Staff manage surveillance" on public.surveillance_activities
  for all using (public.is_staff()) with check (public.is_staff());

-- The establishment reads and responds to its own application's surveillance.
create policy "Applicant reads own surveillance" on public.surveillance_activities
  for select using (exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid()));
create policy "Applicant responds to own surveillance" on public.surveillance_activities
  for update using (exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid()))
  with check (exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid()));

-- The Certification Body reads and decides surveillance on its assigned applications.
create policy "CB reads surveillance on assigned applications" on public.surveillance_activities
  for select using (exists (select 1 from public.applications a where a.id = application_id and a.cb_id = auth.uid()));
create policy "CB decides surveillance on assigned applications" on public.surveillance_activities
  for update using (exists (select 1 from public.applications a where a.id = application_id and a.cb_id = auth.uid()))
  with check (exists (select 1 from public.applications a where a.id = application_id and a.cb_id = auth.uid()));

create index if not exists surveillance_application_id_idx on public.surveillance_activities (application_id);
