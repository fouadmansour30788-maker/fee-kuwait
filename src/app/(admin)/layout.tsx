'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, FileCheck, ClipboardList, Users, Award, FileBarChart, Newspaper, UserCog, BookOpen, Leaf, Menu, X,
  LogOut, ChevronRight, Bell, Search, Radar,
  MessageSquare, Paperclip, Send, RotateCcw,
} from 'lucide-react'
import SignOutButton from '@/components/auth/SignOutButton'
import ProfileMenu from '@/components/auth/ProfileMenu'
import ChatWidget from '@/components/chat/ChatWidget'

const NOTIF_ICON: Record<string, typeof Bell> = {
  criterion_comment: MessageSquare,
  criterion_upload: Paperclip,
  criterion_complete: FileCheck,
  submitted: Send,
  changes_requested: RotateCcw,
}

interface Notif { id: string; message: string; actionUrl: string | null; read: boolean; at: string; kind: string }

// Only the screens wired to real data are shown. Mock screens (certificates,
// analytics, content, reports, staff, certification reviews) are hidden until
// they're backed by the database.
const ADMIN_NAV = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/applications', icon: FileCheck,       label: 'Applications' },
  { href: '/tracker',      icon: ClipboardList,   label: 'Tracker' },
  { href: '/surveillance', icon: Radar,           label: 'Surveillance' },
  { href: '/members',      icon: Users,           label: 'Members' },
  { href: '/registrations', icon: ClipboardList,  label: 'Registrations' },
  { href: '/certificates', icon: Award,           label: 'Certificates' },
  { href: '/reports',      icon: FileBarChart,    label: 'Reports' },
  { href: '/content',      icon: Newspaper,       label: 'Content' },
  { href: '/resources',    icon: BookOpen,        label: 'Resources' },
  { href: '/staff',        icon: UserCog,         label: 'Team' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const unread = notifs.filter(n => !n.read).length

  useEffect(() => {
    const supabase = createClient()
    supabase.from('notifications').select('id, type, message_en, action_url, read, created_at')
      .order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => {
        if (data) setNotifs(data.map(n => ({ id: n.id, message: n.message_en ?? '', actionUrl: n.action_url, read: !!n.read, kind: n.type, at: new Date(n.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuwait', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) })))
      })
  }, [])

  async function markAllRead() {
    setNotifs(ns => ns.map(n => ({ ...n, read: true })))
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
  }
  function openNotif(n: Notif) {
    setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x)); setNotifOpen(false)
    const supabase = createClient()
    supabase.from('notifications').update({ read: true }).eq('id', n.id).then(() => {})
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F0F4F8' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #0D1B2A 0%, #1A2E45 100%)' }}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #40916C, #52B788)' }}>
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">FEE Kuwait</p>
            <p className="text-[10px] font-semibold" style={{ color: '#64B5F6' }}>National Operator</p>
          </div>
          <button className="ml-auto lg:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={active
                  ? { background: 'rgba(100,181,246,0.12)', color: '#90CAF9' }
                  : { color: 'rgba(255,255,255,0.48)' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <SignOutButton
            className="w-full text-start flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ color: 'rgba(255,255,255,0.32)' }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </SignOutButton>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center gap-4 px-6 border-b bg-white" style={{ borderColor: '#E2E8F0' }}>
          <button className="lg:hidden p-2 rounded-lg" style={{ color: '#475569' }} onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-sm px-3 py-2 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
            <input placeholder="Search anything…" className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400" style={{ color: '#1E293B' }} />
          </div>

          <div className="flex-1" />

          <div className="relative">
            <button onClick={() => setNotifOpen(o => !o)} className="relative p-2 rounded-xl transition-colors hover:bg-slate-100">
              <Bell className="w-5 h-5" style={{ color: '#64748B' }} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: '#E53E3E' }}>{unread}</span>
              )}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border bg-white shadow-xl z-40 overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#F1F5F9' }}>
                    <p className="text-sm font-bold" style={{ color: '#0F172A' }}>Notifications</p>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-xs font-semibold" style={{ color: '#40916C' }}>Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifs.length === 0 && <p className="text-sm text-center py-8" style={{ color: '#94A3B8' }}>No notifications.</p>}
                    {notifs.map(n => {
                      const Icon = NOTIF_ICON[n.kind] ?? Bell
                      return (
                        <Link key={n.id} href={n.actionUrl ?? '#'} onClick={() => openNotif(n)}
                          className="flex items-start gap-3 px-4 py-3 border-b transition-colors hover:bg-slate-50" style={{ borderColor: '#F8FAFC', background: n.read ? '#fff' : '#F0F9FF' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF3' }}>
                            <Icon className="w-4 h-4" style={{ color: '#40916C' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm leading-snug" style={{ color: '#1E293B' }}>{n.message}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{n.at}</p>
                          </div>
                          {!n.read && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#0EA5E9' }} />}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <ProfileMenu accent="#1B4332" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}
