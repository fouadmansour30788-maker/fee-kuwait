'use client'

import { useMemo, useState } from 'react'
import { FileBarChart, Download, Award, FileCheck, Clock, XCircle, Inbox, Gauge, Lightbulb, CheckCircle2, AlertTriangle, Info, FileText } from 'lucide-react'
import { CERTIFIED_STATUSES, NOT_APPROVED_STATUSES } from '@/lib/workflow'

export interface AppReportRow {
  id: string
  applicant: string
  email: string
  programme: string
  programmeKey: string
  status: string
  statusLabel: string
  statusColor: string
  statusBg: string
  submitted: string
}

export interface CertReportRow {
  number: string
  applicant: string
  programme: string
  issued: string
  expires: string
  status: string
}

const CERTIFIED = [...CERTIFIED_STATUSES, 'approved']
const NOT_APPROVED = NOT_APPROVED_STATUSES
// Everything that is neither certified nor rejected is "in progress".
const IN_PROGRESS = (s: string) => !CERTIFIED.includes(s) && !NOT_APPROVED.includes(s)

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\r\n')
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const monthKey = (s: string) => { if (!s) return ''; const d = new Date(s); return `${d.getFullYear()}-${d.getMonth()}` }
const daysUntil = (s: string) => (s ? (new Date(s).getTime() - Date.now()) / 86_400_000 : NaN)

type Tone = 'good' | 'warn' | 'info'
const toneMeta: Record<Tone, { color: string; bg: string; Icon: typeof Info }> = {
  good: { color: '#059669', bg: '#ECFDF3', Icon: CheckCircle2 },
  warn: { color: '#B45309', bg: '#FEF9EC', Icon: AlertTriangle },
  info: { color: '#2563EB', bg: '#EFF6FF', Icon: Info },
}

