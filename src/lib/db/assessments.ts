import { createClient } from '@/lib/supabase/server'

export type CriterionResult = 'pending' | 'pass' | 'no_pass'

// Map of criterion_ref -> result for an application (RLS decides visibility).
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
