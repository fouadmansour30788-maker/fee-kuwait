-- FEE Kuwait — public storage bucket for CMS images (partner logos, etc.)
-- Additive migration — safe to run on the existing database (no reset).
--
-- Partner logos are uploaded from the back office and shown on the public
-- Partners page / homepage strip, so the bucket is PUBLIC (readable without a
-- signed URL). Uploads happen through the admin (service-role) client in the
-- server action, which bypasses RLS — so only a public-read bucket is needed.

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;

-- Allow staff to upload/replace via a normal authenticated client too (belt &
-- braces; the server action already uses the service role).
drop policy if exists "Staff manage site assets" on storage.objects;
create policy "Staff manage site assets"
  on storage.objects for all to authenticated
  using (bucket_id = 'site-assets' and public.is_staff())
  with check (bucket_id = 'site-assets' and public.is_staff());
