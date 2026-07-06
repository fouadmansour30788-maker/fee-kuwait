import { createClient } from '@/lib/supabase/server'

export type CriterionResult = 'pending' | 'pass' | 'no_pass'

export interface CriterionAssessment {
  internal: CriterionResult
  internalNote: string | null
  external: CriterionResult
  note: string | null
  applicantNote: string | null
}

// Map of criterion_ref -> external result for an application (RLS decides visibility).
export async function listAssessments(applicationId: string): Promise<Record<string, CriterionResult>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('criterion_assessments')
    .select('criterion_ref, result')
    .eq('application_id', applicationId)
  if (error) { console.error('listAssessments:', error.message); return {} }
  const map: Record<string, CriterionResult> = {}
  for (const r of data ?? []) map[r.criterion_ref] = r.result as CriterionResult
  return map
}

// Full two-tier assessment (internal + external + feedback) per criterion.
export async function listCriterionAssessments(applicationId: string): Promise<Record<string, CriterionAssessment>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('criterion_assessments')
    .select('criterion_ref, result, internal_result, note, internal_note, applicant_note')
    .eq('application_id', applicationId)
  if (error) { console.error('listCriterionAssessments:', error.message); return {} }
  const map: Record<string, CriterionAssessment> = {}
  for (const r of data ?? []) {
    map[r.criterion_ref] = {
      internal: (r.internal_result ?? 'pending') as CriterionResult,
      internalNote: r.internal_note ?? null,
      external: (r.result ?? 'pending') as CriterionResult,
      note: r.note ?? null,
      applicantNote: r.applicant_note ?? null,
    }
  }
  return map
}
