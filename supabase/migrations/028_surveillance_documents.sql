-- FEE Kuwait — separate surveillance evidence from the main application evidence
-- Additive migration — safe to run on the existing database (no reset).
--
-- Surveillance uploads reuse the per-criterion uploader keyed by criterion_ref +
-- year. When a surveillance period equals the application's evidence year the two
-- sets collided, so surveillance documents appeared on the main criteria board.
-- Tagging the row with its surveillance activity keeps each set in its own tab.

alter table public.application_documents
  add column if not exists surveillance_id uuid references public.surveillance_activities on delete cascade;

create index if not exists application_documents_surveillance_id_idx
  on public.application_documents (surveillance_id);

-- Backfill existing surveillance uploads. Conservative: only rows for a criterion
-- the activity actually requested, in its period, uploaded after it was requested
-- — which is the signature of a response to that request.
update public.application_documents d
set    surveillance_id = s.id
from   public.surveillance_activities s
where  d.surveillance_id is null
  and  d.application_id = s.application_id
  and  d.criterion_ref = any (s.criteria)
  and  d.year = s.period
  and  d.created_at >= s.requested_at;
