-- FEE Kuwait — auditor final report upload
-- Additive migration — safe to run on the existing database (no reset).
--
-- Lets the assigned auditor attach documents (their final audit report) to the
-- application. Read access for auditors/staff/CB already exists (008/011).

create policy "Auditor uploads on assigned applications" on public.application_documents
  for insert with check (
    exists (select 1 from public.applications a where a.id = application_id and a.auditor_id = auth.uid())
  );
