-- FEE Kuwait — Eco-Schools: themes the school works on (Step 2)
-- Additive migration — safe to run on the existing database (no reset).
alter table public.applications add column if not exists es_themes text[];
