'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Gavel, KeyRound, Menu, X, LogOut, ChevronRight, Bell, Radar } from 'lucide-react'
import SignOutButton from '@/components/auth/SignOutButton'
import ProfileMenu from '@/components/auth/ProfileMenu'
import NotificationBell from '@/components/notifications/NotificationBell'
import ChatWidget from '@/components/chat/ChatWidget'

const NAV = [
  { href: '/cb/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/cb/registrations', icon: KeyRound, label: 'Registrations' },
  { href: '/cb/surveillance', icon: Radar, label: 'Surveillance' },
]

export default function CbLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const initials = 'CB'

  return (
    <div className="min-h-screen flex" style={{ background: '#F0F4F8' }}>
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #2A2410 0%, #4A3F1A 100%)' }}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C8A951, #E8D5A3)' }}>
            <Gavel className="w-4 h-4" style={{ color: '#2A2410' }} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">FEE Kuwait</p>
            <p className="text-[10px] font-semibold" style={{ color: '#E8D5A3' }}>Certification Body</p>
          </div>
          <button className="ml-auto lg:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={active ? { background: 'rgba(200,169,81,0.18)', color: '#E8D5A3' } : { color: 'rgba(255,255,255,0.48)' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <SignOutButton className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-start" style={{ color: 'rgba(255,255,255,0.32)' }}>
            <LogOut className="w-4 h-4" /> Sign out
          </SignOutButton>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center gap-4 px-6 border-b bg-white" style={{ borderColor: '#E2E8F0' }}>
          <button className="lg:hidden p-2 rounded-lg" style={{ color: '#475569' }} onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#FEF9EC', color: '#854D0E' }}>
            <Gavel className="w-3.5 h-3.5" /> Certification Decisions
          </div>
          <div className="flex-1" />
          <NotificationBell accent="#C8A951" />
          <div className="flex items-center gap-2.5">
            <ProfileMenu accent="#C8A951" textColor="#2A2410" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </div>
      <ChatWidget />
    </div>
  )
}
