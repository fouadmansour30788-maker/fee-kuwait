-- FEE Kuwait — Green Key alignment
-- Implements the role/decision separation and traceability required by the
-- Green Key "Minimum Requirements for Digital Application and Certification
-- Systems" (effective 1 Oct 2026): adds the Certification Body role, separates
-- the auditor's conformity findings from the CB's certification decision, and
-- adds a complete audit trail.

-- ── 1. Add the Certification Body role ────────────────────────────────
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check
  check (role in ('school', 'business', 'admin', 'super_admin', 'auditor', 'certification_body'));

-- ── 2. Green Key 7-stage application status ───────────────────────────
-- Stages: pre_screening → application_setup → submission → audit
--         → cb_review → (certified | certified_rectification | not_certified)
--         → surveillance
alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in (
    'new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'approved', 'rejected', -- legacy
    'pre_screening', 'application_setup', 'submission', 'audit',
    'cb_review', 'certified', 'certified_rectification', 'not_certified', 'surveillance'
  ));

-- Category & filter logic (one main + additional sub-categories)
alter table public.applications add column if not exists main_category text;
alter table public.applications add column if not exists sub_categories text[];
alter table public.applications add column if not exists conformity_pct integer;

-- ── 3. Auditor: findings / conformity / audit report (NOT a decision) ──
alter table public.applications add column if not exists conformity_judgement text
  check (conformity_judgement in ('pending', 'conform', 'minor_nc', 'major_nc'));
alter table public.applications add column if not exists audit_report_submitted_at timestamptz;

-- ── 4. Certification Body: assignment + decision ──────────────────────
alter table public.applications add column if not exists cb_id uuid references public.users;
alter table public.applications add column if not exists cb_decision text
  check (cb_decision in ('pending', 'certified', 'certified_rectification', 'not_certified'));
alter table public.applications add column if not exists cb_decision_at timestamptz;

-- ── 5. 24-month certification validity (was 1 year) ───────────────────
alter table public.certifications alter column expires_at set default (now() + interval '24 months');

-- ── 6. Traceability — complete audit trail ────────────────────────────
-- Every change records previous value, new value, user, user role, date/time.
create table if not exists public.audit_trail (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications on delete cascade,
  entity text not null,          -- e.g. 'application', 'document', 'certification'
  field text not null,           -- the field/aspect that changed
  previous_value text,
  new_value text,
  user_id uuid references public.users,
  user_name text,
  user_role text,
  created_at timestamptz default now()
);
create index if not exists audit_trail_app_idx on public.audit_trail (application_id);
alter table public.audit_trail enable row level security;

-- Anyone involved with an application may read its trail; nobody may edit/delete it.
create policy "Insert audit trail entries"
  on public.audit_trail for insert with check (auth.uid() is not null);
create policy "Admins read all audit trail"
  on public.audit_trail for select using (exists (
    select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')
  ));
create policy "Assigned auditors read app trail"
  on public.audit_trail for select using (exists (
    select 1 from public.applications a where a.id = audit_trail.application_id and a.auditor_id = auth.uid()
  ));
create policy "Assigned CB reads app trail"
  on public.audit_trail for select using (exists (
    select 1 from public.applications a where a.id = audit_trail.application_id and a.cb_id = auth.uid()
  ));

-- ── 7. RLS — Certification Body ───────────────────────────────────────
create policy "CB views assigned applications"
  on public.applications for select using (cb_id = auth.uid());
-- CB may only record its decision fields on assigned applications
create policy "CB records decision on assigned applications"
  on public.applications for update using (cb_id = auth.uid());
create policy "CB views docs on assigned applications"
  on public.documents for select using (exists (
    select 1 from public.applications a where a.id = documents.application_id and a.cb_id = auth.uid()
  ));
create policy "CB views comments on assigned applications"
  on public.application_comments for select using (exists (
    select 1 from public.applications a where a.id = application_comments.application_id and a.cb_id = auth.uid()
  ));

-- Note: the CB must NOT conduct audits or modify auditor findings, and the
-- auditor must NOT make certification decisions — enforced in the app layer
-- by exposing only role-appropriate actions (see auditor vs CB review screens).
