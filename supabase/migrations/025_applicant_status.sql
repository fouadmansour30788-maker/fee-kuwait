-- FEE Kuwait — establishment per-criterion progress status
-- Additive migration — safe to run on the existing database (no reset).
--
-- The establishment tracks each criterion as In progress / Complete / N/A
-- (written server-side via the service role after ownership check, like
-- applicant_result). When a criterion is marked Complete, the operator is
-- notified (notifications table already exists) to check it.

alter table public.criterion_assessments
  add column if not exists applicant_status text
    check (applicant_status in ('in_progress', 'complete', 'na'));
