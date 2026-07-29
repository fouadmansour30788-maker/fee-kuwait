import Link from 'next/link'
import {
  FileCheck, Award, Users, Clock, Activity, Inbox, FileText,
  Gauge, Lightbulb, CheckCircle2, AlertTriangle, Info, MapPin,
} from 'lucide-react'
import { operatorStats, PROGRAMME_LABEL, statusMeta, STATUS_META } from '@/lib/db/applications'
import { CERTIFIED_STATUSES, NOT_APPROVED_STATUSES, CB_STATUSES, AUDIT_STATUSES } from '@/lib/workflow'
import { listCertificates } from '@/lib/db/certificates'
import { listMembers } from '@/lib/db/members'
import { LineChart, Funnel, Radar, Donut } from '@/components/dashboard/charts'
import GovernorateMap, { type GovDatum } from '@/components/dashboard/GovernorateMap'

const PROGRAMME_COLOR: Record<string, string> = {
  'eco-schools': '#2563EB', 'blue-flag': '#0891B2', 'green-key': '#C8A951',
  'leaf': '#16A34A', 'yre': '#7C3AED', 'eco-campus': '#DB2777',
}
const PROGRAMME_SHORT: Record<string, string> = {
  'eco-schools': 'Eco-Sch', 'blue-flag': 'Blue Flag', 'green-key': 'Green Key',
  'leaf': 'LEAF', 'yre': 'YRE', 'eco-campus': 'Campus',
}

const CERTIFIED = [...CERTIFIED_STATUSES, 'approved']
const NOT_APPROVED = NOT_APPROVED_STATUSES
const IN_PROGRESS = ['new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'audit', 'cb_review',
  'pending_eligibility', 'in_progress', ...CB_STATUSES, ...AUDIT_STATUSES,
  'pre_audit_rectification_required', 'pre_audit_rectification_open', 'ready_for_auditor',
  'post_audit_rectification_required', 'post_audit_corrective_open', 'further_corrective_required',
  'cb_clarification_operator', 'cb_clarification_auditor', 'cb_clarification_establishment']

