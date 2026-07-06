import { createClient } from '@/lib/supabase/server'

export interface AppUser {
  id: string
  email: string
  name_en: string | null
  role: string
  created_at: string
}

// Operator: list all users (is_staff RLS allows admins to view all).
export async function listUsers(): Promise<AppUser[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name_en, role, created_at')
    .order('created_at', { ascending: false })
  if (error) { console.error('listUsers:', error.message); return [] }
  return (data ?? []) as AppUser[]
}
