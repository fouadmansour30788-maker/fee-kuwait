// ── Demo data for the Green Key certification workflow ──────────────
// Mirrors the rest of the prototype (hardcoded, client-side). Aligned to the
// Green Key "Minimum Requirements" spec: the Auditor records findings &
// conformity and submits an audit report; the Certification Body (CB) reviews
// it and records the certification decision. Every change is captured in an
// immutable audit trail. See migrations 002 + 003.

export type AuditStatus =
  | 'assigned'        // assigned to an auditor
  | 'in_review'       // auditor reviewing
  | 'audit_submitted' // auditor submitted the audit report → goes to CB
  | 'cb_review'       // Certification Body reviewing
  | 'certified'
  | 'certified_rectification'
  | 'not_certified'

export type DocStatus = 'pending' | 'conform' | 'non_conform'
export type CommentVisibility = 'internal' | 'shared'
export type Conformity = 'pending' | 'conform' | 'minor_nc' | 'major_nc'
export type CbDecision = 'pending' | 'certified' | 'certified_rectification' | 'not_certified'

export interface Auditor {
  id: string; name: string; email: string; specialties: string[]; active: boolean
}
export interface CbMember {
  id: string; name: string; email: string
}

export interface AuditDoc {
  id: string; name: string; type: string; size: string; status: DocStatus; note?: string
}

export interface AuditComment {
  id: string
  author: string
  role: 'auditor' | 'admin' | 'applicant' | 'cb'
  visibility: CommentVisibility
  body: string
  at: string
}

export interface TrailEntry {
  id: string
  field: string
  prev: string
  next: string
  user: string
  role: 'National Operator' | 'Auditor' | 'Certification Body' | 'Applicant'
  at: string
}

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
  conformity: Conformity
  conformityPct: number
  auditReportSubmitted: boolean
  cbDecision: CbDecision
  summary: string
  documents: AuditDoc[]
  comments: AuditComment[]
  trail: TrailEntry[]
}

export const AUDITORS: Auditor[] = [
  { id: 'AUD-01', name: 'Layla Al-Sabah',  email: 'layla.auditor@feekuwait.org',  specialties: ['Eco-Schools', 'YRE'],        active: true },
  { id: 'AUD-02', name: 'Omar Al-Mutairi', email: 'omar.auditor@feekuwait.org',   specialties: ['Blue Flag', 'Green Key'],    active: true },
  { id: 'AUD-03', name: 'Hind Al-Rashidi', email: 'hind.auditor@feekuwait.org',   specialties: ['LEAF', 'Eco-Campus'],        active: true },
  { id: 'AUD-04', name: 'Yousef Al-Ajmi',  email: 'yousef.auditor@feekuwait.org', specialties: ['Green Key', 'Blue Flag'],    active: false },
]

export const CERT_BODIES: CbMember[] = [
  { id: 'CB-01', name: 'Dr. Mariam Al-Otaibi', email: 'cb@feekuwait.org' },
  { id: 'CB-02', name: 'GKI Certification Board', email: 'certification@greenkey.global' },
]

// Signed-in demo users for each workspace
export const CURRENT_AUDITOR = AUDITORS[0] // Layla (AUD-01)
export const CURRENT_CB = CERT_BODIES[0]   // Dr. Mariam (CB-01)

