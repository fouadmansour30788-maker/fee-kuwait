-- FEE Kuwait — establishment per-criterion comment
-- Additive migration — safe to run on the existing database (no reset).
--
-- The establishment can leave a comment per criterion (e.g. explaining its
-- evidence) that the National Operator sees in the shared criteria board.
-- It is written server-side via the service role after verifying ownership,
-- so no applicant write policy on criterion_assessments is needed (they keep
-- read-only access from migration 012).

alter table public.criterion_assessments add column if not exists applicant_note text;
