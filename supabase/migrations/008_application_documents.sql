-- FEE Kuwait — evidence documents attached to an application
--
-- Files live in a private Storage bucket; this table holds their metadata.
-- Additive migration — safe to run on the existing database (no reset).

-- ── Metadata table ────────────────────────────────────────────────────
create table if not exists public.application_documents (
  id             uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications on delete cascade not null,
  uploaded_by    uuid references public.users not null,
  name           text not null,
  path           text not null,        -- object path within the storage bucket
  size           bigint,
  mime_type      text,
  created_at     timestamptz default now()
);
alter table public.application_documents enable row level security;

-- Applicant may manage documents for their own applications; staff read all.
create policy "Applicant manages own application documents" on public.application_documents
  for all
  using (exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid()))
  with check (exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid()));

create policy "Staff read all application documents" on public.application_documents
  for select using (public.is_staff());

create index if not exists application_documents_application_id_idx on public.application_documents (application_id);

-- ── Private storage bucket for the files ──────────────────────────────
insert into storage.buckets (id, name, public)
values ('application-docs', 'application-docs', false)
on conflict (id) do nothing;

-- Authenticated users may upload to the bucket (the metadata table + its RLS
-- ties each file to an application the uploader owns).
create policy "Authenticated upload application docs"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'application-docs');

-- The uploader, or any staff member, may read/download the objects.
create policy "Owner or staff read application docs"
  on storage.objects for select to authenticated
  using (bucket_id = 'application-docs' and (owner = auth.uid() or public.is_staff()));

-- The uploader may delete their own objects.
create policy "Owner delete application docs"
  on storage.objects for delete to authenticated
  using (bucket_id = 'application-docs' and owner = auth.uid());
