// ── Demo data for the Green Key certification workflow ──────────────
// Real process order (see migration 005):
//   National Operator (NO) reviews the checklist WITH the establishment
//   -> NO submits to CB (timestamp + checklist locks)
//   -> CB reviews: request changes (back to NO) OR assign an Auditor
//   -> Auditor visits, records findings from their own profile
//   -> back to CB for final assessment
//   -> CB issues the final judgement (certified / rectification / not certified)
// Client-side demo data; real persistence uses the Supabase tables + RLS.

import { GK_CRITERIA, GK_SECTIONS, isImperativeFor } from './greenKeyCriteria'

export type AuditStatus =
  | 'no_review'          // with National Operator (checklist review, editable)
  | 'changes_requested'  // returned by CB to the National Operator
  | 'cb_review'          // submitted to CB, pre-audit (locked)
  | 'audit'              // CB assigned an auditor; on-site audit in progress
  | 'cb_final'           // audit complete, CB final assessment
  | 'certified'
  | 'certified_rectification'
  | 'not_certified'

export type DocStatus = 'pending' | 'conform' | 'non_conform'
export type CommentVisibility = 'internal' | 'shared'
export type Conformity = 'pending' | 'conform' | 'minor_nc' | 'major_nc'
export type CbDecision = 'pending' | 'certified' | 'certified_rectification' | 'not_certified'

export interface Auditor { id: string; name: string; email: string; specialties: string[]; active: boolean }
export interface CbMember { id: string; name: string; email: string }

export interface AuditDoc { id: string; name: string; type: string; size: string; status: DocStatus; note?: string }
export interface AuditComment {
  id: string
  author: string
  role: 'auditor' | 'no' | 'applicant' | 'cb'
  visibility: CommentVisibility
  body: string
  at: string
}
export interface TrailEntry {
  id: string; field: string; prev: string; next: string
  user: string; role: 'National Operator' | 'Auditor' | 'Certification Body' | 'Applicant'
  at: string
}
// Per-criterion audit verdict (set by the auditor, revealed once results are published)
export type CriterionResult = 'pending' | 'pass' | 'no_pass'

// A message in a criterion's comment thread. Auditor messages stay hidden from the
// establishment until the audit results are published (see visibleCriterionThread).
export interface CriterionMessage {
  id: string
  author: string
  role: 'establishment' | 'no' | 'auditor'
  body: string
  at: string
}
export interface CriterionAttachment { id: string; name: string; at: string }

// Green Key criteria are classified imperative (mandatory) or guideline (optional).
export type CriterionKind = 'imperative' | 'guideline'
// Severity an auditor assigns to a No-Pass finding.
export type NcSeverity = 'none' | 'minor' | 'major'

export interface ChecklistItem {
  ref: string
  criteria: string                // criterion area, e.g. "Energy" (table column 1)
  title: string                   // the specific indicator (table column 2)
  kind: CriterionKind             // imperative vs guideline
  points: number                  // weight toward the overall score
  met: boolean                    // establishment self-declaration (stage 1)
  internalResult: CriterionResult // National Operator internal check (Pass / Not Pass)
  result: CriterionResult         // external (assigned) auditor verdict — the official result
  severity: NcSeverity            // set by the auditor on a No-Pass
  dueDate: string | null          // per-criterion revision deadline (No-Pass, once published)
  externalNarrative: string       // external auditor's written feedback
  thread: CriterionMessage[]      // per-criterion chat
  attachments: CriterionAttachment[]
}
export type Criterion = ChecklistItem

export interface AuditApplication {
  id: string
  entity: string
  type: 'School' | 'Business'
  programme: string
  mainCategory: string
  subCategories: string[]
  governorate: string
  contact: string
  submitted: string
  deadline: string
  status: AuditStatus
  auditorId: string | null
  cbId: string | null
  submittedToCbAt: string | null   // timestamp when NO submitted to CB
  checklistLocked: boolean         // true once submitted to CB
  conformity: Conformity
  conformityPct: number
  cbDecision: CbDecision
  summary: string
  checklist: ChecklistItem[]
  documents: AuditDoc[]
  comments: AuditComment[]
  trail: TrailEntry[]
}

