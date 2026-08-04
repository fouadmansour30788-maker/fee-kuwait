// FEE Kuwait — application workflow (whiteboard state machine).
//
// Client-safe: pure data + helpers, no next/headers, so operator / CB / auditor
// client dropdowns can import the transitions and status metadata directly.
//
// This is the single source of truth for the lifecycle. `STATUS_META` in
// lib/db/applications.ts is merged from WF so every status renders consistently.

export type ClarifyOwner = 'operator' | 'auditor' | 'establishment'

export type AppStatus =
  | 'pending_eligibility'
  | 'in_progress'
  | 'eligibility_rejected'
  | 'cb_pre_audit_review'
  | 'pre_audit_rectification_required'
  | 'pre_audit_rectification_open'
  | 'cb_pre_audit_re_review'
  | 'ready_for_auditor'
  | 'auditor_assigned'
  | 'audit_scheduled'
  | 'audit_in_progress'
  | 'cb_final_review'
  | 'cb_final_re_review'
  | 'post_audit_rectification_required'
  | 'post_audit_corrective_open'
  | 'auditor_reassessment'
  | 'auditor_reassessment_in_progress'
  | 'further_corrective_required'
  | 'cb_clarification_operator'
  | 'cb_clarification_auditor'
  | 'cb_clarification_establishment'
  | 'certified_active'
  | 'certified_rectification_active'
  | 'certified_suspended'
  | 'certified_withdrawn'
  | 'not_certified_recorded'
  | 'not_certified_communicated'

export type Stage = 'eligibility' | 'application' | 'cb_pre_audit' | 'auditor' | 'cb_final' | 'closed'

interface StatusDef { label: string; color: string; bg: string; stage: Stage; estEdit?: boolean }

const AMBER = { color: '#B45309', bg: '#FEF3C7' }
const BLUE = { color: '#2563EB', bg: '#DBEAFE' }
const CYAN = { color: '#0891B2', bg: '#CFFAFE' }
const GREEN = { color: '#059669', bg: '#D1FAE5' }
const RED = { color: '#DC2626', bg: '#FEE2E2' }
const PURPLE = { color: '#7C3AED', bg: '#EDE9FE' }

export const WF: Record<AppStatus, StatusDef> = {
  pending_eligibility:              { label: 'Pending Eligibility Review', ...BLUE,  stage: 'eligibility' },
  in_progress:                      { label: 'Application In Progress',    ...GREEN, stage: 'application', estEdit: true },
  eligibility_rejected:             { label: 'Eligibility Rejected',       ...RED,   stage: 'closed' },
  cb_pre_audit_review:              { label: 'CB Pre-Audit Review',        ...AMBER, stage: 'cb_pre_audit' },
  pre_audit_rectification_required: { label: 'Pre-Audit Rectification Required', ...AMBER, stage: 'cb_pre_audit' },
  pre_audit_rectification_open:     { label: 'Pre-Audit Rectification Open',      ...AMBER, stage: 'cb_pre_audit', estEdit: true },
  cb_pre_audit_re_review:           { label: 'CB Pre-Audit Re-Review',     ...AMBER, stage: 'cb_pre_audit' },
  ready_for_auditor:                { label: 'Ready for Auditor Assignment', ...PURPLE, stage: 'cb_pre_audit' },
  auditor_assigned:                 { label: 'Auditor Assigned',           ...CYAN,  stage: 'auditor' },
  audit_scheduled:                  { label: 'Audit Scheduled',            ...CYAN,  stage: 'auditor' },
  audit_in_progress:                { label: 'Audit In Progress',          ...CYAN,  stage: 'auditor' },
  cb_final_review:                  { label: 'CB Final Review',            ...AMBER, stage: 'cb_final' },
  cb_final_re_review:               { label: 'CB Final Re-Review',         ...AMBER, stage: 'cb_final' },
  post_audit_rectification_required:{ label: 'Post-Audit Rectification Required', ...AMBER, stage: 'cb_final' },
  post_audit_corrective_open:       { label: 'Post-Audit Corrective Action Open', ...AMBER, stage: 'cb_final', estEdit: true },
  auditor_reassessment:             { label: 'Auditor Reassessment',       ...CYAN,  stage: 'auditor' },
  auditor_reassessment_in_progress: { label: 'Auditor Reassessment In Progress', ...CYAN, stage: 'auditor' },
  further_corrective_required:      { label: 'Further Corrective Evidence Required', ...AMBER, stage: 'cb_final' },
  cb_clarification_operator:        { label: 'CB Clarification Required — Operator',      ...AMBER, stage: 'cb_final' },
  cb_clarification_auditor:         { label: 'CB Clarification Required — Auditor',       ...AMBER, stage: 'cb_final' },
  cb_clarification_establishment:   { label: 'CB Clarification Required — Establishment', ...AMBER, stage: 'cb_final', estEdit: true },
  certified_active:                 { label: 'Certified — Active',         ...GREEN, stage: 'closed' },
  certified_rectification_active:   { label: 'Certified — Subject to Rectification', ...GREEN, stage: 'closed' },
  certified_suspended:              { label: 'Certification Suspended',    ...AMBER, stage: 'closed' },
  certified_withdrawn:              { label: 'Certification Withdrawn',    ...RED,   stage: 'closed' },
  not_certified_recorded:           { label: 'Not Certified — Decision Recorded',   ...RED, stage: 'closed' },
  not_certified_communicated:       { label: 'Not Certified — Outcome Communicated', ...RED, stage: 'closed' },
}

