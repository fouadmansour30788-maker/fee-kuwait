'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { issueCertificate, notifyApplicant } from '@/lib/certify'
import { revalidatePath } from 'next/cache'
import {
  OPERATOR_ACTIONS, CB_ACTIONS, AUDITOR_ACTIONS, CLARIFY_STATUS, isCbStage,
  type AppStatus, type ClarifyOwner, type Transition,
} from '@/lib/workflow'

export interface ActionInput {
  reason?: string
  deadline?: string       // ISO date/datetime
  owner?: ClarifyOwner
  date?: string           // site-visit date
}

type Role = 'operator' | 'cb' | 'auditor'

function tableFor(role: Role): Partial<Record<AppStatus, Transition[]>> {
  return role === 'operator' ? OPERATOR_ACTIONS : role === 'cb' ? CB_ACTIONS : AUDITOR_ACTIONS
}

// The single executor behind every operator / CB / auditor workflow action.
// It validates the action against the whiteboard transition table for the
// application's current status, applies the resulting status and side effects
// (clarification owner + origin, deadlines, certificate issuance, rounds),
// records the audit trail and notifies the relevant party.
export async function applyWorkflowAction(
  applicationId: string, role: Role, action: string, input: ActionInput = {},
): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role, name_en, email').eq('id', user.id).single()
  if (!me) return { error: 'Not authorised' }

  const admin = createAdminClient()
  const { data: app } = await admin
    .from('applications')
    .select('id, status, cb_origin_status, rectification_round, auditor_id, cb_id, applicant_id, entity_type, programme, applicant:users!applicant_id(email)')
    .eq('id', applicationId).single()
  if (!app) return { error: 'Application not found' }

  // Role gate.
  if (role === 'operator' && !['admin', 'super_admin'].includes(me.role)) return { error: 'Not authorised' }
  if (role === 'cb' && !(me.role === 'certification_body' && app.cb_id === user.id) && me.role !== 'super_admin') return { error: 'Not authorised' }
  if (role === 'auditor' && !(me.role === 'auditor' && app.auditor_id === user.id) && me.role !== 'super_admin') return { error: 'Not authorised' }

  const transitions = tableFor(role)[app.status as AppStatus] ?? []
  const t = transitions.find((x) => x.action === action)
  if (!t) return { error: `"${action}" is not available from the current status.` }

  // Required inputs.
  const req = t.requires ?? []
  if (req.includes('reason') && !input.reason?.trim()) return { error: 'A reason/note is required for this action.' }
  if (req.includes('deadline') && !input.deadline) return { error: 'A deadline is required.' }
  if (req.includes('owner') && !input.owner) return { error: 'Select who must respond to the clarification.' }
  if (req.includes('date') && !input.date) return { error: 'A confirmed date is required.' }

  // Resolve the target status.
  let target: string
  if (action === 'Request Clarification') {
    target = CLARIFY_STATUS[input.owner as ClarifyOwner]
  } else if (t.to === 'ORIGIN') {
    if (!app.cb_origin_status) return { error: 'No originating CB stage recorded.' }
    target = app.cb_origin_status
  } else {
    target = t.to
  }

  const patch: Record<string, unknown> = { status: target, updated_at: new Date().toISOString() }

  // Side effects by action.
  if (action === 'Request Clarification') {
    patch.cb_origin_status = isCbStage(app.status) ? app.status : app.cb_origin_status
    patch.clarification_owner = input.owner
    patch.clarification_note = input.reason?.trim() || null
  }
  if (t.to === 'ORIGIN') { patch.cb_origin_status = null; patch.clarification_owner = null }
  if (req.includes('deadline')) patch.action_deadline = input.deadline
  if (action === 'Confirm Site Visit Date') patch.site_visit_date = input.date
  if (action === 'Open Further Corrective Action Period') patch.rectification_round = (app.rectification_round ?? 0) + 1
  if (action === 'Reject Eligibility') patch.rejection_reason = input.reason?.trim() || null
  if (action === 'Require Rectification' || action === 'Record Not Certified Decision') patch.cb_note = input.reason?.trim() || null

  let certificateNumber: string | null = null
  if (action === 'Approve & Issue Certificate') {
    patch.cb_decision = 'certified'
    patch.cb_decision_at = new Date().toISOString()
    certificateNumber = await issueCertificate(admin, {
      id: applicationId, applicant_id: app.applicant_id, entity_type: app.entity_type, programme: app.programme,
    })
  }
  if (action === 'Record Not Certified Decision') { patch.cb_decision = 'not_certified'; patch.cb_decision_at = new Date().toISOString() }

  const { error } = await admin.from('applications').update(patch).eq('id', applicationId)
  if (error) return { error: error.message }

  // Traceability.
  await admin.from('audit_trail').insert({
    application_id: applicationId, entity: 'application', field: action,
    previous_value: app.status, new_value: target,
    user_id: user.id, user_name: me.name_en || me.email, user_role: me.role,
  })

  // Notify the party who now has the ball.
  const applicant = Array.isArray(app.applicant) ? app.applicant[0] : app.applicant
  const notifyStaff = async (title: string, message: string) => {
    const { data: staff } = await admin.from('users').select('id').in('role', ['admin', 'super_admin'])
    if (staff?.length) await admin.from('notifications').insert(staff.map((s) => ({
      user_id: s.id, type: 'application', title_en: title, message_en: message, action_url: `/applications/${applicationId}`,
    })))
  }
  if (['Approve Eligibility', 'Reject Eligibility', 'Communicate Outcome', 'Approve & Issue Certificate', 'Record Not Certified Decision'].includes(action)) {
    await notifyApplicant({ email: applicant?.email, programme: app.programme, entityType: app.entity_type, applicationId, status: target, note: input.reason ?? null, certificateNumber })
  }
  if (['Approve for Audit', 'Require Rectification', 'Request Further Evidence', 'Submit Audit Report', 'Submit Reassessment Report'].includes(action)) {
    await notifyStaff(`Application update: ${action}`, `Now: ${target.replace(/_/g, ' ')}`)
  }

  revalidatePath(`/applications/${applicationId}`)
  revalidatePath(`/cb/applications/${applicationId}`)
  revalidatePath(`/auditor/applications/${applicationId}`)
  revalidatePath(`/business/application/${applicationId}`)
  revalidatePath(`/school/application/${applicationId}`)
  return { ok: true }
}
