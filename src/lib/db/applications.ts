import { createClient } from '@/lib/supabase/server'

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

// Friendly label + colour for the (many) possible statuses; falls back to the raw value.
export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  new:                    { label: 'New',                 color: '#2563EB', bg: '#DBEAFE' },
  under_review:           { label: 'Under Review',        color: '#7C3AED', bg: '#EDE9FE' },
  documents_pending:      { label: 'Documents Pending',   color: '#D97706', bg: '#FEF3C7' },
  site_visit_scheduled:   { label: 'Site Visit Scheduled',color: '#0891B2', bg: '#CFFAFE' },
  audit:                  { label: 'Under Audit',         color: '#0891B2', bg: '#CFFAFE' },
  approved:               { label: 'Approved',            color: '#059669', bg: '#D1FAE5' },
  rejected:               { label: 'Rejected',            color: '#DC2626', bg: '#FEE2E2' },
  certified:              { label: 'Certified',           color: '#059669', bg: '#D1FAE5' },
  not_certified:          { label: 'Not Certified',       color: '#DC2626', bg: '#FEE2E2' },
}

export function statusMeta(status: string) {
  return STATUS_META[status] ?? { label: status.replace(/_/g, ' '), color: '#475569', bg: '#F1F5F9' }
}

// Statuses an operator can set from the review screen.
export const OPERATOR_STATUSES = ['new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'approved', 'rejected']

export interface AppDetail {
  id: string
  programme: string
  status: string
  entity_type: string | null
  submitted_at: string
  review_deadline: string | null
  review_notes: string | null
  rejection_reason: string | null
  applicant: { email: string | null; name_en: string | null; name_ar: string | null } | null
}

export async function getApplication(id: string): Promise<AppDetail | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('id, programme, status, entity_type, submitted_at, review_deadline, review_notes, rejection_reason, applicant:users!applicant_id(email, name_en, name_ar)')
    .eq('id', id)
    .single()
  if (error) { console.error('getApplication:', error.message); return null }
  return data as unknown as AppDetail
}
