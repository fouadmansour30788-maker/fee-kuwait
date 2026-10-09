import { createClient } from '@/lib/supabase/server'

export interface RegistrationFull {
  id: string
  kind: 'Establishment' | 'School'
  name: string
  nameAr: string | null
  type: string | null
  governorate: string | null
  address: string | null
  status: string | null
  greenKeyNumber: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  studentsCount: number | null
  details: Record<string, unknown>
  createdAt: string | null
  accountEmail: string | null
  accountName: string | null
  programmes: string[]
}

const OWNER = 'user_id, owner:users!user_id(email, name_en)'
const BIZ_COLS = `id, name_en, name_ar, type, governorate, address, status, green_key_number, contact_name, contact_email, contact_phone, details, created_at, ${OWNER}`
const SCHOOL_COLS = `id, name_en, name_ar, type, governorate, address, status, green_key_number, principal_name, principal_email, principal_phone, students_count, details, created_at, ${OWNER}`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>
const owner = (r: Row): { email?: string; name_en?: string } => (Array.isArray(r.owner) ? r.owner[0] : r.owner) ?? {}
const account = (r: Row, programmes: string[]) => ({
  accountEmail: owner(r).email ?? null,
  accountName: (r.details?.accountName as string | undefined) ?? null,
  programmes,
})
const fromBusiness = (b: Row, programmes: string[] = []): RegistrationFull => ({
  ...account(b, programmes),
  id: b.id, kind: 'Establishment', name: b.name_en, nameAr: b.name_ar ?? null, type: b.type ?? null,
  governorate: b.governorate ?? null, address: b.address ?? null, status: b.status ?? null, greenKeyNumber: b.green_key_number ?? null,
  contactName: b.contact_name ?? null, contactEmail: b.contact_email ?? null, contactPhone: b.contact_phone ?? null,
  studentsCount: null, details: (b.details ?? {}) as Record<string, unknown>, createdAt: b.created_at ?? null,
})
const fromSchool = (s: Row, programmes: string[] = []): RegistrationFull => ({
  ...account(s, programmes),
  id: s.id, kind: 'School', name: s.name_en, nameAr: s.name_ar ?? null, type: s.type ?? null,
  governorate: s.governorate ?? null, address: s.address ?? null, status: s.status ?? null, greenKeyNumber: s.green_key_number ?? null,
  contactName: s.principal_name ?? null, contactEmail: s.principal_email ?? null, contactPhone: s.principal_phone ?? null,
  studentsCount: s.students_count ?? null, details: (s.details ?? {}) as Record<string, unknown>, createdAt: s.created_at ?? null,
})

// All registration form data submitted by establishments and schools — for the
// operator's registration-info table. Staff-only via RLS on both tables.
export async function listRegistrationsFull(): Promise<RegistrationFull[]> {
  const supabase = createClient()
  const [{ data: biz }, { data: sch }, { data: apps }] = await Promise.all([
    supabase.from('businesses').select(BIZ_COLS),
    supabase.from('schools').select(SCHOOL_COLS),
    supabase.from('applications').select('applicant_id, programme'),
  ])
  const progs = new Map<string, string[]>()
  for (const a of apps ?? []) progs.set(a.applicant_id, [...(progs.get(a.applicant_id) ?? []), a.programme])

  const rows: RegistrationFull[] = [
    ...((biz ?? []) as Row[]).map((b) => fromBusiness(b, progs.get(b.user_id))),
    ...((sch ?? []) as Row[]).map((s) => fromSchool(s, progs.get(s.user_id))),
  ]
  return rows.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
}

// The registration form behind one application — shown to the operator on the
// application page. Looks up by entity id, falling back to the applicant's user id.
export async function getRegistrationForApplication(
  entityType: string | null, entityId: string | null, applicantId: string,
): Promise<RegistrationFull | null> {
  const supabase = createClient()
  const isSchool = entityType === 'school'
  const table = isSchool ? 'schools' : 'businesses'
  const q = supabase.from(table).select(isSchool ? SCHOOL_COLS : BIZ_COLS)
  const { data, error } = await (entityId ? q.eq('id', entityId) : q.eq('user_id', applicantId)).maybeSingle()
  if (error) { console.error('getRegistrationForApplication:', error.message); return null }
  if (!data) return null
  const { data: apps } = await supabase.from('applications').select('programme').eq('applicant_id', (data as Row).user_id)
  const programmes = (apps ?? []).map((a) => a.programme as string)
  return isSchool ? fromSchool(data as Row, programmes) : fromBusiness(data as Row, programmes)
}
