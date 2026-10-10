import { createAdminClient } from '@/lib/supabase/admin'

// Audit-trail field recording the establishment's "submit for review" declaration.
export const REVIEW_SUBMISSION_FIELD = 'Submitted for review by establishment'

// When the establishment last submitted the application for review (service
// role — the applicant can't read the audit trail directly). Callers must only
// pass an application the viewer can already see.
export async function lastReviewSubmission(applicationId: string): Promise<string | null> {
  const { data } = await createAdminClient().from('audit_trail').select('created_at')
    .eq('application_id', applicationId).eq('field', REVIEW_SUBMISSION_FIELD)
    .order('created_at', { ascending: false }).limit(1).maybeSingle()
  return data?.created_at ?? null
}
