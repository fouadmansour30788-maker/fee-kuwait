-- FEE Kuwait — Multi-year, append-only certification documents
--
-- Green Key is a MULTI-YEAR certification. Under each criterion an establishment
-- uploads documents for a given year (e.g. 2026); 8-14 months later it is asked for
-- updated reports which go under the next year (2027, then 2028, and so on). Each
-- year's documents must be viewable on their own, and the record must be tamper-proof:
--
--   * documents are stored per (application, criterion, cycle_year)
--   * establishments can ONLY ADD documents — never edit, replace, or delete
--   * once the application is submitted (or certified) uploads lock completely
--
-- These guarantees are enforced at the DATABASE layer (append-only trigger + RLS),
-- so they hold no matter what the client does. This is designed in from the start
-- because retrofitting immutability later is unsafe.

create table if not exists public.criterion_documents (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications on delete cascade not null,
  programme text not null,                       -- e.g. 'green-key'
  criterion_ref text not null,                   -- criterion number, e.g. '1.1', '3.4'
  cycle_year integer not null,                   -- certification year the doc belongs to (2026, 2027, 2028...)
  name text not null,
  file_url text not null,
  file_type text,
  file_size integer,
  uploaded_by uuid references public.users not null,
  uploaded_at timestamptz default now() not null,
  checksum text                                  -- optional content hash for integrity verification
);
create index if not exists criterion_documents_lookup_idx
  on public.criterion_documents (application_id, criterion_ref, cycle_year);
create index if not exists criterion_documents_year_idx
  on public.criterion_documents (application_id, cycle_year);
alter table public.criterion_documents enable row level security;

-- ── 1. Append-only enforcement (DB-level; applies even to the service role) ──
-- No row may EVER be updated or deleted. This is the core tamper-proof guarantee.
create or replace function public.prevent_document_mutation()
returns trigger as $$
begin
  raise exception
    'criterion_documents is append-only: uploaded documents cannot be modified or deleted (audit integrity)';
end;
$$ language plpgsql;

drop trigger if exists criterion_documents_no_mutation on public.criterion_documents;
create trigger criterion_documents_no_mutation
  before update or delete on public.criterion_documents
  for each row execute function public.prevent_document_mutation();

-- ── 2. Lock helper: does the application still accept uploads? ────────────────
-- Uploads are allowed only while the application has NOT yet been submitted/decided.
-- Once it moves to audit / cb_review / any decision (or surveillance), it is locked.
create or replace function public.application_accepts_uploads(app_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.applications a
    where a.id = app_id
      and a.status in ('new', 'pre_screening', 'application_setup', 'submission', 'documents_pending')
  );
$$ language sql stable;

-- ── 3. RLS ───────────────────────────────────────────────────────────────────
-- Applicants read all of their own documents (every year), always.
create policy "Applicants read own criterion documents"
  on public.criterion_documents for select
  using (exists (
    select 1 from public.applications a
    where a.id = criterion_documents.application_id and a.applicant_id = auth.uid()
  ));

-- Applicants may INSERT only: their own application, as the uploader, and only while
-- the application still accepts uploads. There is deliberately NO update/delete policy
-- for applicants — together with the trigger above this makes documents strictly
-- append-only and locks them automatically on submission/certification.
create policy "Applicants add criterion documents while open"
  on public.criterion_documents for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.applications a
      where a.id = criterion_documents.application_id and a.applicant_id = auth.uid()
    )
    and public.application_accepts_uploads(criterion_documents.application_id)
  );

-- Reviewers & admins read (they never write here).
create policy "Admins read all criterion documents"
  on public.criterion_documents for select
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));

create policy "Auditors read assigned criterion documents"
  on public.criterion_documents for select
  using (exists (
    select 1 from public.applications a
    where a.id = criterion_documents.application_id and a.auditor_id = auth.uid()
  ));

create policy "CB reads assigned criterion documents"
  on public.criterion_documents for select
  using (exists (
    select 1 from public.applications a
    where a.id = criterion_documents.application_id and a.cb_id = auth.uid()
  ));

-- ── 4. Convenience view: latest cycle year per application (for UIs) ──────────
create or replace view public.criterion_document_years as
  select application_id, criterion_ref, cycle_year, count(*) as document_count
  from public.criterion_documents
  group by application_id, criterion_ref, cycle_year;
