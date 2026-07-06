import { createClient } from '@supabase/supabase-js'

// Server-only service-role client — bypasses RLS. Use for privileged tasks like
// creating signed download URLs. NEVER import this from client components.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
