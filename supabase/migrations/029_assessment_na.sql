-- FEE Kuwait — allow an "N/A" result at the operator & auditor review levels
-- Additive migration — safe to run on the existing database (no reset).
--
-- The whiteboard's option sets add a fourth choice to the Operator Readiness
-- Review ("N/A Confirmed") and the Auditor Conformity Assessment ("Not
-- Applicable"). Both are stored as 'na'. Relax the check constraints to allow it.

alter table public.criterion_assessments drop constraint if exists criterion_assessments_result_check;
alter table public.criterion_assessments
  add constraint criterion_assessments_result_check check (result in ('pending', 'pass', 'no_pass', 'na'));

alter table public.criterion_assessments drop constraint if exists criterion_assessments_internal_result_check;
alter table public.criterion_assessments
  add constraint criterion_assessments_internal_result_check check (internal_result in ('pending', 'pass', 'no_pass', 'na'));
