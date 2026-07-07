'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const STATUSES = ['pending', 'active', 'suspended', 'inactive']

// Operator approves / suspends a registered member. Written with the service role
// (staff-gated in code) so no extra RLS policy on schools/businesses is needed.
export async function setMemberStatus(kind: 'School' | 'Establishment', id: string, status: string): Promise<{ ok?: true; error?: string }> {
  if (!STATUSES.includes(status)) return { error: 'Invalid status' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' }

  const admin = createAdminClient()
  const table = kind === 'School' ? 'schools' : 'businesses'
  const { error } = await admin.from(table).update({ status, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/members')
  revalidatePath('/dashboard')
  return { ok: true }
}
