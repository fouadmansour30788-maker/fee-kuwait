-- FEE Kuwait — Stage 2b: adopt the whiteboard lifecycle for existing applications
-- Additive migration — safe to run on the existing database (no reset).
--
-- Maps every legacy application status onto its new-lifecycle equivalent. New
-- applications are created at 'pending_eligibility'; the existing eligibility
-- approval (pre-screening / registration) moves them to 'in_progress'.

update public.applications set status = 'in_progress'          where status in ('under_review', 'documents_pending', 'revision');
update public.applications set status = 'audit_scheduled'      where status = 'site_visit_scheduled';
update public.applications set status = 'audit_in_progress'    where status = 'audit';
update public.applications set status = 'cb_pre_audit_review'  where status = 'cb_review';
update public.applications set status = 'ready_for_auditor'    where status = 'approved';
update public.applications set status = 'eligibility_rejected' where status = 'rejected';
update public.applications set status = 'certified_active'     where status in ('certified', 'certified_rectification');
update public.applications set status = 'not_certified_communicated' where status = 'not_certified';

-- 'new' rows whose registration is already approved are in progress; the rest
-- await eligibility.
update public.applications a set status = 'in_progress'
  where a.status = 'new'
    and (exists (select 1 from public.businesses b where b.id = a.entity_id and b.status = 'active')
      or exists (select 1 from public.schools s where s.id = a.entity_id and s.status = 'active'));
update public.applications set status = 'pending_eligibility' where status = 'new';
