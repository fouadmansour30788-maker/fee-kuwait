'use server'

import { createClient } from '@/lib/supabase/server'
import { OPERATOR_STATUSES } from '@/lib/db/applications'
import { issueCertificate, notifyApplicant } from '@/lib/certify'
import { revalidatePath } from 'next/cache'

// Operator re-opens an audited application for the establishment to fix its
// non-conformities. Deadline: 15 days for 1-5 NCs, 3 months for 6+ (per spec).
export async function reopenForRevision(applicationId: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' }

  const { count } = await supabase.from('criterion_assessments')
    .select('id', { count: 'exact', head: true })
    .eq('application_id', applicationId).eq('result', 'no_pass')
  const nc = count ?? 0
  if (nc === 0) return { error: 'There are no non-conformities to revise.' }

  const deadline = new Date()
  if (nc <= 5) deadline.setDate(deadline.getDate() + 15)
  else deadline.setMonth(deadline.getMonth() + 3)

  const { error } = await supabase.from('applications')
    .update({ status: 'revision', revision_deadline: deadline.toISOString(), updated_at: new Date().toISOString() })
    .eq('id', applicationId)
  if (error) return { error: error.message }

  const { data: appRow } = await supabase
    .from('applications')
    .select('entity_type, programme, applicant:users!applicant_id(email)')
    .eq('id', applicationId).single()
  const applicant = Array.isArray(appRow?.applicant) ? appRow?.applicant[0] : appRow?.applicant
  await notifyApplicant({
    email: applicant?.email, programme: appRow?.programme ?? '', entityType: appRow?.entity_type ?? null,
    applicationId, status: 'documents_pending',
  })

  revalidatePath(`/applications/${applicationId}`)
  revalidatePath('/applications')
  revalidatePath(`/business/application/${applicationId}`)
  revalidatePath(`/school/application/${applicationId}`)
  return { ok: true }
}

// Operator assigns (or clears) an auditor; moves the application into audit.
export async function assignAuditor(applicationId: string, auditorId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return

  await supabase.from('applications').update({
    auditor_id: auditorId || null,
    auditor_assigned_at: auditorId ? new Date().toISOString() : null,
    status: auditorId ? 'audit' : 'under_review',
    updated_at: new Date().toISOString(),
  }).eq('id', applicationId)

  // Let the applicant know their application has moved into audit.
  if (auditorId) {
    const { data: appRow } = await supabase
      .from('applications')
      .select('entity_type, programme, applicant:users!applicant_id(email)')
      .eq('id', applicationId)
      .single()
    const applicant = Array.isArray(appRow?.applicant) ? appRow?.applicant[0] : appRow?.applicant
    await notifyApplicant({
      email: applicant?.email, programme: appRow?.programme ?? '', entityType: appRow?.entity_type ?? null,
      applicationId, status: 'audit',
    })
  }

  revalidatePath(`/applications/${applicationId}`)
  revalidatePath('/applications')
}

// Operator assigns (or clears) a Certification Body; moves the application to CB review.
export async function assignCb(applicationId: string, cbId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return

  await supabase.from('applications').update({
    cb_id: cbId || null,
    cb_assigned_at: cbId ? new Date().toISOString() : null,
    status: cbId ? 'cb_review' : 'audit',
    updated_at: new Date().toISOString(),
  }).eq('id', applicationId)

  // Let the applicant know their application is now with the Certification Body.
  if (cbId) {
    const { data: appRow } = await supabase
      .from('applications')
      .select('entity_type, programme, applicant:users!applicant_id(email)')
      .eq('id', applicationId)
      .single()
    const applicant = Array.isArray(appRow?.applicant) ? appRow?.applicant[0] : appRow?.applicant
    await notifyApplicant({
      email: applicant?.email, programme: appRow?.programme ?? '', entityType: appRow?.entity_type ?? null,
      applicationId, status: 'cb_review',
    })
  }

  revalidatePath(`/applications/${applicationId}`)
  revalidatePath('/applications')
}

// Operator updates an application's status + review notes. RLS also enforces
// that only staff can manage all applications; we re-check the session here.
// Returns a result the client can act on (instead of redirecting) so the review
// form can show pending/success/error state.
export async function updateApplication(id: string, formData: FormData): Promise<{ ok?: true; error?: string }> {
  const status = formData.get('status')?.toString() ?? ''
  const notes = formData.get('review_notes')?.toString()?.trim() || null
  const rejection = formData.get('rejection_reason')?.toString()?.trim() || null
  if (!OPERATOR_STATUSES.includes(status)) return { error: 'Invalid status' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { error: upErr } = await supabase
    .from('applications')
    .update({
      status,
      review_notes: notes,
      rejection_reason: status === 'rejected' ? rejection : null,
      assigned_to: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (upErr) return { error: upErr.message }

  // Application + applicant (used for the certificate and the notification email).
  const { data: appRow } = await supabase
    .from('applications')
    .select('applicant_id, entity_type, programme, applicant:users!applicant_id(email, name_en)')
    .eq('id', id)
    .single()

  // Issue a certificate on approval (best-effort — never fail the status save).
  let certificateNumber: string | null = null
  if (status === 'approved' && appRow) {
    try {
      certificateNumber = await issueCertificate(supabase, { id, applicant_id: appRow.applicant_id, entity_type: appRow.entity_type, programme: appRow.programme })
    } catch (e) {
      console.error('issueCertificate failed:', e)
    }
  }

  // Notify the applicant of the status change (best-effort; never blocks the save).
  const applicant = Array.isArray(appRow?.applicant) ? appRow?.applicant[0] : appRow?.applicant
  await notifyApplicant({
    email: applicant?.email, programme: appRow?.programme ?? '', entityType: appRow?.entity_type ?? null,
    applicationId: id, status, note: rejection, certificateNumber,
  })

  revalidatePath('/applications')
  revalidatePath('/certificates')
  revalidatePath('/business/certification')
  revalidatePath(`/applications/${id}`)
  revalidatePath('/dashboard')
  return { ok: true }
}
