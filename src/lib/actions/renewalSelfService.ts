'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CERTIFIED_STATUSES } from '@/lib/workflow'
import { revalidatePath } from 'next/cache'

// How early before expiry an establishment may self-start re-certification.
const RENEWAL_WINDOW_DAYS = 120

// Establishment-triggered re-certification. Mirrors the CB "Start Re-certification"
// side effects (bump cycle, clear the decision, reopen for editing) but is guarded
// so the holder can only do it near expiry — never accidentally un-certifying a
// fresh certificate. Ownership is enforced, then a service-role write applies it.
export async function startRenewal(applicationId: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('name_en, email, role').eq('id', user.id).single()

  const admin = createAdminClient()
  const { data: app } = await admin
    .from('applications')
    .select('id, status, certification_cycle, applicant_id')
    .eq('id', applicationId)
    .single()
  if (!app) return { error: 'Application not found.' }
  if (app.applicant_id !== user.id) return { error: 'This is not your application.' }
  if (!CERTIFIED_STATUSES.includes(app.status)) return { error: 'Re-certification is only available for a certified establishment.' }

  // Guard: only within the renewal window (or after expiry).
  const { data: cert } = await admin.from('certificates').select('expires_at').eq('application_id', applicationId).maybeSingle()
  if (cert?.expires_at) {
    const days = (new Date(cert.expires_at).getTime() - Date.now()) / 86_400_000
    if (days > RENEWAL_WINDOW_DAYS) return { error: `Re-certification opens ${RENEWAL_WINDOW_DAYS} days before expiry. Your certificate is still valid for ${Math.round(days)} days.` }
  }

  // Freeze a snapshot of the finished cycle before reopening the board.
  const { data: rows } = await admin.from('criterion_assessments')
    .select('criterion_ref, applicant_status, applicant_result, internal_result, result, note, internal_note')
    .eq('application_id', applicationId)
  await admin.from('application_versions').insert({
    application_id: applicationId, label: `Cycle ${app.certification_cycle ?? 1} — re-certification started`, status: app.status,
    snapshot: { assessments: rows ?? [], at: new Date().toISOString() }, created_by: user.id,
  })

  const { error } = await admin.from('applications').update({
    status: 'in_progress',
    certification_cycle: (app.certification_cycle ?? 1) + 1,
    cb_decision: null,
    cb_decision_at: null,
  }).eq('id', applicationId)
  if (error) return { error: error.message }

  await admin.from('audit_trail').insert({
    application_id: applicationId, entity: 'application', field: 'Start Re-certification',
    previous_value: app.status, new_value: 'in_progress (self-service renewal)',
    user_id: user.id, user_name: me?.name_en || me?.email || 'Establishment', user_role: me?.role || 'business',
  })

  // Let the operator know a renewal has begun.
  const { data: staff } = await admin.from('users').select('id').in('role', ['admin', 'super_admin'])
  if (staff?.length) {
    await admin.from('notifications').insert(staff.map((s) => ({
      user_id: s.id, type: 'application',
      title_en: 'Re-certification started', message_en: 'An establishment has started a new certification cycle.',
      action_url: `/applications/${applicationId}`,
    })))
  }

  revalidatePath('/business/dashboard'); revalidatePath('/business/application')
  revalidatePath('/school/dashboard'); revalidatePath('/school/application')
  return { ok: true }
}
