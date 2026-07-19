-- FEE Kuwait — Registration details (Green Key & Eco-Schools application forms)
-- Additive migration — safe to run on the existing database (no reset).
--
-- The official Green Key and Eco-Schools registration forms collect a set of
-- programme-specific fields (rooms/guests/managers for Green Key; principal,
-- coordinator, teachers, themes for Eco-Schools). They are captured in the
-- sign-up wizard's "Details" step and stored as a single JSONB blob on the
-- establishment/school record, so no per-field schema churn is needed.

alter table public.businesses add column if not exists details jsonb not null default '{}'::jsonb;
alter table public.schools    add column if not exists details jsonb not null default '{}'::jsonb;
