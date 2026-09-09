-- FEE Kuwait — guest reviews & photos for certified establishments
-- Additive migration — safe to run on the existing database (no reset).
--
-- Powers the public "green stays" directory profiles: visitors leave a star
-- rating, a comment, and an optional photo for a certified establishment
-- (keyed by its certificate number). Reviews are MODERATED — they only appear
-- publicly once staff approve them.

create table if not exists public.establishment_reviews (
  id                 uuid default uuid_generate_v4() primary key,
  certificate_number text        not null,
  author_name        text,
  rating             int         not null check (rating between 1 and 5),
  comment            text,
  photo_url          text,
  status             text        not null default 'pending'
                       check (status in ('pending', 'approved', 'hidden')),
  created_at         timestamptz not null default now()
);

alter table public.establishment_reviews enable row level security;

-- Anyone (anonymous visitors) can submit a review.
create policy "Anyone submit review" on public.establishment_reviews
  for insert with check (true);

-- The public can read only approved reviews.
create policy "Public read approved reviews" on public.establishment_reviews
  for select using (status = 'approved');

-- Staff moderate everything.
create policy "Staff manage reviews" on public.establishment_reviews
  for all using (public.is_staff()) with check (public.is_staff());

create index if not exists reviews_cert_idx on public.establishment_reviews (certificate_number, status);
create index if not exists reviews_status_idx on public.establishment_reviews (status, created_at desc);
