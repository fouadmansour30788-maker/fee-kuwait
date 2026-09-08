import { createClient } from '@/lib/supabase/server'

export interface AppUser {
  id: string
  email: string
  name_en: string | null
  role: string
  cb_scope: string | null
  created_at: string
}

// Operator: list all users (is_staff RLS allows admins to view all).
export async function listUsers(): Promise<AppUser[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name_en, role, cb_scope, created_at')
    .order('created_at', { ascending: false })
  if (!error) return (data ?? []) as AppUser[]

  // Fallback if the cb_scope column isn't present yet (migration 041 not run):
  // never let a missing column blank the whole team list.
  const res = await supabase
    .from('users')
    .select('id, email, name_en, role, created_at')
    .order('created_at', { ascending: false })
  if (res.error) { console.error('listUsers:', res.error.message); return [] }
  return (res.data ?? []).map((u) => ({ ...u, cb_scope: null })) as AppUser[]
}
