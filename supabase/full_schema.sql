-- ============================================================
-- FEE Kuwait — full schema (RESET + migrations 001-006)
-- Paste this whole file once into the Supabase SQL Editor.
-- Safe to re-run: it drops & recreates the public schema first (no data yet),
-- then rebuilds every table, policy, function and trigger.
-- ============================================================
drop schema if exists public cascade;
create schema public;
grant usage on schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables    to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on routines  to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;


-- ============================================================
-- 001_initial_schema.sql
-- ============================================================
-- FEE Kuwait Full Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── USERS ─────────────────────────────────────────────────────────────
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text not null default 'school' check (role in ('school', 'business', 'admin', 'super_admin')),
  name_en text,
  name_ar text,
  phone text,
  avatar_url text,
  preferred_language text default 'en' check (preferred_language in ('en', 'ar')),
  demo boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.users enable row level security;

-- Helper: is the current user staff (admin/super_admin)? SECURITY DEFINER so it
-- reads public.users WITHOUT triggering RLS -> prevents infinite recursion in the
-- users policies (Postgres error 42P17).
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_staff();
$$;

create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Admins can view all users" on public.users for select using (
  public.is_staff()
);

-- ── SCHOOLS ───────────────────────────────────────────────────────────
create table public.schools (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  name_en text not null,
  name_ar text,
  type text check (type in ('public', 'private', 'international')),
  governorate text check (governorate in ('Capital','Hawalli','Farwaniya','Ahmadi','Jahra','Mubarak Al-Kabeer')),
  address text,
  students_count integer,
  principal_name text,
  principal_email text,
  principal_phone text,
  status text default 'pending' check (status in ('pending','active','suspended','inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.schools enable row level security;
create policy "School owners can view own school" on public.schools for all using (user_id = auth.uid());
create policy "Admins can view all schools" on public.schools for select using (
  public.is_staff()
);

-- ── BUSINESSES ────────────────────────────────────────────────────────
create table public.businesses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  name_en text not null,
  name_ar text,
  type text check (type in ('hotel','restaurant','beach','marina','other')),
  governorate text,
  address text,
  lat numeric(9,6),
  lng numeric(9,6),
  stars integer check (stars between 1 and 7),
  contact_name text,
  contact_email text,
  contact_phone text,
  trade_license_url text,
  status text default 'pending' check (status in ('pending','active','suspended','inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.businesses enable row level security;
create policy "Business owners can view own business" on public.businesses for all using (user_id = auth.uid());
create policy "Admins can view all businesses" on public.businesses for select using (
  public.is_staff()
);

-- ── APPLICATIONS ──────────────────────────────────────────────────────
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  applicant_id uuid references public.users on delete cascade not null,
  entity_id uuid, -- school_id or business_id
  entity_type text check (entity_type in ('school','business')),
  programme text not null check (programme in ('eco-schools','blue-flag','green-key','leaf','yre','eco-campus')),
  status text default 'new' check (status in ('new','under_review','documents_pending','site_visit_scheduled','approved','rejected')),
  assigned_to uuid references public.users,
  review_notes text,
  rejection_reason text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now(),
  review_deadline timestamptz default (now() + interval '5 days')
);
alter table public.applications enable row level security;
create policy "Applicants can view own applications" on public.applications for select using (applicant_id = auth.uid());
create policy "Admins can manage all applications" on public.applications for all using (
  public.is_staff()
);

-- ── DOCUMENTS ─────────────────────────────────────────────────────────
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications on delete cascade not null,
  uploader_id uuid references public.users not null,
  name text not null,
  file_url text not null,
  file_type text,
  file_size integer,
  status text default 'pending' check (status in ('pending','approved','rejected','requested')),
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.users,
  version integer default 1,
  created_at timestamptz default now()
);
alter table public.documents enable row level security;
create policy "Uploaders can manage own documents" on public.documents for all using (uploader_id = auth.uid());
create policy "Admins can manage all documents" on public.documents for all using (
  public.is_staff()
);

-- ── CERTIFICATIONS ────────────────────────────────────────────────────
create table public.certifications (
  id uuid default uuid_generate_v4() primary key,
  applicant_id uuid references public.users on delete cascade not null,
  application_id uuid references public.applications,
  programme text not null,
  level text,
  issued_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '1 year'),
  certificate_url text,
  badge_url text,
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.certifications enable row level security;
create policy "Members can view own certifications" on public.certifications for select using (applicant_id = auth.uid());
create policy "Admins can manage certifications" on public.certifications for all using (
  public.is_staff()
);

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  type text not null,
  title_en text,
  title_ar text,
  message_en text,
  message_ar text,
  action_url text,
  read boolean default false,
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "Users can manage own notifications" on public.notifications for all using (user_id = auth.uid());

-- ── NEWS ──────────────────────────────────────────────────────────────
create table public.news (
  id uuid default uuid_generate_v4() primary key,
  title_en text not null,
  title_ar text,
  slug text unique not null,
  excerpt_en text,
  excerpt_ar text,
  body_en text,
  body_ar text,
  image_url text,
  category text default 'news',
  programme text,
  published boolean default false,
  published_at timestamptz,
  author_id uuid references public.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.news enable row level security;
create policy "Anyone can read published news" on public.news for select using (published = true);
create policy "Admins can manage news" on public.news for all using (
  public.is_staff()
);

-- ── EVENTS ────────────────────────────────────────────────────────────
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title_en text not null,
  title_ar text,
  description_en text,
  description_ar text,
  location text,
  date timestamptz not null,
  end_date timestamptz,
  image_url text,
  registration_url text,
  published boolean default true,
  created_at timestamptz default now()
);
alter table public.events enable row level security;
create policy "Anyone can read published events" on public.events for select using (published = true);
create policy "Admins can manage events" on public.events for all using (
  public.is_staff()
);

-- ── MAP PINS ──────────────────────────────────────────────────────────
create table public.map_pins (
  id uuid default uuid_generate_v4() primary key,
  name_en text not null,
  name_ar text,
  programme text not null check (programme in ('eco-schools','blue-flag','green-key','leaf','yre','eco-campus')),
  type text,
  governorate text,
  lat numeric(9,6) not null,
  lng numeric(9,6) not null,
  certified_at timestamptz,
  certification_id uuid references public.certifications,
  photo_url text,
  description_en text,
  description_ar text,
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.map_pins enable row level security;
create policy "Anyone can read active map pins" on public.map_pins for select using (active = true);
create policy "Admins can manage map pins" on public.map_pins for all using (
  public.is_staff()
);

-- ── RESOURCES ─────────────────────────────────────────────────────────
create table public.resources (
  id uuid default uuid_generate_v4() primary key,
  title_en text not null,
  title_ar text,
  description_en text,
  description_ar text,
  programme text,
  language text default 'both' check (language in ('en','ar','both')),
  category text,
  file_url text not null,
  file_type text,
  file_size integer,
  downloads integer default 0,
  published boolean default true,
  created_at timestamptz default now()
);
alter table public.resources enable row level security;
create policy "Authenticated users can read resources" on public.resources for select using (auth.uid() is not null and published = true);
create policy "Admins can manage resources" on public.resources for all using (
  public.is_staff()
);

-- ── CHAT LOGS ─────────────────────────────────────────────────────────
create table public.chat_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users,
  session_id text not null,
  message text not null,
  role text check (role in ('user','assistant')),
  language text default 'en',
  created_at timestamptz default now()
);
alter table public.chat_logs enable row level security;
create policy "Users can view own chat logs" on public.chat_logs for select using (user_id = auth.uid());
create policy "System can insert chat logs" on public.chat_logs for insert with check (true);

-- ── AUTOMATION LOGS ───────────────────────────────────────────────────
create table public.automation_logs (
  id uuid default uuid_generate_v4() primary key,
  trigger text not null,
  recipient_id uuid references public.users,
  recipient_email text,
  recipient_phone text,
  channel text check (channel in ('email','whatsapp','sms','push')),
  template text,
  status text check (status in ('sent','failed','pending')),
  error_message text,
  sent_at timestamptz default now()
);
alter table public.automation_logs enable row level security;
create policy "Admins can view automation logs" on public.automation_logs for select using (
  public.is_staff()
);

-- ── YOUTH PLEDGES ─────────────────────────────────────────────────────
create table public.youth_pledges (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  school text,
  pledge_en text,
  pledge_ar text,
  approved boolean default false,
  created_at timestamptz default now()
);
alter table public.youth_pledges enable row level security;
create policy "Anyone can read approved pledges" on public.youth_pledges for select using (approved = true);
create policy "Anyone can submit pledges" on public.youth_pledges for insert with check (true);

-- ── CERTIFICATION STEPS ───────────────────────────────────────────────
create table public.certification_steps (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications on delete cascade not null,
  step_number integer not null,
  title_en text,
  title_ar text,
  status text default 'not_started' check (status in ('not_started','in_progress','submitted','approved','rejected')),
  submitted_at timestamptz,
  approved_at timestamptz,
  notes text,
  created_at timestamptz default now()
);
alter table public.certification_steps enable row level security;
create policy "Applicants can manage own steps" on public.certification_steps for all using (
  exists (select 1 from public.applications where id = application_id and applicant_id = auth.uid())
);

-- ── IMPACT STATS ──────────────────────────────────────────────────────
create table public.impact_stats (
  id uuid default uuid_generate_v4() primary key,
  year integer not null,
  schools_certified integer default 0,
  businesses_certified integer default 0,
  students_reached integer default 0,
  trees_planted integer default 0,
  beaches_cleaned integer default 0,
  co2_saved_kg integer default 0,
  countries_connected integer default 0,
  updated_at timestamptz default now()
);
alter table public.impact_stats enable row level security;
create policy "Anyone can read impact stats" on public.impact_stats for select using (true);
create policy "Admins can manage impact stats" on public.impact_stats for all using (
  public.is_staff()
);

-- ── PARTNERS ──────────────────────────────────────────────────────────
create table public.partners (
  id uuid default uuid_generate_v4() primary key,
  name_en text not null,
  name_ar text,
  type text check (type in ('government','corporate','institutional')),
  logo_url text,
  website_url text,
  sort_order integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.partners enable row level security;
create policy "Anyone can read active partners" on public.partners for select using (active = true);

-- ── TRIGGER: update updated_at ────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users for each row execute function update_updated_at();
create trigger schools_updated_at before update on public.schools for each row execute function update_updated_at();
create trigger businesses_updated_at before update on public.businesses for each row execute function update_updated_at();
create trigger applications_updated_at before update on public.applications for each row execute function update_updated_at();

-- ── FUNCTION: handle new user ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name_en)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 002_auditors.sql
-- ============================================================
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


-- ============================================================
-- 003_green_key_alignment.sql
-- ============================================================
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


-- ============================================================
-- 004_criterion_documents.sql
-- ============================================================
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
  using (public.is_staff());

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


-- ============================================================
-- 005_no_cb_workflow.sql
-- ============================================================
-- FEE Kuwait — National Operator (NO) -> Certification Body (CB) -> Auditor workflow
--
-- Real Green Key process order:
--   a) National Operator reviews the criteria checklist WITH the establishment
--   b) NO submits to the CB  -> submitted_to_cb_at timestamp is recorded and the
--      establishment's checklist + documents LOCK (read-only, audit integrity)
--   c) CB reviews. Comments -> back to NO (changes_requested). Clear -> CB assigns an Auditor
--   d) Auditor visits, records findings from their own profile
--   e) Audit returns to CB for final assessment (cb_final)
--   f) CB issues the final judgement -> certified / certified_rectification / not_certified
--
-- ("Admin" is renamed to National Operator in the UI; the role code stays 'admin'.)

