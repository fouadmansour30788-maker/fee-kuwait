import { createClient } from '@/lib/supabase/server'
import type { AppRow } from './applications'

export interface AuditorUser { id: string; name_en: string | null; email: string }

// Users with the auditor role (operator picks from these).
export async function listAuditors(): Promise<AuditorUser[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('users').select('id, name_en, email').eq('role', 'auditor').order('name_en')
  if (error) { console.error('listAuditors:', error.message); return [] }
  return (data ?? []) as AuditorUser[]
}

// Applications assigned to the signed-in auditor (RLS returns only their own).
export async function auditorApplications(): Promise<AppRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('id, programme, status, entity_type, submitted_at, review_deadline, applicant:users!applicant_id(email, name_en)')
    .order('submitted_at', { ascending: false })
  if (error) { console.error('auditorApplications:', error.message); return [] }
  return (data ?? []) as unknown as AppRow[]
}

// The auditor currently assigned to an application (for the operator view).
export async function applicationAuditor(applicationId: string): Promise<AuditorUser | null> {
  const supabase = createClient()
  const { data } = await supabase.from('applications').select('auditor_id').eq('id', applicationId).single()
  if (!data?.auditor_id) return null
  const { data: u } = await supabase.from('users').select('id, name_en, email').eq('id', data.auditor_id).single()
  return (u ?? null) as AuditorUser | null
}
