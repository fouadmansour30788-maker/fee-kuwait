import Link from 'next/link'
import { FileText, Inbox, ChevronRight } from 'lucide-react'
import { listApplications, PROGRAMME_LABEL, statusMeta } from '@/lib/db/applications'

export default async function ApplicationsPage() {
  const apps = await listApplications()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Applications</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            {apps.length} {apps.length === 1 ? 'application' : 'applications'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Applicant', 'Programme', 'Type', 'Status', 'Submitted'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</th>
              ))}
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
            {apps.map((a) => {
              const s = statusMeta(a.status)
              return (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                        <FileText className="w-4 h-4" style={{ color: '#64748B' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate" style={{ color: '#1E293B' }}>{a.applicant?.name_en || a.applicant?.email || '—'}</p>
                        {a.applicant?.name_en && a.applicant?.email && <p className="text-xs" style={{ color: '#94A3B8' }}>{a.applicant.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: '#334155' }}>{PROGRAMME_LABEL[a.programme] ?? a.programme}</td>
                  <td className="px-5 py-3.5 capitalize" style={{ color: '#334155' }}>{a.entity_type ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>
                    {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/applications/${a.id}`} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#40916C' }}>
                      Open <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {apps.length === 0 && (
          <div className="py-16 text-center" style={{ color: '#94A3B8' }}>
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No applications yet</p>
            <p className="text-xs mt-1">Applications from registered schools and establishments will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
