import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FileText, Download, Inbox, Clock } from 'lucide-react'
import { getApplication, PROGRAMME_LABEL, statusMeta, CB_DECISION_LABEL, AUDIT_PUBLISHED_STATUSES, ESTABLISHMENT_EDITABLE_STATUSES } from '@/lib/db/applications'
import { listApplicationDocuments, formatBytes, AUDIT_REPORT_REF } from '@/lib/db/documents'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { listAudits } from '@/lib/db/audits'
import { listCriterionMessages } from '@/lib/db/messages'
import { myEntity } from '@/lib/db/establishment'
import { getPreScreening, preScreeningApproved } from '@/lib/db/preScreening'
import { criteriaForProgramme, applicableCriteria } from '@/lib/criteria'
import { getApplicationTimeline } from '@/lib/db/timeline'
import JourneyTimeline from '@/components/timeline/JourneyTimeline'
import PreScreeningBanner from '@/components/prescreening/PreScreeningBanner'
import DocumentUpload from '@/components/documents/DocumentUpload'
import CriteriaBoard from '@/components/audit/CriteriaBoard'
import CompliancePanel from '@/components/audit/CompliancePanel'

export default async function BusinessApplicationDetail({ params }: { params: { id: string } }) {
  const app = await getApplication(params.id)
  if (!app) notFound()
  const [docs, assessments, messages, ent, audits, ps, timeline] = await Promise.all([listApplicationDocuments(params.id), listCriterionAssessments(params.id), listCriterionMessages(params.id), myEntity(), listAudits(params.id), getPreScreening(params.id), getApplicationTimeline(params.id)])
  const psApproved = preScreeningApproved(ps)
  const criteria = app.programme === 'green-key' && psApproved && ps ? applicableCriteria(ps) : criteriaForProgramme(app.programme)
  const showExternal = AUDIT_PUBLISHED_STATUSES.includes(app.status)
  const locked = !ESTABLISHMENT_EDITABLE_STATUSES.includes(app.status) || ent?.status !== 'active'
  const generalDocs = docs.filter((d) => !d.criterion_ref)
  const reports = showExternal ? docs.filter((d) => d.criterion_ref === AUDIT_REPORT_REF) : []
  const ncCount = criteria.filter((c) => assessments[c.ref]?.external === 'no_pass').length
  const s = statusMeta(app.status)

  // The application stays closed until the National Operator approves the
  // registration (registration under review / pending).
  if (ent && ent.status !== 'active') {
    return (
      <div className="space-y-5 max-w-2xl">
        <Link href="/business/application" className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: '#5B7568' }}>
          <ArrowLeft className="w-4 h-4" /> Applications
        </Link>
        <div className="rounded-2xl border p-6 flex items-start gap-3" style={{ borderColor: '#FDE68A', background: '#FEF9EC' }}>
          <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#B45309' }} />
          <div>
            <h2 className="text-base font-bold" style={{ color: '#854D0E' }}>Registration under review</h2>
            <p className="text-sm mt-1" style={{ color: '#92400E' }}>Your registration is pending approval by the National Operator. Your application will open once your registration is approved.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/business/application" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4" style={{ color: '#5B7568' }}>
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

      {app.programme === 'green-key' && (
        <PreScreeningBanner href={`/business/pre-screening/${params.id}`} status={ps?.status ?? null} mainCategory={ps?.mainCategory ?? null} subCategories={ps?.subCategories} ineligibleReason={ps?.ineligibleReason} reviewNote={ps?.reviewNote} />
      )}

      {app.status === 'revision' && (
        <div className="rounded-2xl border px-4 py-3 text-sm" style={{ background: '#FEF9EC', border: '1px solid #FDE68A', color: '#854D0E' }}>
          <strong>Revision required.</strong> {ncCount} criteri{ncCount === 1 ? 'on' : 'a'} did not pass. Please update your evidence/comments for the flagged indicators{app.revision_deadline ? ` by ${new Date(app.revision_deadline).toLocaleDateString('en-GB')}` : ''}.
        </div>
      )}

      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
        <h2 className="text-base font-bold mb-1" style={{ color: '#0F2318' }}>Journey &amp; history</h2>
        <p className="text-xs mb-4" style={{ color: '#5B7568' }}>Your progress so far — registration, eligibility, audits and decisions.</p>
        <JourneyTimeline events={timeline} />
      </div>

      {criteria.length > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F2318' }}>Criteria board</h2>
          <p className="text-xs mb-4" style={{ color: '#5B7568' }}>Attach evidence and add a comment for each indicator, and see your reviewer&apos;s feedback.</p>
          <CriteriaBoard role="establishment" applicationId={app.id} criteria={criteria} assessments={assessments} docs={docs} messages={messages} showExternal={showExternal} locked={locked} applicantId={app.applicant_id} audits={audits} />
        </div>
      )}

      {criteria.length > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F2318' }}>Certification requirement</h2>
          <p className="text-xs mb-4" style={{ color: '#5B7568' }}>100% of imperative criteria plus a share of guidelines by certificate age.</p>
          <CompliancePanel criteria={criteria} assessments={assessments} showProgress={showExternal} />
        </div>
      )}

      {reports.length > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: '#0F2318' }}>Audit report</h2>
          <div className="space-y-2">
            {reports.map((d) => (
              <a key={d.id} href={d.url ?? '#'} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: '#EEF5F0' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F4F9F5' }}>
                  <FileText className="w-4 h-4" style={{ color: '#40916C' }} />
                </div>
                <p className="text-sm font-semibold flex-1 truncate" style={{ color: '#1E293B' }}>{d.name}</p>
                <Download className="w-4 h-4" style={{ color: '#94A3B8' }} />
              </a>
            ))}
          </div>
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

      {/* Documents */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-base font-bold" style={{ color: '#0F2318' }}>General documents</h2>
            <p className="text-xs mt-0.5" style={{ color: '#5B7568' }}>Evidence not tied to a specific indicator (PDF, images, spreadsheets…).</p>
          </div>
          {!locked && <DocumentUpload applicationId={app.id} />}
        </div>

        {generalDocs.length > 0 ? (
          <div className="space-y-2">
            {generalDocs.map((d) => (
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