export const WF_STATUS_META: Record<string, { label: string; color: string; bg: string }> = Object.fromEntries(
  Object.entries(WF).map(([k, v]) => [k, { label: v.label, color: v.color, bg: v.bg }]),
)

// A transition: an action the role can take from a status, and the resulting
// status. `to: 'ORIGIN'` returns to the CB stage a clarification came from.
export interface Transition {
  action: string
  to: AppStatus | 'ORIGIN'
  // Extra input the action requires from the UI.
  requires?: ('reason' | 'deadline' | 'owner' | 'date' | 'criteria')[]
  note?: string
  tone?: 'primary' | 'danger' | 'neutral'
}

// Statuses where only the reopened criteria are editable by the establishment
// (the rest of the board stays locked).
export const PARTIAL_EDIT_STATUSES = ['pre_audit_rectification_open', 'post_audit_corrective_open']

// ── Operator actions ──────────────────────────────────────────────────
export const OPERATOR_ACTIONS: Partial<Record<AppStatus, Transition[]>> = {
  pending_eligibility: [
    { action: 'Approve Eligibility', to: 'in_progress', tone: 'primary', note: 'Opens the full application.' },
    { action: 'Reject Eligibility', to: 'eligibility_rejected', requires: ['reason'], tone: 'danger', note: 'Rejection reason is mandatory.' },
  ],
  in_progress: [
    { action: 'Submit Application to CB', to: 'cb_pre_audit_review', tone: 'primary', note: 'Enabled when all applicable criteria are Ready; the application locks and a frozen version is created.' },
  ],
  pre_audit_rectification_required: [
    { action: 'Open Rectification', to: 'pre_audit_rectification_open', requires: ['criteria', 'deadline'], tone: 'primary', note: 'Select the criteria/evidence to reopen with instructions and a deadline.' },
  ],
  pre_audit_rectification_open: [
    { action: 'Return to CB', to: 'cb_pre_audit_re_review', tone: 'primary', note: 'After the establishment completes the reopened items and you review them.' },
  ],
  cb_clarification_operator: [
    { action: 'Return to CB', to: 'ORIGIN', requires: ['reason'], tone: 'primary', note: 'Enter the requested clarification without reopening the application.' },
  ],
  cb_clarification_establishment: [
    { action: 'Return to CB', to: 'ORIGIN', tone: 'primary', note: 'After the establishment responds in the comments and you review it.' },
  ],
  post_audit_rectification_required: [
    { action: 'Open Corrective Action Period', to: 'post_audit_corrective_open', requires: ['criteria', 'deadline'], tone: 'primary', note: 'Only the non-conforming criteria and relevant evidence fields are reopened.' },
  ],
  post_audit_corrective_open: [
    { action: 'Send to Auditor for Reassessment', to: 'auditor_reassessment', tone: 'primary', note: 'After corrective evidence is uploaded and you review it; reopened items lock.' },
  ],
  further_corrective_required: [
    { action: 'Open Further Corrective Action Period', to: 'post_audit_corrective_open', requires: ['criteria', 'deadline'], tone: 'primary', note: 'Only auditor-identified criteria are reopened; the rectification round increases.' },
  ],
  not_certified_recorded: [
    { action: 'Communicate Outcome', to: 'not_certified_communicated', tone: 'neutral', note: 'The final decision and reason become visible to the establishment.' },
  ],
}