-- ── New workflow statuses ─────────────────────────────────────────────────────
alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in (
    -- legacy values kept for compatibility
    'new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'approved', 'rejected',
    'pre_screening', 'application_setup', 'submission', 'audit',
    'cb_review', 'certified', 'certified_rectification', 'not_certified', 'surveillance',
    -- NO -> CB -> Auditor workflow
    'no_review',          -- with National Operator (checklist review, editable)
    'changes_requested',  -- returned by CB to the National Operator
    'cb_final'            -- post-audit, awaiting CB final judgement
  ));

-- ── Submission timestamp + checklist lock ─────────────────────────────────────
alter table public.applications add column if not exists submitted_to_cb_at timestamptz;
-- Locked once submitted to the CB; nothing in the checklist/documents may change after.
alter table public.applications add column if not exists checklist_locked boolean not null default false;

-- Keep the append-only document lock (migration 004) consistent with this flow:
-- documents accept uploads only while the checklist is still open.
create or replace function public.application_accepts_uploads(app_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.applications a
    where a.id = app_id
      and a.checklist_locked = false
      and a.status in ('no_review', 'changes_requested',
                       'new', 'pre_screening', 'application_setup', 'submission', 'documents_pending')
  );
$$ language sql stable;

-- ── Guardrail: once locked, the checklist cannot be silently reopened ──────────
-- Only a National Operator (admin/super_admin) may set checklist_locked back to false,
-- and only when the CB explicitly returned the application (changes_requested).
create or replace function public.enforce_checklist_lock()
returns trigger as $$
begin
  if old.checklist_locked = true and new.checklist_locked = false then
    if not public.is_staff() then
      raise exception 'Only the National Operator can reopen a locked checklist';
    end if;
    if new.status not in ('changes_requested', 'no_review') then
      raise exception 'A locked checklist can only reopen when the application is returned for changes';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_checklist_lock on public.applications;
