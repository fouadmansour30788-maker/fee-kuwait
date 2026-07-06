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
  select exists (select 1 from public.users where id = auth.uid() and role in ('admin','super_admin'));
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
