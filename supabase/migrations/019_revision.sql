-- FEE Kuwait — non-conformity revision stage
-- Additive migration — safe to run on the existing database (no reset).
--
-- Adds a 'revision' status: the operator re-opens an audited application so the
-- establishment can fix its non-conforming criteria within a deadline. During
-- revision the board is editable for the establishment AND the audit results stay
-- visible. revision_deadline records the due date (15 days for 1-5 NCs, 3 months
-- for 6+).

alter table public.applications add column if not exists revision_deadline timestamptz;

alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in (
    'new', 'under_review', 'documents_pending', 'site_visit_scheduled',
    'pre_screening', 'application_setup', 'submission', 'audit',
    'cb_review', 'certified', 'certified_rectification', 'not_certified', 'surveillance',
    'no_review', 'changes_requested', 'cb_final',
    'approved', 'rejected', 'revision'
  ));