export const AUDITORS: Auditor[] = [
  { id: 'AUD-01', name: 'Layla Al-Sabah',  email: 'layla.auditor@feebureaukw.org',  specialties: ['Eco-Schools', 'YRE'],     active: true },
  { id: 'AUD-02', name: 'Omar Al-Mutairi', email: 'omar.auditor@feebureaukw.org',   specialties: ['Blue Flag', 'Green Key'], active: true },
  { id: 'AUD-03', name: 'Hind Al-Rashidi', email: 'hind.auditor@feebureaukw.org',   specialties: ['LEAF', 'Eco-Campus'],     active: true },
  { id: 'AUD-04', name: 'Yousef Al-Ajmi',  email: 'yousef.auditor@feebureaukw.org', specialties: ['Green Key', 'Blue Flag'], active: false },
]

export const CERT_BODIES: CbMember[] = [
  { id: 'CB-01', name: 'Dr. Mariam Al-Otaibi', email: 'cb@feebureaukw.org' },
  { id: 'CB-02', name: 'GKI Certification Board', email: 'certification@greenkey.global' },
]

// Signed-in demo users for each workspace
export const CURRENT_AUDITOR = AUDITORS[0]  // Layla (AUD-01)
export const CURRENT_CB = CERT_BODIES[0]    // Dr. Mariam (CB-01)
export const CURRENT_NO = { name: 'Mostafa Kanjo', org: 'FEE Kuwait — National Operator' }

// Status groupings for each role's queues
export const NO_OPEN: AuditStatus[] = ['no_review', 'changes_requested']
export const CB_PRE_AUDIT: AuditStatus[] = ['cb_review']
export const CB_FINAL: AuditStatus[] = ['cb_final']
export const DECIDED: AuditStatus[] = ['certified', 'certified_rectification', 'not_certified']

// The assessment checklist is the full official Green Key criteria set (all 7
// sections). Demo establishments are hotels, so I/G criteria are resolved for
// the Hotels & Hostels (HH) category. Imperatives are weighted 2 pts, guidelines 1.
const sectionTitle = (n: number) => GK_SECTIONS.find(s => s.n === n)?.title ?? `Section ${n}`
const CHECKLIST_GK: { ref: string; criteria: string; title: string; kind: CriterionKind; points: number }[] =
  GK_CRITERIA.map(c => {
    const imperative = isImperativeFor(c, 'HH')
    return {
      ref: c.id,
      criteria: sectionTitle(c.section),
      title: c.title,
      kind: imperative ? 'imperative' : 'guideline',
      points: imperative ? 2 : 1,
    }
  })
// Bare checklist — met flags only, empty threads/attachments, results pending.
const checklist = (metRefs: string[]): ChecklistItem[] =>
  CHECKLIST_GK.map(c => ({
    ...c, met: metRefs.includes(c.ref),
    internalResult: 'pending', result: 'pending', severity: 'none', dueDate: null,
    externalNarrative: '', thread: [], attachments: [],
  }))
const allRefs = CHECKLIST_GK.map(c => c.ref)

// Enrich specific criteria with per-criterion threads / attachments / results.
type CritPatch = Partial<Pick<ChecklistItem, 'met' | 'internalResult' | 'result' | 'severity' | 'dueDate' | 'externalNarrative' | 'thread' | 'attachments'>>
const enriched = (metRefs: string[], patches: Record<string, CritPatch>): ChecklistItem[] =>
  checklist(metRefs).map(c => (patches[c.ref] ? { ...c, ...patches[c.ref] } : c))
const allPass: Record<string, CritPatch> = Object.fromEntries(
  allRefs.map(r => [r, { internalResult: 'pass' as const, result: 'pass' as const, externalNarrative: 'Verified on-site; conforms to the Green Key requirement.' }])
)

