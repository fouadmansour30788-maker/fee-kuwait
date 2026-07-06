-- FEE Kuwait — news / content articles (CMS)
-- Additive migration — safe to run on the existing database (no reset).

create table if not exists public.news_articles (
  id           uuid default uuid_generate_v4() primary key,
  slug         text unique not null,
  title_en     text not null,
  title_ar     text,
  excerpt_en   text,
  excerpt_ar   text,
  body_en      text,
  body_ar      text,
  image_url    text,
  programme    text,
  status       text default 'draft' check (status in ('draft', 'published', 'scheduled')),
  published_at timestamptz,
  author_id    uuid references public.users,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table public.news_articles enable row level security;

-- Anyone (including anonymous visitors) can read published articles.
create policy "Public read published news" on public.news_articles
  for select using (status = 'published');

-- Staff (operator) manage everything.
create policy "Staff manage news" on public.news_articles
  for all using (public.is_staff()) with check (public.is_staff());

create index if not exists news_articles_status_idx on public.news_articles (status, published_at desc);
