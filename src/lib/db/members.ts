import { createClient } from '@/lib/supabase/server'

export interface Member {
  id: string
  kind: 'School' | 'Establishment'
  name: string
  type: string | null
  governorate: string | null
  status: string | null
}

// Operator view of all registered schools + establishments (RLS: admins see all).
export async function listMembers(): Promise<Member[]> {
  const supabase = createClient()
  const [s, b] = await Promise.all([
    supabase.from('schools').select('id, name_en, type, governorate, status').order('name_en'),
    supabase.from('businesses').select('id, name_en, type, governorate, status').order('name_en'),
  ])
  if (s.error) console.error('listMembers schools:', s.error.message)
  if (b.error) console.error('listMembers businesses:', b.error.message)
  const schools: Member[] = (s.data ?? []).map((r) => ({ id: r.id, kind: 'School', name: r.name_en, type: r.type, governorate: r.governorate, status: r.status }))
  const biz: Member[] = (b.data ?? []).map((r) => ({ id: r.id, kind: 'Establishment', name: r.name_en, type: r.type, governorate: r.governorate, status: r.status }))
  return [...schools, ...biz].sort((a, b2) => a.name.localeCompare(b2.name))
}

export const MEMBER_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7' },
  active:    { label: 'Active',    color: '#059669', bg: '#D1FAE5' },
  suspended: { label: 'Suspended', color: '#DC2626', bg: '#FEE2E2' },
  inactive:  { label: 'Inactive',  color: '#64748B', bg: '#F1F5F9' },
}
