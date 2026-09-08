-- FEE Kuwait — Certification Body scope (specialty)
-- Additive migration — safe to run on the existing database (no reset).
--
-- Lets the operator run more than one Certification Body and mark each one's
-- domain: hospitality establishments, educational institutions, or both. The
-- operator's CB-assignment dropdown uses it to recommend the right CB per
-- application type; it never restricts the choice.

alter table public.users
  add column if not exists cb_scope text
  check (cb_scope in ('hospitality', 'educational', 'both'));
