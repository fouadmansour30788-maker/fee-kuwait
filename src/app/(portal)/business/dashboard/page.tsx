import Link from 'next/link'
import {
  FileText, Plus, CheckCircle2, Clock, Inbox, KeyRound, Award,
  Lightbulb, CalendarClock, Route, ChevronRight,
} from 'lucide-react'
import { myApplications, myEntity } from '@/lib/db/establishment'
import { listCertificates } from '@/lib/db/certificates'
import { PROGRAMME_LABEL, statusMeta } from '@/lib/db/applications'
import {
  CLOSED_STATUSES, CERTIFIED_STATUSES, NOT_APPROVED_STATUSES, AUDIT_STATUSES, CB_STATUSES,
} from '@/lib/workflow'
import { Donut } from '@/components/dashboard/charts'
import { Kpi, Card, Insights, type Tone } from '@/components/dashboard/blocks'

export const dynamic = 'force-dynamic'

const GREEN = '#40916C'

// Where an application sits along the certification journey (from status alone).
const STAGES = ['Registered', 'Eligibility', 'Application', 'Audit', 'CB decision', 'Certified'] as const
const ELIGIBILITY = ['pending_eligibility', 'eligibility_review']
const APPLICATION = ['new', 'in_progress', 'under_review', 'documents_pending',
  'pre_audit_rectification_required', 'pre_audit_rectification_open', 'ready_for_auditor', 'cb_pre_audit_review', 'cb_pre_audit_re_review']
function stageIndex(status: string): number {
  if (CERTIFIED_STATUSES.includes(status)) return 5
  if (CB_STATUSES.includes(status) || status.startsWith('cb_clarification')) return 4
  if (AUDIT_STATUSES.includes(status) || status.startsWith('post_audit') || status === 'further_corrective_required') return 3
  if (APPLICATION.includes(status)) return 2
  if (ELIGIBILITY.includes(status)) return 1
  return 0
}

const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', day: '2-digit', month: 'long', year: 'numeric' })