// ── CB actions ────────────────────────────────────────────────────────
const CB_PRE = (): Transition[] => [
  { action: 'Approve for Audit', to: 'ready_for_auditor', tone: 'primary', note: 'The operator is notified to assign an auditor.' },
  { action: 'Request Clarification', to: 'cb_clarification_operator', requires: ['owner'], note: 'Pick who must respond; the application remains locked.' },
  { action: 'Require Rectification', to: 'pre_audit_rectification_required', requires: ['reason'], tone: 'danger', note: 'Establishment answers or evidence must be amended.' },
]
const CB_FINAL = (): Transition[] => [
  { action: 'Approve & Issue Certificate', to: 'certified_active', tone: 'primary', note: 'Records the decision, issues the certificate and locks the records.' },
  { action: 'Certify — subject to rectification', to: 'certified_rectification_active', requires: ['reason'], tone: 'primary', note: 'Issues the certificate but records outstanding points to rectify.' },
  { action: 'Request Clarification', to: 'cb_clarification_operator', requires: ['owner'], note: 'Pick who must respond; the application remains locked.' },
  { action: 'Require Rectification', to: 'post_audit_rectification_required', requires: ['reason'], note: 'Corrective evidence is required from the establishment.' },
  { action: 'Record Not Certified Decision', to: 'not_certified_recorded', requires: ['reason'], tone: 'danger', note: 'Decision reason is mandatory.' },
]
// Post-certification lifecycle: suspend / reinstate / withdraw / re-certify.
const CB_CERTIFIED = (): Transition[] => [
  { action: 'Start Re-certification', to: 'in_progress', tone: 'primary', note: 'Opens a new certification cycle for the establishment.' },
  { action: 'Suspend Certification', to: 'certified_suspended', requires: ['reason'], tone: 'danger', note: 'Temporarily suspends the certificate.' },
  { action: 'Withdraw Certification', to: 'certified_withdrawn', requires: ['reason'], tone: 'danger', note: 'Permanently withdraws the certificate.' },
]
export const CB_ACTIONS: Partial<Record<AppStatus, Transition[]>> = {
  cb_pre_audit_review: CB_PRE(),
  cb_pre_audit_re_review: CB_PRE(),
  cb_final_review: CB_FINAL(),
  cb_final_re_review: CB_FINAL(),
  certified_active: CB_CERTIFIED(),
  certified_rectification_active: CB_CERTIFIED(),
  certified_suspended: [
    { action: 'Reinstate Certification', to: 'certified_active', tone: 'primary', note: 'Restores the suspended certificate.' },
    { action: 'Withdraw Certification', to: 'certified_withdrawn', requires: ['reason'], tone: 'danger', note: 'Permanently withdraws the certificate.' },
  ],
}

// ── Establishment actions ─────────────────────────────────────────────
export const ESTABLISHMENT_ACTIONS: Partial<Record<AppStatus, Transition[]>> = {
  eligibility_rejected: [
    { action: 'Request CB Re-assessment', to: 'pending_eligibility', requires: ['reason'], tone: 'primary', note: 'Ask for your eligibility to be re-assessed. It returns to the National Operator / Certification Body for review.' },
  ],
}

