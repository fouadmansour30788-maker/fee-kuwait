import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Mail, Calendar, Building2, Save, FileText, Download, Inbox } from 'lucide-react'
import { getApplication, PROGRAMME_LABEL, statusMeta, OPERATOR_STATUSES } from '@/lib/db/applications'
import { listApplicationDocuments, formatBytes } from '@/lib/db/documents'
import { listAuditors, applicationAuditor } from '@/lib/db/audit'
import { listAssessments } from '@/lib/db/assessments'
import { criteriaForProgramme } from '@/lib/criteria'
import AssignAuditor from '@/components/audit/AssignAuditor'
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
  const [docs, auditors, currentAuditor, assessments] = await Promise.all([
    listApplicationDocuments(id), listAuditors(), applicationAuditor(id), listAssessments(id),
  ])
  const criteria = criteriaForProgramme(app.programme)
  const graded = criteria.filter((c) => (assessments[c.ref] ?? 'pending') !== 'pending').length
  const passed = criteria.filter((c) => assessments[c.ref] === 'pass').length
  const noPassList = criteria.filter((c) => assessments[c.ref] === 'no_pass')

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

      {/* Auditor assignment */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Auditor</h2>
        <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>
          {currentAuditor ? `Assigned to ${currentAuditor.name_en || currentAuditor.email}.` : 'Assign an independent auditor to conduct the audit.'} Assigning moves the application to “Under Audit”.
        </p>
        {auditors.length > 0
          ? <AssignAuditor applicationId={id} auditors={auditors} currentId={currentAuditor?.id ?? null} />
          : <p className="text-xs" style={{ color: '#94A3B8' }}>No auditor accounts yet — create one and set its role under Team.</p>}
      </div>

      {/* Submitted documents */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold mb-4" style={{ color: '#0F172A' }}>Submitted documents</h2>
        {docs.length > 0 ? (
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: '#E2E8F0' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                  <FileText className="w-4 h-4" style={{ color: '#64748B' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>{d.name}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{formatBytes(d.size)} · {new Date(d.created_at).toLocaleDateString('en-GB')}</p>
                </div>
                {d.url && (
                  <a href={d.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#F1F5F9', color: '#40916C' }}>
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center" style={{ color: '#94A3B8' }}>
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No documents submitted for this application.</p>
          </div>
        )}
      </div>

      {/* Audit results (read-only, from the auditor) */}
      {criteria.length > 0 && graded > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Audit results</h2>
            <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{passed}/{criteria.length} passed · {graded} graded</span>
          </div>
          {noPassList.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold" style={{ color: '#B91C1C' }}>{noPassList.length} non-conformity(ies):</p>
              {noPassList.map((c) => (
                <div key={c.ref} className="flex items-center gap-2.5 rounded-lg border p-2.5" style={{ borderColor: '#FECACA', background: '#FEF6F6' }}>
                  <span className="text-xs font-mono font-semibold flex-shrink-0" style={{ color: '#B91C1C' }}>{c.ref}</span>
                  <p className="text-sm" style={{ color: '#334155' }}>{c.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#059669' }}>All graded criteria passed.</p>
          )}
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
