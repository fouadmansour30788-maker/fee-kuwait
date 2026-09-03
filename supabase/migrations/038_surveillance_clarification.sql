-- FEE Kuwait — surveillance: CB can request clarification
-- After the establishment fulfils a surveillance request, the Certification Body
-- either maintains certification, records "not maintained", or sends it back for
-- clarification. Add the 'clarification' state to the status check constraint.

alter table public.surveillance_activities drop constraint if exists surveillance_activities_status_check;
alter table public.surveillance_activities
  add constraint surveillance_activities_status_check
  check (status in ('requested', 'submitted', 'reviewed', 'clarification', 'certified', 'not_certified'));
