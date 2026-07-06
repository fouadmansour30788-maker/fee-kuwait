-- FEE Kuwait — Certification Body decision layer
-- Additive migration — safe to run on the existing database (no reset).
--
-- The National Operator assigns a certification_body user (applications.cb_id) to
-- an application once the audit is complete; the CB then records the formal
-- certification decision. Read access to that application's documents, applicant
-- profile and criterion assessments is already granted in migrations 011 & 012.
-- Here we let the CB read and update the applications it is assigned to, and add
-- a note column for the rationale shared back with the establishment.

-- Rationale the CB shares with the applicant alongside the decision.
alter table public.applications add column if not exists cb_note text;
alter table public.applications add column if not exists cb_assigned_at timestamptz;

-- CB can read the applications assigned to it (queries only its own cb_id — no recursion).
drop policy if exists "CB reads assigned applications" on public.applications;
create policy "CB reads assigned applications" on public.applications
  for select using (cb_id = auth.uid());

-- CB can update the applications assigned to it (the decision fields + status).
-- WITH CHECK keeps cb_id pinned to the current CB so it cannot reassign the row away.
drop policy if exists "CB updates assigned applications" on public.applications;
create policy "CB updates assigned applications" on public.applications
  for update using (cb_id = auth.uid()) with check (cb_id = auth.uid());
