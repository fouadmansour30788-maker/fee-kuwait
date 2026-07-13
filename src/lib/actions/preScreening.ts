'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { evaluatePreScreening, isPreScreeningComplete } from '@/lib/data/preScreening'
import type { PSAnswers } from '@/lib/data/preScreening'

// Compute the derived columns from the answers so they can be filtered/reviewed.
function derive(answers: PSAnswers) {
  const r = evaluatePreScreening(answers)
  return {
    eligible: r.eligible,
    ineligible_reason: r.ineligibleReason,
    main_category: r.mainCategory,
    sub_categories: r.subCategories,
    flags: r.flags,
  }
}

async function ownsApplication(applicationId: string): Promise<{ ok: boolean; userId?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }
  const { data } = await supabase.from('applications').select('applicant_id').eq('id', applicationId).single()
  return { ok: data?.applicant_id === user.id, userId: user.id }
}

// Applicant saves a draft (allowed only while not submitted).
export async function savePreScreening(applicationId: string, answers: PSAnswers): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: existing } = await supabase.from('pre_screening').select('status').eq('application_id', applicationId).maybeSingle()
  if (existing && !['draft'].includes(existing.status)) return { error: 'The pre-screening is locked. Ask the National Operator to unlock it to make changes.' }

  const { error } = await supabase.from('pre_screening').upsert({
    application_id: applicationId, answers, ...derive(answers), status: 'draft', updated_at: new Date().toISOString(),
  }, { onConflict: 'application_id' })
  if (error) return { error: error.message }
  revalidatePath(`/business/pre-screening/${applicationId}`)
  revalidatePath(`/school/pre-screening/${applicationId}`)
  return { ok: true }
}

// Applicant submits — locks the form and computes the result for review.
export async function submitPreScreening(applicationId: string, answers: PSAnswers): Promise<{ ok?: true; error?: string }> {
  if (!isPreScreeningComplete(answers)) return { error: 'Please answer all applicable questions before submitting.' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: existing } = await supabase.from('pre_screening').select('status').eq('application_id', applicationId).maybeSingle()
  if (existing && !['draft'].includes(existing.status)) return { error: 'Already submitted. Ask the National Operator to unlock it to re-submit.' }

  const { error } = await supabase.from('pre_screening').upsert({
    application_id: applicationId, answers, ...derive(answers), status: 'submitted',
    submitted_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }, { onConflict: 'application_id' })
  if (error) return { error: error.message }
  revalidatePath(`/business/pre-screening/${applicationId}`)
  revalidatePath(`/school/pre-screening/${applicationId}`)
  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}

// National Operator reviews eligibility and confirms/adjusts category & scope.
export async function reviewPreScreening(
  applicationId: string,
  decision: 'eligible' | 'rejected',
  note: string,
  mainCategory?: string | null,
  subCategories?: string[],
): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const patch: Record<string, unknown> = {
    status: decision, review_note: note || null, reviewed_by: user.id,
    reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }
  if (decision === 'eligible') {
    patch.eligible = true
    if (mainCategory !== undefined) patch.main_category = mainCategory
    if (subCategories !== undefined) patch.sub_categories = subCategories
  } else {
    patch.eligible = false
  }

  const { error } = await supabase.from('pre_screening').update(patch).eq('application_id', applicationId)
  if (error) return { error: error.message }
  revalidatePath(`/applications/${applicationId}`)
  revalidatePath(`/business/pre-screening/${applicationId}`)
  revalidatePath(`/school/pre-screening/${applicationId}`)
  return { ok: true }
}

// National Operator unlocks a submitted form for editing — a reason is mandatory
// and retained for the audit trail (visible to NO, CB and the auditor).
export async function unlockPreScreening(applicationId: string, reason: string): Promise<{ ok?: true; error?: string }> {
  if (!reason?.trim()) return { error: 'A reason for unlocking is required.' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { error } = await supabase.from('pre_screening').update({
    status: 'draft', unlock_reason: reason.trim(), reviewed_by: user.id, updated_at: new Date().toISOString(),
  }).eq('application_id', applicationId)
  if (error) return { error: error.message }
  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}

export { ownsApplication }
