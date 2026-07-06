-- FEE Kuwait — two-tier criterion assessment (internal + external)
-- Additive migration — safe to run on the existing database (no reset).
--
-- criterion_assessments already stores the external (independent auditor) result
-- in `result` + `note`. This adds the internal assessment recorded by the National
-- Operator (admin) before/alongside the external audit, and lets staff write it.

alter table public.criterion_assessments
  add column if not exists internal_result text default 'pending'
    check (internal_result in ('pending', 'pass', 'no_pass'));
alter table public.criterion_assessments
  add column if not exists internal_note text;

-- Staff (National Operator) manage the internal assessment. This supplements the
-- existing read-only staff policy and the auditor's own manage policy; PostgREST
-- upserts only touch the columns in the request body, so admin writes to
-- internal_result never overwrite the auditor's `result`/`note` and vice-versa.
drop policy if exists "Staff manage assessments" on public.criterion_assessments;
create policy "Staff manage assessments" on public.criterion_assessments
  for all using (public.is_staff()) with check (public.is_staff());
