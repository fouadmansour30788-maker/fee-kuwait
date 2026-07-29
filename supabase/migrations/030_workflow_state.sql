-- FEE Kuwait — Stage 2 workflow state (whiteboard state machine support)
-- Additive migration — safe to run on the existing database (no reset).
--
-- Columns the new lifecycle needs:
--   cb_origin_status    — the CB stage a clarification was requested from, so
--                         "Return to CB" / "Submit Clarification to CB" can go back.
--   clarification_owner — who must respond to a CB clarification (operator/auditor/establishment).
--   clarification_note  — the clarification request text.
--   rectification_round — increments each corrective-action round.
--   site_visit_date     — the auditor's confirmed site-visit date.
--   action_deadline     — deadline for a reopened rectification/corrective period.

alter table public.applications add column if not exists cb_origin_status    text;
alter table public.applications add column if not exists clarification_owner  text check (clarification_owner in ('operator', 'auditor', 'establishment'));
alter table public.applications add column if not exists clarification_note   text;
alter table public.applications add column if not exists rectification_round  int not null default 0;
alter table public.applications add column if not exists site_visit_date      date;
alter table public.applications add column if not exists action_deadline      timestamptz;

-- Allow the whiteboard lifecycle statuses (must run before 031 remaps the data).
alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in (
    -- legacy values kept for compatibility
    'new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'approved', 'rejected',
    'pre_screening', 'application_setup', 'submission', 'audit', 'cb_review', 'certified',
    'certified_rectification', 'not_certified', 'surveillance', 'revision',
    'no_review', 'changes_requested', 'cb_final', 'pending',
    -- whiteboard lifecycle
    'pending_eligibility', 'in_progress', 'eligibility_rejected',
    'cb_pre_audit_review', 'pre_audit_rectification_required', 'pre_audit_rectification_open',
    'cb_pre_audit_re_review', 'ready_for_auditor', 'auditor_assigned', 'audit_scheduled',
    'audit_in_progress', 'cb_final_review', 'cb_final_re_review',
    'post_audit_rectification_required', 'post_audit_corrective_open',
    'auditor_reassessment', 'auditor_reassessment_in_progress', 'further_corrective_required',
    'cb_clarification_operator', 'cb_clarification_auditor', 'cb_clarification_establishment',
    'certified_active', 'not_certified_recorded', 'not_certified_communicated'
  ));
