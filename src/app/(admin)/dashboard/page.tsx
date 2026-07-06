import {
  FileCheck, Award, Users, Clock, ArrowUpRight, Activity, Inbox, FileText,
} from 'lucide-react'
import { operatorStats, PROGRAMME_LABEL, statusMeta } from '@/lib/db/applications'

const PROGRAMME_COLORS: Record<string, string> = {
  'eco-schools': '#52B788', 'blue-flag': '#90E0EF', 'green-key': '#C8A951',
  'leaf': '#74C69D', 'yre': '#A8DADC', 'eco-campus': '#52B788',
}

export default async function AdminDashboard() {
  const { apps, members } = await operatorStats()

  const count = (fn: (s: string) => boolean) => apps.filter((a) => fn(a.status)).length
  const pending = count((s) => ['new', 'under_review', 'documents_pending', 'site_visit_scheduled'].includes(s))
  const approved = count((s) => ['approved', 'certified'].includes(s))

  const stats = [
    { label: 'Open Applications', value: pending, icon: FileCheck, color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Approved / Certified', value: approved, icon: Award, color: '#10B981', bg: '#D1FAE5' },
    { label: 'Member Institutions', value: members, icon: Users, color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'Total Applications', value: apps.length, icon: Clock, color: '#8B5CF6', bg: '#EDE9FE' },
  ]

  // Applications per programme (from real data)
  const byProgramme = Object.keys(PROGRAMME_LABEL).map((key) => ({
    key, label: PROGRAMME_LABEL[key], color: PROGRAMME_COLORS[key] ?? '#94A3B8',
    count: apps.filter((a) => a.programme === key).length,
  }))
  const recent = apps.slice(0, 6)
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{today} — Overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium" style={{ background: '#D1FAE5', color: '#065F46' }}>
          <Activity className="w-3.5 h-3.5" /> System Operational
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <ArrowUpRight className="w-4 h-4" style={{ color: '#CBD5E1' }} />
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: '#0F172A' }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: '#64748B' }}>{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent applications */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
              <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>Recent Applications</h2>
              <a href="/applications" className="text-xs font-semibold" style={{ color: '#3B82F6' }}>View all →</a>
            </div>
            <div className="divide-y" style={{ borderColor: '#F8FAFC' }}>
              {recent.map((app) => {
                const s = statusMeta(app.status)
                return (
                  <div key={app.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                      <FileText className="w-4 h-4" style={{ color: '#64748B' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>{app.applicant?.name_en || app.applicant?.email || '—'}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{PROGRAMME_LABEL[app.programme] ?? app.programme}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                )
              })}
              {recent.length === 0 && (
                <div className="py-12 text-center" style={{ color: '#94A3B8' }}>
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium" style={{ color: '#475569' }}>No applications yet</p>
                  <p className="text-xs mt-0.5">They&apos;ll show here as schools and establishments apply.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Programme breakdown */}
        <div>
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <h2 className="font-bold text-sm mb-5" style={{ color: '#0F172A' }}>Applications by Programme</h2>
            <div className="space-y-3.5">
              {byProgramme.map((p) => {
                const pct = apps.length ? Math.round((p.count / apps.length) * 100) : 0
                return (
                  <div key={p.key}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      <span className="text-xs font-medium flex-1" style={{ color: '#334155' }}>{p.label}</span>
                      <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{p.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-5 pt-4 border-t flex items-center justify-between" style={{ borderColor: '#F1F5F9' }}>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Total applications</p>
              <p className="text-xl font-bold" style={{ color: '#0F172A' }}>{apps.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
