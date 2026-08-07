-- FEE Kuwait — CB per-criterion assessment columns + post-audit comment thread
-- Additive migration — safe to run on the existing database (no reset).
--
--   cb_pre_result   — CB Pre-Audit Review per criterion: approved_audit /
--                     clarification / rectification.
--   cb_final_result — CB Final Review per criterion: conforming / non_conforming /
--                     req_clarification / req_rectification.
--   phase           — separates the pre-auditor and post-auditor comment threads.

alter table public.criterion_assessments add column if not exists cb_pre_result   text;
alter table public.criterion_assessments add column if not exists cb_final_result text;

alter table public.criterion_messages add column if not exists phase text not null default 'pre_audit';
