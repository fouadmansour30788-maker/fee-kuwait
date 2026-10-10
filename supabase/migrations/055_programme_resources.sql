-- FEE Kuwait — programme resources managed by the National Operator
-- Additive migration — safe to run on the existing database (no reset).
--
-- The operator adds guides, toolkits, templates and links per programme
-- (or for all programmes); schools / establishments see the published ones
-- for their programmes under Resources & tools.

-- A resource is either an uploaded file (path in the private bucket) or a link.
alter table public.resources alter column file_url drop not null;
alter table public.resources add column if not exists path text;
alter table public.resources add column if not exists created_by uuid references public.users;

-- Private bucket: members download through /api/resources/[id] (signed URL
-- after a sign-in check), never by a public link.
insert into storage.buckets (id, name, public)
values ('programme-resources', 'programme-resources', false)
on conflict (id) do update set public = false;

-- Staff upload straight from the browser (files can exceed the server-action limit).
drop policy if exists "Staff manage programme resources" on storage.objects;
create policy "Staff manage programme resources"
  on storage.objects for all to authenticated
  using (bucket_id = 'programme-resources' and public.is_staff())
  with check (bucket_id = 'programme-resources' and public.is_staff());
