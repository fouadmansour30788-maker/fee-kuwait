-- FEE Kuwait — certificates issued when an application is approved
-- Additive migration — safe to run on the existing database (no reset).

create table if not exists public.certificates (
  id                 uuid default uuid_generate_v4() primary key,
  application_id     uuid references public.applications on delete cascade unique not null,
  applicant_id       uuid references public.users not null,
  entity_type        text,
  programme          text not null,
  certificate_number text unique not null,
  issued_at          timestamptz default now(),
  expires_at         timestamptz,
  status             text default 'active' check (status in ('active', 'expired', 'revoked')),
  created_at         timestamptz default now()
);
alter table public.certificates enable row level security;

-- Applicants see their own certificates; staff manage all.
create policy "Applicants view own certificates" on public.certificates
  for select using (applicant_id = auth.uid());

create policy "Staff manage all certificates" on public.certificates
  for all using (public.is_staff()) with check (public.is_staff());

create index if not exists certificates_applicant_id_idx on public.certificates (applicant_id);