export const AUDIT_APPLICATIONS: AuditApplication[] = [
  {
    id: 'KW-2026-00202', entity: 'Marina Bay Hotel', type: 'Business', programme: 'Green Key',
    mainCategory: 'Hotel', subCategories: ['Restaurant', 'Spa'], governorate: 'Ahmadi',
    contact: 'Ms. Lina Haddad · gm@marinabay.kw', submitted: '2026-05-30', deadline: '2026-07-05',
    status: 'no_review', auditorId: null, cbId: null, submittedToCbAt: null, checklistLocked: false,
    conformity: 'pending', conformityPct: 40, cbDecision: 'pending',
    summary: 'New Green Key application. The hotel and the National Operator are completing the criteria checklist together.',
    checklist: enriched(['1.1', '3.1'], {
      '3.1': {
        attachments: [{ id: 'A1', name: 'Water Meter Log — May.pdf', at: '2026-06-02 09:02' }],
        thread: [
          { id: 'M1', author: 'Lina Haddad', role: 'establishment', body: 'Uploaded the May water meter log. April is being digitised and will follow this week.', at: '2026-06-02 09:02' },
          { id: 'M2', author: 'Mostafa Kanjo', role: 'no', body: 'Thanks. Please also add the pool backwash readings so the monthly total is complete.', at: '2026-06-02 11:20' },
        ],
      },
      '4.1': {
        thread: [
          { id: 'M1', author: 'Mostafa Kanjo', role: 'no', body: 'We need energy use split by source (grid vs. on-site generator) for the last 3 months.', at: '2026-06-01 15:10' },
          { id: 'M2', author: 'Lina Haddad', role: 'establishment', body: 'Generator logs are with engineering — I will attach them here by Thursday.', at: '2026-06-02 09:15' },
        ],
      },
    }),
    documents: [
      { id: 'D1', name: 'Green Key Self-Assessment (draft).pdf', type: 'PDF', size: '2.9 MB', status: 'pending' },
    ],
    comments: [
      { id: 'C1', author: 'Mostafa Kanjo', role: 'no', visibility: 'shared', body: 'Two criteria still need evidence (4.1 energy, 5.1 waste). See the per-criterion notes.', at: '2026-06-02 11:25' },
    ],
    trail: [
      { id: 'T1', field: 'Application opened', prev: '—', next: 'Under NO review', user: 'Mostafa Kanjo', role: 'National Operator', at: '2026-05-30 10:00' },
    ],
  },
  {
    id: 'KW-2026-00201', entity: 'Al-Noor Primary School', type: 'School', programme: 'Eco-Schools',
    mainCategory: 'Primary School', subCategories: [], governorate: 'Hawalli',
    contact: 'Mrs. Fatima Al-Khaldi · principal@alnoor.edu.kw', submitted: '2026-05-23', deadline: '2026-06-28',
    status: 'no_review', auditorId: null, cbId: null, submittedToCbAt: null, checklistLocked: false,
    conformity: 'pending', conformityPct: 72, cbDecision: 'pending',
    summary: 'Year-1 Eco-Schools certification. National Operator is reviewing the seven-step checklist with the school.',
    checklist: checklist(['1.1', '3.1', '5.1']),
    documents: [
      { id: 'D1', name: 'Environmental Review Report.pdf', type: 'PDF', size: '2.4 MB', status: 'pending' },
      { id: 'D2', name: 'Eco-Committee Minutes.pdf',       type: 'PDF', size: '880 KB', status: 'pending' },
      { id: 'D3', name: 'Action Plan 2026.xlsx',           type: 'XLSX', size: '210 KB', status: 'pending' },
    ],
    comments: [
      { id: 'C1', author: 'Mostafa Kanjo', role: 'no', visibility: 'shared', body: 'Please add the 2026 action plan baselines before we can submit to the Certification Body.', at: '2026-05-26 14:40' },
    ],
    trail: [
      { id: 'T1', field: 'Application opened', prev: '—', next: 'Under NO review', user: 'Mostafa Kanjo', role: 'National Operator', at: '2026-05-23 09:10' },
    ],
  },
  {
    id: 'KW-2026-00197', entity: 'Gulf Science University', type: 'School', programme: 'Eco-Campus',
    mainCategory: 'University', subCategories: ['Student Residences'], governorate: 'Capital',
    contact: 'Dr. Salem Al-Roumi · sustainability@gsu.edu.kw', submitted: '2026-05-19', deadline: '2026-06-24',
    status: 'changes_requested', auditorId: null, cbId: 'CB-01', submittedToCbAt: null, checklistLocked: false,
    conformity: 'pending', conformityPct: 60, cbDecision: 'pending',
    summary: 'Eco-Campus accreditation returned by the Certification Body for additional evidence on energy management.',
    checklist: checklist(['1.1', '1.2', '3.1']),
    comments: [
      { id: 'C1', author: 'Dr. Mariam Al-Otaibi', role: 'cb', visibility: 'internal', body: 'Criterion 4.1 energy records incomplete — returning to the National Operator for revision before audit.', at: '2026-05-24 11:00' },
    ],
    documents: [
      { id: 'D1', name: 'Campus Sustainability Policy.pdf', type: 'PDF', size: '3.1 MB', status: 'pending' },
    ],
    trail: [
      { id: 'T1', field: 'CB review', prev: 'Submitted', next: 'Changes requested', user: 'Dr. Mariam Al-Otaibi', role: 'Certification Body', at: '2026-05-24 11:00' },
    ],
  },
  {
    id: 'KW-2026-00196', entity: 'Young Reporters Kuwait', type: 'School', programme: 'YRE',
    mainCategory: 'Secondary School', subCategories: [], governorate: 'Capital',
    contact: 'Mr. Bader Al-Failakawi · coordinator@yrekuwait.org', submitted: '2026-05-18', deadline: '2026-06-12',
    status: 'cb_review', auditorId: null, cbId: 'CB-01', submittedToCbAt: '2026-05-29 10:20', checklistLocked: true,
    conformity: 'pending', conformityPct: 88, cbDecision: 'pending',
    summary: 'Submitted to the Certification Body. Checklist is locked; the CB is reviewing before assigning an auditor.',
    checklist: checklist(allRefs),
    documents: [
      { id: 'D1', name: 'Article Portfolio.pdf', type: 'PDF', size: '5.6 MB', status: 'pending' },
      { id: 'D2', name: 'Video Report.mp4',      type: 'MP4', size: '48 MB',  status: 'pending' },
    ],
    comments: [
      { id: 'C1', author: 'Mostafa Kanjo', role: 'no', visibility: 'internal', body: 'All criteria met. Submitting to the Certification Body.', at: '2026-05-29 10:20' },
    ],
    trail: [
      { id: 'T1', field: 'Submission to CB', prev: 'NO review', next: 'Submitted (locked)', user: 'Mostafa Kanjo', role: 'National Operator', at: '2026-05-29 10:20' },
    ],
  },
  {
    id: 'KW-2026-00188', entity: 'Hilton Kuwait Resort', type: 'Business', programme: 'Green Key',
    mainCategory: 'Hotel', subCategories: ['Restaurant', 'Conference Centre'], governorate: 'Capital',
    contact: 'Mr. Tareq Haddad · gm@hiltonkuwait.com', submitted: '2026-05-10', deadline: '2026-06-15',
    status: 'audit', auditorId: 'AUD-01', cbId: 'CB-01', submittedToCbAt: '2026-05-20 08:00', checklistLocked: true,
    conformity: 'pending', conformityPct: 80, cbDecision: 'pending',
    summary: 'Certification Body assigned an auditor. On-site audit of the 280-room resort in progress.',
    checklist: enriched(allRefs, {
      ...allPass,
      '4.1': {
        internalResult: 'pass', result: 'no_pass', severity: 'major',
        externalNarrative: 'Energy sub-metering covers only 2 of 4 zones; the conference wing is unmetered — imperative non-conformity.',
        thread: [
          { id: 'M1', author: 'Layla Al-Sabah', role: 'auditor', body: 'On-site: energy sub-metering covers only 2 of 4 zones. Recording gap for the conference wing — provisional non-conformity.', at: '2026-06-03 12:30' },
        ],
      },
      '5.1': {
        internalResult: 'pass', result: 'pass',
        externalNarrative: 'Waste separation verified — 5 streams with back-of-house signage.',
        thread: [
          { id: 'M1', author: 'Layla Al-Sabah', role: 'auditor', body: 'Waste separation verified on-site — 5 streams, back-of-house signage in place.', at: '2026-06-03 13:10' },
        ],
      },
    }),
    documents: [
      { id: 'D1', name: 'Green Key Self-Assessment.pdf', type: 'PDF',  size: '3.8 MB', status: 'pending' },
      { id: 'D2', name: 'Energy & Water Metrics.xlsx',   type: 'XLSX', size: '320 KB', status: 'pending' },
      { id: 'D3', name: 'Guest Awareness Evidence.pdf',  type: 'PDF',  size: '2.1 MB', status: 'pending' },
    ],
    comments: [
      { id: 'C1', author: 'Dr. Mariam Al-Otaibi', role: 'cb', visibility: 'internal', body: 'No comments on the checklist. Assigning Layla for the on-site audit.', at: '2026-05-22 09:30' },
    ],
    trail: [
      { id: 'T1', field: 'Submission to CB', prev: 'NO review', next: 'Submitted (locked)', user: 'Mostafa Kanjo', role: 'National Operator', at: '2026-05-20 08:00' },
      { id: 'T2', field: 'Auditor assignment', prev: '—', next: 'Layla Al-Sabah', user: 'Dr. Mariam Al-Otaibi', role: 'Certification Body', at: '2026-05-22 09:30' },
    ],
  },
  {
    id: 'KW-2026-00185', entity: 'Seasons Hotel', type: 'Business', programme: 'Green Key',
    mainCategory: 'Hotel', subCategories: ['Restaurant'], governorate: 'Capital',
    contact: 'Ms. Dana Al-Sager · gm@seasons.kw', submitted: '2026-05-02', deadline: '2026-06-06',
    status: 'cb_final', auditorId: 'AUD-01', cbId: 'CB-01', submittedToCbAt: '2026-05-08 09:00', checklistLocked: true,
    conformity: 'conform', conformityPct: 92, cbDecision: 'pending',
    summary: 'On-site audit complete (conform, 92%). Awaiting the Certification Body final judgement.',
    checklist: enriched(allRefs, {
      ...allPass,
      '3.1': { internalResult: 'pass', result: 'pass', externalNarrative: 'Monthly water totals verified against utility bills. Conform.',
        thread: [{ id: 'M1', author: 'Layla Al-Sabah', role: 'auditor', body: 'Monthly water totals verified against utility bills. Conform.', at: '2026-05-30 11:00' }] },
      '4.1': { internalResult: 'pass', result: 'no_pass', severity: 'major', dueDate: '2026-06-14',
        externalNarrative: 'Energy records missing for February on an imperative criterion. Provide the month and re-submit.',
        thread: [{ id: 'M1', author: 'Layla Al-Sabah', role: 'auditor', body: 'Energy records missing for February. Imperative non-conformity — provide the month and re-submit.', at: '2026-05-30 11:20' }] },
    }),
    documents: [
      { id: 'D1', name: 'Audit Report — Seasons Hotel.pdf', type: 'PDF', size: '3.4 MB', status: 'conform' },
      { id: 'D2', name: 'Energy & Water Metrics.xlsx',      type: 'XLSX', size: '300 KB', status: 'conform' },
    ],
    comments: [
      { id: 'C1', author: 'Layla Al-Sabah', role: 'auditor', visibility: 'internal', body: 'On-site audit complete. All imperative criteria met; conformity 92%. Returning to the CB for the final decision.', at: '2026-05-30 17:00' },
    ],
    trail: [
      { id: 'T1', field: 'Conformity judgement', prev: 'Pending', next: 'Conform (92%)', user: 'Layla Al-Sabah', role: 'Auditor', at: '2026-05-30 16:55' },
      { id: 'T2', field: 'Audit report', prev: 'Draft', next: 'Submitted to CB', user: 'Layla Al-Sabah', role: 'Auditor', at: '2026-05-30 17:00' },
    ],
  },
  {
    id: 'KW-2026-00190', entity: 'Salmiya International School', type: 'School', programme: 'Eco-Schools',
    mainCategory: 'Secondary School', subCategories: [], governorate: 'Hawalli',
    contact: 'Ms. Reem Al-Sabah · ecoclub@sis.edu.kw', submitted: '2026-04-30', deadline: '2026-05-30',
    status: 'certified', auditorId: 'AUD-01', cbId: 'CB-01', submittedToCbAt: '2026-05-05 09:00', checklistLocked: true,
    conformity: 'conform', conformityPct: 96, cbDecision: 'certified',
    summary: 'Eco-Schools renewal — Green Flag award, third cycle. Certified by the Certification Body.',
    checklist: enriched(allRefs, allPass),
    documents: [
      { id: 'D1', name: 'Renewal Dossier.pdf', type: 'PDF', size: '4.0 MB', status: 'conform' },
      { id: 'D2', name: 'Audit Report.pdf',    type: 'PDF', size: '2.2 MB', status: 'conform' },
    ],
    comments: [
      { id: 'C1', author: 'Dr. Mariam Al-Otaibi', role: 'cb', visibility: 'shared', body: 'Certification approved — Green Flag renewed for a 24-month cycle.', at: '2026-05-14 09:05' },
    ],
    trail: [
      { id: 'T1', field: 'Certification decision', prev: 'Pending', next: 'Certified', user: 'Dr. Mariam Al-Otaibi', role: 'Certification Body', at: '2026-05-14 09:05' },
    ],
  },
]

