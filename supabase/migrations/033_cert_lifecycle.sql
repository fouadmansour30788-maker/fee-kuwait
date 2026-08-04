-- FEE Kuwait — certification lifecycle: suspend / reinstate / withdraw / re-certify
-- + "certified subject to rectification" + establishment re-assessment request.
-- Additive migration — safe to run on the existing database (no reset).

alter table public.applications add column if not exists certification_cycle int not null default 1;

-- Allow the new lifecycle statuses.
alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in (
    'new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'approved', 'rejected',
    'pre_screening', 'application_setup', 'submission', 'audit', 'cb_review', 'certified',
    'certified_rectification', 'not_certified', 'surveillance', 'revision',
    'no_review', 'changes_requested', 'cb_final', 'pending',
    'pending_eligibility', 'in_progress', 'eligibility_rejected',
    'cb_pre_audit_review', 'pre_audit_rectification_required', 'pre_audit_rectification_open',
    'cb_pre_audit_re_review', 'ready_for_auditor', 'auditor_assigned', 'audit_scheduled',
    'audit_in_progress', 'cb_final_review', 'cb_final_re_review',
    'post_audit_rectification_required', 'post_audit_corrective_open',
    'auditor_reassessment', 'auditor_reassessment_in_progress', 'further_corrective_required',
    'cb_clarification_operator', 'cb_clarification_auditor', 'cb_clarification_establishment',
    'certified_active', 'certified_rectification_active', 'certified_suspended', 'certified_withdrawn',
    'not_certified_recorded', 'not_certified_communicated'
  ));

-- Certificate status gains suspended / withdrawn.
alter table public.certificates drop constraint if exists certificates_status_check;
alter table public.certificates add constraint certificates_status_check
  check (status in ('active', 'expired', 'revoked', 'suspended', 'withdrawn'));
