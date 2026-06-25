-- FEE Kuwait — Auditor role, assignment, and review comments
-- Auditors are assigned by FEE Kuwait admins to review applications & documents,
-- provide feedback, and leave comments (internal or shared with the applicant).

-- ── 1. Add 'auditor' to the role enum ─────────────────────────────────
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check
  check (role in ('school', 'business', 'admin', 'super_admin', 'auditor'));

-- ── 2. Auditor assignment on applications ─────────────────────────────
alter table public.applications add column if not exists auditor_id uuid references public.users;
alter table public.applications add column if not exists auditor_assigned_at timestamptz;
create index if not exists applications_auditor_id_idx on public.applications (auditor_id);

-- ── 3. Review comments (feedback + internal notes) ────────────────────
create table if not exists public.application_comments (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications on delete cascade not null,
  author_id uuid references public.users not null,
  body text not null,
  -- 'internal' = admin + auditors only; 'shared' = also visible to the applicant
  visibility text not null default 'internal' check (visibility in ('internal', 'shared')),
  created_at timestamptz default now()
);
create index if not exists application_comments_app_idx on public.application_comments (application_id);
alter table public.application_comments enable row level security;

-- ── 4. RLS — Applications ─────────────────────────────────────────────
-- (admins already have full access via the policy in 001)
create policy "Auditors view assigned applications"
  on public.applications for select
  using (auditor_id = auth.uid());

create policy "Auditors update assigned applications"
  on public.applications for update
  using (auditor_id = auth.uid());

-- ── 5. RLS — Documents ────────────────────────────────────────────────
create policy "Auditors view docs on assigned applications"
  on public.documents for select
  using (exists (
    select 1 from public.applications a
    where a.id = documents.application_id and a.auditor_id = auth.uid()
  ));

create policy "Auditors review docs on assigned applications"
  on public.documents for update
  using (exists (
    select 1 from public.applications a
    where a.id = documents.application_id and a.auditor_id = auth.uid()
  ));

-- ── 6. RLS — Comments ─────────────────────────────────────────────────
-- Authors (admin/auditor/applicant) can insert their own comments
create policy "Authors insert own comments"
  on public.application_comments for insert
  with check (author_id = auth.uid());

-- Admins manage every comment
create policy "Admins manage all comments"
  on public.application_comments for all
  using (exists (
    select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')
  ));

-- Auditors read all comments on applications assigned to them
create policy "Auditors view comments on assigned applications"
  on public.application_comments for select
  using (exists (
    select 1 from public.applications a
    where a.id = application_comments.application_id and a.auditor_id = auth.uid()
  ));

-- Applicants read only 'shared' comments on their own applications
create policy "Applicants view shared comments"
  on public.application_comments for select
  using (
    visibility = 'shared'
    and exists (
      select 1 from public.applications a
      where a.id = application_comments.application_id and a.applicant_id = auth.uid()
    )
  );
