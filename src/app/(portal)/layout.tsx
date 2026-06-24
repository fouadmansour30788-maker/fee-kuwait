'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, CheckSquare, BookOpen,
  Bell, FolderOpen, Map, Award, Leaf, Menu, X, LogOut,
  ChevronRight,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'

const SCHOOL_NAV = [
  { href: '/school/dashboard',    icon: LayoutDashboard, en: 'Dashboard',    ar: 'لوحة التحكم' },
  { href: '/school/application',  icon: FileText,        en: 'Application',  ar: 'الطلب' },
  { href: '/school/action-plan',  icon: CheckSquare,     en: 'Action Plan',  ar: 'خطة العمل' },
  { href: '/school/activities',   icon: BookOpen,        en: 'Activities',   ar: 'الأنشطة' },
  { href: '/school/journey',      icon: Map,             en: 'My Journey',   ar: 'رحلتي' },
  { href: '/school/documents',    icon: FolderOpen,      en: 'Documents',    ar: 'المستندات' },
  { href: '/school/resources',    icon: BookOpen,        en: 'Resources',    ar: 'الموارد' },
  { href: '/school/notifications',icon: Bell,            en: 'Notifications',ar: 'الإشعارات' },
]

const BUSINESS_NAV = [
  { href: '/business/dashboard',    icon: LayoutDashboard, en: 'Dashboard',    ar: 'لوحة التحكم' },
  { href: '/business/application',  icon: FileText,        en: 'Application',  ar: 'الطلب' },
  { href: '/business/criteria',     icon: CheckSquare,     en: 'Criteria',     ar: 'المعايير' },
  { href: '/business/inspections',  icon: Map,             en: 'Inspections',  ar: 'التفتيش' },
  { href: '/business/certification',icon: Award,           en: 'Certification',ar: 'الشهادة' },
]

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isSchool = pathname.startsWith('/school')
  const nav = isSchool ? SCHOOL_NAV : BUSINESS_NAV
  const portalName = isSchool
    ? (lang === 'ar' ? 'بوابة المدرسة' : 'School Portal')
    : (lang === 'ar' ? 'بوابة المنشأة' : 'Business Portal')
  const portalColor = isSchool ? '#8B9B88' : '#C8A951'

  return (
    <div className="min-h-screen flex" style={{ background: '#FBF8F0' }}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #182019 0%, #182019 100%)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${portalColor}, #7B8266)` }}>
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">FEE Kuwait</p>
            <p className="text-[10px] font-semibold" style={{ color: portalColor }}>{portalName}</p>
          </div>
          <button className="ml-auto lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {nav.map(({ href, icon: Icon, en, ar }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
                style={active
                  ? { background: `${portalColor}20`, color: portalColor }
                  : { color: 'rgba(255,255,255,0.55)' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {lang === 'ar' ? ar : en}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: sign out */}
        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <LogOut className="w-4 h-4" />
            {lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-16 flex items-center gap-4 px-6 border-b bg-warmwhite"
          style={{ borderColor: '#E7E4D6' }}
        >
          <button
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#7B8266' }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {/* Notification bell */}
          <button className="relative p-2 rounded-xl transition-colors hover:bg-[#E8ECE1]" style={{ color: '#7B8266' }}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#E53E3E' }} />
          </button>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${portalColor}, #7B8266)` }}>
            S
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