export function getAuditApplication(id: string) { return AUDIT_APPLICATIONS.find(a => a.id === id) }
export function auditorById(id: string | null) { return AUDITORS.find(a => a.id === id) }
export function cbById(id: string | null) { return CERT_BODIES.find(c => c.id === id) }

export const AUDIT_STATUS_META: Record<AuditStatus, { label: string; color: string; bg: string }> = {
  no_review:              { label: 'NO Review',          color: '#2563EB', bg: '#DBEAFE' },
  changes_requested:      { label: 'Changes Requested',  color: '#D97706', bg: '#FEF3C7' },
  cb_review:              { label: 'CB Review',           color: '#7C3AED', bg: '#EDE9FE' },
  audit:                  { label: 'Audit in Progress',  color: '#0891B2', bg: '#CFFAFE' },
  cb_final:               { label: 'CB Final Assessment', color: '#B45309', bg: '#FEF3C7' },
  certified:              { label: 'Certified',           color: '#059669', bg: '#D1FAE5' },
  certified_rectification:{ label: 'Certified · Rectify', color: '#65A30D', bg: '#ECFCCB' },
  not_certified:          { label: 'Not Certified',       color: '#DC2626', bg: '#FEE2E2' },
}

export const DOC_STATUS_META: Record<DocStatus, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pending',     color: '#64748B', bg: '#F1F5F9' },
  conform:     { label: 'Conform',     color: '#059669', bg: '#D1FAE5' },
  non_conform: { label: 'Non-conform', color: '#DC2626', bg: '#FEE2E2' },
}

