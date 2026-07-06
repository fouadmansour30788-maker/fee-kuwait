'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const RESULTS = ['pending', 'pass', 'no_pass']

// The assigned auditor records a criterion result. RLS enforces that only the
// assigned auditor can write; we still require a session.
export async function setCriterionResult(applicationId: string, criterionRef: string, result: string): Promise<{ ok?: true; error?: string }> {
  if (!RESULTS.includes(result)) return { error: 'Invalid result' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { error } = await supabase.from('criterion_assessments').upsert({
    application_id: applicationId,
    criterion_ref: criterionRef,
    result,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'application_id,criterion_ref' })
  if (error) return { error: error.message }

  revalidatePath(`/auditor/applications/${applicationId}`)
  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}
