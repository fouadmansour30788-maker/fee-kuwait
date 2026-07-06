import Link from 'next/link'
import { Gavel, Clock, CheckCircle2, ChevronRight, Inbox } from 'lucide-react'
import { cbApplications } from '@/lib/db/audit'
import { PROGRAMME_LABEL, statusMeta } from '@/lib/db/applications'

export default async function CbDashboard() {
  const apps = await cbApplications()
  const pending = apps.filter((a) => a.status === 'cb_review')
  const decided = apps.filter((a) => ['certified', 'certified_rectification', 'not_certified'].includes(a.status))

  const stats = [
    { label: 'Assigned', value: apps.length, Icon: Gavel, color: '#854D0E' },
    { label: 'Awaiting decision', value: pending.length, Icon: Clock, color: '#D97706' },
    { label: 'Decided', value: decided.length, Icon: CheckCircle2, color: '#059669' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Certification Body</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{apps.length} application{apps.length === 1 ? '' : 's'} assigned to you for a certification decision.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((st) => (
          <div key={st.label} className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${st.color}14` }}>
              <st.Icon className="w-5 h-5" style={{ color: st.color }} />
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: '#0F172A' }}>{st.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{st.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-base font-bold mb-3" style={{ color: '#0F172A' }}>Assigned applications</h2>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          {apps.length > 0 ? (
            <div className="divide-y" style={{ borderColor: '#F8FAFC' }}>
              {apps.map((a) => {
                const s = statusMeta(a.status)
                return (
                  <Link key={a.id} href={`/cb/applications/${a.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{a.applicant?.name_en || a.applicant?.email || '—'}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{PROGRAMME_LABEL[a.programme] ?? a.programme}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-14 text-center" style={{ color: '#94A3B8' }}>
              <Inbox className="w-9 h-9 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium" style={{ color: '#475569' }}>No applications assigned</p>
              <p className="text-xs mt-0.5">The National Operator assigns completed audits to you for a decision.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
