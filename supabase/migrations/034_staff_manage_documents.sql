-- FEE Kuwait — allow staff to manage application documents
-- Additive migration — safe to run on the existing database (no reset).
--
-- The applicant can already insert/manage documents for their own application
-- (migration 008). Staff (operator/auditor/CB via is_staff) could only read.
-- This lets staff also attach/remove documents — e.g. an operator uploading on
-- behalf of an establishment, or attaching against an application they don't own.

create policy "Staff manage application documents" on public.application_documents
  for all using (public.is_staff()) with check (public.is_staff());
