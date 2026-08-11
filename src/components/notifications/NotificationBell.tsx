'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Notif { id: string; title: string; message: string | null; action_url: string | null; read: boolean; created_at: string }

// Self-contained notification bell: loads the signed-in user's own notifications
// (RLS scopes them), shows the unread count, and marks read on open / on click.
export default function NotificationBell({ accent = '#40916C' }: { accent?: string }) {
  const [items, setItems] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('id, title_en, message_en, action_url, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setItems((data ?? []).map((n) => ({ id: n.id, title: n.title_en ?? '', message: n.message_en ?? null, action_url: n.action_url ?? null, read: !!n.read, created_at: n.created_at })))
  }

  useEffect(() => { load() }, [])

  const unread = items.filter((n) => !n.read).length

  async function markAllRead() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setItems((p) => p.map((n) => ({ ...n, read: true })))
  }

  function openNotif(n: Notif) {
    setOpen(false)
    if (n.action_url) router.push(n.action_url)
  }

  return (
    <div className="relative">
      <button onClick={() => { const next = !open; setOpen(next); if (next && unread) markAllRead() }}
        className="relative p-2 rounded-xl transition-colors hover:bg-slate-100" style={{ color: accent }}>
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: '#E53E3E' }}>{unread}</span>
        )}
      </button>
      {open && (
        <>
          <button className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-lg z-50 overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
            <div className="px-4 py-2.5 text-sm font-bold" style={{ color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>Notifications</div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm" style={{ color: '#94A3B8' }}>No notifications</div>
              ) : items.map((n) => (
                <button key={n.id} onClick={() => openNotif(n)} className="w-full text-left px-4 py-3 flex gap-2.5 hover:bg-slate-50" style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {!n.read && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#0EA5E9' }} />}
                  <div className={n.read ? 'pl-4' : ''}>
                    <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{n.title}</p>
                    {n.message && <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{n.message}</p>}
                    <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{new Date(n.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuwait' })}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
