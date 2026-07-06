-- FEE Kuwait — per-criterion evidence
-- Additive migration — safe to run on the existing database (no reset).
--
-- Lets the establishment attach a document to a specific criterion/indicator
-- (self-assessment evidence). Existing flat documents keep criterion_ref NULL.
-- RLS is unchanged: applicants insert/read their own documents (migration 008),
-- staff/auditor/CB read them (008/011).

alter table public.application_documents add column if not exists criterion_ref text;

create index if not exists application_documents_criterion_idx
  on public.application_documents (application_id, criterion_ref);
