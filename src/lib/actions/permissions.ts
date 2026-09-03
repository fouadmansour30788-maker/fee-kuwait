'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { CAPABILITY_BY_ID, STAFF_ROLE_ORDER, type StaffRole } from '@/lib/permissions'

// Only the National Operator / Super Admin may change the matrix.
async function requireOperator() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' as const }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' as const }
  return { ok: true as const }
}

// Grant or revoke a grantable capability for a staff role. Non-grantable
// capabilities and unknown roles/capabilities are rejected.
export async function setRolePermission(
  role: string,
  capability: string,
  granted: boolean,
): Promise<{ ok?: true; error?: string }> {
  const cap = CAPABILITY_BY_ID[capability]
  if (!cap) return { error: 'Unknown capability' }
  if (!cap.grantable) return { error: 'This capability cannot be changed' }
  if (role === 'super_admin') return { error: 'Super Admin always has every capability' }
  if (!STAFF_ROLE_ORDER.includes(role as StaffRole)) return { error: 'Unknown role' }

  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }

  const admin = createAdminClient()
  const { error } = await admin.from('role_permissions').upsert(
    { role, capability, granted, updated_at: new Date().toISOString() },
    { onConflict: 'role,capability' },
  )
  if (error) return { error: error.message }

  revalidatePath('/staff')
  return { ok: true }
}
