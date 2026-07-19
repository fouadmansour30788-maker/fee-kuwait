-- FEE Kuwait — evidence links (attach a URL instead of/along with a file)
-- Additive migration — safe to run on the existing database (no reset).
--
-- Evidence can now be a link (e.g. a shared drive / cloud document) rather than
-- an uploaded file. Link rows carry `link_url` and have no storage object, so
-- `path` becomes optional.

alter table public.application_documents add column if not exists link_url text;
alter table public.application_documents alter column path drop not null;
