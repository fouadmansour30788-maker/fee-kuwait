import { createClient } from '@/lib/supabase/server'

export interface TrackerRow {
  id: string
  entityName: string
  kind: 'School' | 'Establishment' | '—'
  type: string | null
  governorate: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  registrationStatus: string | null
  registeredAt: string | null
  programme: string
  status: string
  auditorName: string | null
  cbName: string | null
  cbDecision: string | null
  submittedAt: string | null
  applicantEmail: string | null
}

// One row per application, joined to the establishment's registration details
// (schools/businesses), the assigned auditor, and the certification body.
// Admin-only via RLS (is_staff can read all four tables).
export async function listTracker(): Promise<TrackerRow[]> {
  const supabase = createClient()

  const { data: apps, error } = await supabase
    .from('applications')
    .select('id, entity_id, entity_type, programme, status, auditor_id, cb_id, cb_decision, submitted_at, applicant:users!applicant_id(email, name_en)')
    .order('submitted_at', { ascending: false })
  if (error) { console.error('listTracker apps:', error.message); return [] }
  const rows = apps ?? []

  const [{ data: schools }, { data: businesses }] = await Promise.all([
    supabase.from('schools').select('id, name_en, type, governorate, principal_name, principal_email, principal_phone, status, created_at'),
    supabase.from('businesses').select('id, name_en, type, governorate, contact_name, contact_email, contact_phone, status, created_at'),
  ])
  const schoolMap = new Map((schools ?? []).map((s) => [s.id, s]))
  const bizMap = new Map((businesses ?? []).map((b) => [b.id, b]))

  // Resolve auditor + CB names in one lookup.
  const userIds = Array.from(new Set(rows.flatMap((a) => [a.auditor_id, a.cb_id]).filter(Boolean) as string[]))
  const userMap = new Map<string, string>()
  if (userIds.length) {
    const { data: users } = await supabase.from('users').select('id, name_en, email').in('id', userIds)
    for (const u of users ?? []) userMap.set(u.id, u.name_en || u.email)
  }

  return rows.map((a) => {
    const applicant = Array.isArray(a.applicant) ? a.applicant[0] : a.applicant
    const school = a.entity_type === 'school' && a.entity_id ? schoolMap.get(a.entity_id) : undefined
    const biz = a.entity_type === 'business' && a.entity_id ? bizMap.get(a.entity_id) : undefined

    const base = {
      id: a.id,
      programme: a.programme,
      status: a.status,
      auditorName: a.auditor_id ? userMap.get(a.auditor_id) ?? null : null,
      cbName: a.cb_id ? userMap.get(a.cb_id) ?? null : null,
      cbDecision: a.cb_decision ?? null,
      submittedAt: a.submitted_at ?? null,
      applicantEmail: applicant?.email ?? null,
    }

    if (school) return {
      ...base, entityName: school.name_en, kind: 'School' as const, type: school.type, governorate: school.governorate,
      contactName: school.principal_name, contactEmail: school.principal_email, contactPhone: school.principal_phone,
      registrationStatus: school.status, registeredAt: school.created_at,
    }
    if (biz) return {
      ...base, entityName: biz.name_en, kind: 'Establishment' as const, type: biz.type, governorate: biz.governorate,
      contactName: biz.contact_name, contactEmail: biz.contact_email, contactPhone: biz.contact_phone,
      registrationStatus: biz.status, registeredAt: biz.created_at,
    }
    return {
      ...base, entityName: applicant?.name_en || applicant?.email || '—', kind: '—' as const, type: null, governorate: null,
      contactName: null, contactEmail: applicant?.email ?? null, contactPhone: null, registrationStatus: null, registeredAt: null,
    }
  })
}
