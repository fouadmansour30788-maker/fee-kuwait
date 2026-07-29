import { createClient } from '@/lib/supabase/server'
import { WF_STATUS_META } from '@/lib/workflow'

export interface AppRow {
  id: string
  programme: string
  status: string
  entity_type: string | null
  submitted_at: string
  review_deadline: string | null
  applicant: { email: string | null; name_en: string | null } | null
}

// Operator view (RLS: admins see all; applicants see their own).
export async function listApplications(): Promise<AppRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('id, programme, status, entity_type, submitted_at, review_deadline, applicant:users!applicant_id(email, name_en)')
    .order('submitted_at', { ascending: false })
  if (error) {
    console.error('listApplications:', error.message)
    return []
  }
  return (data ?? []) as unknown as AppRow[]
}

// Counts for the operator dashboard.
export async function operatorStats(): Promise<{ apps: AppRow[]; members: number }> {
  const supabase = createClient()
  const apps = await listApplications()
  const [schools, businesses] = await Promise.all([
    supabase.from('schools').select('id', { count: 'exact', head: true }),
    supabase.from('businesses').select('id', { count: 'exact', head: true }),
  ])
  return { apps, members: (schools.count ?? 0) + (businesses.count ?? 0) }
}

export const PROGRAMME_LABEL: Record<string, string> = {
  'eco-schools': 'Eco-Schools',
  'blue-flag': 'Blue Flag',
  'green-key': 'Green Key',
  'leaf': 'LEAF',
  'yre': 'YRE',
  'eco-campus': 'Eco-Campus',
}

// Friendly label + colour for the (many) possible statuses; falls back to the raw
// value. Legacy statuses (pre-Stage-2 data) are kept alongside the whiteboard
// lifecycle (WF_STATUS_META) so historical rows still render.
export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  new:                    { label: 'New',                 color: '#2563EB', bg: '#DBEAFE' },
  under_review:           { label: 'Under Review',        color: '#7C3AED', bg: '#EDE9FE' },
  documents_pending:      { label: 'Documents Pending',   color: '#D97706', bg: '#FEF3C7' },
  site_visit_scheduled:   { label: 'Site Visit Scheduled',color: '#0891B2', bg: '#CFFAFE' },
  audit:                  { label: 'Under Audit',         color: '#0891B2', bg: '#CFFAFE' },
  revision:               { label: 'In Revision',         color: '#B45309', bg: '#FEF3C7' },
  cb_review:              { label: 'CB Review',           color: '#B45309', bg: '#FEF3C7' },
  approved:               { label: 'Approved',            color: '#059669', bg: '#D1FAE5' },
  rejected:               { label: 'Rejected',            color: '#DC2626', bg: '#FEE2E2' },
  certified:              { label: 'Certified',           color: '#059669', bg: '#D1FAE5' },
  certified_rectification:{ label: 'Certified · rectification', color: '#B45309', bg: '#FEF3C7' },
  not_certified:          { label: 'Not Certified',       color: '#DC2626', bg: '#FEE2E2' },
  ...WF_STATUS_META,
}

export function statusMeta(status: string) {
  return STATUS_META[status] ?? { label: status.replace(/_/g, ' '), color: '#475569', bg: '#F1F5F9' }
}

export interface TrailEntry {
  id: string
  field: string
  previousValue: string | null
  newValue: string | null
  userName: string | null
  userRole: string | null
  createdAt: string
}

// The traceability trail for an application (RLS: admins all; assigned auditor/CB).
export async function listAuditTrail(applicationId: string): Promise<TrailEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('audit_trail')
    .select('id, field, previous_value, new_value, user_name, user_role, created_at')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })
  if (error) { console.error('listAuditTrail:', error.message); return [] }
  return (data ?? []).map((r) => ({
    id: r.id, field: r.field, previousValue: r.previous_value ?? null, newValue: r.new_value ?? null,
    userName: r.user_name ?? null, userRole: r.user_role ?? null, createdAt: r.created_at,
  }))
}

// Statuses an operator can set from the review screen. 'cb_review' hands the
// application to the Certification Body — it locks for the establishment while
// the CB decides to assign an auditor or return it for rectification.
export const OPERATOR_STATUSES = ['new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'cb_review', 'approved', 'rejected']

// Statuses at which the auditor's per-criterion results are finalised (audit handed
// off to the CB, or a decision recorded) and may be shown to the establishment.
// During 'audit' the grading is still a draft, so it stays hidden from the applicant.
export const AUDIT_PUBLISHED_STATUSES = ['cb_review', 'revision', 'approved', 'certified', 'certified_rectification', 'not_certified', 'rejected']

// While the application is with the establishment/operator (pre-audit) — or re-opened
// for revision — the establishment can edit its board (self-assessment, evidence,
// comments). Once submitted to the CB / audit begins, the board locks read-only.
export const ESTABLISHMENT_EDITABLE_STATUSES = ['new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'revision']

export interface AppDetail {
  id: string
  applicant_id: string
  programme: string
  status: string
  entity_type: string | null
  submitted_at: string
  review_deadline: string | null
  review_notes: string | null
  rejection_reason: string | null
  cb_decision: string | null
  cb_note: string | null
  revision_deadline: string | null
  applicant: { email: string | null; name_en: string | null; name_ar: string | null } | null
}

export async function getApplication(id: string): Promise<AppDetail | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('id, applicant_id, programme, status, entity_type, submitted_at, review_deadline, review_notes, rejection_reason, cb_decision, cb_note, revision_deadline, applicant:users!applicant_id(email, name_en, name_ar)')
    .eq('id', id)
    .single()
  if (error) { console.error('getApplication:', error.message); return null }
  return data as unknown as AppDetail
}

// Human labels for the CB decision.
export const CB_DECISION_LABEL: Record<string, string> = {
  certified: 'Certified',
  certified_rectification: 'Certified — subject to rectification',
  not_certified: 'Not certified',
}
