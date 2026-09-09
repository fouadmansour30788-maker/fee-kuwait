import Link from 'next/link'
import { FileCheck, Building2, Mail, Calendar, Inbox, ChevronRight } from 'lucide-react'
import { cbApplications } from '@/lib/db/audit'
import { PROGRAMME_LABEL, statusMeta } from '@/lib/db/applications'

export const dynamic = 'force-dynamic'

export default async function CbApplicationsPage() {
  const apps = await cbApplications()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#0F172A' }}>
          <FileCheck className="w-6 h-6" style={{ color: '#C8A951' }} /> Applications
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{apps.length} application{apps.length === 1 ? '' : 's'} assigned to you — open one to review and decide.</p>
      </div>

      {apps.length > 0 ? (
        <div className="bg-white rounded-2xl border overflow-hidden divide-y" style={{ borderColor: '#E2E8F0' }}>
          {apps.map((a) => {
            const s = statusMeta(a.status)
            const applicant = Array.isArray(a.applicant) ? a.applicant[0] : a.applicant
            return (
              <Link key={a.id} href={`/cb/applications/${a.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FEF9EC' }}>
                  <Building2 className="w-4 h-4" style={{ color: '#C8A951' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: '#0F172A' }}>{PROGRAMME_LABEL[a.programme] ?? a.programme}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#64748B' }}>{applicant?.name_en || applicant?.email || '—'}</p>
                </div>
                <div className="hidden sm:flex items-center gap-5 text-xs flex-shrink-0" style={{ color: '#94A3B8' }}>
                  <span className="inline-flex items-center gap-1.5 capitalize"><Mail className="w-3.5 h-3.5" /> {a.entity_type ?? '—'}</span>
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait' }) : '—'}</span>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#CBD5E1' }} />
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border py-16 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>No applications assigned yet</p>
          <p className="text-xs mt-1">Applications appear here once the operator submits them to you for review.</p>
        </div>
      )}
    </div>
  )
}
