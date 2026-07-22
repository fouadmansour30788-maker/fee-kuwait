'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ROLE_LABEL } from '@/lib/roles'

interface Me { name: string; email: string; role: string }

// Header avatar that opens the signed-in user's profile details and a sign-out
// action. Loads the current user itself so any layout can drop it in.
export default function ProfileMenu({ accent = '#40916C', textColor = '#fff' }: { accent?: string; textColor?: string }) {
  const [me, setMe] = useState<Me | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let alive = true
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !alive) return
      const { data } = await supabase.from('users').select('name_en, email, role').eq('id', user.id).maybeSingle()
      if (!alive) return
      setMe({
        name: data?.name_en || user.email?.split('@')[0] || 'Account',
        email: data?.email || user.email || '',
        role: data?.role || '',
      })
    })()
    return () => { alive = false }
  }, [])

  async function signOut() {
    setBusy(true)
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initial = (me?.name || me?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} title={me?.name ?? 'Account'}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-transform hover:scale-105"
        style={{ background: `linear-gradient(135deg, ${accent}, #40916C)`, color: textColor }}>
        {initial}
      </button>

      {open && (
        <>
          <button className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-lg z-50 overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
            <div className="p-4" style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${accent}, #40916C)`, color: textColor }}>{initial}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: '#1E293B' }}>{me?.name ?? '—'}</p>
                  <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{me?.email ?? ''}</p>
                </div>
              </div>
              {me?.role && (
                <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
                  style={{ background: '#ECFDF3', color: '#047857' }}>{ROLE_LABEL[me.role] ?? me.role}</span>
              )}
            </div>
            <button onClick={signOut} disabled={busy}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-left transition-colors hover:bg-slate-50 disabled:opacity-60"
              style={{ color: '#B91C1C' }}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
