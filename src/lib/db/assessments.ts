import { createClient } from '@/lib/supabase/server'

export type CriterionResult = 'pending' | 'pass' | 'no_pass' | 'na'

export type ApplicantStatus = 'in_progress' | 'complete' | 'na'

export type CbPreResult = 'pending' | 'approved_audit' | 'clarification' | 'rectification'
export type CbFinalResult = 'pending' | 'conforming' | 'non_conforming' | 'req_clarification' | 'req_rectification'

export interface CriterionAssessment {
  applicantResult: CriterionResult
  applicantStatus: ApplicantStatus | null
  internal: CriterionResult
  internalNote: string | null
  external: CriterionResult
  note: string | null
  applicantNote: string | null
  cbPre: CbPreResult
  cbFinal: CbFinalResult
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
    .select('criterion_ref, result, internal_result, note, internal_note, applicant_note, applicant_result, applicant_status, cb_pre_result, cb_final_result')
    .eq('application_id', applicationId)
  if (error) { console.error('listCriterionAssessments:', error.message); return {} }
  const map: Record<string, CriterionAssessment> = {}
  for (const r of data ?? []) {
    map[r.criterion_ref] = {
      applicantResult: (r.applicant_result ?? 'pending') as CriterionResult,
      applicantStatus: (r.applicant_status ?? null) as ApplicantStatus | null,
      internal: (r.internal_result ?? 'pending') as CriterionResult,
      internalNote: r.internal_note ?? null,
      external: (r.result ?? 'pending') as CriterionResult,
      note: r.note ?? null,
      applicantNote: r.applicant_note ?? null,
      cbPre: (r.cb_pre_result ?? 'pending') as CbPreResult,
      cbFinal: (r.cb_final_result ?? 'pending') as CbFinalResult,
    }
  }
  return map
}
