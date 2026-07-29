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
