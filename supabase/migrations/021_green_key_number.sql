-- FEE Kuwait — Green Key number per approved registration
-- Additive migration — safe to run on the existing database (no reset).
--
-- The operator (and Certification Body) assign a unique Green Key number to each
-- approved establishment/school after registration approval.

alter table public.businesses add column if not exists green_key_number text unique;
alter table public.schools    add column if not exists green_key_number text unique;