export default async function AdminDashboard() {
  const [{ apps, members }, certs, memberRows] = await Promise.all([operatorStats(), listCertificates(), listMembers()])

  const total = apps.length
  const certifiedCount = apps.filter((a) => CERTIFIED.includes(a.status)).length
  const inProgress = apps.filter((a) => IN_PROGRESS.includes(a.status)).length
  const notApproved = apps.filter((a) => NOT_APPROVED.includes(a.status)).length
  const decided = certifiedCount + notApproved
  const certRate = decided ? Math.round((certifiedCount / decided) * 100) : 0

  // Avg days from submission to certificate issuance.
  const submittedById = new Map(apps.map((a) => [a.id, a.submitted_at]))
  const durations = certs
    .map((c) => {
      const sub = submittedById.get(c.application_id)
      if (!sub || !c.issued_at) return null
      return (new Date(c.issued_at).getTime() - new Date(sub).getTime()) / 86_400_000
    })
    .filter((d): d is number => d !== null && d >= 0)
  const avgDays = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null

  // KPI tiles
  const kpis = [
    { label: 'Total applications', value: total, Icon: FileCheck, color: '#2563EB' },
    { label: 'Certification rate', value: `${certRate}%`, Icon: Gauge, color: '#059669' },
    { label: 'Certificates issued', value: certs.length, Icon: Award, color: '#C8A951' },
    { label: 'Members', value: members, Icon: Users, color: '#7C3AED' },
    { label: 'In progress', value: inProgress, Icon: Activity, color: '#D97706' },
    { label: 'Avg. days to certify', value: avgDays ?? '—', Icon: Clock, color: '#0891B2' },
  ]

  // Funnel — how far applications progress through the pipeline.
  const AUDITED_SET = [...AUDIT_STATUSES, ...CB_STATUSES, ...CERTIFIED, ...NOT_APPROVED_STATUSES]
  const CB_SET = [...CB_STATUSES, ...CERTIFIED.filter((s) => s !== 'approved'), 'not_certified']
  const reached = {
    submitted: total,
    reviewed: apps.filter((a) => a.status !== 'new').length,
    audited: apps.filter((a) => AUDITED_SET.includes(a.status)).length,
    cb: apps.filter((a) => CB_SET.includes(a.status)).length,
    certified: certifiedCount,
  }
  const funnel = [
    { label: 'Submitted', value: reached.submitted, color: '#1E40AF' },
    { label: 'In review', value: reached.reviewed, color: '#2563EB' },
    { label: 'Audited', value: reached.audited, color: '#3B82F6' },
    { label: 'CB decision', value: reached.cb, color: '#60A5FA' },
    { label: 'Certified', value: reached.certified, color: '#059669' },
  ]

  // Outcome donut
  const donutSegments = [
    { label: 'Certified', value: certifiedCount, color: '#059669' },
    { label: 'In progress', value: inProgress, color: '#D97706' },
    { label: 'Not approved', value: notApproved, color: '#DC2626' },
  ].filter((s) => s.value > 0)

  // Trend — last 8 months of submissions vs certificates.
  const now = new Date()
  const months = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 7 + i, 1)
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-GB', { month: 'short' }), submitted: 0, certified: 0 }
  })
  const bucket = (dateStr: string | null | undefined) => {
    if (!dateStr) return undefined
    const d = new Date(dateStr)
    return months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`)
  }
  for (const a of apps) { const m = bucket(a.submitted_at); if (m) m.submitted++ }
  for (const c of certs) { const m = bucket(c.issued_at); if (m) m.certified++ }

  // Radar + bars — per programme
  const byProgramme = Object.keys(PROGRAMME_LABEL).map((key) => ({
    key, label: PROGRAMME_LABEL[key], short: PROGRAMME_SHORT[key] ?? key, color: PROGRAMME_COLOR[key] ?? '#94A3B8',
    apps: apps.filter((a) => a.programme === key).length,
    certified: certs.filter((c) => c.programme === key).length,
  }))
  const progMax = Math.max(1, ...byProgramme.map((p) => p.apps))

  // Status distribution
  const statusOrder = Object.keys(STATUS_META)
  const byStatus = statusOrder
    .map((st) => ({ st, ...statusMeta(st), count: apps.filter((a) => a.status === st).length }))
    .filter((r) => r.count > 0)
  const statusMax = Math.max(1, ...byStatus.map((r) => r.count))

  // Governorate map data — canonicalise members to Kuwait's six governorates.
  const GOV_DEFS = [
    { key: 'capital', label: 'Al Asimah' },
    { key: 'hawalli', label: 'Hawalli' },
    { key: 'farwaniyah', label: 'Al Farwaniyah' },
    { key: 'mubarak', label: 'Mubarak Al-Kabeer' },
    { key: 'ahmadi', label: 'Al Ahmadi' },
    { key: 'jahra', label: 'Al Jahra' },
  ]
  const canonGov = (raw: string | null) => {
    const n = (raw ?? '').toLowerCase().replace(/[^a-z]/g, '')
    if (n.includes('asimah') || n.includes('capital') || n.includes('kuwaitcity') || n === 'alkuwait' || n === 'kuwait') return 'capital'
    if (n.includes('hawalli')) return 'hawalli'
    if (n.includes('farwani')) return 'farwaniyah'
    if (n.includes('mubarak')) return 'mubarak'
    if (n.includes('ahmadi')) return 'ahmadi'
    if (n.includes('jahra')) return 'jahra'
    return 'other'
  }
  const blankGov = () => ({ total: 0, schools: 0, establishments: 0, active: 0 })
  const govAgg: Record<string, ReturnType<typeof blankGov>> = { other: blankGov() }
  for (const def of GOV_DEFS) govAgg[def.key] = blankGov()
  for (const m of memberRows) {
    const a = govAgg[canonGov(m.governorate)]
    a.total++
    if (m.kind === 'School') a.schools++
    else a.establishments++
    if (m.status === 'active') a.active++
  }
  const govData: GovDatum[] = GOV_DEFS.map((def) => ({ key: def.key, label: def.label, ...govAgg[def.key] }))
  const govOther: GovDatum = { key: 'other', label: 'Other / unspecified', ...govAgg.other }

  // ── Auto insights & recommendations ──
  const expiringSoon = certs.filter((c) => {
    if (!c.expires_at) return false
    const days = (new Date(c.expires_at).getTime() - now.getTime()) / 86_400_000
    return days > 0 && days <= 90
  }).length
  const awaitingAudit = apps.filter((a) => AUDIT_STATUSES.includes(a.status)).length
  const awaitingCb = apps.filter((a) => CB_STATUSES.includes(a.status)).length
  const stuckDocs = apps.filter((a) => a.status === 'documents_pending').length
  const bottleneck = [...byStatus].filter((r) => IN_PROGRESS.includes(r.st)).sort((a, b) => b.count - a.count)[0]
  const thisMonth = months[months.length - 1].submitted
  const lastMonth = months[months.length - 2]?.submitted ?? 0
  const emptyProgrammes = byProgramme.filter((p) => p.apps === 0)

  type Tone = 'good' | 'warn' | 'info'
  const insights: { tone: Tone; title: string; text: string }[] = []
  if (total === 0) {
    insights.push({ tone: 'info', title: 'No applications yet', text: 'As schools and establishments apply, live analysis and recommendations will appear here.' })
  } else {
    insights.push({
      tone: certRate >= 60 ? 'good' : 'info',
      title: `Certification rate ${certRate}%`,
      text: `${certifiedCount} certified out of ${decided || 0} decided application${decided === 1 ? '' : 's'}${inProgress ? `; ${inProgress} still in progress.` : '.'}`,
    })
    if (thisMonth !== lastMonth) {
      const up = thisMonth > lastMonth
      insights.push({
        tone: 'info',
        title: `Submissions ${up ? 'up' : 'down'} this month`,
        text: `${thisMonth} this month vs ${lastMonth} last month${up ? ' — momentum is building.' : ' — consider an outreach push.'}`,
      })
    }
    if (awaitingAudit > 0) insights.push({ tone: 'warn', title: `${awaitingAudit} awaiting audit`, text: 'Applications are under audit — check that an auditor is actively assigned and progressing.' })
    if (awaitingCb > 0) insights.push({ tone: 'warn', title: `${awaitingCb} awaiting CB decision`, text: 'Audited applications are waiting on a Certification Body decision. Assign or nudge the CB reviewer.' })
    if (stuckDocs > 0) insights.push({ tone: 'warn', title: `${stuckDocs} pending documents`, text: 'These applicants owe supporting evidence. A reminder email will help them move forward.' })
    if (bottleneck && bottleneck.count >= 3) insights.push({ tone: 'info', title: `Bottleneck: ${bottleneck.label}`, text: `${bottleneck.count} applications are sitting at “${bottleneck.label}” — the largest in-progress stage.` })
    if (expiringSoon > 0) insights.push({ tone: 'warn', title: `${expiringSoon} certificate${expiringSoon === 1 ? '' : 's'} expiring ≤90 days`, text: 'Reach out to these holders to start their renewal before the certificate lapses.' })
    if (emptyProgrammes.length > 0) insights.push({ tone: 'info', title: 'Programmes with no applications', text: `${emptyProgrammes.map((p) => p.label).join(', ')} — an awareness campaign could open these up.` })
    if (avgDays !== null) insights.push({ tone: avgDays <= 45 ? 'good' : 'info', title: `~${avgDays} days to certify`, text: `Average time from submission to certificate${avgDays > 45 ? ' — trimming review/audit hand-offs would speed this up.' : ' — a healthy turnaround.'}` })
  }
  const toneMeta: Record<Tone, { color: string; bg: string; Icon: typeof Info }> = {
    good: { color: '#059669', bg: '#ECFDF3', Icon: CheckCircle2 },
    warn: { color: '#B45309', bg: '#FEF9EC', Icon: AlertTriangle },
    info: { color: '#2563EB', bg: '#EFF6FF', Icon: Info },
  }

  const recent = apps.slice(0, 6)
  const today = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Operations dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{today} — live figures, trends &amp; recommendations</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium" style={{ background: '#D1FAE5', color: '#065F46' }}>
          <Activity className="w-3.5 h-3.5" /> System operational
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${k.color}14` }}>
              <k.Icon className="w-5 h-5" style={{ color: k.color }} />
            </div>
            <p className="text-2xl font-bold tracking-tight" style={{ color: '#0F172A' }}>{k.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Funnel + Outcome donut */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-bold text-sm mb-5" style={{ color: '#0F172A' }}>Certification pipeline</h2>
          <Funnel stages={funnel} />
        </div>
        <div className="bg-white rounded-2xl border p-6 flex flex-col items-center" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-bold text-sm mb-4 self-start" style={{ color: '#0F172A' }}>Outcomes</h2>
          {donutSegments.length > 0 ? (
            <>
              <Donut segments={donutSegments} centerValue={total} centerLabel="applications" />
              <div className="mt-4 w-full space-y-1.5">
                {donutSegments.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="flex-1" style={{ color: '#475569' }}>{s.label}</span>
                    <span className="font-bold" style={{ color: '#0F172A' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-sm py-10" style={{ color: '#94A3B8' }}>No applications yet.</p>}
        </div>
      </div>

      {/* Trend line */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>Submissions &amp; certificates — last 8 months</h2>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}><span className="w-3 h-0.5 rounded" style={{ background: '#2563EB' }} /> Submitted</span>
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}><span className="w-3 h-0.5 rounded" style={{ background: '#059669' }} /> Certified</span>
          </div>
        </div>
        <LineChart
          labels={months.map((m) => m.label)}
          series={[
            { name: 'Submitted', color: '#2563EB', values: months.map((m) => m.submitted) },
            { name: 'Certified', color: '#059669', values: months.map((m) => m.certified) },
          ]}
        />
      </div>

      {/* Radar + status bars */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>Programme coverage</h2>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#2563EB' }} /> Applications</span>
              <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#059669' }} /> Certified</span>
            </div>
          </div>
          <Radar
            axes={byProgramme.map((p) => p.short)}
            series={[
              { name: 'Applications', color: '#2563EB', values: byProgramme.map((p) => p.apps) },
              { name: 'Certified', color: '#059669', values: byProgramme.map((p) => p.certified) },
            ]}
          />
        </div>
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-bold text-sm mb-5" style={{ color: '#0F172A' }}>Applications by status</h2>
          {byStatus.length > 0 ? (
            <div className="space-y-3">
              {byStatus.map((r) => (
                <div key={r.st}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: '#334155' }}>{r.label}</span>
                    <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{r.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((r.count / statusMax) * 100)}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm" style={{ color: '#94A3B8' }}>No applications yet.</p>}
        </div>
      </div>

      {/* Insights & recommendations */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4" style={{ color: '#C8A951' }} />
          <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>Insights &amp; recommendations</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {insights.map((ins, i) => {
            const m = toneMeta[ins.tone]
            return (
              <div key={i} className="flex items-start gap-3 rounded-xl p-3.5" style={{ background: m.bg }}>
                <m.Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: m.color }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{ins.title}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#475569' }}>{ins.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Interactive governorate map */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4" style={{ color: '#0891B2' }} />
          <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>Members by governorate</h2>
          <span className="text-[11px]" style={{ color: '#94A3B8' }}>— click a region to filter the figures</span>
        </div>
        {memberRows.length > 0
          ? <GovernorateMap data={govData} other={govOther} />
          : <p className="text-sm py-8 text-center" style={{ color: '#94A3B8' }}>No members yet — governorate figures will appear as schools and establishments register.</p>}
      </div>

      {/* Recent applications */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
            <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>Recent applications</h2>
            <Link href="/applications" className="text-xs font-semibold" style={{ color: '#2563EB' }}>View all →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: '#F8FAFC' }}>
            {recent.map((app) => {
              const s = statusMeta(app.status)
              return (
                <Link key={app.id} href={`/applications/${app.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                    <FileText className="w-4 h-4" style={{ color: '#64748B' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>{app.applicant?.name_en || app.applicant?.email || '—'}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{PROGRAMME_LABEL[app.programme] ?? app.programme}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </Link>
              )
            })}
            {recent.length === 0 && (
              <div className="py-12 text-center" style={{ color: '#94A3B8' }}>
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium" style={{ color: '#475569' }}>No applications yet</p>
              </div>
            )}
          </div>
      </div>
    </div>
  )
}
