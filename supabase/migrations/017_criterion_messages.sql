-- FEE Kuwait — per-criterion chat threads, self-assessment, operator attachments
-- Additive migration — safe to run on the existing database (no reset).

-- ── 1. Per-criterion comment thread (two-way establishment <-> operator; the
--    auditor also posts, but auditor messages stay hidden from the establishment
--    until the audit is published — enforced by the visibility column + RLS). ──
create table if not exists public.criterion_messages (
  id             uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications on delete cascade not null,
  criterion_ref  text not null,
  author_id      uuid references public.users,
  author_role    text,   -- 'establishment' | 'operator' | 'auditor' | 'cb'
  body           text not null,
  visibility     text default 'shared' check (visibility in ('shared', 'auditor_internal')),
  created_at     timestamptz default now()
);
alter table public.criterion_messages enable row level security;
create index if not exists criterion_messages_app_ref_idx on public.criterion_messages (application_id, criterion_ref);

-- Applicant: reads SHARED messages on their own applications, and posts their own.
create policy "Applicant reads shared messages" on public.criterion_messages
  for select using (
    visibility = 'shared'
    and exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid())
  );
create policy "Applicant posts own messages" on public.criterion_messages
  for insert with check (
    author_id = auth.uid()
    and exists (select 1 from public.applications a where a.id = application_id and a.applicant_id = auth.uid())
  );

-- Staff (National Operator): read + post all.
create policy "Staff read all messages" on public.criterion_messages
  for select using (public.is_staff());
create policy "Staff post messages" on public.criterion_messages
  for insert with check (public.is_staff());

-- Auditor / CB: read + post on applications assigned to them.
create policy "Auditor CB read assigned messages" on public.criterion_messages
  for select using (
    exists (select 1 from public.applications a where a.id = application_id and (a.auditor_id = auth.uid() or a.cb_id = auth.uid()))
  );
create policy "Auditor CB post assigned messages" on public.criterion_messages
  for insert with check (
    author_id = auth.uid()
    and exists (select 1 from public.applications a where a.id = application_id and (a.auditor_id = auth.uid() or a.cb_id = auth.uid()))
  );

-- ── 2. Establishment self-assessment result per criterion. ──
alter table public.criterion_assessments
  add column if not exists applicant_result text default 'pending'
    check (applicant_result in ('pending', 'pass', 'no_pass'));

-- ── 3. Let staff (operator) attach documents per criterion too. ──
drop policy if exists "Staff manage application documents" on public.application_documents;
create policy "Staff manage application documents" on public.application_documents
  for all using (public.is_staff()) with check (public.is_staff());
