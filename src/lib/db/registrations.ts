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
}

// All registration form data submitted by establishments and schools — for the
// operator's registration-info table. Staff-only via RLS on both tables.
export async function listRegistrationsFull(): Promise<RegistrationFull[]> {
  const supabase = createClient()
  const [{ data: biz }, { data: sch }] = await Promise.all([
    supabase.from('businesses').select('id, name_en, name_ar, type, governorate, address, status, green_key_number, contact_name, contact_email, contact_phone, details, created_at'),
    supabase.from('schools').select('id, name_en, name_ar, type, governorate, address, status, green_key_number, principal_name, principal_email, principal_phone, students_count, details, created_at'),
  ])

  const rows: RegistrationFull[] = []
  for (const b of biz ?? []) rows.push({
    id: b.id, kind: 'Establishment', name: b.name_en, nameAr: b.name_ar ?? null, type: b.type ?? null,
    governorate: b.governorate ?? null, address: b.address ?? null, status: b.status ?? null, greenKeyNumber: b.green_key_number ?? null,
    contactName: b.contact_name ?? null, contactEmail: b.contact_email ?? null, contactPhone: b.contact_phone ?? null,
    studentsCount: null, details: (b.details ?? {}) as Record<string, unknown>, createdAt: b.created_at ?? null,
  })
  for (const s of sch ?? []) rows.push({
    id: s.id, kind: 'School', name: s.name_en, nameAr: s.name_ar ?? null, type: s.type ?? null,
    governorate: s.governorate ?? null, address: s.address ?? null, status: s.status ?? null, greenKeyNumber: s.green_key_number ?? null,
    contactName: s.principal_name ?? null, contactEmail: s.principal_email ?? null, contactPhone: s.principal_phone ?? null,
    studentsCount: s.students_count ?? null, details: (s.details ?? {}) as Record<string, unknown>, createdAt: s.created_at ?? null,
  })
  return rows.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
}
