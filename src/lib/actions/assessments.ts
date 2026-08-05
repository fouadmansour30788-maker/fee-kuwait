'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ESTABLISHMENT_EDITABLE_STATUSES } from '@/lib/db/applications'
import { revalidatePath } from 'next/cache'

const RESULTS = ['pending', 'pass', 'no_pass', 'na']

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

// The establishment leaves a comment on a criterion. Ownership is verified here
// and the note is written with the service role, so applicants keep read-only RLS
// on criterion_assessments (they can never write result columns).
export async function setApplicantNote(applicationId: string, criterionRef: string, note: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: own } = await supabase.from('applications').select('id').eq('id', applicationId).eq('applicant_id', user.id).maybeSingle()
  if (!own) return { error: 'Not allowed' }

  const admin = createAdminClient()
  const { error } = await admin.from('criterion_assessments').upsert({
    application_id: applicationId,
    criterion_ref: criterionRef,
    applicant_note: note.trim().slice(0, 2000) || null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'application_id,criterion_ref' })
  if (error) return { error: error.message }

  revalidatePath(`/business/application/${applicationId}`)
  revalidatePath(`/school/application/${applicationId}`)
  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}

// The establishment records its own self-assessment per criterion. Ownership is
// verified and the write uses the service role (applicants keep read-only RLS).
export async function setApplicantResult(applicationId: string, criterionRef: string, result: string): Promise<{ ok?: true; error?: string }> {
  if (!RESULTS.includes(result)) return { error: 'Invalid result' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: own } = await supabase.from('applications').select('status').eq('id', applicationId).eq('applicant_id', user.id).maybeSingle()
  if (!own) return { error: 'Not allowed' }
  if (!ESTABLISHMENT_EDITABLE_STATUSES.includes(own.status)) return { error: 'This application is locked for editing.' }

  const admin = createAdminClient()
  const { error } = await admin.from('criterion_assessments').upsert({
    application_id: applicationId,
    criterion_ref: criterionRef,
    applicant_result: result,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'application_id,criterion_ref' })
  if (error) return { error: error.message }

  revalidatePath(`/business/application/${applicationId}`)
  revalidatePath(`/school/application/${applicationId}`)
  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}

const STATUSES = ['in_progress', 'complete', 'na', 'not_started']

// The establishment sets its progress status for a criterion (In progress /
// Complete / N/A, or 'not_started' to clear it). Written via the service role
// after an ownership check. When marked Complete, the operator(s) are notified.
export async function setApplicantStatus(applicationId: string, criterionRef: string, status: string): Promise<{ ok?: true; error?: string }> {
  if (!STATUSES.includes(status)) return { error: 'Invalid status' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: own } = await supabase.from('applications').select('status').eq('id', applicationId).eq('applicant_id', user.id).maybeSingle()
  if (!own) return { error: 'Not allowed' }
  if (!ESTABLISHMENT_EDITABLE_STATUSES.includes(own.status)) return { error: 'This application is locked for editing.' }

  const admin = createAdminClient()
  const { error } = await admin.from('criterion_assessments').upsert({
    application_id: applicationId,
    criterion_ref: criterionRef,
    applicant_status: status === 'not_started' ? null : status,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'application_id,criterion_ref' })
  if (error) return { error: error.message }

  // Notify the operator(s) when a criterion is completed, so they check it.
  if (status === 'complete') {
    const { data: me } = await admin.from('users').select('name_en, email').eq('id', user.id).maybeSingle()
    const estName = me?.name_en || me?.email || 'An establishment'
    const { data: staff } = await admin.from('users').select('id').in('role', ['admin', 'super_admin'])
    if (staff?.length) {
      await admin.from('notifications').insert(staff.map((s) => ({
        user_id: s.id,
        type: 'criterion_complete',
        title_en: 'Criterion marked complete',
        title_ar: 'تم إكمال معيار',
        message_en: `${estName} marked criterion ${criterionRef} as complete — please check.`,
        message_ar: `${estName} أكمل المعيار ${criterionRef} — يرجى المراجعة.`,
        action_url: `/applications/${applicationId}`,
      })))
    }
  }

  revalidatePath(`/business/application/${applicationId}`)
  revalidatePath(`/school/application/${applicationId}`)
  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}

// The National Operator (staff) records internal feedback shown to the establishment.
export async function setInternalNote(applicationId: string, criterionRef: string, note: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' }

  const { error } = await supabase.from('criterion_assessments').upsert({
    application_id: applicationId,
    criterion_ref: criterionRef,
    internal_note: note.trim().slice(0, 2000) || null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'application_id,criterion_ref' })
  if (error) return { error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}
