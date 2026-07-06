import { createClient } from '@/lib/supabase/server'
import type { Role, CurrentUser } from '@/lib/auth'

// Server-only: uses next/headers via the server Supabase client. Import this
// from Server Components / route handlers / server actions — never from a
// client component (that would pull next/headers into the client bundle).
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('users')
    .select('role, name_en, name_ar')
    .eq('id', user.id)
    .single()
  return {
    id: user.id,
    email: user.email ?? null,
    role: (profile?.role ?? 'school') as Role,
    nameEn: profile?.name_en ?? null,
    nameAr: profile?.name_ar ?? null,
  }
}
