-- FEE Kuwait — article media attachments (photo / video / link / slideshow)
-- Additive migration — safe to run on the existing database (no reset).
--
-- Stores an ordered list of embedded media items on each article. Shape:
--   [{ "type": "image"|"video"|"link"|"slideshow",
--      "url": "…",            -- image src, video src/embed, or link href
--      "urls": ["…","…"],     -- slideshow: ordered image sources
--      "title": "…",          -- link title / media heading (optional)
--      "caption": "…" }]      -- caption shown under the item (optional)

alter table public.news_articles
  add column if not exists media jsonb not null default '[]'::jsonb;
