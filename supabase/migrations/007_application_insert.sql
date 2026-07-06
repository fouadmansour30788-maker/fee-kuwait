-- FEE Kuwait — let applicants create their own applications
--
-- 001 gave applicants only a SELECT policy on applications ("view own") and a
-- catch-all for admins. Schools/establishments also need to INSERT their own
-- application (applicant_id must be themselves). This is additive — no reset.

create policy "Applicants can create own applications" on public.applications
  for insert with check (applicant_id = auth.uid());

-- Allow applicants to update their own application while it is still new/draft
-- (e.g. before an operator picks it up). Operators keep full control via the
-- existing "Admins can manage all applications" policy.
create policy "Applicants can update own new applications" on public.applications
  for update using (applicant_id = auth.uid() and status in ('new', 'documents_pending'))
  with check (applicant_id = auth.uid());
