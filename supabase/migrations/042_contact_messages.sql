-- FEE Kuwait — public contact-form inbox
-- Additive migration — safe to run on the existing database (no reset).
--
-- Stores "Send a Message" submissions from the public /contact form so the
-- operator can read and act on them in the back office. Anyone (anonymous) may
-- submit; only staff may read, mark read, or delete.

create table if not exists public.contact_messages (
  id         uuid default uuid_generate_v4() primary key,
  name       text,
  email      text,
  subject    text,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Public visitors can submit a message.
create policy "Anyone can submit contact message" on public.contact_messages
  for insert with check (true);

-- Staff read and manage the inbox.
create policy "Staff read contact messages" on public.contact_messages
  for select using (public.is_staff());
create policy "Staff update contact messages" on public.contact_messages
  for update using (public.is_staff()) with check (public.is_staff());
create policy "Staff delete contact messages" on public.contact_messages
  for delete using (public.is_staff());

create index if not exists contact_messages_created_idx on public.contact_messages (read, created_at desc);
