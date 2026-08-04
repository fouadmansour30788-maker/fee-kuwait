'use client'

import { createClient } from '@/lib/supabase/client'

export default function SignOutButton({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  async function signOut() {
    try { await createClient().auth.signOut() } catch { /* ignore */ }
    // Hard navigation guarantees the cleared session cookie is picked up server-side.
    window.location.href = '/login'
  }
  return (
    <button onClick={signOut} className={className} style={style} type="button">
      {children}
    </button>
  )
}
