'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { issueCertificate, notifyApplicant } from '@/lib/certify'
import { revalidatePath } from 'next/cache'
import {
  OPERATOR_ACTIONS, CB_ACTIONS, AUDITOR_ACTIONS, ESTABLISHMENT_ACTIONS, CLARIFY_STATUS, isCbStage,
  type AppStatus, type ClarifyOwner, type Transition,
} from '@/lib/workflow'
import { getPreScreening, preScreeningApproved } from '@/lib/db/preScreening'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { listApplicationDocuments } from '@/lib/db/documents'
import { criteriaForProgramme, applicableCriteria } from '@/lib/criteria'
import { complianceStatus } from '@/lib/compliance'
import { GK_EVIDENCE } from '@/lib/data/greenKeyEvidence'

// Diagram guards (OQ-3, OQ-4, "all criteria assessed"): some transitions are only
// allowed when the board is in the right state. Returns an error string to block.
async function guardAction(applicationId: string, action: string, app: { programme: string; certification_cycle?: number }): Promise<string | null> {
  const gated = ['Submit Application to CB', 'Submit Audit Report', 'Approve & Issue Certificate']
  if (!gated.includes(action)) return null

  const ps = await getPreScreening(applicationId)
  const criteria = app.programme === 'green-key' && preScreeningApproved(ps) && ps ? applicableCriteria(ps) : criteriaForProgramme(app.programme)
  const assessments = await listCriterionAssessments(applicationId)

  if (action === 'Submit Application to CB') {
    const notReady = criteria.filter((c) => !['pass', 'na'].includes(assessments[c.ref]?.internal ?? 'pending'))
    if (notReady.length) return `Submit is blocked: ${notReady.length} applicable criteri${notReady.length === 1 ? 'on is' : 'a are'} not yet marked Ready (or N/A Confirmed) by the operator.`
    const docs = await listApplicationDocuments(applicationId)
    const missing = criteria.filter((c) => GK_EVIDENCE[c.ref]?.required === 'Yes' && !docs.some((d) => d.criterion_ref === c.ref))
    if (missing.length) return `Submit is blocked: required evidence is missing for ${missing.length} criteri${missing.length === 1 ? 'on' : 'a'} (${missing.slice(0, 5).map((c) => c.ref).join(', ')}${missing.length > 5 ? '…' : ''}).`
  }

  if (action === 'Submit Audit Report') {
    const notAssessed = criteria.filter((c) => (assessments[c.ref]?.external ?? 'pending') === 'pending')
    if (notAssessed.length) return `Cannot submit the audit report: ${notAssessed.length} applicable criteri${notAssessed.length === 1 ? 'on has' : 'a have'} not been assessed yet.`
  }

  if (action === 'Approve & Issue Certificate') {
    const comp = complianceStatus(criteria, assessments, (app.certification_cycle ?? 1) - 1)
    if (!comp.met) return `Certification requirement not met: imperative ${comp.imperative.got}/${comp.imperative.total} conforming, guideline ${comp.guideline.got}/${comp.guideline.need} required. Use "Certify — subject to rectification" or "Require Rectification" instead.`
  }
  return null
}

export interface ActionInput {
  reason?: string
  deadline?: string       // ISO date/datetime
  owner?: ClarifyOwner
  date?: string           // site-visit date
  criteria?: string[]     // criterion refs to reopen
}

type Role = 'operator' | 'cb' | 'auditor' | 'establishment'

