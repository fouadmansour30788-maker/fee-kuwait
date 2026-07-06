import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Mail, Calendar, Building2, Save } from 'lucide-react'
import { getApplication, PROGRAMME_LABEL, statusMeta, OPERATOR_STATUSES } from '@/lib/db/applications'
import { updateApplication } from './actions'

export default async function ApplicationDetail({
  params, searchParams,
}: {
  params: { id: string }
  searchParams: Record<string, string | undefined>
}) {
  const { id } = params
  const sp = searchParams
  const app = await getApplication(id)
  if (!app) notFound()

  const s = statusMeta(app.status)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <Link href="/applications" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-4 h-4" /> Applications
        </Link>
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>{PROGRAMME_LABEL[app.programme] ?? app.programme}</h1>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              </div>
              <p className="text-sm mt-1" style={{ color: '#64748B' }}>{app.applicant?.name_en || app.applicant?.email || '—'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5 pt-5 border-t" style={{ borderColor: '#F1F5F9' }}>
            {[
              { Icon: Building2, label: 'Type', value: app.entity_type ?? '—' },
              { Icon: Mail, label: 'Applicant', value: app.applicant?.email ?? '—' },
              { Icon: Calendar, label: 'Submitted', value: app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-GB') : '—' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#94A3B8' }}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </div>
                <p className="text-sm truncate capitalize" style={{ color: '#1E293B' }} title={value}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {sp.saved === '1' && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm" style={{ background: '#ECFDF3', border: '1px solid #A7F3D0', color: '#047857' }}>
          <CheckCircle2 className="w-4 h-4" /> Application updated.
        </div>
      )}

      {/* Review / decision */}
      <form action={updateApplication.bind(null, id)} className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Review</h2>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Status</label>
          <select name="status" defaultValue={app.status} className="w-full text-sm px-3 py-2.5 rounded-xl outline-none bg-white" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
            {OPERATOR_STATUSES.map((st) => (
              <option key={st} value={st}>{statusMeta(st).label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Review notes</label>
          <textarea name="review_notes" defaultValue={app.review_notes ?? ''} rows={3} placeholder="Internal notes about this application…"
            className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Rejection reason <span className="font-normal" style={{ color: '#94A3B8' }}>(only used if status is Rejected)</span></label>
          <input name="rejection_reason" defaultValue={app.rejection_reason ?? ''} placeholder="Reason shared with the applicant if rejected"
            className="w-full text-sm px-3 py-2.5 rounded-xl outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
        </div>

        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          <Save className="w-4 h-4" /> Save changes
        </button>
      </form>
    </div>
  )
}