// ── Auditor actions ───────────────────────────────────────────────────
export const AUDITOR_ACTIONS: Partial<Record<AppStatus, Transition[]>> = {
  auditor_assigned: [
    { action: 'Confirm Site Visit Date', to: 'audit_scheduled', requires: ['date'], tone: 'primary', note: 'Confirmed date is mandatory; relevant users are notified.' },
  ],
  audit_scheduled: [
    { action: 'Start Audit', to: 'audit_in_progress', tone: 'primary', note: 'The conformity assessment becomes available.' },
  ],
  audit_in_progress: [
    { action: 'Submit Audit Report', to: 'cb_final_review', tone: 'primary', note: 'Enabled after all applicable criteria are assessed; findings lock.' },
  ],
  auditor_reassessment: [
    { action: 'Start Reassessment', to: 'auditor_reassessment_in_progress', tone: 'primary', note: 'Corrective evidence and previously non-conforming criteria become available.' },
  ],
  auditor_reassessment_in_progress: [
    { action: 'Submit Reassessment Report', to: 'cb_final_re_review', tone: 'primary', note: 'Enabled after all affected criteria are reassessed; the report locks.' },
    { action: 'Request Further Evidence', to: 'further_corrective_required', requires: ['reason'], note: 'Identify the affected criteria; the operator is notified.' },
  ],
  cb_clarification_auditor: [
    { action: 'Submit Clarification to CB', to: 'ORIGIN', requires: ['reason'], tone: 'primary', note: 'Stored separately; the submitted report stays locked.' },
  ],
}

// The CB stage a clarification originated from — used to resolve `to: 'ORIGIN'`.
export function isCbStage(s: string): boolean {
  return s === 'cb_pre_audit_review' || s === 'cb_pre_audit_re_review' || s === 'cb_final_review' || s === 'cb_final_re_review'
}

// Statuses where the establishment can edit its board/evidence.
export function establishmentCanEdit(status: string): boolean {
  return (WF as Record<string, StatusDef>)[status]?.estEdit === true
    // legacy statuses (pre-Stage-2 data) keep their previous editable set
    || ['new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'revision'].includes(status)
}

// Map a clarification owner to its holding status.
export const CLARIFY_STATUS: Record<ClarifyOwner, AppStatus> = {
  operator: 'cb_clarification_operator',
  auditor: 'cb_clarification_auditor',
  establishment: 'cb_clarification_establishment',
}

// ── Semantic status groups (tolerant of both legacy and new vocabularies) ──
export const CERTIFIED_STATUSES = ['certified', 'certified_rectification', 'certified_active', 'certified_rectification_active']
export const NOT_APPROVED_STATUSES = ['rejected', 'not_certified', 'eligibility_rejected', 'not_certified_recorded', 'not_certified_communicated', 'certified_withdrawn']
export const CLOSED_STATUSES = [...CERTIFIED_STATUSES, ...NOT_APPROVED_STATUSES]
// The CB currently holds the application.
export const CB_STATUSES = ['cb_review', 'cb_pre_audit_review', 'cb_pre_audit_re_review', 'cb_final_review', 'cb_final_re_review']
// The auditor currently holds the application.
export const AUDIT_STATUSES = ['audit', 'auditor_assigned', 'audit_scheduled', 'audit_in_progress', 'auditor_reassessment', 'auditor_reassessment_in_progress']
// Statuses at which the auditor's per-criterion results are shown to the applicant
// (audit submitted to the CB or a decision recorded).
export const AUDIT_RESULTS_VISIBLE = [
  'cb_review', 'revision', 'approved', 'certified', 'certified_rectification', 'not_certified', 'rejected',
  'cb_final_review', 'cb_final_re_review', 'post_audit_rectification_required', 'post_audit_corrective_open',
  'auditor_reassessment', 'auditor_reassessment_in_progress', 'further_corrective_required',
  'cb_clarification_operator', 'cb_clarification_auditor', 'cb_clarification_establishment',
  'certified_active', 'not_certified_recorded', 'not_certified_communicated',
]
export const isCertified = (s: string) => CERTIFIED_STATUSES.includes(s)
export const isClosed = (s: string) => CLOSED_STATUSES.includes(s)