create trigger applications_checklist_lock
  before update on public.applications
  for each row execute function public.enforce_checklist_lock();


-- ============================================================
-- 006_auth_profile_roles.sql
-- ============================================================
-- FEE Kuwait — sign-up profile creation with role & language
--
-- migration 001 created a handle_new_user() trigger that copied only the name.
-- Real sign-up needs the chosen role (school / business / auditor / …),
-- bilingual name and preferred language, which the client passes as user
-- metadata (auth.users.raw_user_meta_data) at signUp().
--
-- Roles were extended to include 'auditor' (002) and 'certification_body' (003),
-- so metadata role values are validated by the users.role check constraint.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role, name_en, name_ar, preferred_language)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'school'),
    new.raw_user_meta_data->>'name_en',
    new.raw_user_meta_data->>'name_ar',
    coalesce(nullif(new.raw_user_meta_data->>'preferred_language', ''), 'en')
  )
  on conflict (id) do update
    set email = excluded.email,
        role = coalesce(nullif(excluded.role, ''), public.users.role),
        name_en = coalesce(excluded.name_en, public.users.name_en),
        name_ar = coalesce(excluded.name_ar, public.users.name_ar);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger already exists from 001 (on_auth_user_created); replacing the
-- function above is enough. Re-create defensively in case 001 was partial.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 007_application_insert.sql
-- ============================================================
-- FEE Kuwait — let applicants create their own applications
--
-- 001 gave applicants only a SELECT policy on applications ("view own") and a
-- catch-all for admins. Schools/establishments also need to INSERT their own
-- application (applicant_id must be themselves). This is additive — no reset.

create policy "Applicants can create own applications" on public.applications
  for insert with check (applicant_id = auth.uid());

-- Allow applicants to update their own application while it is still new/draft
-- (e.g. before an operator picks it up). Operators keep full control via the
-- existing "Admins can manage all applications" policy.
create policy "Applicants can update own new applications" on public.applications
  for update using (applicant_id = auth.uid() and status in ('new', 'documents_pending'))
  with check (applicant_id = auth.uid());

