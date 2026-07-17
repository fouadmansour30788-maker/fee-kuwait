'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { myEntity } from '@/lib/db/establishment'
import { PROGRAMME_LABEL, STATUS_META } from '@/lib/db/applications'
import { revalidatePath } from 'next/cache'

const PROGRAMMES = ['eco-schools', 'blue-flag', 'green-key', 'leaf', 'yre', 'eco-campus']

// Shared by the establishment and school portals: create an application for the
// signed-in applicant's institution. One application per programme per applicant.
export async function createApplication(programme: string): Promise<{ ok?: true; error?: string }> {
  if (!PROGRAMMES.includes(programme)) return { error: 'Invalid programme' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  // Block duplicates — one application per programme for this applicant.
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('applicant_id', user.id)
    .eq('programme', programme)
    .limit(1)
  if (existing && existing.length > 0) {
    return { error: `You already have a ${PROGRAMME_LABEL[programme] ?? programme} application.` }
  }

  const ent = await myEntity()
  // Registration must be approved by the National Operator before applying (Step 1).
  if (ent && ent.status !== 'active') return { error: 'Your registration is pending approval by the National Operator.' }

  const { error } = await supabase.from('applications').insert({
    applicant_id: user.id,
    entity_type: ent?.entityType ?? null,
    entity_id: ent?.entityId ?? null,
    programme,
    status: 'new',
  })
  if (error) return { error: error.message }

  revalidatePath('/business/application'); revalidatePath('/business/dashboard')
  revalidatePath('/school/application'); revalidatePath('/school/dashboard')
  return { ok: true }
}

// Manual override by an authorised administrator (National Operator): force an
// application's status outside the normal workflow, for flexibility in
// unforeseen cases. A reason is mandatory and the change is recorded in the
// audit trail (previous value, new value, user, role, time) for traceability.
export async function manualOverrideStatus(applicationId: string, newStatus: string, reason: string): Promise<{ ok?: true; error?: string }> {
  if (!Object.keys(STATUS_META).includes(newStatus)) return { error: 'Invalid status' }
  if (!reason?.trim()) return { error: 'A reason is required for a manual override.' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role, name_en, email').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not authorised' }

  const admin = createAdminClient()
  const { data: app } = await admin.from('applications').select('status').eq('id', applicationId).single()
  const prev = app?.status ?? null
  if (prev === newStatus) return { error: 'The application is already at that status.' }

  const { error } = await admin.from('applications').update({ status: newStatus }).eq('id', applicationId)
  if (error) return { error: error.message }

  await admin.from('audit_trail').insert({
    application_id: applicationId, entity: 'application', field: 'Manual status override',
    previous_value: prev, new_value: `${newStatus} — ${reason.trim()}`,
    user_id: user.id, user_name: me.name_en || me.email, user_role: me.role,
  })

  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}
