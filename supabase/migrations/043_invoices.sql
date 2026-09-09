-- FEE Kuwait — programme fees / invoices per application
-- Additive migration — safe to run on the existing database (no reset).
--
-- The operator raises an invoice against an application (amount entered per
-- invoice — programme fees vary), tracks its status, and the applicant can see
-- their own invoices. Amounts are in KWD (3 decimal places / fils).

create table if not exists public.invoices (
  id             uuid default uuid_generate_v4() primary key,
  invoice_number text        unique not null,
  application_id uuid        references public.applications on delete cascade,
  applicant_id   uuid        references public.users,
  programme      text,
  description    text,
  amount         numeric(12,3) not null default 0,
  currency       text        not null default 'KWD',
  status         text        not null default 'draft'
                   check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issued_at      timestamptz not null default now(),
  due_at         timestamptz,
  paid_at        timestamptz,
  created_by     uuid        references public.users,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.invoices enable row level security;

-- Staff (operator/CB/auditor via is_staff) manage invoices.
create policy "Staff manage invoices" on public.invoices
  for all using (public.is_staff()) with check (public.is_staff());

-- The applicant can read their own invoices.
create policy "Applicant reads own invoices" on public.invoices
  for select using (applicant_id = auth.uid());

create index if not exists invoices_application_idx on public.invoices (application_id);
create index if not exists invoices_status_idx on public.invoices (status, issued_at desc);