function tableFor(role: Role): Partial<Record<AppStatus, Transition[]>> {
  return role === 'operator' ? OPERATOR_ACTIONS
    : role === 'cb' ? CB_ACTIONS
    : role === 'auditor' ? AUDITOR_ACTIONS
    : ESTABLISHMENT_ACTIONS
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
    .select('id, status, cb_origin_status, rectification_round, certification_cycle, auditor_id, cb_id, applicant_id, entity_type, programme, applicant:users!applicant_id(email)')
    .eq('id', applicationId).single()
  if (!app) return { error: 'Application not found' }

  // Role gate.
  if (role === 'operator' && !['admin', 'super_admin'].includes(me.role)) return { error: 'Not authorised' }
  if (role === 'cb' && !(me.role === 'certification_body' && app.cb_id === user.id) && me.role !== 'super_admin') return { error: 'Not authorised' }
  if (role === 'auditor' && !(me.role === 'auditor' && app.auditor_id === user.id) && me.role !== 'super_admin') return { error: 'Not authorised' }
  if (role === 'establishment' && app.applicant_id !== user.id) return { error: 'Not authorised' }

  const transitions = tableFor(role)[app.status as AppStatus] ?? []
  const t = transitions.find((x) => x.action === action)
  if (!t) return { error: `"${action}" is not available from the current status.` }

  // Required inputs.
  const req = t.requires ?? []
  if (req.includes('reason') && !input.reason?.trim()) return { error: 'A reason/note is required for this action.' }
  if (req.includes('deadline') && !input.deadline) return { error: 'A deadline is required.' }
  if (req.includes('owner') && !input.owner) return { error: 'Select who must respond to the clarification.' }
  if (req.includes('date') && !input.date) return { error: 'A confirmed date is required.' }
  if (req.includes('criteria') && !(input.criteria && input.criteria.length)) return { error: 'Select at least one criterion to reopen.' }

  // Diagram guards (OQ-3, OQ-4, all-criteria-assessed).
  const blocked = await guardAction(applicationId, action, app)
  if (blocked) return { error: blocked }

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
  if (req.includes('criteria')) patch.reopened_criteria = input.criteria
  if (action === 'Confirm Site Visit Date') patch.site_visit_date = input.date
  if (action === 'Open Further Corrective Action Period') patch.rectification_round = (app.rectification_round ?? 0) + 1
  if (action === 'Reject Eligibility') patch.rejection_reason = input.reason?.trim() || null
  if (action === 'Require Rectification' || action === 'Record Not Certified Decision') patch.cb_note = input.reason?.trim() || null
  // Reopened items lock again once the operator returns the application.
  if (['Return to CB', 'Send to Auditor for Reassessment', 'Submit Application to CB'].includes(action)) patch.reopened_criteria = []

  let certificateNumber: string | null = null
  if (action === 'Approve & Issue Certificate' || action === 'Certify — subject to rectification') {
    patch.cb_decision = action === 'Approve & Issue Certificate' ? 'certified' : 'certified_rectification'
    patch.cb_decision_at = new Date().toISOString()
    if (action === 'Certify — subject to rectification') patch.cb_note = input.reason?.trim() || null
    certificateNumber = await issueCertificate(admin, {
      id: applicationId, applicant_id: app.applicant_id, entity_type: app.entity_type, programme: app.programme,
    })
  }
  if (action === 'Record Not Certified Decision') { patch.cb_decision = 'not_certified'; patch.cb_decision_at = new Date().toISOString() }

  // Post-certification lifecycle updates the certificate record too.
  if (action === 'Suspend Certification') { patch.cb_note = input.reason?.trim() || null; await admin.from('certificates').update({ status: 'suspended' }).eq('application_id', applicationId) }
  if (action === 'Reinstate Certification') await admin.from('certificates').update({ status: 'active' }).eq('application_id', applicationId)
  if (action === 'Withdraw Certification') { patch.cb_note = input.reason?.trim() || null; await admin.from('certificates').update({ status: 'withdrawn' }).eq('application_id', applicationId) }
  if (action === 'Start Re-certification') { patch.certification_cycle = (app.certification_cycle ?? 1) + 1; patch.cb_decision = null; patch.cb_decision_at = null }

  const { error } = await admin.from('applications').update(patch).eq('id', applicationId)
  if (error) return { error: error.message }

  // Freeze a version snapshot when the application is handed on.
  const SNAPSHOT_ACTIONS: Record<string, string> = {
    'Submit Application to CB': 'Submitted to CB',
    'Return to CB': 'Returned to CB',
    'Submit Audit Report': 'Audit report submitted',
    'Submit Reassessment Report': `Reassessment round ${app.rectification_round ?? 0}`,
    'Send to Auditor for Reassessment': 'Sent for reassessment',
  }
  if (SNAPSHOT_ACTIONS[action]) {
    const { data: rows } = await admin.from('criterion_assessments')
      .select('criterion_ref, applicant_status, applicant_result, internal_result, result, note, internal_note')
      .eq('application_id', applicationId)
    await admin.from('application_versions').insert({
      application_id: applicationId, label: SNAPSHOT_ACTIONS[action], status: target,
      snapshot: { assessments: rows ?? [], at: new Date().toISOString() }, created_by: user.id,
    })
  }

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
