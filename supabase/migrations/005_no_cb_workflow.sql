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
    if not exists (select 1 from public.users where id = auth.uid() and role in ('admin','super_admin')) then
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
