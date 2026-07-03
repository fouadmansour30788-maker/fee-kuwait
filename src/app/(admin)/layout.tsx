'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileCheck, Award, Newspaper,
  Users, BarChart3, UserCog, Leaf, Menu, X,
  LogOut, ChevronRight, Bell, Search, LineChart, ClipboardCheck,
  MessageSquare, Paperclip, Send, RotateCcw,
} from 'lucide-react'
import { NO_NOTIFICATIONS, type NotificationKind } from '@/lib/data/audits'

const NOTIF_ICON: Record<NotificationKind, typeof Bell> = {
  criterion_comment: MessageSquare,
  criterion_upload: Paperclip,
  submitted: Send,
  changes_requested: RotateCcw,
}

const ADMIN_NAV = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/applications', icon: FileCheck,       label: 'Applications' },
  { href: '/auditors',     icon: ClipboardCheck,  label: 'Certification Reviews' },
  { href: '/certificates', icon: Award,           label: 'Certificates' },
  { href: '/members',      icon: Users,           label: 'Members' },
  { href: '/analytics',    icon: LineChart,       label: 'Analytics' },
  { href: '/content',      icon: Newspaper,       label: 'Content' },
  { href: '/reports',      icon: BarChart3,       label: 'Reports' },
  { href: '/staff',        icon: UserCog,         label: 'Staff' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState(NO_NOTIFICATIONS)
  const unread = notifs.filter(n => !n.read).length

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
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ color: 'rgba(255,255,255,0.32)' }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Link>
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
                      <button onClick={() => setNotifs(ns => ns.map(n => ({ ...n, read: true })))} className="text-xs font-semibold" style={{ color: '#40916C' }}>Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifs.length === 0 && <p className="text-sm text-center py-8" style={{ color: '#94A3B8' }}>No notifications.</p>}
                    {notifs.map(n => {
                      const Icon = NOTIF_ICON[n.kind]
                      return (
                        <Link key={n.id} href={`/auditors/${n.appId}`} onClick={() => { setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x)); setNotifOpen(false) }}
                          className="flex items-start gap-3 px-4 py-3 border-b transition-colors hover:bg-slate-50" style={{ borderColor: '#F8FAFC', background: n.read ? '#fff' : '#F0F9FF' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF3' }}>
                            <Icon className="w-4 h-4" style={{ color: '#40916C' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm leading-snug" style={{ color: '#1E293B' }}>{n.body}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{n.entity} · {n.at}</p>
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
              M
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>Mostafa Kanjo</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>National Operator</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
