import { FileCheck, Award, Users, TrendingUp } from 'lucide-react'
import { listApplications, PROGRAMME_LABEL, statusMeta } from '@/lib/db/applications'
import { listCertificates } from '@/lib/db/certificates'
import { listMembers } from '@/lib/db/members'

// Fixed categorical order for programmes (colour follows the programme, not rank).
const PROGRAMME_COLOR: Record<string, string> = {
  'eco-schools': '#2D9C6F', 'blue-flag': '#2563EB', 'green-key': '#C8A951',
  'leaf': '#16A34A', 'yre': '#7C3AED', 'eco-campus': '#0891B2',
}

export default async function AnalyticsPage() {
  const [apps, certs, members] = await Promise.all([listApplications(), listCertificates(), listMembers()])

  const total = apps.length
  const approved = apps.filter((a) => ['approved', 'certified'].includes(a.status)).length
  const approvedRate = total ? Math.round((approved / total) * 100) : 0
  const schools = members.filter((m) => m.kind === 'School').length
  const establishments = members.length - schools

  // Applications by status (reserved status palette + labels)
  const statusOrder = ['new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'approved', 'rejected']
  const byStatus = statusOrder.map((st) => ({ st, ...statusMeta(st), count: apps.filter((a) => a.status === st).length })).filter((r) => r.count > 0)

  // Applications by programme (fixed categorical order)
  const byProgramme = Object.keys(PROGRAMME_LABEL).map((key) => ({
    key, label: PROGRAMME_LABEL[key], color: PROGRAMME_COLOR[key] ?? '#94A3B8',
    count: apps.filter((a) => a.programme === key).length,
  }))
  const progMax = Math.max(1, ...byProgramme.map((p) => p.count))

  // Applications over the last 6 months (single series → no legend, direct labels)
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-GB', { month: 'short' }), count: 0 }
  })
  for (const a of apps) {
    if (!a.submitted_at) continue
    const d = new Date(a.submitted_at)
    const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (m) m.count++
  }
  const monthMax = Math.max(1, ...months.map((m) => m.count))

  const tiles = [
    { label: 'Applications', value: total, Icon: FileCheck, color: '#2563EB' },
    { label: 'Approval rate', value: `${approvedRate}%`, Icon: TrendingUp, color: '#059669' },
    { label: 'Certificates', value: certs.length, Icon: Award, color: '#C8A951' },
    { label: 'Members', value: members.length, Icon: Users, color: '#7C3AED' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Live figures across your applications, certificates and members.</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${t.color}14` }}>
              <t.Icon className="w-5 h-5" style={{ color: t.color }} />
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: '#0F172A' }}>{t.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications by status */}
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-bold text-sm mb-5" style={{ color: '#0F172A' }}>Applications by status</h2>
          {byStatus.length > 0 ? (
            <div className="space-y-3">
              {byStatus.map((r) => (
                <div key={r.st}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: '#334155' }}>{r.label}</span>
                    <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{r.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((r.count / total) * 100)}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm" style={{ color: '#94A3B8' }}>No applications yet.</p>}
        </div>

        {/* Applications by programme */}
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-bold text-sm mb-5" style={{ color: '#0F172A' }}>Applications by programme</h2>
          <div className="space-y-3">
            {byProgramme.map((p) => (
              <div key={p.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: '#334155' }}>{p.label}</span>
                  <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{p.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.round((p.count / progMax) * 100)}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Applications over time */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="font-bold text-sm mb-5" style={{ color: '#0F172A' }}>Applications — last 6 months</h2>
        <div className="flex items-end justify-between gap-3 h-40">
          {months.map((m) => (
            <div key={m.key} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
              <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{m.count}</span>
              <div className="w-full rounded-t-md" style={{ height: `${Math.round((m.count / monthMax) * 100)}%`, minHeight: m.count ? 6 : 2, background: m.count ? '#40916C' : '#E2E8F0' }} />
              <span className="text-[11px]" style={{ color: '#94A3B8' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Members split */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-3xl font-bold" style={{ color: '#0F172A' }}>{schools}</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Schools</p>
        </div>
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-3xl font-bold" style={{ color: '#0F172A' }}>{establishments}</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Establishments</p>
        </div>
      </div>
    </div>
  )
}
