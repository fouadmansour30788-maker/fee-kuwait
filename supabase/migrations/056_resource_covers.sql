-- FEE Kuwait — cover images for programme resources
-- Additive migration — safe to run on the existing database (no reset).
--
-- Resources show as cards in category columns; a card can carry a cover image
-- (stored in the public site-assets bucket, like news images).

alter table public.resources add column if not exists cover_url text;