export const AUDIT_APPLICATIONS: AuditApplication[] = [
  {
    id: 'KW-2026-00201',
    entity: 'Al-Noor Primary School',
    type: 'School', programme: 'Eco-Schools',
    mainCategory: 'Primary School', subCategories: [],
    governorate: 'Hawalli',
    contact: 'Mrs. Fatima Al-Khaldi · principal@alnoor.edu.kw',
    submitted: '2026-05-23', deadline: '2026-06-28',
    status: 'in_review', auditorId: 'AUD-01', cbId: null,
    conformity: 'pending', conformityPct: 72, auditReportSubmitted: false, cbDecision: 'pending',
    summary: 'Year-1 Eco-Schools certification covering the seven-step framework, an eco-committee, and a whole-school environmental review.',
    documents: [
      { id: 'D1', name: 'Environmental Review Report.pdf', type: 'PDF',  size: '2.4 MB',  status: 'conform',     note: 'Thorough baseline audit — conforms.' },
      { id: 'D2', name: 'Eco-Committee Minutes.pdf',       type: 'PDF',  size: '880 KB',  status: 'pending'  },
      { id: 'D3', name: 'Action Plan 2026.xlsx',           type: 'XLSX', size: '210 KB',  status: 'non_conform', note: 'Targets are not measurable — add baselines and deadlines.' },
      { id: 'D4', name: 'Campus Photos.zip',               type: 'ZIP',  size: '14.1 MB', status: 'pending'  },
    ],
    comments: [
      { id: 'C1', author: 'FEE Admin',      role: 'admin',   visibility: 'internal', body: 'Assigned to Layla — priority, deadline end of June.', at: '2026-05-24 09:10' },
      { id: 'C2', author: 'Layla Al-Sabah', role: 'auditor', visibility: 'internal', body: 'Environmental review conforms. Holding conformity judgement until the action plan baselines are added.', at: '2026-05-26 14:32' },
      { id: 'C3', author: 'Layla Al-Sabah', role: 'auditor', visibility: 'shared',   body: 'Please revise the 2026 Action Plan: each target needs a measurable baseline and a target date. Everything else is on track.', at: '2026-05-26 14:40' },
    ],
    trail: [
      { id: 'T1', field: 'Auditor assignment', prev: '—', next: 'Layla Al-Sabah', user: 'FEE Admin', role: 'National Operator', at: '2026-05-24 09:10' },
      { id: 'T2', field: 'Document: Environmental Review Report', prev: 'Pending', next: 'Conform', user: 'Layla Al-Sabah', role: 'Auditor', at: '2026-05-26 14:30' },
      { id: 'T3', field: 'Document: Action Plan 2026', prev: 'Pending', next: 'Non-conform', user: 'Layla Al-Sabah', role: 'Auditor', at: '2026-05-26 14:38' },
    ],
  },
  {
    id: 'KW-2026-00197',
    entity: 'Gulf Science University',
    type: 'School', programme: 'Eco-Campus',
    mainCategory: 'University', subCategories: ['Student Residences'],
    governorate: 'Capital',
    contact: 'Dr. Salem Al-Roumi · sustainability@gsu.edu.kw',
    submitted: '2026-05-19', deadline: '2026-06-24',
    status: 'assigned', auditorId: 'AUD-01', cbId: null,
    conformity: 'pending', conformityPct: 0, auditReportSubmitted: false, cbDecision: 'pending',
    summary: 'Eco-Campus accreditation for a 12,000-student university, including energy, waste and water management policies.',
    documents: [
      { id: 'D1', name: 'Campus Sustainability Policy.pdf', type: 'PDF', size: '3.1 MB', status: 'pending' },
      { id: 'D2', name: 'Energy Audit 2025.pdf',           type: 'PDF', size: '1.7 MB', status: 'pending' },
      { id: 'D3', name: 'Waste Management Plan.pdf',        type: 'PDF', size: '990 KB', status: 'pending' },
    ],
    comments: [
      { id: 'C1', author: 'FEE Admin', role: 'admin', visibility: 'internal', body: 'New assignment — please begin the document review this week.', at: '2026-05-20 11:00' },
    ],
    trail: [
      { id: 'T1', field: 'Auditor assignment', prev: '—', next: 'Layla Al-Sabah', user: 'FEE Admin', role: 'National Operator', at: '2026-05-20 11:00' },
    ],
  },
  {
    id: 'KW-2026-00196',
    entity: 'Young Reporters Kuwait',
    type: 'School', programme: 'YRE',
    mainCategory: 'Secondary School', subCategories: [],
    governorate: 'Capital',
    contact: 'Mr. Bader Al-Failakawi · coordinator@yrekuwait.org',
    submitted: '2026-05-18', deadline: '2026-06-12',
    status: 'audit_submitted', auditorId: 'AUD-01', cbId: 'CB-01',
    conformity: 'minor_nc', conformityPct: 88, auditReportSubmitted: true, cbDecision: 'pending',
    summary: 'Young Reporters for the Environment — portfolio of 14 student environmental articles and one video report.',
    documents: [
      { id: 'D1', name: 'Article Portfolio.pdf', type: 'PDF', size: '5.6 MB', status: 'conform' },
      { id: 'D2', name: 'Video Report.mp4',      type: 'MP4', size: '48 MB',  status: 'conform' },
      { id: 'D3', name: 'Consent Forms.pdf',     type: 'PDF', size: '1.2 MB', status: 'non_conform', note: 'Two forms are missing signatures (minor non-conformity).' },
    ],
    comments: [
      { id: 'C1', author: 'Layla Al-Sabah', role: 'auditor', visibility: 'shared', body: 'Excellent journalism. Two consent forms still need signatures — a minor non-conformity to rectify.', at: '2026-05-29 10:15' },
      { id: 'C2', author: 'Layla Al-Sabah', role: 'auditor', visibility: 'internal', body: 'Audit report submitted with one minor NC. Forwarding to the Certification Body.', at: '2026-05-29 10:20' },
    ],
    trail: [
      { id: 'T1', field: 'Conformity judgement', prev: 'Pending', next: 'Minor non-conformity', user: 'Layla Al-Sabah', role: 'Auditor', at: '2026-05-29 10:18' },
      { id: 'T2', field: 'Audit report', prev: 'Draft', next: 'Submitted', user: 'Layla Al-Sabah', role: 'Auditor', at: '2026-05-29 10:20' },
    ],
  },
  {
    id: 'KW-2026-00188',
    entity: 'Hilton Kuwait Resort',
    type: 'Business', programme: 'Green Key',
    mainCategory: 'Hotel', subCategories: ['Restaurant', 'Conference Centre'],
    governorate: 'Capital',
    contact: 'Mr. Tareq Haddad · gm@hiltonkuwait.com',
    submitted: '2026-05-10', deadline: '2026-06-15',
    status: 'cb_review', auditorId: 'AUD-02', cbId: 'CB-01',
    conformity: 'conform', conformityPct: 94, auditReportSubmitted: true, cbDecision: 'pending',
    summary: 'Green Key certification for a 280-room resort, assessed as a hotel with additional restaurant and conference-centre sub-categories.',
    documents: [
      { id: 'D1', name: 'Green Key Audit Report.pdf',   type: 'PDF', size: '3.8 MB', status: 'conform' },
      { id: 'D2', name: 'Energy & Water Metrics.xlsx',  type: 'XLSX', size: '320 KB', status: 'conform' },
      { id: 'D3', name: 'Guest Awareness Evidence.pdf', type: 'PDF', size: '2.1 MB', status: 'conform' },
    ],
    comments: [
      { id: 'C1', author: 'Omar Al-Mutairi',    role: 'auditor', visibility: 'internal', body: 'On-site audit complete. All imperative criteria met; conformity 94%. Recommending the CB review for decision.', at: '2026-05-28 17:00' },
      { id: 'C2', author: 'Dr. Mariam Al-Otaibi', role: 'cb',    visibility: 'internal', body: 'Reviewing the audit report and metrics. Decision pending.', at: '2026-05-30 09:30' },
    ],
    trail: [
      { id: 'T1', field: 'Conformity judgement', prev: 'Pending', next: 'Conform (94%)', user: 'Omar Al-Mutairi', role: 'Auditor', at: '2026-05-28 16:55' },
      { id: 'T2', field: 'Audit report', prev: 'Draft', next: 'Submitted', user: 'Omar Al-Mutairi', role: 'Auditor', at: '2026-05-28 17:00' },
      { id: 'T3', field: 'CB assignment', prev: '—', next: 'Dr. Mariam Al-Otaibi', user: 'FEE Admin', role: 'National Operator', at: '2026-05-29 08:00' },
    ],
  },
  {
    id: 'KW-2026-00190',
    entity: 'Salmiya International School',
    type: 'School', programme: 'Eco-Schools',
    mainCategory: 'Secondary School', subCategories: [],
    governorate: 'Hawalli',
    contact: 'Ms. Reem Al-Sabah · ecoclub@sis.edu.kw',
    submitted: '2026-04-30', deadline: '2026-05-30',
    status: 'certified', auditorId: 'AUD-01', cbId: 'CB-01',
    conformity: 'conform', conformityPct: 96, auditReportSubmitted: true, cbDecision: 'certified',
    summary: 'Eco-Schools renewal — Green Flag award, third cycle.',
    documents: [
      { id: 'D1', name: 'Renewal Dossier.pdf', type: 'PDF', size: '4.0 MB', status: 'conform' },
      { id: 'D2', name: 'Impact Evidence.pdf', type: 'PDF', size: '2.2 MB', status: 'conform' },
    ],
    comments: [
      { id: 'C1', author: 'Layla Al-Sabah',     role: 'auditor', visibility: 'shared',   body: 'All criteria met (96% conformity). Audit report submitted to the Certification Body.', at: '2026-05-12 16:20' },
      { id: 'C2', author: 'Dr. Mariam Al-Otaibi', role: 'cb',    visibility: 'shared',   body: 'Certification approved — Green Flag renewed for a 24-month cycle.', at: '2026-05-14 09:05' },
    ],
    trail: [
      { id: 'T1', field: 'Conformity judgement', prev: 'Pending', next: 'Conform (96%)', user: 'Layla Al-Sabah', role: 'Auditor', at: '2026-05-12 16:15' },
      { id: 'T2', field: 'Audit report', prev: 'Draft', next: 'Submitted', user: 'Layla Al-Sabah', role: 'Auditor', at: '2026-05-12 16:20' },
      { id: 'T3', field: 'Certification decision', prev: 'Pending', next: 'Certified', user: 'Dr. Mariam Al-Otaibi', role: 'Certification Body', at: '2026-05-14 09:05' },
    ],
  },
]

