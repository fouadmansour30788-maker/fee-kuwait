'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { issueCertificate, notifyApplicant } from '@/lib/certify'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const CB_DECISIONS = ['certified', 'certified_rectification', 'not_certified']

async function requireCb() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' as const }
  const { data: me } = await supabase.from('users').select('role, name_en, email').eq('id', user.id).single()
  if (!me || !['certification_body', 'super_admin'].includes(me.role)) return { error: 'Not authorised' as const }
  return { user, me }
}

// ── CB review stage (before the audit) ────────────────────────────────
// The operator sets the application to "CB Review"; the CB then either assigns
// an auditor (moving it into audit) or returns it for rectification.

export async function cbAssignAuditor(applicationId: string, auditorId: string): Promise<{ ok?: true; error?: string }> {
  if (!auditorId) return { error: 'Select an auditor.' }
  const gate = await requireCb()
  if ('error' in gate) return { error: gate.error }

  const admin = createAdminClient()
  const { error } = await admin.from('applications').update({
    auditor_id: auditorId,
    auditor_assigned_at: new Date().toISOString(),
    status: 'audit',
    updated_at: new Date().toISOString(),
  }).eq('id', applicationId)
  if (error) return { error: error.message }

  await admin.from('audit_trail').insert({
    application_id: applicationId, entity: 'application', field: 'CB assigned auditor',
    previous_value: 'cb_review', new_value: 'audit',
    user_id: gate.user.id, user_name: gate.me.name_en || gate.me.email, user_role: gate.me.role,
  })

  const { data: appRow } = await admin
    .from('applications')
    .select('entity_type, programme, applicant:users!applicant_id(email)')
    .eq('id', applicationId)
    .single()
  const applicant = Array.isArray(appRow?.applicant) ? appRow?.applicant[0] : appRow?.applicant
  await notifyApplicant({
    email: applicant?.email, programme: appRow?.programme ?? '', entityType: appRow?.entity_type ?? null,
    applicationId, status: 'audit',
  })

  revalidatePath(`/cb/applications/${applicationId}`)
  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}

// The CB returns the application: it needs further rectification before an audit
// can be scheduled. The operator picks it up from here (re-open or override).
export async function cbReturnForRectification(applicationId: string, note: string): Promise<{ ok?: true; error?: string }> {
  const reason = note?.trim()
  if (!reason) return { error: 'Add a comment explaining what needs rectification.' }
  const gate = await requireCb()
  if ('error' in gate) return { error: gate.error }

  const admin = createAdminClient()
  const { error } = await admin.from('applications').update({
    status: 'revision', cb_note: reason, updated_at: new Date().toISOString(),
  }).eq('id', applicationId)
  if (error) return { error: error.message }

  await admin.from('audit_trail').insert({
    application_id: applicationId, entity: 'application', field: 'CB returned for rectification',
    previous_value: 'cb_review', new_value: reason,
    user_id: gate.user.id, user_name: gate.me.name_en || gate.me.email, user_role: gate.me.role,
  })

  // Tell the operator so they can re-open or override.
  const { data: staff } = await admin.from('users').select('id').in('role', ['admin', 'super_admin'])
  if (staff?.length) {
    await admin.from('notifications').insert(staff.map((s) => ({
      user_id: s.id, type: 'application',
      title_en: 'CB returned an application for rectification',
      message_en: reason,
      action_url: `/applications/${applicationId}`,
    })))
  }

  revalidatePath(`/cb/applications/${applicationId}`)
  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}

// The assigned Certification Body records its formal decision. RLS ("CB updates
// assigned applications", migration 013) ensures only the assigned CB can write
// this row; we also re-check the role here. A "certified" outcome issues the
// certificate via the service-role client (the CB is not staff, so RLS on
// certificates would otherwise block the insert).
export async function recordCbDecision(applicationId: string, formData: FormData) {
  const decision = formData.get('decision')?.toString() ?? ''
  const note = formData.get('cb_note')?.toString()?.trim() || null
  if (!CB_DECISIONS.includes(decision)) return

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || me.role !== 'certification_body') return

  await supabase.from('applications').update({
    cb_decision: decision,
    cb_note: note,
    cb_decision_at: new Date().toISOString(),
    status: decision,
    updated_at: new Date().toISOString(),
  }).eq('id', applicationId)

  const { data: appRow } = await supabase
    .from('applications')
    .select('applicant_id, entity_type, programme, applicant:users!applicant_id(email)')
    .eq('id', applicationId)
    .single()

  let certificateNumber: string | null = null
  if ((decision === 'certified' || decision === 'certified_rectification') && appRow) {
    certificateNumber = await issueCertificate(createAdminClient(), {
      id: applicationId, applicant_id: appRow.applicant_id, entity_type: appRow.entity_type, programme: appRow.programme,
    })
  }

  const applicant = Array.isArray(appRow?.applicant) ? appRow?.applicant[0] : appRow?.applicant
  await notifyApplicant({
    email: applicant?.email, programme: appRow?.programme ?? '', entityType: appRow?.entity_type ?? null,
    applicationId, status: decision, note, certificateNumber,
  })

  revalidatePath(`/cb/applications/${applicationId}`)
  revalidatePath('/cb/dashboard')
  revalidatePath(`/applications/${applicationId}`)
  revalidatePath('/certificates')
  redirect(`/cb/applications/${applicationId}?decided=1`)
}
