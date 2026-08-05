import Link from 'next/link'
import { FileText, Inbox, ChevronRight, Clock, KeyRound } from 'lucide-react'
import { myApplications, myEntity } from '@/lib/db/establishment'
import { PROGRAMME_LABEL, statusMeta } from '@/lib/db/applications'
import NewApplicationForm from '@/components/applications/NewApplicationForm'

export default async function BusinessApplicationPage() {
  const [apps, ent] = await Promise.all([myApplications(), myEntity()])
  const approved = ent?.status === 'active'

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F2318' }}>Applications</h1>
        <p className="text-sm mt-0.5" style={{ color: '#5B7568' }}>
          {ent ? ent.name : 'Your establishment'} · {apps.length} {apps.length === 1 ? 'application' : 'applications'}
        </p>
        {ent?.greenKeyNumber && (
          <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#ECFDF3', color: '#065F46', border: '1px solid #A7F3D0' }}>
            <KeyRound className="w-3.5 h-3.5" /> Green Key #: {ent.greenKeyNumber}
          </span>
        )}
      </div>

      {approved ? (
        <NewApplicationForm programmes={['green-key', 'blue-flag']} appliedProgrammes={apps.map((a) => a.programme)} />
      ) : (
        <div className="rounded-2xl border p-5 flex items-start gap-3" style={{ borderColor: '#FDE68A', background: '#FEF9EC' }}>
          <Clock className="w-5 h-5 flex-shrink-0" style={{ color: '#B45309' }} />
          <div>
            <h2 className="text-sm font-bold" style={{ color: '#854D0E' }}>Registration pending approval</h2>
            <p className="text-xs mt-0.5" style={{ color: '#92400E' }}>Your registration is awaiting approval by the National Operator. You&apos;ll be able to start applications once it&apos;s approved.</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-base font-bold mb-3" style={{ color: '#0F2318' }}>Your applications</h2>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#D4E7DA' }}>
          {apps.length > 0 ? (
            <div className="divide-y" style={{ borderColor: '#EEF5F0' }}>
              {apps.map((a) => {
                const s = statusMeta(a.status)
                return (
                  <Link key={a.id} href={`/business/application/${a.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F4F9F5' }}>
                      <FileText className="w-4 h-4" style={{ color: '#40916C' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{PROGRAMME_LABEL[a.programme] ?? a.programme}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>
                        Submitted {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-GB') : '—'}
                      </p>
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
              <p className="text-sm font-medium" style={{ color: '#475569' }}>No applications yet</p>
              <p className="text-xs mt-0.5">Submit one above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