export default function ReportsClient({
  appRows, certRows, programmes, statuses, avgDays,
}: {
  appRows: AppReportRow[]
  certRows: CertReportRow[]
  programmes: { key: string; label: string }[]
  statuses: { key: string; label: string }[]
  avgDays: number | null
}) {
  const [programme, setProgramme] = useState('')
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')

  // ── Aggregates ──
  const total = appRows.length
  const certified = appRows.filter((a) => CERTIFIED.includes(a.status)).length
  const inProgress = appRows.filter((a) => IN_PROGRESS(a.status)).length
  const notApproved = appRows.filter((a) => NOT_APPROVED.includes(a.status)).length
  const decided = certified + notApproved
  const certRate = decided ? Math.round((certified / decided) * 100) : 0

  const byProgramme = useMemo(() => programmes.map((p) => {
    const rows = appRows.filter((a) => a.programmeKey === p.key)
    const c = rows.filter((a) => CERTIFIED.includes(a.status)).length
    const ip = rows.filter((a) => IN_PROGRESS(a.status)).length
    const na = rows.filter((a) => NOT_APPROVED.includes(a.status)).length
    const dec = c + na
    return { ...p, apps: rows.length, certified: c, inProgress: ip, notApproved: na, rate: dec ? Math.round((c / dec) * 100) : 0 }
  }).filter((p) => p.apps > 0).sort((a, b) => b.apps - a.apps), [appRows, programmes])

  const byStatus = useMemo(() => {
    const m = new Map<string, { label: string; color: string; bg: string; count: number }>()
    for (const a of appRows) {
      const e = m.get(a.status) ?? { label: a.statusLabel, color: a.statusColor, bg: a.statusBg, count: 0 }
      e.count++; m.set(a.status, e)
    }
    return Array.from(m.values()).sort((a, b) => b.count - a.count)
  }, [appRows])

  const months = useMemo(() => {
    const now = new Date()
    const arr = Array.from({ length: 8 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 7 + i, 1)
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', month: 'short', year: '2-digit' }), submitted: 0, certified: 0 }
    })
    for (const a of appRows) { const m = arr.find((x) => x.key === monthKey(a.submitted)); if (m) m.submitted++ }
    for (const c of certRows) { const m = arr.find((x) => x.key === monthKey(c.issued)); if (m) m.certified++ }
    return arr
  }, [appRows, certRows])
  const monthMax = Math.max(1, ...months.map((m) => Math.max(m.submitted, m.certified)))

  const expiringSoon = certRows.filter((c) => { const d = daysUntil(c.expires); return d > 0 && d <= 90 }).length
  const topProg = byProgramme[0]
  const thisMonth = months[7].submitted
  const lastMonth = months[6]?.submitted ?? 0
  const emptyProgrammes = programmes.filter((p) => !appRows.some((a) => a.programmeKey === p.key))
  const bottleneck = useMemo(() => {
    const m = new Map<string, number>()
    for (const a of appRows) if (IN_PROGRESS(a.status)) m.set(a.statusLabel, (m.get(a.statusLabel) ?? 0) + 1)
    const top = Array.from(m.entries()).sort((x, y) => y[1] - x[1])[0]
    return top ? { label: top[0], count: top[1] } : null
  }, [appRows])

  // ── Narrative ──
  const today = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', day: 'numeric', month: 'long', year: 'numeric' })
  const narrative = total === 0
    ? 'No applications have been submitted yet. This report will populate automatically as schools and establishments apply.'
    : [
        `As of ${today}, the programme has received ${total} application${total === 1 ? '' : 's'}${topProg ? `, led by ${topProg.label} (${topProg.apps})` : ''}.`,
        `${certified} ${certified === 1 ? 'has' : 'have'} been certified or approved${decided ? ` — a ${certRate}% certification rate across ${decided} decided application${decided === 1 ? '' : 's'}` : ''}, with ${inProgress} in progress and ${notApproved} not approved.`,
        avgDays !== null ? `Average time from submission to certificate is about ${avgDays} days.` : '',
        thisMonth !== lastMonth ? `Submissions are ${thisMonth > lastMonth ? 'up' : 'down'} this month (${thisMonth} vs ${lastMonth} last month).` : '',
        expiringSoon > 0 ? `${expiringSoon} certificate${expiringSoon === 1 ? '' : 's'} expire within 90 days and will need renewal.` : '',
      ].filter(Boolean).join(' ')

  // ── Insights ──
  const insights: { tone: Tone; title: string; text: string }[] = []
  if (total > 0) {
    insights.push({ tone: certRate >= 60 ? 'good' : 'info', title: `Certification rate ${certRate}%`, text: `${certified} certified of ${decided || 0} decided.` })
    if (thisMonth !== lastMonth) insights.push({ tone: 'info', title: `Submissions ${thisMonth > lastMonth ? 'up' : 'down'} this month`, text: `${thisMonth} vs ${lastMonth} last month.` })
    if (bottleneck && bottleneck.count >= 3) insights.push({ tone: 'warn', title: `Bottleneck: ${bottleneck.label}`, text: `${bottleneck.count} applications sitting at this stage.` })
    if (expiringSoon > 0) insights.push({ tone: 'warn', title: `${expiringSoon} certificate${expiringSoon === 1 ? '' : 's'} expiring ≤90 days`, text: 'Start renewals before they lapse.' })
    if (emptyProgrammes.length > 0) insights.push({ tone: 'info', title: 'Programmes with no applications', text: `${emptyProgrammes.map((p) => p.label).join(', ')} — an awareness push could open these up.` })
    if (avgDays !== null) insights.push({ tone: avgDays <= 45 ? 'good' : 'info', title: `~${avgDays} days to certify`, text: avgDays > 45 ? 'Trimming review/audit hand-offs would speed this up.' : 'A healthy turnaround.' })
  }

  const filtered = useMemo(() => appRows.filter((a) =>
    (!programme || a.programmeKey === programme) &&
    (!status || a.status === status) &&
    (!q || a.applicant.toLowerCase().includes(q.toLowerCase()) || a.email.toLowerCase().includes(q.toLowerCase()))
  ), [appRows, programme, status, q])

  const tiles = [
    { label: 'Applications', value: total, Icon: FileCheck, color: '#2563EB' },
    { label: 'Certification rate', value: `${certRate}%`, Icon: Gauge, color: '#059669' },
    { label: 'In progress', value: inProgress, Icon: Clock, color: '#D97706' },
    { label: 'Not approved', value: notApproved, Icon: XCircle, color: '#DC2626' },
    { label: 'Certificates', value: certRows.length, Icon: Award, color: '#C8A951' },
    { label: 'Avg. days to certify', value: avgDays ?? '—', Icon: Clock, color: '#0891B2' },
  ]

  function exportApps() {
    downloadCsv(`applications-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Applicant', 'Email', 'Programme', 'Status', 'Submitted'],
      filtered.map((a) => [a.applicant, a.email, a.programme, a.statusLabel, a.submitted]))
  }
  function exportCerts() {
    downloadCsv(`certificates-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Certificate', 'Holder', 'Programme', 'Issued', 'Expires', 'Status'],
      certRows.map((c) => [c.number, c.applicant, c.programme, c.issued, c.expires, c.status]))
  }
  function exportProgramme() {
    downloadCsv(`by-programme-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Programme', 'Applications', 'Certified', 'In progress', 'Not approved', 'Cert rate %'],
      byProgramme.map((p) => [p.label, p.apps, p.certified, p.inProgress, p.notApproved, p.rate]))
  }

  const selectStyle = { border: '1px solid #E2E8F0', color: '#1E293B' } as const
  const th = 'text-left px-5 py-2.5 font-semibold text-xs uppercase tracking-wide'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Reports</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Live analysis of applications &amp; certificates — with breakdowns, narrative and CSV export.</p>
      </div>

      {/* Executive summary */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-2 mb-2">
          <FileBarChart className="w-4 h-4" style={{ color: '#2563EB' }} />
          <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Executive summary</h2>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{narrative}</p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${t.color}14` }}>
              <t.Icon className="w-5 h-5" style={{ color: t.color }} />
            </div>
            <p className="text-2xl font-bold tracking-tight" style={{ color: '#0F172A' }}>{t.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t.label}</p>
          </div>
        ))}
      </div>

      {/* By programme + by status */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: '#F1F5F9' }}>
            <h2 className="text-base font-bold mr-auto" style={{ color: '#0F172A' }}>By programme</h2>
            <button onClick={exportProgramme} disabled={byProgramme.length === 0} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40" style={{ background: '#2563EB' }}>
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
          {byProgramme.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr style={{ color: '#94A3B8' }}>
                  <th className={th}>Programme</th><th className={th}>Apps</th><th className={th}>Certified</th><th className={th}>In prog.</th><th className={th}>Rate</th>
                </tr></thead>
                <tbody>
                  {byProgramme.map((p) => (
                    <tr key={p.key} className="border-t" style={{ borderColor: '#F1F5F9' }}>
                      <td className="px-5 py-2.5 font-semibold" style={{ color: '#1E293B' }}>{p.label}</td>
                      <td className="px-5 py-2.5" style={{ color: '#475569' }}>{p.apps}</td>
                      <td className="px-5 py-2.5" style={{ color: '#059669' }}>{p.certified}</td>
                      <td className="px-5 py-2.5" style={{ color: '#D97706' }}>{p.inProgress}</td>
                      <td className="px-5 py-2.5 font-semibold" style={{ color: '#0F172A' }}>{p.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm p-5" style={{ color: '#94A3B8' }}>No applications yet.</p>}
        </div>

        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-base font-bold mb-4" style={{ color: '#0F172A' }}>By status</h2>
          {byStatus.length > 0 ? (
            <div className="space-y-3">
              {byStatus.map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: '#334155' }}>{r.label}</span>
                    <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{r.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((r.count / total) * 100)}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm" style={{ color: '#94A3B8' }}>No applications yet.</p>}
        </div>
      </div>

      {/* Monthly */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="p-4 border-b" style={{ borderColor: '#F1F5F9' }}>
          <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Monthly — submissions &amp; certificates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ color: '#94A3B8' }}><th className={th}>Month</th><th className={th}>Submitted</th><th className={th}>Certified</th><th className={th} style={{ width: '40%' }}>Volume</th></tr></thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.key} className="border-t" style={{ borderColor: '#F1F5F9' }}>
                  <td className="px-5 py-2.5 font-semibold" style={{ color: '#1E293B' }}>{m.label}</td>
                  <td className="px-5 py-2.5" style={{ color: '#2563EB' }}>{m.submitted}</td>
                  <td className="px-5 py-2.5" style={{ color: '#059669' }}>{m.certified}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-1 h-4">
                      <div className="h-2 rounded-full" style={{ width: `${(m.submitted / monthMax) * 100}%`, background: '#2563EB', minWidth: m.submitted ? 4 : 0 }} />
                      <div className="h-2 rounded-full" style={{ width: `${(m.certified / monthMax) * 100}%`, background: '#059669', minWidth: m.certified ? 4 : 0 }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4" style={{ color: '#C8A951' }} />
            <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Insights &amp; recommendations</h2>
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
      )}

      {/* Applications register */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-3 flex-wrap p-4 border-b" style={{ borderColor: '#F1F5F9' }}>
          <div className="flex items-center gap-2 mr-auto">
            <FileText className="w-4 h-4" style={{ color: '#2563EB' }} />
            <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Applications</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>{filtered.length}</span>
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search applicant…" className="text-sm px-3 py-2 rounded-xl outline-none" style={selectStyle} />
          <select value={programme} onChange={(e) => setProgramme(e.target.value)} className="text-sm px-3 py-2 rounded-xl outline-none bg-white" style={selectStyle}>
            <option value="">All programmes</option>
            {programmes.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm px-3 py-2 rounded-xl outline-none bg-white" style={selectStyle}>
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={exportApps} disabled={filtered.length === 0} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#2563EB' }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ color: '#94A3B8' }}><th className={th}>Applicant</th><th className={th}>Programme</th><th className={th}>Status</th><th className={th}>Submitted</th></tr></thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t" style={{ borderColor: '#F1F5F9' }}>
                    <td className="px-5 py-3">
                      <p className="font-semibold" style={{ color: '#1E293B' }}>{a.applicant}</p>
                      {a.email && <p className="text-xs" style={{ color: '#94A3B8' }}>{a.email}</p>}
                    </td>
                    <td className="px-5 py-3" style={{ color: '#475569' }}>{a.programme}</td>
                    <td className="px-5 py-3"><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: a.statusBg, color: a.statusColor }}>{a.statusLabel}</span></td>
                    <td className="px-5 py-3" style={{ color: '#64748B' }}>{a.submitted || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center" style={{ color: '#94A3B8' }}>
            <Inbox className="w-9 h-9 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No applications match these filters</p>
          </div>
        )}
      </div>

      {/* Certificates register */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-3 flex-wrap p-4 border-b" style={{ borderColor: '#F1F5F9' }}>
          <div className="flex items-center gap-2 mr-auto">
            <Award className="w-4 h-4" style={{ color: '#C8A951' }} />
            <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Certificates</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>{certRows.length}</span>
            {expiringSoon > 0 && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>{expiringSoon} expiring ≤90d</span>}
          </div>
          <button onClick={exportCerts} disabled={certRows.length === 0} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#C8A951' }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        {certRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ color: '#94A3B8' }}><th className={th}>Certificate</th><th className={th}>Holder</th><th className={th}>Programme</th><th className={th}>Issued</th><th className={th}>Expires</th></tr></thead>
              <tbody>
                {certRows.map((c) => {
                  const soon = (() => { const d = daysUntil(c.expires); return d > 0 && d <= 90 })()
                  return (
                    <tr key={c.number} className="border-t" style={{ borderColor: '#F1F5F9' }}>
                      <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: '#1E293B' }}>{c.number}</td>
                      <td className="px-5 py-3" style={{ color: '#475569' }}>{c.applicant}</td>
                      <td className="px-5 py-3" style={{ color: '#475569' }}>{c.programme}</td>
                      <td className="px-5 py-3" style={{ color: '#64748B' }}>{c.issued || '—'}</td>
                      <td className="px-5 py-3">
                        <span style={{ color: soon ? '#B45309' : '#64748B', fontWeight: soon ? 600 : 400 }}>{c.expires || '—'}</span>
                        {soon && <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>soon</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center" style={{ color: '#94A3B8' }}>
            <Inbox className="w-9 h-9 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No certificates issued yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
