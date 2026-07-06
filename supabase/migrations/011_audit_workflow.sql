-- FEE Kuwait — audit workflow, slice 1
-- Additive migration — safe to run on the existing database (no reset).

-- Auditors and the certification body can read the evidence documents on the
-- applications assigned to them (008 only allowed the applicant + staff).
create policy "Auditor/CB read docs on assigned applications" on public.application_documents
  for select using (
    exists (
      select 1 from public.applications a
      where a.id = application_id and (a.auditor_id = auth.uid() or a.cb_id = auth.uid())
    )
  );

-- Auditors/CB can read the applicant's profile for applications assigned to them
-- (so they can see who they are auditing). Queries applications, not users, so
-- there is no policy recursion.
create policy "Auditor/CB read applicant of assigned applications" on public.users
  for select using (
    exists (
      select 1 from public.applications a
      where a.applicant_id = users.id and (a.auditor_id = auth.uid() or a.cb_id = auth.uid())
    )
  );
