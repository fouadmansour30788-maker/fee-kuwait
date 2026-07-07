import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Mail, Calendar, Building2, FileText, Download, Inbox } from 'lucide-react'
import { getApplication, PROGRAMME_LABEL, statusMeta, OPERATOR_STATUSES, CB_DECISION_LABEL } from '@/lib/db/applications'
import { listApplicationDocuments, formatBytes, AUDIT_REPORT_REF } from '@/lib/db/documents'
import { listAuditors, applicationAuditor, listCertificationBodies, applicationCb } from '@/lib/db/audit'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { listCriterionMessages } from '@/lib/db/messages'
import { criteriaForProgramme } from '@/lib/criteria'
import AssignAuditor from '@/components/audit/AssignAuditor'
import AssignCb from '@/components/audit/AssignCb'
import CriteriaBoard from '@/components/audit/CriteriaBoard'
import CompliancePanel from '@/components/audit/CompliancePanel'
import ReopenRevision from '@/components/audit/ReopenRevision'
import ReviewForm from './ReviewForm'

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
  const [docs, auditors, currentAuditor, assessments, bodies, currentCb, messages] = await Promise.all([
    listApplicationDocuments(id), listAuditors(), applicationAuditor(id), listCriterionAssessments(id),
    listCertificationBodies(), applicationCb(id), listCriterionMessages(id),
  ])
  const criteria = criteriaForProgramme(app.programme)
  const ncCount = criteria.filter((c) => assessments[c.ref]?.external === 'no_pass').length

  const s = statusMeta(app.status)

  return (
    <div className="space-y-5">
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

      {/* Certification Body assignment + decision */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Certification Body</h2>
        <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>
          {currentCb ? `Assigned to ${currentCb.name_en || currentCb.email}.` : 'Once the audit is complete, assign a Certification Body to make the certification decision.'} Assigning moves the application to “CB Review”.
        </p>
        {bodies.length > 0
          ? <AssignCb applicationId={id} bodies={bodies} currentId={currentCb?.id ?? null} />
          : <p className="text-xs" style={{ color: '#94A3B8' }}>No certification-body accounts yet — create one and set its role under Team.</p>}

        {app.cb_decision && app.cb_decision !== 'pending' && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F1F5F9' }}>
            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: s.bg, color: s.color }}>
              {CB_DECISION_LABEL[app.cb_decision] ?? app.cb_decision}
            </div>
            {app.cb_note && <p className="text-sm mt-2.5" style={{ color: '#475569' }}>{app.cb_note}</p>}
          </div>
        )}
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>{d.name}</p>
                    {d.criterion_ref === AUDIT_REPORT_REF
                      ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: '#FEF3C7', color: '#92400E' }}>Audit report</span>
                      : d.criterion_ref && <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{d.criterion_ref}</span>}
                  </div>
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

      {/* Shared criteria board — establishment evidence/comments + operator feedback */}
      {criteria.length > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Criteria board</h2>
          <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>The establishment&apos;s evidence and comments alongside your feedback per indicator. The auditor&apos;s result is shown once assessed. Saved automatically.</p>
          <CriteriaBoard role="admin" applicationId={id} criteria={criteria} assessments={assessments} docs={docs} messages={messages} showExternal applicantId={app.applicant_id} />
        </div>
      )}

      {/* Certification requirement (auto-calculated) */}
      {criteria.length > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Certification requirement</h2>
          <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Auto-calculated from the programme criteria and the audit results.</p>
          <CompliancePanel criteria={criteria} assessments={assessments} showProgress />
        </div>
      )}

      {/* Non-conformities & revision */}
      {ncCount > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: '#0F172A' }}>Non-conformities</h2>
          <ReopenRevision applicationId={id} ncCount={ncCount} deadline={app.status === 'revision' ? app.revision_deadline : null} />
        </div>
      )}

      {/* Review / decision */}
      <ReviewForm
        id={id}
        status={OPERATOR_STATUSES.includes(app.status) ? app.status : 'new'}
        notes={app.review_notes ?? ''}
        rejection={app.rejection_reason ?? ''}
        statuses={OPERATOR_STATUSES.map((st) => ({ value: st, label: statusMeta(st).label }))}
      />
    </div>
  )
}