export function getAuditApplication(id: string): AuditApplication | undefined {
  return AUDIT_APPLICATIONS.find(a => a.id === id)
}
export function auditorById(id: string | null): Auditor | undefined {
  return AUDITORS.find(a => a.id === id)
}
export function cbById(id: string | null): CbMember | undefined {
  return CERT_BODIES.find(c => c.id === id)
}

export const AUDIT_STATUS_META: Record<AuditStatus, { label: string; color: string; bg: string }> = {
  assigned:               { label: 'Assigned',          color: '#7C3AED', bg: '#EDE9FE' },
  in_review:              { label: 'Audit in Progress', color: '#2563EB', bg: '#DBEAFE' },
  audit_submitted:        { label: 'Report Submitted',  color: '#0891B2', bg: '#CFFAFE' },
  cb_review:              { label: 'CB Review',          color: '#D97706', bg: '#FEF3C7' },
  certified:              { label: 'Certified',          color: '#059669', bg: '#D1FAE5' },
  certified_rectification:{ label: 'Certified · Rectify',color: '#65A30D', bg: '#ECFCCB' },
  not_certified:          { label: 'Not Certified',      color: '#DC2626', bg: '#FEE2E2' },
}

export const DOC_STATUS_META: Record<DocStatus, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pending',     color: '#64748B', bg: '#F1F5F9' },
  conform:     { label: 'Conform',     color: '#059669', bg: '#D1FAE5' },
  non_conform: { label: 'Non-conform', color: '#DC2626', bg: '#FEE2E2' },
}

export const CONFORMITY_META: Record<Conformity, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',                color: '#64748B', bg: '#F1F5F9' },
  conform:  { label: 'Conform',                color: '#059669', bg: '#D1FAE5' },
  minor_nc: { label: 'Minor non-conformity',   color: '#D97706', bg: '#FEF3C7' },
  major_nc: { label: 'Major non-conformity',   color: '#DC2626', bg: '#FEE2E2' },
}

export const CB_DECISION_META: Record<CbDecision, { label: string; color: string; bg: string }> = {
  pending:                 { label: 'Decision pending',        color: '#64748B', bg: '#F1F5F9' },
  certified:               { label: 'Certified',               color: '#059669', bg: '#D1FAE5' },
  certified_rectification: { label: 'Certified · rectification',color: '#65A30D', bg: '#ECFCCB' },
  not_certified:           { label: 'Not certified',           color: '#DC2626', bg: '#FEE2E2' },
}