export default async function BusinessDashboard() {
  const [apps, ent, certs] = await Promise.all([myApplications(), myEntity(), listCertificates()])
  const open = apps.filter((a) => !CLOSED_STATUSES.includes(a.status))
  const certifiedApps = apps.filter((a) => CERTIFIED_STATUSES.includes(a.status))

  // The application to spotlight: the most recent still-open one, else the newest.
  const active = open[0] ?? apps[0] ?? null
  const activeStage = active ? stageIndex(active.status) : 0
  const isClosedNotApproved = active ? NOT_APPROVED_STATUSES.includes(active.status) : false
  const journeyPct = Math.round((activeStage / (STAGES.length - 1)) * 100)

  // Live certificate (if any) + renewal countdown.
  const liveCert = certs.find((c) => c.status === 'active') ?? certs[0] ?? null
  const certDays = liveCert?.expires_at ? daysUntil(liveCert.expires_at) : null

  const kpis = [
    { label: 'Applications', value: apps.length, Icon: FileText, color: GREEN },
    { label: 'In progress', value: open.length, Icon: Clock, color: '#D97706' },
    { label: 'Certified', value: certifiedApps.length, Icon: CheckCircle2, color: '#059669' },
    {
      label: liveCert ? 'Certificate valid to' : 'Certificates',
      value: liveCert?.expires_at ? fmtDate(liveCert.expires_at).replace(/ \d{4}$/, '') : certs.length,
      Icon: Award, color: '#00A95D',
      hint: certDays !== null && certDays > 0 ? `${certDays} days left` : certDays !== null ? 'expired' : undefined,
    },
  ]

  // Outcome donut across the establishment's own applications.
  const donut = [
    { label: 'In progress', value: open.length, color: '#D97706' },
    { label: 'Certified', value: certifiedApps.length, color: '#00A95D' },
    { label: 'Not approved', value: apps.filter((a) => NOT_APPROVED_STATUSES.includes(a.status)).length, color: '#DC2626' },
  ].filter((s) => s.value > 0)

  // ── Next steps / insights ──
  const insights: { tone: Tone; title: string; text: string }[] = []
  if (apps.length === 0) {
    insights.push({ tone: 'info', title: 'Start your first application', text: 'Complete the pre-screening to confirm eligibility, then work through the Green Key criteria at your own pace.' })
  } else if (active) {
    const s = statusMeta(active.status)
    if (active.status === 'documents_pending') insights.push({ tone: 'warn', title: 'Documents requested', text: 'Your reviewer needs more evidence. Upload the requested documents to move forward.' })
    else if (active.status === 'in_progress' || active.status === 'new') insights.push({ tone: 'info', title: 'Keep completing your criteria', text: 'Mark each imperative criterion complete and attach evidence, then submit for the operator’s review.' })
    else if (active.status.includes('rectification') || active.status === 'further_corrective_required') insights.push({ tone: 'warn', title: 'Rectification required', text: 'Address the points raised and resubmit — see your application for the specific criteria.' })
    else if (AUDIT_STATUSES.includes(active.status)) insights.push({ tone: 'info', title: 'Audit stage', text: 'An auditor is assigned. Prepare for the site visit; a confirmed date will appear on your journey.' })
    else if (CB_STATUSES.includes(active.status)) insights.push({ tone: 'info', title: 'With the Certification Body', text: 'Your audited application is under the final certification decision. No action needed right now.' })
    else if (isClosedNotApproved) insights.push({ tone: 'warn', title: `Outcome: ${s.label}`, text: 'You’re welcome to address the points raised and re-apply when ready.' })
    if (active.review_deadline) {
      const dd = daysUntil(active.review_deadline)
      if (dd >= 0) insights.push({ tone: dd <= 7 ? 'warn' : 'info', title: `Action due in ${dd} day${dd === 1 ? '' : 's'}`, text: `Your current step has a deadline of ${fmtDate(active.review_deadline)}.` })
    }
  }
  if (certDays !== null && certDays > 0 && certDays <= 90) insights.push({ tone: 'warn', title: `Certificate expires in ${certDays} days`, text: 'Begin re-certification now so your Green Key status continues without a gap.' })
  if (certifiedApps.length > 0 && !insights.some((i) => i.tone === 'warn')) insights.push({ tone: 'good', title: 'You’re certified 🎉', text: 'Display your Green Key certificate and keep maintaining the criteria for your next audit.' })

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F2318' }}>Welcome{ent ? `, ${ent.name}` : ''}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5B7568' }}>Your certification overview.</p>
          {ent?.greenKeyNumber && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#ECFDF3', color: '#065F46', border: '1px solid #A7F3D0' }}>
              <KeyRound className="w-3.5 h-3.5" /> Green Key #: {ent.greenKeyNumber}
            </span>
          )}
        </div>
        <Link href="/business/application" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          <Plus className="w-4 h-4" /> New application
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => <Kpi key={k.label} {...k} />)}
      </div>

      {/* Certification journey stepper */}
      {active && (
        <Card title="Certification journey" sub={`${PROGRAMME_LABEL[active.programme] ?? active.programme} · currently ${statusMeta(active.status).label}`}
          right={<span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: GREEN }}><Route className="w-4 h-4" /> {isClosedNotApproved ? 'Closed' : `${journeyPct}% through`}</span>}>
          <div className="flex items-center">
            {STAGES.map((label, i) => {
              const doneStage = i < activeStage
              const current = i === activeStage && !isClosedNotApproved
              const color = doneStage ? '#059669' : current ? GREEN : '#CBD5E1'
              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 60 }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: doneStage ? '#059669' : current ? GREEN : '#F1F5F9', color: doneStage || current ? '#fff' : '#94A3B8', border: current ? '3px solid #C6E7D3' : 'none' }}>
                      {doneStage ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                    </div>
                    <span className="text-[10px] font-semibold text-center leading-tight" style={{ color }}>{label}</span>
                  </div>
                  {i < STAGES.length - 1 && <div className="h-0.5 flex-1 mx-1 rounded" style={{ background: i < activeStage ? '#059669' : '#E2E8F0' }} />}
                </div>
              )
            })}
          </div>
          <div className="mt-5 flex justify-end">
            <Link href={`/business/application`} className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: GREEN }}>
              Open application <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      )}

      {/* Outcomes donut + certificate card */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Your applications">
          {donut.length > 0 ? (
            <div className="flex flex-col items-center">
              <Donut segments={donut} centerValue={apps.length} centerLabel="total" />
              <div className="mt-4 w-full space-y-1.5">
                {donut.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="flex-1" style={{ color: '#475569' }}>{s.label}</span>
                    <span className="font-bold" style={{ color: '#0F172A' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm py-10 text-center" style={{ color: '#94A3B8' }}>No applications yet.</p>}
        </Card>

        <div className="lg:col-span-2">
          <Card title="Certificate status" right={<Award className="w-4 h-4" style={{ color: '#00A95D' }} />}>
            {liveCert ? (
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: '#94A3B8' }}>Certificate no.</p>
                  <p className="text-lg font-bold" style={{ color: '#0F2318' }}>{liveCert.certificate_number}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: '#94A3B8' }}>Valid until</p>
                  <p className="text-lg font-bold" style={{ color: '#0F2318' }}>{liveCert.expires_at ? fmtDate(liveCert.expires_at) : '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: '#94A3B8' }}>Countdown</p>
                  <p className="text-lg font-bold" style={{ color: certDays !== null && certDays <= 90 ? '#B45309' : '#059669' }}>
                    {certDays === null ? '—' : certDays > 0 ? `${certDays} days` : 'Expired'}
                  </p>
                </div>
                <Link href="/business/certification" className="ml-auto inline-flex items-center gap-1 text-sm font-semibold" style={{ color: GREEN }}>
                  View certificate <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-4">
                <CalendarClock className="w-8 h-8 opacity-40" style={{ color: '#94A3B8' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#475569' }}>No certificate yet</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>Complete the journey above to earn your Green Key certificate.</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Next steps */}
      <Card title="Next steps & insights" right={<Lightbulb className="w-4 h-4" style={{ color: '#C8A951' }} />}>
        <Insights items={insights} />
      </Card>

      {/* Applications list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: '#0F2318' }}>Your applications</h2>
          <Link href="/business/application" className="text-sm font-semibold" style={{ color: GREEN }}>Manage →</Link>
        </div>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#D4E7DA' }}>
          {apps.length > 0 ? (
            <div className="divide-y" style={{ borderColor: '#EEF5F0' }}>
              {apps.map((a) => {
                const s = statusMeta(a.status)
                return (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F4F9F5' }}>
                      <FileText className="w-4 h-4" style={{ color: GREEN }} />
                    </div>
                    <p className="text-sm font-semibold flex-1" style={{ color: '#1E293B' }}>{PROGRAMME_LABEL[a.programme] ?? a.programme}</p>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-14 text-center" style={{ color: '#94A3B8' }}>
              <Inbox className="w-9 h-9 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium" style={{ color: '#475569' }}>No applications yet</p>
              <p className="text-xs mt-0.5">Start one from the Application page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
