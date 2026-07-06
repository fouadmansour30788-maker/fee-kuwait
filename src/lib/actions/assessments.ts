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

// The assigned auditor records written feedback for a criterion.
export async function setCriterionNote(applicationId: string, criterionRef: string, note: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { error } = await supabase.from('criterion_assessments').upsert({
    application_id: applicationId,
    criterion_ref: criterionRef,
    note: note.trim().slice(0, 2000) || null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'application_id,criterion_ref' })
  if (error) return { error: error.message }

  revalidatePath(`/auditor/applications/${applicationId}`)
  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}

// The National Operator (staff) records the internal assessment. RLS restricts
// writes to staff; the upsert only touches internal_result so it never clobbers
// the external auditor's result/feedback.
export async function setInternalResult(applicationId: string, criterionRef: string, result: string): Promise<{ ok?: true; error?: string }> {
  if (!RESULTS.includes(result)) return { error: 'Invalid result' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' }

  const { error } = await supabase.from('criterion_assessments').upsert({
    application_id: applicationId,
    criterion_ref: criterionRef,
    internal_result: result,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'application_id,criterion_ref' })
  if (error) return { error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  revalidatePath(`/auditor/applications/${applicationId}`)
  return { ok: true }
}
