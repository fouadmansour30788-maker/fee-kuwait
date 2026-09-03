import { getCurrentUser } from '@/lib/auth-server'
import { getPermissionOverrides } from '@/lib/db/permissions'
import { resolveCan, type CapabilityId } from '@/lib/permissions'

// Server-only capability check for the current signed-in user. Import from Server
// Components, route handlers, and server actions — never a client component.
export async function can(capability: CapabilityId): Promise<boolean> {
  const [user, overrides] = await Promise.all([getCurrentUser(), getPermissionOverrides()])
  if (!user) return false
  return resolveCan(user.role, capability, overrides)
}

// Throwing variant for server actions: returns an { error } bag when denied so
// callers can short-circuit with the existing action-result convention.
export async function requireCapability(
  capability: CapabilityId,
): Promise<{ ok: true } | { error: string }> {
  return (await can(capability)) ? { ok: true } : { error: 'You do not have permission to do this.' }
}
