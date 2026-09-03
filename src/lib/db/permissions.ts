import { createClient } from '@/lib/supabase/server'
import { permKey } from '@/lib/permissions'

// Fetch the per-role permission overrides as a map of `${role}:${capability}` → granted.
// Missing table or read error resolves to an empty map (code defaults apply).
export async function getPermissionOverrides(): Promise<Record<string, boolean>> {
  const supabase = createClient()
  const { data, error } = await supabase.from('role_permissions').select('role, capability, granted')
  if (error || !data) return {}
  const map: Record<string, boolean> = {}
  for (const row of data) map[permKey(row.role, row.capability)] = row.granted
  return map
}
