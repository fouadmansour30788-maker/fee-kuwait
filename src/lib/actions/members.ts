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

// The Certification Body assigns a Green Key number to an approved registration
// by entering it manually (the operator does not — they only see the synced
// result). The number must be unique across establishments and schools.
export async function assignGreenKeyNumber(kind: 'School' | 'Establishment', id: string, number: string): Promise<{ ok?: true; error?: string; number?: string }> {
  const value = number?.trim()
  if (!value) return { error: 'Enter a Green Key number.' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['certification_body', 'super_admin'].includes(me.role)) return { error: 'Only the Certification Body can assign a Green Key number.' }

  const admin = createAdminClient()
  const table = kind === 'School' ? 'schools' : 'businesses'
  const { data: row } = await admin.from(table).select('status').eq('id', id).single()
  if (!row) return { error: 'Registration not found' }
  if (row.status !== 'active') return { error: 'Approve the registration first' }

  // Enforce uniqueness across both entity tables (excluding this row itself).
  const [biz, sch] = await Promise.all([
    admin.from('businesses').select('id').eq('green_key_number', value),
    admin.from('schools').select('id').eq('green_key_number', value),
  ])
  const bizClash = (biz.data ?? []).some((r) => !(table === 'businesses' && r.id === id))
  const schClash = (sch.data ?? []).some((r) => !(table === 'schools' && r.id === id))
  if (bizClash || schClash) return { error: 'That Green Key number is already in use.' }

  const { error } = await admin.from(table).update({ green_key_number: value, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/members')
  revalidatePath('/cb/registrations')
  return { ok: true, number: value }
}
