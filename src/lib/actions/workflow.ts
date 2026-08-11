'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { issueCertificate, notifyApplicant } from '@/lib/certify'
import { revalidatePath } from 'next/cache'
import {
  OPERATOR_ACTIONS, CB_ACTIONS, AUDITOR_ACTIONS, ESTABLISHMENT_ACTIONS, CLARIFY_STATUS, isCbStage, canonicalStatus,
  type AppStatus, type ClarifyOwner, type Transition,
} from '@/lib/workflow'
import { getPreScreening, preScreeningApproved } from '@/lib/db/preScreening'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { listApplicationDocuments } from '@/lib/db/documents'
import { criteriaForProgramme, applicableCriteria } from '@/lib/criteria'
import { complianceStatus } from '@/lib/compliance'
import { GK_EVIDENCE } from '@/lib/data/greenKeyEvidence'
import { GUIDELINE_CYCLE } from '@/lib/data/greenKeyCriteria'

// Diagram guards (OQ-3, OQ-4, "all criteria assessed"): some transitions are only
// allowed when the board is in the right state. Returns an error string to block.
async function guardAction(applicationId: string, action: string, app: { programme: string; certification_cycle?: number }): Promise<string | null> {
  const gated = ['Submit Application to CB', 'Submit Audit Report', 'Approve & Issue Certificate']
  if (!gated.includes(action)) return null

  const ps = await getPreScreening(applicationId)
  const criteria = app.programme === 'green-key' && preScreeningApproved(ps) && ps ? applicableCriteria(ps) : criteriaForProgramme(app.programme)
  const assessments = await listCriterionAssessments(applicationId)

  if (action === 'Submit Application to CB') {
    // Requirement: 100% of imperative criteria Ready (or N/A Confirmed), plus the
    // certification period's share of guideline criteria. Guidelines beyond that
    // share are NOT required to submit.
    const na = (ref: string) => assessments[ref]?.internal === 'na'
    const ready = (ref: string) => assessments[ref]?.internal === 'pass'
    const impRefs = criteria.filter((c) => !!c.type && c.type.includes('I') && !na(c.ref))
    const guideRefs = criteria.filter((c) => c.type === 'G' && !na(c.ref))
    const impReady = impRefs.filter((c) => ready(c.ref)).length
    const guideReady = guideRefs.filter((c) => ready(c.ref)).length
    const cyc = GUIDELINE_CYCLE[Math.min(Math.max((app.certification_cycle ?? 1) - 1, 0), GUIDELINE_CYCLE.length - 1)]
    const guideNeed = Math.ceil((guideRefs.length * cyc.guideline) / 100)
    if (impReady < impRefs.length) return `Submit is blocked: all imperative criteria must be marked Ready (or N/A Confirmed) by the operator — ${impReady}/${impRefs.length} ready.`
    if (guideReady < guideNeed) return `Submit is blocked: this certification period needs ${guideNeed} guideline criteria marked Ready — ${guideReady}/${guideNeed} ready.`
    // Required evidence for the imperative criteria that must be Ready.
    const docs = await listApplicationDocuments(applicationId)
    const missing = impRefs.filter((c) => GK_EVIDENCE[c.ref]?.required === 'Yes' && !docs.some((d) => d.criterion_ref === c.ref))
    if (missing.length) return `Submit is blocked: required evidence is missing for ${missing.length} imperative criteri${missing.length === 1 ? 'on' : 'a'} (${missing.slice(0, 5).map((c) => c.ref).join(', ')}${missing.length > 5 ? '…' : ''}).`
  }

  if (action === 'Submit Audit Report') {
    // Same rule as Submit-to-CB: every imperative criterion must be assessed
    // (Conforming / Non-Conforming), plus the certification period's guideline
    // share. Not Applicable is excluded; remaining guidelines don't block.
    const na = (ref: string) => assessments[ref]?.external === 'na'
    const assessed = (ref: string) => assessments[ref]?.external === 'pass' || assessments[ref]?.external === 'no_pass'
    const impRefs = criteria.filter((c) => !!c.type && c.type.includes('I') && !na(c.ref))
    const guideRefs = criteria.filter((c) => c.type === 'G' && !na(c.ref))
    const impAssessed = impRefs.filter((c) => assessed(c.ref)).length
    const guideAssessed = guideRefs.filter((c) => assessed(c.ref)).length
    const cyc = GUIDELINE_CYCLE[Math.min(Math.max((app.certification_cycle ?? 1) - 1, 0), GUIDELINE_CYCLE.length - 1)]
    const guideNeed = Math.ceil((guideRefs.length * cyc.guideline) / 100)
    if (impAssessed < impRefs.length) return `Cannot submit the audit report: all imperative criteria must be assessed — ${impAssessed}/${impRefs.length} assessed.`
    if (guideAssessed < guideNeed) return `Cannot submit the audit report: this certification period needs ${guideNeed} guideline criteria assessed — ${guideAssessed}/${guideNeed} assessed.`
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

  const curStatus = canonicalStatus(app.status)
  const transitions = tableFor(role)[curStatus as AppStatus] ?? []
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
    patch.cb_origin_status = isCbStage(curStatus) ? curStatus : app.cb_origin_status
    patch.clarification_owner = input.owner
    patch.clarification_note = input.reason?.trim() || null
  }
  if (t.to === 'ORIGIN') { patch.cb_origin_status = null; patch.clarification_owner = null }
  if (req.includes('deadline')) patch.action_deadline = input.deadline
  if (req.includes('criteria')) patch.reopened_criteria = input.criteria
  if (action === 'Confirm Site Visit Date') {
    // The datetime-local value is a Kuwait wall-clock time (UTC+3, no DST).
    // Anchor it to +03:00 so it's stored as the correct instant and displays back
    // as the same time. Fall back to a bare date for legacy date-only input.
    const raw = input.date
    patch.site_visit_date = raw && raw.includes('T') ? new Date(`${raw}:00+03:00`).toISOString() : raw
  }
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

  // Traceability. For "Confirm Site Visit Date" record the chosen date.
  const trailNew = action === 'Confirm Site Visit Date' && input.date ? `Site visit confirmed for ${input.date}` : target
  await admin.from('audit_trail').insert({
    application_id: applicationId, entity: 'application', field: action,
    previous_value: app.status, new_value: trailNew,
    user_id: user.id, user_name: me.name_en || me.email, user_role: me.role,
  })

  // Notify the party who now has the ball. In-app notification rows go to the
  // relevant user(s); the applicant also gets an email.
  const applicant = Array.isArray(app.applicant) ? app.applicant[0] : app.applicant
  const label = target.replace(/_/g, ' ')
  const notify = async (userId: string | null | undefined, title: string, message: string, url: string) => {
    if (!userId) return
    await admin.from('notifications').insert({ user_id: userId, type: 'application', title_en: title, message_en: message, action_url: url })
  }
  const notifyStaff = async (title: string, message: string) => {
    const { data: staff } = await admin.from('users').select('id').in('role', ['admin', 'super_admin'])
    if (staff?.length) await admin.from('notifications').insert(staff.map((s) => ({
      user_id: s.id, type: 'application', title_en: title, message_en: message, action_url: `/applications/${applicationId}`,
    })))
  }

  // Actions the establishment should hear about (in-app + email).
  const APPLICANT_ACTIONS = [
    'Approve Eligibility', 'Reject Eligibility', 'Communicate Outcome', 'Approve & Issue Certificate',
    'Certify — subject to rectification', 'Record Not Certified Decision', 'Require Rectification',
    'Open Rectification', 'Open Corrective Action Period', 'Open Further Corrective Action Period',
    'Suspend Certification', 'Reinstate Certification', 'Withdraw Certification',
  ]
  if (APPLICANT_ACTIONS.includes(action) || target === 'cb_clarification_establishment') {
    await notify(app.applicant_id, `Your application: ${action}`, `Now: ${label}${input.reason ? ` — ${input.reason}` : ''}`,
      app.entity_type === 'school' ? `/school/application/${applicationId}` : `/business/application/${applicationId}`)
    await notifyApplicant({ email: applicant?.email, programme: app.programme, entityType: app.entity_type, applicationId, status: target, note: input.reason ?? null, certificateNumber })
  }

  // Actions the assigned auditor should hear about.
  if (target === 'auditor_reassessment' || target === 'cb_clarification_auditor' || action === 'Approve for Audit') {
    await notify(app.auditor_id, `Audit update: ${action}`, `Now: ${label}${input.reason ? ` — ${input.reason}` : ''}`, `/auditor/applications/${applicationId}`)
  }

  // Actions the operator should hear about.
  if (['Approve for Audit', 'Require Rectification', 'Request Further Evidence', 'Submit Audit Report', 'Submit Reassessment Report'].includes(action)) {
    await notifyStaff(`Application update: ${action}`, `Now: ${label}`)
  }

  revalidatePath(`/applications/${applicationId}`)
  revalidatePath(`/cb/applications/${applicationId}`)
  revalidatePath(`/auditor/applications/${applicationId}`)
  revalidatePath(`/business/application/${applicationId}`)
  revalidatePath(`/school/application/${applicationId}`)
  return { ok: true }
}
