import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FileText, Download, Inbox, Mail, Building2, Calendar } from 'lucide-react'
import { getApplication, PROGRAMME_LABEL, statusMeta } from '@/lib/db/applications'
import { listApplicationDocuments, formatBytes, AUDIT_REPORT_REF } from '@/lib/db/documents'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { listAudits } from '@/lib/db/audits'
import { listCriterionMessages } from '@/lib/db/messages'
import { criteriaForProgramme } from '@/lib/criteria'
import CriteriaBoard from '@/components/audit/CriteriaBoard'
import CompliancePanel from '@/components/audit/CompliancePanel'
import AuditorSubmit from '@/components/audit/AuditorSubmit'

export default async function AuditorApplicationDetail({ params }: { params: { id: string } }) {
  const app = await getApplication(params.id)
  if (!app) notFound()
  const [docs, assessments, messages, audits] = await Promise.all([listApplicationDocuments(params.id), listCriterionAssessments(params.id), listCriterionMessages(params.id), listAudits(params.id)])
  const criteria = criteriaForProgramme(app.programme)
  const reports = docs.filter((d) => d.criterion_ref === AUDIT_REPORT_REF).map((d) => ({ id: d.id, name: d.name, url: d.url }))
  const evidence = docs.filter((d) => d.criterion_ref !== AUDIT_REPORT_REF)
  const inProgress = app.status === 'audit'
  const s = statusMeta(app.status)

  return (
    <div className="space-y-5">
      <div>
        <Link href="/auditor/applications" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-4 h-4" /> Assigned Applications
        </Link>
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>{PROGRAMME_LABEL[app.programme] ?? app.programme}</h1>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5 pt-5 border-t" style={{ borderColor: '#F1F5F9' }}>
            {[
              { Icon: Building2, label: 'Applicant', value: app.applicant?.name_en || app.applicant?.email || '—' },
              { Icon: Mail, label: 'Email', value: app.applicant?.email ?? '—' },
              { Icon: Calendar, label: 'Submitted', value: app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-GB') : '—' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#94A3B8' }}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </div>
                <p className="text-sm truncate" style={{ color: '#1E293B' }} title={value}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Criteria board */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Criteria board</h2>
        <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>{inProgress ? 'Grade the Audit column (Pass / Not pass) and add remarks/comments per indicator. Your comments stay hidden from the establishment. Saved automatically.' : 'This audit has been submitted — results are locked.'}</p>
        {criteria.length > 0
          ? <CriteriaBoard role="auditor" applicationId={params.id} criteria={criteria} assessments={assessments} docs={docs} messages={messages} showExternal auditEditable={inProgress} applicantId={app.applicant_id} audits={audits} />
          : <p className="text-sm" style={{ color: '#94A3B8' }}>No criteria checklist for this programme yet.</p>}
      </div>

      {criteria.length > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Certification requirement</h2>
          <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Auto-calculated from the programme criteria and your results.</p>
          <CompliancePanel criteria={criteria} assessments={assessments} showProgress />
        </div>
      )}

      {/* Final report & submit */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Final report &amp; submission</h2>
        <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Attach your audit report and submit. Submitting locks your results and hands the application to the Certification Body.</p>
        <AuditorSubmit applicationId={params.id} status={app.status} reports={reports} />
      </div>

      {/* Evidence documents */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold mb-4" style={{ color: '#0F172A' }}>Evidence documents</h2>
        {evidence.length > 0 ? (
          <div className="space-y-2">
            {evidence.map((d) => (
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
    </div>
  )
}
