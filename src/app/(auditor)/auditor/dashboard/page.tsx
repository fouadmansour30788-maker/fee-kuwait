import Link from 'next/link'
import {
  ClipboardCheck, CheckCircle2, Clock, ChevronRight, Inbox, CalendarClock,
  Gauge, Lightbulb, MapPin,
} from 'lucide-react'
import { auditorApplications } from '@/lib/db/audit'
import { PROGRAMME_LABEL, statusMeta, STATUS_META } from '@/lib/db/applications'
import { AUDIT_STATUSES, CLOSED_STATUSES } from '@/lib/workflow'
import { LineChart, Donut } from '@/components/dashboard/charts'
import { Kpi, Card, StatBars, Insights, lastMonths, tallyByMonth, PROGRAMME_COLOR, type Tone } from '@/components/dashboard/blocks'

export const dynamic = 'force-dynamic'

const fmtDay = (d: string) => new Date(d).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', weekday: 'short', day: '2-digit', month: 'short' })
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-GB', { timeZone: 'Asia/Kuwait', hour: '2-digit', minute: '2-digit' })

export default async function AuditorDashboard() {
  const apps = await auditorApplications()
  const now = Date.now()

  const active = apps.filter((a) => AUDIT_STATUSES.includes(a.status))
  const done = apps.filter((a) => CLOSED_STATUSES.includes(a.status))
  const scheduled = apps.filter((a) => a.status === 'audit_scheduled' || a.status === 'audit_in_progress')

  // Upcoming confirmed site visits (future), soonest first.
  const upcoming = apps
    .filter((a) => a.site_visit_date && new Date(a.site_visit_date).getTime() >= now && !CLOSED_STATUSES.includes(a.status))
    .sort((a, b) => new Date(a.site_visit_date!).getTime() - new Date(b.site_visit_date!).getTime())
  const visitsThisWeek = upcoming.filter((a) => (new Date(a.site_visit_date!).getTime() - now) <= 7 * 86_400_000).length

  const completionRate = apps.length ? Math.round((done.length / apps.length) * 100) : 0

  const kpis = [
    { label: 'Assigned to me', value: apps.length, Icon: ClipboardCheck, color: '#0891B2' },
    { label: 'Active audits', value: active.length, Icon: Clock, color: '#D97706' },
    { label: 'Completed', value: done.length, Icon: CheckCircle2, color: '#059669' },
    { label: 'Upcoming site visits', value: upcoming.length, Icon: CalendarClock, color: '#7C3AED', hint: visitsThisWeek ? `${visitsThisWeek} within 7 days` : undefined },
    { label: 'Completion rate', value: `${completionRate}%`, Icon: Gauge, color: '#2563EB' },
  ]

  // Workload by stage — every status present among my apps, by frequency.
  const statusRows = Object.keys(STATUS_META)
    .map((st) => ({ label: statusMeta(st).label, color: statusMeta(st).color, count: apps.filter((a) => a.status === st).length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)

  // Outcome split for the donut.
  const other = apps.length - active.length - done.length
  const donut = [
    { label: 'Active', value: active.length, color: '#D97706' },
    { label: 'Completed', value: done.length, color: '#059669' },
    { label: 'Awaiting / other', value: other, color: '#94A3B8' },
  ].filter((s) => s.value > 0)

  // Assignments received per month (by submission date) — my incoming workload.
  const months = tallyByMonth(lastMonths(6), apps.map((a) => a.submitted_at))

  // Programme mix.
  const progRows = Object.keys(PROGRAMME_LABEL)
    .map((k) => ({ label: PROGRAMME_LABEL[k], color: PROGRAMME_COLOR[k] ?? '#94A3B8', count: apps.filter((a) => a.programme === k).length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)

  // ── Insights ──
  const insights: { tone: Tone; title: string; text: string }[] = []
  if (apps.length === 0) {
    insights.push({ tone: 'info', title: 'No applications assigned', text: 'When the operator assigns an application for audit, your live workload and site-visit schedule will appear here.' })
  } else {
    if (visitsThisWeek > 0) insights.push({ tone: 'warn', title: `${visitsThisWeek} site visit${visitsThisWeek === 1 ? '' : 's'} within 7 days`, text: 'Confirm logistics and prepare the criteria checklist before you go on site.' })
    if (active.length > 0) insights.push({ tone: active.length > 3 ? 'warn' : 'info', title: `${active.length} active audit${active.length === 1 ? '' : 's'}`, text: `${scheduled.length} scheduled or in progress — keep them moving toward report submission.` })
    const needsDate = active.filter((a) => a.status === 'auditor_assigned' && !a.site_visit_date)
    if (needsDate.length > 0) insights.push({ tone: 'warn', title: `${needsDate.length} awaiting a site-visit date`, text: 'Confirm the date & time so the establishment and operator are notified.' })
    if (done.length > 0) insights.push({ tone: 'good', title: `${done.length} completed`, text: `You've closed ${completionRate}% of everything assigned to you.` })
    if (upcoming.length === 0 && active.length > 0) insights.push({ tone: 'info', title: 'No site visits on the calendar', text: 'Active audits have no confirmed visit date yet — schedule them to progress.' })
  }

  const today = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Auditor dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{today} — your workload, schedule &amp; insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((k) => <Kpi key={k.label} {...k} />)}
      </div>

      {/* Workload split + status breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Workload split">
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
          <Card title="Applications by stage" sub="Where your assigned audits currently sit">
            <StatBars rows={statusRows} empty="No applications assigned yet." />
          </Card>
        </div>
      </div>

      {/* Trend + programme mix */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Assignments received — last 6 months" sub="Incoming audit workload by submission month">
            <LineChart labels={months.map((m) => m.label)} series={[{ name: 'Assigned', color: '#0891B2', values: months.map((m) => m.count) }]} />
          </Card>
        </div>
        <Card title="Programme mix">
          <StatBars rows={progRows} empty="No applications yet." />
        </Card>
      </div>

      {/* Upcoming site visits */}
      <Card title="Upcoming site visits" right={<Link href="/auditor/applications" className="text-xs font-semibold" style={{ color: '#0891B2' }}>All applications →</Link>}>
        {upcoming.length > 0 ? (
          <div className="divide-y -mx-6" style={{ borderColor: '#F1F5F9' }}>
            {upcoming.slice(0, 6).map((a) => (
              <Link key={a.id} href={`/auditor/applications/${a.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F3FF' }}>
                  <MapPin className="w-4 h-4" style={{ color: '#7C3AED' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>{a.applicant?.name_en || a.applicant?.email || '—'}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{PROGRAMME_LABEL[a.programme] ?? a.programme}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: '#0F172A' }}>{fmtDay(a.site_visit_date!)}</p>
                  <p className="text-[11px]" style={{ color: '#7C3AED' }}>{fmtTime(a.site_visit_date!)}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center" style={{ color: '#94A3B8' }}>
            <CalendarClock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm" style={{ color: '#475569' }}>No site visits scheduled.</p>
            <p className="text-xs mt-0.5">Confirm a date &amp; time on an active audit to schedule one.</p>
          </div>
        )}
      </Card>

      {/* Insights */}
      <Card title="Insights & recommendations" right={<Lightbulb className="w-4 h-4" style={{ color: '#C8A951' }} />}>
        <Insights items={insights} />
      </Card>

      {/* Assigned applications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Your assigned applications</h2>
          <Link href="/auditor/applications" className="text-sm font-semibold" style={{ color: '#0891B2' }}>View all →</Link>
        </div>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          {apps.length > 0 ? (
            <div className="divide-y" style={{ borderColor: '#F8FAFC' }}>
              {apps.slice(0, 8).map((a) => {
                const s = statusMeta(a.status)
                return (
                  <Link key={a.id} href={`/auditor/applications/${a.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
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
              <p className="text-xs mt-0.5">The operator assigns applications to you for audit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
