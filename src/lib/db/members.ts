import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface Member {
  id: string
  kind: 'School' | 'Establishment'
  name: string
  type: string | null
  governorate: string | null
  status: string | null
  green_key_number: string | null
}

async function readMembers(db: SupabaseClient): Promise<Member[]> {
  const [s, b] = await Promise.all([
    db.from('schools').select('id, name_en, type, governorate, status, green_key_number').order('name_en'),
    db.from('businesses').select('id, name_en, type, governorate, status, green_key_number').order('name_en'),
  ])
  if (s.error) console.error('readMembers schools:', s.error.message)
  if (b.error) console.error('readMembers businesses:', b.error.message)
  const schools: Member[] = (s.data ?? []).map((r) => ({ id: r.id, kind: 'School', name: r.name_en, type: r.type, governorate: r.governorate, status: r.status, green_key_number: r.green_key_number }))
  const biz: Member[] = (b.data ?? []).map((r) => ({ id: r.id, kind: 'Establishment', name: r.name_en, type: r.type, governorate: r.governorate, status: r.status, green_key_number: r.green_key_number }))
  return [...schools, ...biz].sort((a, b2) => a.name.localeCompare(b2.name))
}

// Operator view of all registered schools + establishments (RLS: admins see all).
export async function listMembers(): Promise<Member[]> {
  return readMembers(createClient())
}

// Certification Body view — the CB isn't staff, so read with the service role.
// Only reached from the role-gated /cb pages.
export async function listRegistrations(): Promise<Member[]> {
  return readMembers(createAdminClient())
}

export const MEMBER_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7' },
  active:    { label: 'Active',    color: '#059669', bg: '#D1FAE5' },
  suspended: { label: 'Suspended', color: '#DC2626', bg: '#FEE2E2' },
  inactive:  { label: 'Inactive',  color: '#64748B', bg: '#F1F5F9' },
}
