import Link from 'next/link'
import { ChevronRight, Inbox } from 'lucide-react'
import { auditorApplications } from '@/lib/db/audit'
import { PROGRAMME_LABEL, statusMeta } from '@/lib/db/applications'

export default async function AuditorApplications() {
  const apps = await auditorApplications()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Assigned Applications</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{apps.length} assigned to you</p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        {apps.length > 0 ? (
          <div className="divide-y" style={{ borderColor: '#F8FAFC' }}>
            {apps.map((a) => {
              const s = statusMeta(a.status)
              return (
                <Link key={a.id} href={`/auditor/applications/${a.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{a.applicant?.name_en || a.applicant?.email || '—'}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{PROGRAMME_LABEL[a.programme] ?? a.programme} · submitted {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-GB') : '—'}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-16 text-center" style={{ color: '#94A3B8' }}>
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No applications assigned</p>
            <p className="text-xs mt-1">The operator assigns applications to you for audit.</p>
          </div>
        )}
      </div>
    </div>
  )
}
