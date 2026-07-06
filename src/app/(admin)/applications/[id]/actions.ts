'use server'

import { createClient } from '@/lib/supabase/server'
import { OPERATOR_STATUSES, PROGRAMME_LABEL } from '@/lib/db/applications'
import { sendEmail, applicationStatusEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
    if (applicant?.email) {
      const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
      const portalUrl = base
        ? `${base}/${appRow?.entity_type === 'school' ? 'school' : 'business'}/application/${applicationId}`
        : undefined
      const mail = applicationStatusEmail({
        programme: PROGRAMME_LABEL[appRow!.programme] ?? appRow!.programme,
        status: 'audit',
        portalUrl,
      })
      if (mail) await sendEmail({ to: applicant.email, subject: mail.subject, html: mail.html })
    }
  }

  revalidatePath(`/applications/${applicationId}`)
  revalidatePath('/applications')
}

// Operator updates an application's status + review notes. RLS also enforces
// that only staff can manage all applications; we re-check the session here.
export async function updateApplication(id: string, formData: FormData) {
  const status = formData.get('status')?.toString() ?? ''
  const notes = formData.get('review_notes')?.toString()?.trim() || null
  const rejection = formData.get('rejection_reason')?.toString()?.trim() || null
  if (!OPERATOR_STATUSES.includes(status)) return

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('applications')
    .update({
      status,
      review_notes: notes,
      rejection_reason: status === 'rejected' ? rejection : null,
      assigned_to: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  // Application + applicant (used for the certificate and the notification email).
  const { data: appRow } = await supabase
    .from('applications')
    .select('applicant_id, entity_type, programme, applicant:users!applicant_id(email, name_en)')
    .eq('id', id)
    .single()

  // Issue a certificate on approval (one per application; won't overwrite).
  let certificateNumber: string | null = null
  if (status === 'approved' && appRow) {
    const prefix: Record<string, string> = { 'green-key': 'GK', 'blue-flag': 'BF', 'eco-schools': 'ES', 'leaf': 'LF', 'yre': 'YR', 'eco-campus': 'EC' }
    certificateNumber = `${prefix[appRow.programme] ?? 'FEE'}-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
    const expires = new Date(); expires.setFullYear(expires.getFullYear() + 2)
    await supabase.from('certificates').upsert({
      application_id: id,
      applicant_id: appRow.applicant_id,
      entity_type: appRow.entity_type,
      programme: appRow.programme,
      certificate_number: certificateNumber,
      expires_at: expires.toISOString(),
    }, { onConflict: 'application_id', ignoreDuplicates: true })
  }

  // Notify the applicant of the status change (best-effort; never blocks the save).
  const applicant = Array.isArray(appRow?.applicant) ? appRow?.applicant[0] : appRow?.applicant
  if (applicant?.email) {
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    const portalUrl = base
      ? `${base}/${appRow?.entity_type === 'school' ? 'school' : 'business'}/application/${id}`
      : undefined
    const mail = applicationStatusEmail({
      programme: PROGRAMME_LABEL[appRow!.programme] ?? appRow!.programme,
      status,
      rejectionReason: rejection,
      certificateNumber,
      portalUrl,
    })
    if (mail) await sendEmail({ to: applicant.email, subject: mail.subject, html: mail.html })
  }

  revalidatePath('/applications')
  revalidatePath('/certificates')
  revalidatePath('/business/certification')
  revalidatePath(`/applications/${id}`)
  revalidatePath('/dashboard')
  redirect(`/applications/${id}?saved=1`)
}
