'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ROLES } from '@/lib/roles'
import { revalidatePath } from 'next/cache'

// Change a user's role. Gated to staff (admin/super_admin); the actual update
// runs with the service role because updating *another* user's row is not
// permitted by the users RLS.
export async function setUserRole(userId: string, role: string): Promise<{ ok?: true; error?: string }> {
  if (!ROLES.includes(role)) return { error: 'Invalid role' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' }

  const admin = createAdminClient()
  const { error } = await admin.from('users').update({ role, updated_at: new Date().toISOString() }).eq('id', userId)
  if (error) return { error: error.message }

  revalidatePath('/staff')
  return { ok: true }
}
