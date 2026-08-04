import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Mail, Calendar, Building2, FileText, Download, Inbox, Gavel, CheckCircle2, Award } from 'lucide-react'
import { getApplication, PROGRAMME_LABEL, statusMeta, CB_DECISION_LABEL } from '@/lib/db/applications'
import { listApplicationDocuments, formatBytes } from '@/lib/db/documents'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { listAudits } from '@/lib/db/audits'
import { listCriterionMessages } from '@/lib/db/messages'
import { getPreScreening, preScreeningApproved } from '@/lib/db/preScreening'
import { criteriaForProgramme, applicableCriteria } from '@/lib/criteria'
import { listAuditorsForCb } from '@/lib/db/audit'
import { CB_ACTIONS, type AppStatus } from '@/lib/workflow'
import CbReviewPanel from '@/components/audit/CbReviewPanel'
import WorkflowActions from '@/components/audit/WorkflowActions'
import CriteriaBoard from '@/components/audit/CriteriaBoard'
import CompliancePanel from '@/components/audit/CompliancePanel'
import { recordCbDecision } from './actions'

const DECISIONS = [
  { value: 'certified', label: 'Certified' },
  { value: 'certified_rectification', label: 'Certified — subject to rectification' },
  { value: 'not_certified', label: 'Not certified' },
]

export default async function CbApplicationDetail({
  params, searchParams,
}: {
  params: { id: string }
  searchParams: Record<string, string | undefined>
}) {
  const { id } = params
  const app = await getApplication(id)
  if (!app) notFound()
  const [docs, assessments, messages, audits, ps, cbAuditors] = await Promise.all([listApplicationDocuments(id), listCriterionAssessments(id), listCriterionMessages(id), listAudits(id), getPreScreening(id), listAuditorsForCb()])
  const criteria = app.programme === 'green-key' && preScreeningApproved(ps) && ps ? applicableCriteria(ps) : criteriaForProgramme(app.programme)
  const s = statusMeta(app.status)
  const decided = !!app.cb_decision && app.cb_decision !== 'pending'

  return (
    <div className="space-y-5">
      <div>
        <Link href="/cb/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-4 h-4" /> Certification Body
        </Link>
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>{PROGRAMME_LABEL[app.programme] ?? app.programme}</h1>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
          </div>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>{app.applicant?.name_en || app.applicant?.email || '—'}</p>
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

      {searchParams.decided === '1' && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm" style={{ background: '#ECFDF3', border: '1px solid #A7F3D0', color: '#047857' }}>
          <CheckCircle2 className="w-4 h-4" /> Certification decision recorded.
        </div>
      )}

      {/* Legacy pre-audit panel — only for old-vocabulary rows still at cb_review */}
      {app.status === 'cb_review' && <CbReviewPanel applicationId={id} auditors={cbAuditors} />}

      <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF9EC', border: '1px solid #FDE68A', color: '#854D0E' }}>
        <Gavel className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Review the auditor&apos;s findings and evidence below, then take the action for this stage. The auditor&apos;s results are read-only — you do not conduct the audit.</p>
      </div>

      {/* CB workflow actions (whiteboard state machine) */}
      {CB_ACTIONS[app.status as AppStatus] && app.status !== 'cb_review' && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>CB decision</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
          </div>
          <WorkflowActions applicationId={id} role="cb" status={app.status} />
        </div>
      )}

      {/* Criteria board (read-only) */}
      {criteria.length > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Criteria board</h2>
          <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>The full checklist with the establishment&apos;s evidence, the auditor&apos;s results and remarks, and comments. You can add comments; results are read-only.</p>
          <CriteriaBoard role="cb" applicationId={id} criteria={criteria} assessments={assessments} docs={docs} messages={messages} showExternal applicantId={app.applicant_id} audits={audits} />
        </div>
      )}

      {criteria.length > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Certification requirement</h2>
          <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Auto-calculated from the programme criteria and the auditor&apos;s results.</p>
          <CompliancePanel criteria={criteria} assessments={assessments} showProgress />
        </div>
      )}

      {/* Evidence documents */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold mb-4" style={{ color: '#0F172A' }}>Evidence documents</h2>
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
                  <a href={d.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#F1F5F9', color: '#854D0E' }}>
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center" style={{ color: '#94A3B8' }}>
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No evidence documents on this application.</p>
          </div>
        )}
      </div>

      {/* Recorded decision */}
      {decided && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: '#0F172A' }}>Certification decision</h2>
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: s.bg, color: s.color }}>
            <Award className="w-4 h-4" /> {CB_DECISION_LABEL[app.cb_decision!] ?? app.cb_decision}
          </div>
          {app.cb_note && <p className="text-sm mt-3" style={{ color: '#475569' }}>{app.cb_note}</p>}
        </div>
      )}
    </div>
  )
}