export const CONFORMITY_META: Record<Conformity, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',              color: '#64748B', bg: '#F1F5F9' },
  conform:  { label: 'Conform',              color: '#059669', bg: '#D1FAE5' },
  minor_nc: { label: 'Minor non-conformity', color: '#D97706', bg: '#FEF3C7' },
  major_nc: { label: 'Major non-conformity', color: '#DC2626', bg: '#FEE2E2' },
}

export const CB_DECISION_META: Record<CbDecision, { label: string; color: string; bg: string }> = {
  pending:                 { label: 'Decision pending',         color: '#64748B', bg: '#F1F5F9' },
  certified:               { label: 'Certified',                color: '#059669', bg: '#D1FAE5' },
  certified_rectification: { label: 'Certified · rectification',color: '#65A30D', bg: '#ECFCCB' },
  not_certified:           { label: 'Not certified',            color: '#DC2626', bg: '#FEE2E2' },
}

export const CRITERION_RESULT_META: Record<CriterionResult, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#64748B', bg: '#F1F5F9' },
  pass:     { label: 'Pass',     color: '#059669', bg: '#D1FAE5' },
  no_pass:  { label: 'No Pass',  color: '#DC2626', bg: '#FEE2E2' },
}

export const CRITERION_ROLE_META: Record<CriterionMessage['role'], { label: string; color: string; bg: string }> = {
  establishment: { label: 'Establishment',     color: '#1D4ED8', bg: '#DBEAFE' },
  no:            { label: 'National Operator',  color: '#166534', bg: '#DCFCE7' },
  auditor:       { label: 'Auditor',            color: '#0E7490', bg: '#CFFAFE' },
}

