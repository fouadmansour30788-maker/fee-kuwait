'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { can } from '@/lib/permissions-server'
import { revalidatePath } from 'next/cache'

// Create a new auditor account. Available to the Certification Body (and the
// National Operator / Super Admin) when they hold the `create_auditor`
// capability. Always creates the `auditor` role — never any other role — so the
// CB cannot escalate. Returns a temporary password to share with the auditor.
export async function cbCreateAuditor(input: { email: string; name: string }): Promise<{ ok?: true; error?: string; tempPassword?: string }> {
  const email = input.email?.trim().toLowerCase()
  const name = input.name?.trim()
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Enter a valid email' }

  // Role gate: certification_body, admin, or super_admin only.
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['certification_body', 'admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' }

  // Capability gate (toggleable per role from the Team page).
  if (!(await can('create_auditor'))) return { error: 'You do not have permission to create auditor accounts.' }

  const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  const admin = createAdminClient()
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name, role: 'auditor', lang: 'en' },
  })
  if (error) return { error: error.message }

  if (created.user?.id) {
    await admin.from('users').update({ role: 'auditor', name_en: name || null, updated_at: new Date().toISOString() }).eq('id', created.user.id)
  }

  revalidatePath('/cb/auditors')
  revalidatePath('/staff')
  return { ok: true, tempPassword }
}
