import Link from 'next/link'
import { Gavel, Clock, CheckCircle2, ChevronRight, Inbox, Award, Gauge, Lightbulb } from 'lucide-react'
import { cbApplications } from '@/lib/db/audit'
import { PROGRAMME_LABEL, statusMeta, STATUS_META } from '@/lib/db/applications'
import { CB_STATUSES, CLOSED_STATUSES, CERTIFIED_STATUSES, NOT_APPROVED_STATUSES } from '@/lib/workflow'
import { LineChart, Donut } from '@/components/dashboard/charts'
import { Kpi, Card, StatBars, Insights, lastMonths, tallyByMonth, PROGRAMME_COLOR, type Tone } from '@/components/dashboard/blocks'

export const dynamic = 'force-dynamic'

const PRE_REVIEW = ['cb_pre_audit_review', 'cb_pre_audit_re_review']
const FINAL_REVIEW = ['cb_final_review', 'cb_final_re_review']
const CLARIFY = ['cb_clarification_operator', 'cb_clarification_auditor', 'cb_clarification_establishment']

export default async function CbDashboard() {
  const apps = await cbApplications()

  const pending = apps.filter((a) => CB_STATUSES.includes(a.status))
  const decided = apps.filter((a) => CLOSED_STATUSES.includes(a.status))
  const certified = apps.filter((a) => CERTIFIED_STATUSES.includes(a.status))
  const notApproved = apps.filter((a) => NOT_APPROVED_STATUSES.includes(a.status))
  const preReview = apps.filter((a) => PRE_REVIEW.includes(a.status))
  const finalReview = apps.filter((a) => FINAL_REVIEW.includes(a.status))
  const clarify = apps.filter((a) => CLARIFY.includes(a.status))
  const certRate = decided.length ? Math.round((certified.length / decided.length) * 100) : 0

  const kpis = [
    { label: 'Assigned to me', value: apps.length, Icon: Gavel, color: '#854D0E' },
    { label: 'Awaiting decision', value: pending.length, Icon: Clock, color: '#D97706' },
    { label: 'Decided', value: decided.length, Icon: CheckCircle2, color: '#059669' },
    { label: 'Certified', value: certified.length, Icon: Award, color: '#00A95D' },
    { label: 'Certification rate', value: `${certRate}%`, Icon: Gauge, color: '#2563EB' },
  ]

  // Outcome split among decided applications.
  const donut = [
    { label: 'Certified', value: certified.length, color: '#00A95D' },
    { label: 'Not approved', value: notApproved.length, color: '#DC2626' },
    { label: 'Awaiting', value: pending.length, color: '#D97706' },
  ].filter((s) => s.value > 0)

  // Review queue — the CB-specific stages.
  const queueRows = [
    { label: 'Pre-audit review', color: '#854D0E', count: preReview.length },
    { label: 'Final review', color: '#B45309', count: finalReview.length },
    { label: 'Awaiting clarification', color: '#D97706', count: clarify.length },
    { label: 'General CB review', color: '#A16207', count: apps.filter((a) => a.status === 'cb_review').length },
  ].filter((r) => r.count > 0)

  // Full status breakdown.
  const statusRows = Object.keys(STATUS_META)
    .map((st) => ({ label: statusMeta(st).label, color: statusMeta(st).color, count: apps.filter((a) => a.status === st).length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)

  const months = tallyByMonth(lastMonths(6), apps.map((a) => a.submitted_at))
  const progRows = Object.keys(PROGRAMME_LABEL)
    .map((k) => ({ label: PROGRAMME_LABEL[k], color: PROGRAMME_COLOR[k] ?? '#94A3B8', count: apps.filter((a) => a.programme === k).length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)

  // ── Insights ──
  const insights: { tone: Tone; title: string; text: string }[] = []
  if (apps.length === 0) {
    insights.push({ tone: 'info', title: 'No applications assigned', text: 'When the operator sends an audited application for a certification decision, your review queue and outcomes will appear here.' })
  } else {
    if (pending.length > 0) insights.push({ tone: pending.length > 3 ? 'warn' : 'info', title: `${pending.length} awaiting your decision`, text: `${preReview.length} in pre-audit review, ${finalReview.length} in final review. Clear the oldest first to keep turnaround short.` })
    if (clarify.length > 0) insights.push({ tone: 'warn', title: `${clarify.length} in clarification`, text: 'You have asked for clarification — chase the operator, auditor or establishment so these can move.' })
    if (certified.length > 0) insights.push({ tone: 'good', title: `Certification rate ${certRate}%`, text: `${certified.length} certified vs ${notApproved.length} not approved across ${decided.length} decided.` })
    if (finalReview.length > 0) insights.push({ tone: 'info', title: `${finalReview.length} at final review`, text: 'Audit reports are in — a final conforming/non-conforming decision is the last gate before certification.' })
  }

  const today = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Certification Body</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{today} — review queue, outcomes &amp; insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((k) => <Kpi key={k.label} {...k} />)}
      </div>

      {/* Outcomes donut + review queue */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Decision outcomes">
          {donut.length > 0 ? (
            <div className="flex flex-col items-center">
              <Donut segments={donut} centerValue={apps.length} centerLabel="assigned" />
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
          ) : <p className="text-sm py-10 text-center" style={{ color: '#94A3B8' }}>No applications assigned.</p>}
        </Card>
        <div className="lg:col-span-2">
          <Card title="Review queue" sub="Applications waiting on a Certification Body action">
            <StatBars rows={queueRows} empty="Nothing waiting on you right now." />
          </Card>
        </div>
      </div>

      {/* Trend + programme mix */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Applications received — last 6 months" sub="Incoming decisions by submission month">
            <LineChart labels={months.map((m) => m.label)} series={[{ name: 'Received', color: '#854D0E', values: months.map((m) => m.count) }]} />
          </Card>
        </div>
        <Card title="Programme mix">
          <StatBars rows={progRows} empty="No applications yet." />
        </Card>
      </div>

      {/* Full status breakdown */}
      <Card title="All assigned by status">
        <StatBars rows={statusRows} empty="No applications assigned yet." />
      </Card>

      {/* Insights */}
      <Card title="Insights & recommendations" right={<Lightbulb className="w-4 h-4" style={{ color: '#C8A951' }} />}>
        <Insights items={insights} />
      </Card>

      {/* Assigned applications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Assigned applications</h2>
        </div>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          {apps.length > 0 ? (
            <div className="divide-y" style={{ borderColor: '#F8FAFC' }}>
              {apps.slice(0, 8).map((a) => {
                const s = statusMeta(a.status)
                return (
                  <Link key={a.id} href={`/cb/applications/${a.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{a.applicant?.name_en || a.applicant?.email || '—'}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{PROGRAMME_LABEL[a.programme] ?? a.programme}</p>
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
              <p className="text-sm font-medium" style={{ color: '#475569' }}>No applications assigned</p>
              <p className="text-xs mt-0.5">The National Operator assigns completed audits to you for a decision.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
