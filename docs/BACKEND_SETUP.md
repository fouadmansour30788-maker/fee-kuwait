# FEE Kuwait — Backend Setup (Supabase)

This is **Phase 1: connect the database + real authentication**. After these
steps, sign-in / sign-out, session handling, protected routes and role-based
landing are real. (Screen *content* is still mock data — that's Phase 2.)

## 1. Environment variables

1. Copy the template: `cp .env.local.example .env.local`
2. In Supabase → **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)

`.env.local` is git-ignored — never commit real keys. Add the same three
variables in **Vercel → Project → Settings → Environment Variables** for
production.

## 2. Apply the database schema

Run the migrations **in order** (001 → 006). Two options:

**A. Supabase SQL Editor (simplest):** open each file in `supabase/migrations/`
and run them one at a time, oldest first.

**B. Supabase CLI:**
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Migrations create: `users` (linked to Supabase Auth, with roles), `schools`,
`businesses`, the auditor/CB/criteria/document tables, RLS policies, and the
`handle_new_user` trigger that creates a profile row on sign-up.

## 3. Enable email/password auth

Supabase → **Authentication → Providers → Email**: enable it. For internal
staff you may turn **"Confirm email"** off so accounts work immediately.

## 4. Create the first users

Roles: `school`, `business`, `admin` (National Operator), `super_admin`,
`auditor`, `certification_body`.

- **Staff (Operator / CB / Auditor):** create them yourself.
  Supabase → **Authentication → Users → Add user** (email + password). A profile
  row is auto-created with role `school` by default, so set the real role:
  ```sql
  update public.users set role = 'admin'              where email = 'operator@feebureaukw.org';
  update public.users set role = 'certification_body' where email = 'cb@feebureaukw.org';
  update public.users set role = 'auditor'            where email = 'auditor@feebureaukw.org';
  ```
- **Establishments / schools** self-register (Phase 1.5): sign-up passes the
  chosen role as metadata and the trigger sets it automatically.

## 5. Run

```bash
npm run dev
```
Sign in at `/login`. You'll be redirected to the workspace for your role
(`/dashboard` for the operator, `/business/dashboard`, `/auditor/dashboard`,
`/cb/dashboard`, `/school/dashboard`). Unauthenticated visits to those routes
redirect to `/login`.

## What's real vs. still mock

| Area | Status |
|------|--------|
| Sign-in / sign-out / sessions | ✅ real (Supabase Auth) |
| Route protection + role landing | ✅ real (middleware + `roleHome`) |
| Profile + roles | ✅ real (`users` table) |
| Self-registration form | ⏳ Phase 1.5 (wire the register page to `signUp`) |
| Applications, criteria, comments, documents, CMS, news | ⏳ Phase 2 (swap mock arrays for DB queries + RLS) |

## Next (Phase 2)

Replace the mock `src/lib/data/*` arrays with Supabase queries, module by
module (certification workflow → documents → CMS → news), enforcing the
per-role visibility rules through the RLS policies already in the migrations.