export const CRITERION_KIND_META: Record<CriterionKind, { label: string; short: string; color: string; bg: string }> = {
  imperative: { label: 'Imperative', short: 'I', color: '#B45309', bg: '#FEF3C7' },
  guideline:  { label: 'Guideline',  short: 'G', color: '#475569', bg: '#F1F5F9' },
}

export const NC_SEVERITY_META: Record<NcSeverity, { label: string; color: string; bg: string }> = {
  none:  { label: '—',     color: '#94A3B8', bg: '#F1F5F9' },
  minor: { label: 'Minor', color: '#B45309', bg: '#FEF3C7' },
  major: { label: 'Major', color: '#B91C1C', bg: '#FEE2E2' },
}

// ── Scoring & conformity derived from per-criterion (external) results ─────────
export interface Scorecard {
  total: number
  passed: number
  noPass: number
  pending: number
  passRatePct: number          // graded pass rate
  points: number               // total available points
  pointsEarned: number         // points from passed criteria
  scorePct: number             // pointsEarned / points
  impTotal: number
  impPassed: number
  impFailed: number
  allImperativePass: boolean   // no imperative is No-Pass
  ncCount: number
  ncMinor: number
  ncMajor: number
}
export function scorecard(items: ChecklistItem[]): Scorecard {
  const total = items.length
  const passed = items.filter(c => c.result === 'pass').length
  const noPass = items.filter(c => c.result === 'no_pass').length
  const pending = items.filter(c => c.result === 'pending').length
  const graded = passed + noPass
  const points = items.reduce((s, c) => s + c.points, 0)
  const pointsEarned = items.filter(c => c.result === 'pass').reduce((s, c) => s + c.points, 0)
  const imp = items.filter(c => c.kind === 'imperative')
  const impPassed = imp.filter(c => c.result === 'pass').length
  const impFailed = imp.filter(c => c.result === 'no_pass').length
  return {
    total, passed, noPass, pending,
    passRatePct: graded ? Math.round((passed / graded) * 100) : 0,
    points, pointsEarned,
    scorePct: points ? Math.round((pointsEarned / points) * 100) : 0,
    impTotal: imp.length, impPassed, impFailed,
    allImperativePass: impFailed === 0,
    ncCount: noPass,
    ncMinor: items.filter(c => c.result === 'no_pass' && c.severity === 'minor').length,
    ncMajor: items.filter(c => c.result === 'no_pass' && c.severity === 'major').length,
  }
}
// Overall conformity implied by the results (auto-derived, no manual entry).
export function deriveConformity(items: ChecklistItem[]): Conformity {
  if (items.some(c => c.result === 'pending')) return 'pending'
  const noPass = items.filter(c => c.result === 'no_pass')
  if (noPass.length === 0) return 'conform'
  if (noPass.some(c => c.kind === 'imperative' || c.severity === 'major')) return 'major_nc'
  return 'minor_nc'
}
// The CB may only award full certification when every imperative criterion passes
// and nothing is still ungraded.
export function canCertify(items: ChecklistItem[]): boolean {
  return items.length > 0 && !items.some(c => c.result === 'pending') && !items.some(c => c.kind === 'imperative' && c.result === 'no_pass')
}

