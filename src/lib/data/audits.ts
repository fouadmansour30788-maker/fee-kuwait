// ── Demo data for the Green Key certification workflow ──────────────
// Real process order (see migration 005):
//   National Operator (NO) reviews the checklist WITH the establishment
//   -> NO submits to CB (timestamp + checklist locks)
//   -> CB reviews: request changes (back to NO) OR assign an Auditor
//   -> Auditor visits, records findings from their own profile
//   -> back to CB for final assessment
//   -> CB issues the final judgement (certified / rectification / not certified)
// Client-side demo data; real persistence uses the Supabase tables + RLS.

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
export interface ChecklistItem { ref: string; title: string; met: boolean }

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

const CHECKLIST_GK = [
  { ref: '1.1', title: 'Green Key Establishment Representative appointed' },
  { ref: '1.2', title: 'Strategic sustainability targets formulated' },
  { ref: '3.1', title: 'Total water consumption recorded monthly' },
  { ref: '4.1', title: 'Energy use by source recorded monthly' },
  { ref: '5.1', title: 'Waste separated into 3+ recyclable categories' },
]
const checklist = (metRefs: string[]): ChecklistItem[] =>
  CHECKLIST_GK.map(c => ({ ...c, met: metRefs.includes(c.ref) }))
const allRefs = CHECKLIST_GK.map(c => c.ref)

export const AUDIT_APPLICATIONS: AuditApplication[] = [
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
    checklist: checklist(allRefs),
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
    checklist: checklist(allRefs),
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
    checklist: checklist(allRefs),
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
