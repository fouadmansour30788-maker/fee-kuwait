'use client'

import { motion } from 'framer-motion'
import {
  FileCheck, Award, Users, TrendingUp,
  Clock, CheckCircle2, AlertCircle, School,
  Waves, KeyRound, Leaf, Newspaper, GraduationCap,
  ArrowUpRight, Activity,
} from 'lucide-react'

const STATS = [
  { label: 'Pending Applications', value: 14, delta: '+3 this week', icon: FileCheck,   color: '#F59E0B', bg: '#FEF3C7' },
  { label: 'Active Certificates',  value: 210, delta: '+8 this month', icon: Award,     color: '#8B9B88', bg: '#E8ECE1' },
  { label: 'Member Institutions',  value: 248, delta: '+12 this month', icon: Users,    color: '#3B82F6', bg: '#DBEAFE' },
  { label: 'Renewals Due (30d)',    value: 22,  delta: '5 overdue',     icon: TrendingUp, color: '#EF4444', bg: '#FEE2E2' },
]

const RECENT_APPLICATIONS = [
  { id: 'KW-2026-00201', name: 'Al-Noor Primary School',    programme: 'Eco-Schools', status: 'pending',  date: '2026-05-23', Icon: School   },
  { id: 'KW-2026-00200', name: 'Pearl Beach Resort',        programme: 'Blue Flag',   status: 'review',   date: '2026-05-22', Icon: Waves    },
  { id: 'KW-2026-00199', name: 'Hilton Kuwait Resort',      programme: 'Green Key',   status: 'approved', date: '2026-05-21', Icon: KeyRound },
  { id: 'KW-2026-00198', name: 'Rumaithiya Secondary',      programme: 'Eco-Schools', status: 'pending',  date: '2026-05-20', Icon: School   },
  { id: 'KW-2026-00197', name: 'Gulf Science University',   programme: 'Eco-Campus',  status: 'review',   date: '2026-05-19', Icon: GraduationCap },
  { id: 'KW-2026-00196', name: 'Young Reporters Kuwait',    programme: 'YRE',         status: 'approved', date: '2026-05-18', Icon: Newspaper },
]

const PROGRAMME_STATS = [
  { name: 'Eco-Schools', count: 142, color: '#8B9B88',  Icon: School },
  { name: 'Blue Flag',   count: 18,  color: '#90E0EF',  Icon: Waves  },
  { name: 'Green Key',   count: 34,  color: '#C8A951',  Icon: KeyRound },
  { name: 'LEAF',        count: 28,  color: '#A9B6A4',  Icon: Leaf   },
  { name: 'YRE',         count: 19,  color: '#A8DADC',  Icon: Newspaper },
  { name: 'Eco-Campus',  count: 7,   color: '#8B9B88',  Icon: GraduationCap },
]

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: '#F59E0B', bg: '#FEF3C7', Icon: Clock          },
  review:   { label: 'In Review',color: '#3B82F6', bg: '#DBEAFE', Icon: AlertCircle    },
  approved: { label: 'Approved', color: '#8B9B88', bg: '#E8ECE1', Icon: CheckCircle2   },
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function AdminDashboard() {
  const totalCertified = PROGRAMME_STATS.reduce((s, p) => s + p.count, 0)

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Sunday, 25 May 2026 — Overview</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium" style={{ background: '#E8ECE1', color: '#065F46' }}>
            <Activity className="w-3.5 h-3.5" />
            System Operational
          </div>
        </div>
      </FadeIn>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon
          return (
            <FadeIn key={s.label} delay={i * 0.07}>
              <div className="bg-warmwhite rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                    <Icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <ArrowUpRight className="w-4 h-4" style={{ color: '#CBD5E1' }} />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#0F172A' }}>{s.value}</p>
                <p className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>{s.label}</p>
                <p className="text-[11px]" style={{ color: s.color }}>{s.delta}</p>
              </div>
            </FadeIn>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent applications */}
        <FadeIn delay={0.28} className="lg:col-span-2">
          <div className="bg-warmwhite rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
              <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>Recent Applications</h2>
              <a href="/applications" className="text-xs font-semibold" style={{ color: '#3B82F6' }}>View all →</a>
            </div>
            <div className="divide-y" style={{ borderColor: '#F8FAFC' }}>
              {RECENT_APPLICATIONS.map((app) => {
                const cfg = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG]
                const StatusIcon = cfg.Icon
                const ProgIcon = app.Icon
                return (
                  <div key={app.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                      <ProgIcon className="w-4 h-4" style={{ color: '#64748B' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>{app.name}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{app.id} · {app.programme}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0" style={{ background: cfg.bg }}>
                      <StatusIcon className="w-3 h-3" style={{ color: cfg.color }} />
                      <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <p className="text-xs flex-shrink-0" style={{ color: '#CBD5E1' }}>{app.date}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* Programme breakdown */}
        <FadeIn delay={0.34}>
          <div className="bg-warmwhite rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <h2 className="font-bold text-sm mb-5" style={{ color: '#0F172A' }}>Certified by Programme</h2>
            <div className="space-y-3.5">
              {PROGRAMME_STATS.map((p) => {
                const Icon = p.Icon
                const pct = Math.round((p.count / totalCertified) * 100)
                return (
                  <div key={p.name}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: p.color }} />
                      <span className="text-xs font-medium flex-1" style={{ color: '#334155' }}>{p.name}</span>
                      <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{p.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: p.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-5 pt-4 border-t flex items-center justify-between" style={{ borderColor: '#F1F5F9' }}>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Total certified</p>
              <p className="text-xl font-bold" style={{ color: '#0F172A' }}>{totalCertified}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
