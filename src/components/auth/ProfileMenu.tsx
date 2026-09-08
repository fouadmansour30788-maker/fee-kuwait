'use client'

import { useEffect, useState } from 'react'
import { LogOut, Loader2, KeyRound, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ROLE_LABEL } from '@/lib/roles'

interface Me { name: string; email: string; role: string }

// Header avatar that opens the signed-in user's profile details and a sign-out
// action. Loads the current user itself so any layout can drop it in.
export default function ProfileMenu({ accent = '#40916C', textColor = '#fff' }: { accent?: string; textColor?: string }) {
  const [me, setMe] = useState<Me | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [view, setView] = useState<'menu' | 'password'>('menu')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok?: boolean; text: string } | null>(null)

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
    try { await createClient().auth.signOut() } catch { /* ignore */ }
    // Hard navigation guarantees the cleared session cookie is picked up server-side.
    window.location.href = '/login'
  }

  function closeMenu() {
    setOpen(false)
    setView('menu'); setPw(''); setPw2(''); setPwMsg(null)
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (pw.length < 8) { setPwMsg({ text: 'Use at least 8 characters.' }); return }
    if (pw !== pw2) { setPwMsg({ text: 'Passwords do not match.' }); return }
    setPwBusy(true)
    try {
      const { error } = await createClient().auth.updateUser({ password: pw })
      if (error) setPwMsg({ text: error.message })
      else { setPwMsg({ ok: true, text: 'Password updated.' }); setPw(''); setPw2('') }
    } catch {
      setPwMsg({ text: 'Could not update password. Try again.' })
    } finally {
      setPwBusy(false)
    }
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
          <button className="fixed inset-0 z-40 cursor-default" onClick={closeMenu} aria-label="Close menu" />
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

            {view === 'menu' ? (
              <>
                <button onClick={() => { setView('password'); setPwMsg(null) }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-left transition-colors hover:bg-slate-50"
                  style={{ color: '#334155' }}>
                  <KeyRound className="w-4 h-4" style={{ color: accent }} /> Change password
                </button>
                <button onClick={signOut} disabled={busy}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-left transition-colors hover:bg-slate-50 disabled:opacity-60 border-t"
                  style={{ color: '#B91C1C', borderColor: '#F1F5F9' }}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Sign out
                </button>
              </>
            ) : (
              <form onSubmit={changePassword} className="p-4 space-y-2.5">
                <button type="button" onClick={() => { setView('menu'); setPwMsg(null) }}
                  className="flex items-center gap-1 text-xs font-semibold mb-1" style={{ color: '#64748B' }}>
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" autoComplete="new-password"
                  className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
                <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Confirm new password" autoComplete="new-password"
                  className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
                {pwMsg && (
                  <p className="flex items-center gap-1.5 text-xs" style={{ color: pwMsg.ok ? '#047857' : '#DC2626' }}>
                    {pwMsg.ok ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />} {pwMsg.text}
                  </p>
                )}
                <button type="submit" disabled={pwBusy}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${accent}, #40916C)` }}>
                  {pwBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Update password
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  )
}
