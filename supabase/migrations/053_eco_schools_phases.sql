-- FEE Kuwait — Eco-Schools phased workflow + Green Flag scorecard
-- Additive migration — safe to run on the existing database (no reset).

-- Steps 3–7 open once the National Operator approves Steps 1–2.
alter table public.applications add column if not exists es_unlocked_at timestamptz;
alter table public.applications add column if not exists es_unlocked_by uuid references public.users;

-- "Is your school Green Flag ready?" scorecard, filled by the operator.
alter table public.applications add column if not exists es_score jsonb;
alter table public.applications add column if not exists es_score_total int;
alter table public.applications add column if not exists es_scored_at timestamptz;
alter table public.applications add column if not exists es_scored_by uuid references public.users;