// ── Stage & visibility rules for per-criterion threads / results ──────────────
// Stage 1 (application): establishment <-> National Operator collaborate openly.
// Stage 2 (submitted, locked; audit): only the assigned auditor comments, and the
//   establishment CANNOT see auditor comments or results.
// Stage 3 (results published): results become visible to everyone, read-only, and
//   the auditor's comments are revealed to the establishment.
export function resultsPublished(status: AuditStatus): boolean {
  return CB_FINAL.includes(status) || DECIDED.includes(status)
}
export function criterionStage(status: AuditStatus): 1 | 2 | 3 {
  if (NO_OPEN.includes(status)) return 1
  if (resultsPublished(status)) return 3
  return 2 // cb_review, audit
}

// Thread messages a given viewer may see at the application's current status.
export function visibleCriterionThread(
  thread: CriterionMessage[],
  viewerRole: CriterionMessage['role'] | 'cb',
  status: AuditStatus,
): CriterionMessage[] {
  const published = resultsPublished(status)
  return thread.filter(m => {
    // Auditor observations stay hidden from the establishment until results are published.
    if (m.role === 'auditor' && viewerRole === 'establishment' && !published) return false
    return true
  })
}

// Who may add a comment to a criterion thread at the current status.
export function canPostCriterion(viewerRole: CriterionMessage['role'], status: AuditStatus): boolean {
  const stage = criterionStage(status)
  if (stage === 1) return viewerRole === 'establishment' || viewerRole === 'no'
  if (stage === 2) return viewerRole === 'auditor' && status === 'audit'
  return false // stage 3 is read-only
}

