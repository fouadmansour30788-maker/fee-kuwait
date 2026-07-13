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

// Operator OR Certification Body assigns a unique Green Key number to an approved
// registration. Idempotent — returns the existing number if one is already set.
export async function assignGreenKeyNumber(kind: 'School' | 'Establishment', id: string): Promise<{ ok?: true; error?: string; number?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin', 'certification_body'].includes(me.role)) return { error: 'Not allowed' }

  const admin = createAdminClient()
  const table = kind === 'School' ? 'schools' : 'businesses'
  const { data: row } = await admin.from(table).select('green_key_number, status').eq('id', id).single()
  if (!row) return { error: 'Registration not found' }
  if (row.status !== 'active') return { error: 'Approve the registration first' }
  if (row.green_key_number) return { ok: true, number: row.green_key_number }

  const [{ count: bc }, { count: sc }] = await Promise.all([
    admin.from('businesses').select('id', { count: 'exact', head: true }).not('green_key_number', 'is', null),
    admin.from('schools').select('id', { count: 'exact', head: true }).not('green_key_number', 'is', null),
  ])
  const number = `GK-KW-${new Date().getFullYear()}-${String((bc ?? 0) + (sc ?? 0) + 1).padStart(4, '0')}`
  const { error } = await admin.from(table).update({ green_key_number: number, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/members')
  revalidatePath('/cb/registrations')
  return { ok: true, number }
}
