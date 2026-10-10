-- FEE Kuwait — Eco-Schools academic years
-- Additive migration — safe to run on the existing database (no reset).
--
-- Each Eco-Schools application covers one academic year (September–June).
-- The National Operator closes a year and opens the next one as a new
-- application; a closed year stays visible but read-only for the school.

alter table public.applications add column if not exists academic_year text;      -- e.g. '2025-2026'
alter table public.applications add column if not exists year_closed_at timestamptz;
alter table public.applications add column if not exists year_closed_by uuid references public.users;

-- Back-fill existing Eco-Schools applications from the date they were created
-- (the academic year starts in September, Kuwait time).
update public.applications
set academic_year = case
  when extract(month from submitted_at at time zone 'Asia/Kuwait') >= 9
    then extract(year from submitted_at at time zone 'Asia/Kuwait')::int || '-' || (extract(year from submitted_at at time zone 'Asia/Kuwait')::int + 1)
  else (extract(year from submitted_at at time zone 'Asia/Kuwait')::int - 1) || '-' || extract(year from submitted_at at time zone 'Asia/Kuwait')::int
end
where programme = 'eco-schools' and academic_year is null;

-- One Eco-Schools application per school per academic year.
create unique index if not exists applications_eco_year_unique
  on public.applications (applicant_id, programme, academic_year)
  where programme = 'eco-schools' and academic_year is not null;