// The auditor records per-criterion Pass / No Pass only during the on-site audit.
export function canSetCriterionResults(status: AuditStatus): boolean {
  return status === 'audit'
}

// ── Non-conformity handling (stage 4) ─────────────────────────────────────────
// 1–5 non-conformities: 15 days to adjust; NO may re-open those criteria.
// 6+ non-conformities: 3 months to revise.
export interface NonConformityPlan {
  count: number
  window: string          // human window, e.g. "15 days"
  windowDays: number
  canReopen: boolean      // NO may re-open the non-conforming criteria for revision
  note: string
}
export function nonConformityPlan(items: ChecklistItem[]): NonConformityPlan | null {
  const count = items.filter(c => c.result === 'no_pass').length
  if (count === 0) return null
  if (count <= 5) {
    return { count, window: '15 days', windowDays: 15, canReopen: true,
      note: `${count} non-conformity(ies). The establishment has 15 days to adjust; the National Operator may re-open these criteria for revision.` }
  }
  return { count, window: '3 months', windowDays: 90, canReopen: true,
    note: `${count} non-conformities. The establishment has 3 months to revise the affected criteria.` }
}

// ── Notifications (National Operator) ─────────────────────────────────────────
// In a live build these are emitted when the establishment comments or uploads on a
// criterion during stage 1. Seeded here for the demo.
export type NotificationKind = 'criterion_comment' | 'criterion_upload' | 'submitted' | 'changes_requested'
export interface AppNotification {
  id: string
  appId: string
  entity: string
  kind: NotificationKind
  criterionRef?: string
  body: string
  at: string
  read: boolean
}
export const NO_NOTIFICATIONS: AppNotification[] = [
  { id: 'N1', appId: 'KW-2026-00202', entity: 'Marina Bay Hotel', kind: 'criterion_comment', criterionRef: '4.1',
    body: 'Marina Bay Hotel replied on criterion 4.1 (Energy use recorded monthly).', at: '2026-06-02 09:15', read: false },
  { id: 'N2', appId: 'KW-2026-00202', entity: 'Marina Bay Hotel', kind: 'criterion_upload', criterionRef: '3.1',
    body: 'Marina Bay Hotel attached “Water Meter Log — May.pdf” to criterion 3.1.', at: '2026-06-02 09:02', read: false },
  { id: 'N3', appId: 'KW-2026-00201', entity: 'Al-Noor Primary School', kind: 'criterion_comment', criterionRef: '5.1',
    body: 'Al-Noor Primary School replied on criterion 5.1 (Waste separation).', at: '2026-06-01 16:40', read: true },
]
