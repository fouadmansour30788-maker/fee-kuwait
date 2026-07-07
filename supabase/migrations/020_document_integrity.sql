-- FEE Kuwait — multi-year, tamper-proof evidence documents
-- Additive migration — safe to run on the existing database (no reset).
--
-- Requirements (audit integrity):
--   * documents are stored per criterion AND per year
--   * the establishment can ONLY add documents — never delete/replace
--   * once the application leaves an editable status (submitted / certified), no
--     one can add either — the record is frozen
--   * nobody can delete or overwrite a stored file

alter table public.application_documents add column if not exists year int;

-- ── Applicant: read own + ADD ONLY while the application is still editable ──
drop policy if exists "Applicant manages own application documents" on public.application_documents;

create policy "Applicant reads own application documents" on public.application_documents
  for select using (
    exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid())
  );

create policy "Applicant adds documents when editable" on public.application_documents
  for insert with check (
    exists (
      select 1 from public.applications a
      where a.id = application_id and a.applicant_id = auth.uid()
        and a.status in ('new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'revision')
    )
  );

-- ── Staff: read all + add only (no update / delete) — record is immutable ──
drop policy if exists "Staff manage application documents" on public.application_documents;
-- ("Staff read all application documents" for select already exists from 008)
create policy "Staff add application documents" on public.application_documents
  for insert with check (public.is_staff());

-- ── Storage: remove the ability to delete a stored file (tamper-proof) ──
drop policy if exists "Owner delete application docs" on storage.objects;
