-- FEE Kuwait — configurable role permissions (back-office RBAC)
-- Additive migration — safe to run on the existing database (no reset).
--
-- Stores per-role OVERRIDES for the "grantable" capabilities defined in
-- src/lib/permissions.ts. A row means: for this staff role, this capability is
-- explicitly granted (true) or revoked (false), overriding the code default.
-- Capabilities with no row fall back to their default in code. This layer sits
-- ON TOP of RLS — it governs what back-office staff sub-roles may do; it never
-- widens the RLS security floor (applicants can never reach staff actions).

create table if not exists public.role_permissions (
  role       text        not null,
  capability text        not null,
  granted    boolean     not null,
  updated_at timestamptz not null default now(),
  primary key (role, capability)
);

alter table public.role_permissions enable row level security;

-- Any signed-in staff member may read the matrix (needed to resolve their own
-- capabilities at request time).
create policy "Staff read role permissions" on public.role_permissions
  for select using (public.is_staff());

-- Only the National Operator / Super Admin may change the matrix. (Writes from
-- the app run with the service role, which bypasses RLS; this is defence in depth.)
create policy "Operator manage role permissions" on public.role_permissions
  for all
  using  (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin')))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin')));
