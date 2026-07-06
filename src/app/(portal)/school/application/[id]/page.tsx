import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FileText, Download, Inbox } from 'lucide-react'
import { getApplication, PROGRAMME_LABEL, statusMeta, CB_DECISION_LABEL } from '@/lib/db/applications'
import { listApplicationDocuments, formatBytes } from '@/lib/db/documents'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { criteriaForProgramme } from '@/lib/criteria'
import DocumentUpload from '@/components/documents/DocumentUpload'
import CriteriaGrid from '@/components/audit/CriteriaGrid'

export default async function SchoolApplicationDetail({ params }: { params: { id: string } }) {
  const app = await getApplication(params.id)
  if (!app) notFound()
  const [docs, assessments] = await Promise.all([listApplicationDocuments(params.id), listCriterionAssessments(params.id)])
  const criteria = criteriaForProgramme(app.programme)
  const hasResults = Object.values(assessments).some((a) => a.external !== 'pending')
  const s = statusMeta(app.status)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <Link href="/school/application" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4" style={{ color: '#5B7568' }}>
          <ArrowLeft className="w-4 h-4" /> Applications
        </Link>
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: '#0F2318' }}>{PROGRAMME_LABEL[app.programme] ?? app.programme}</h1>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
          </div>
          <p className="text-sm mt-1" style={{ color: '#5B7568' }}>
            Submitted {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-GB') : '—'}
          </p>
          {app.status === 'rejected' && app.rejection_reason && (
            <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
              <strong>Not approved:</strong> {app.rejection_reason}
            </div>
          )}
        </div>
      </div>

      {hasResults && criteria.length > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F2318' }}>Audit results</h2>
          <p className="text-xs mb-4" style={{ color: '#5B7568' }}>Your assigned auditor&apos;s result and feedback for each criterion.</p>
          <CriteriaGrid role="establishment" applicationId={app.id} criteria={criteria} initial={assessments} />
        </div>
      )}

      {app.cb_decision && app.cb_decision !== 'pending' && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
          <h2 className="text-base font-bold mb-2" style={{ color: '#0F2318' }}>Certification decision</h2>
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: s.bg, color: s.color }}>
            {CB_DECISION_LABEL[app.cb_decision] ?? app.cb_decision}
          </div>
          {app.cb_note && <p className="text-sm mt-2.5" style={{ color: '#5B7568' }}>{app.cb_note}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-base font-bold" style={{ color: '#0F2318' }}>Supporting documents</h2>
            <p className="text-xs mt-0.5" style={{ color: '#5B7568' }}>Upload evidence for your reviewer (PDF, images, spreadsheets…).</p>
          </div>
          <DocumentUpload applicationId={app.id} />
        </div>

        {docs.length > 0 ? (
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: '#EEF5F0' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F4F9F5' }}>
                  <FileText className="w-4 h-4" style={{ color: '#40916C' }} />
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
          <div className="py-10 text-center" style={{ color: '#94A3B8' }}>
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
