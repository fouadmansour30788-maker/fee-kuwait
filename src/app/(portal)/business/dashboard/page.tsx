import Link from 'next/link'
import { FileText, Plus, CheckCircle2, Clock, Inbox } from 'lucide-react'
import { myApplications, myEntity } from '@/lib/db/establishment'
import { PROGRAMME_LABEL, statusMeta } from '@/lib/db/applications'

export default async function BusinessDashboard() {
  const [apps, ent] = await Promise.all([myApplications(), myEntity()])
  const open = apps.filter((a) => !['approved', 'certified', 'rejected', 'not_certified'].includes(a.status)).length
  const done = apps.filter((a) => ['approved', 'certified'].includes(a.status)).length

  const stats = [
    { label: 'Applications', value: apps.length, Icon: FileText, color: '#40916C' },
    { label: 'In progress', value: open, Icon: Clock, color: '#D97706' },
    { label: 'Approved', value: done, Icon: CheckCircle2, color: '#059669' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F2318' }}>Welcome{ent ? `, ${ent.name}` : ''}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5B7568' }}>Your certification overview.</p>
        </div>
        <Link href="/business/application" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          <Plus className="w-4 h-4" /> New application
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border p-5" style={{ borderColor: '#D4E7DA' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}14` }}>
              <s.Icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: '#0F2318' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#5B7568' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: '#0F2318' }}>Your applications</h2>
          <Link href="/business/application" className="text-sm font-semibold" style={{ color: '#40916C' }}>Manage →</Link>
        </div>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#D4E7DA' }}>
          {apps.length > 0 ? (
            <div className="divide-y" style={{ borderColor: '#EEF5F0' }}>
              {apps.map((a) => {
                const s = statusMeta(a.status)
                return (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F4F9F5' }}>
                      <FileText className="w-4 h-4" style={{ color: '#40916C' }} />
                    </div>
                    <p className="text-sm font-semibold flex-1" style={{ color: '#1E293B' }}>{PROGRAMME_LABEL[a.programme] ?? a.programme}</p>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-14 text-center" style={{ color: '#94A3B8' }}>
              <Inbox className="w-9 h-9 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium" style={{ color: '#475569' }}>No applications yet</p>
              <p className="text-xs mt-0.5">Start one from the Application page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
