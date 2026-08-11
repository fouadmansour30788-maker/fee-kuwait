-- FEE Kuwait — capture the site-visit time, not just the date.
-- The auditor now confirms an exact date AND time for the site visit, so widen
-- the column from `date` to `timestamptz`. Existing dates cast cleanly (they
-- become midnight of that day). Additive/safe — no data loss.

alter table public.applications
  alter column site_visit_date type timestamptz using site_visit_date::timestamptz;
