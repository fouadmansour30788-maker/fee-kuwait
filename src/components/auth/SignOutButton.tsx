'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const router = useRouter()
  async function signOut() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <button onClick={signOut} className={className} style={style} type="button">
      {children}
    </button>
  )
}
