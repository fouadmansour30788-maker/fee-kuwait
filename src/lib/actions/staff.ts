'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ROLES, STAFF_ROLES } from '@/lib/roles'
import { revalidatePath } from 'next/cache'

async function requireOperator() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' as const }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' as const }
  return { ok: true as const }
}

// Create a new team member (auditor / certification body / operator) directly from
// the Team page — no Supabase console needed. Runs with the service role; returns a
// generated temporary password the operator shares with the new member.
export async function addTeamMember(input: { email: string; name: string; role: string }): Promise<{ ok?: true; error?: string; tempPassword?: string }> {
  const email = input.email?.trim().toLowerCase()
  const name = input.name?.trim()
  const role = input.role
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Enter a valid email' }
  if (!STAFF_ROLES.includes(role)) return { error: 'Invalid role' }

  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }

  const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  const admin = createAdminClient()
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name, role, lang: 'en' },
  })
  if (error) return { error: error.message }

  // Ensure the profile row carries the chosen role + name (the signup trigger reads
  // metadata, but we set it explicitly to be safe).
  if (created.user?.id) {
    await admin.from('users').update({ role, name_en: name || null, updated_at: new Date().toISOString() }).eq('id', created.user.id)
  }

  revalidatePath('/staff')
  return { ok: true, tempPassword }
}

// Remove a team member's account entirely (auth user + profile via cascade).
// Operator-gated; you can't remove yourself.
export async function removeTeamMember(userId: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  if (user.id === userId) return { error: "You can't remove yourself" }
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  revalidatePath('/staff')
  return { ok: true }
}

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
