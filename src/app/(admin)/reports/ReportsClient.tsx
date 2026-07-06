'use client'

import { useMemo, useState } from 'react'
import { FileBarChart, Download, Award, FileCheck, Clock, XCircle, Inbox } from 'lucide-react'

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

// Turn a set of rows into a CSV string and trigger a download. Values are quoted
// and internal quotes escaped so commas/quotes in names never break columns.
function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\r\n')
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsClient({
  appRows, certRows, programmes, statuses,
}: {
  appRows: AppReportRow[]
  certRows: CertReportRow[]
  programmes: { key: string; label: string }[]
  statuses: { key: string; label: string }[]
}) {
  const [programme, setProgramme] = useState('')
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => appRows.filter((a) =>
    (!programme || a.programmeKey === programme) &&
    (!status || a.status === status) &&
    (!q || a.applicant.toLowerCase().includes(q.toLowerCase()) || a.email.toLowerCase().includes(q.toLowerCase()))
  ), [appRows, programme, status, q])

  const tiles = [
    { label: 'Applications', value: appRows.length, Icon: FileCheck, color: '#2563EB' },
    { label: 'Certified / approved', value: appRows.filter((a) => ['approved', 'certified', 'certified_rectification'].includes(a.status)).length, Icon: Award, color: '#059669' },
    { label: 'In progress', value: appRows.filter((a) => ['new', 'under_review', 'documents_pending', 'site_visit_scheduled', 'audit', 'cb_review'].includes(a.status)).length, Icon: Clock, color: '#D97706' },
    { label: 'Not approved', value: appRows.filter((a) => ['rejected', 'not_certified'].includes(a.status)).length, Icon: XCircle, color: '#DC2626' },
  ]

  function exportApps() {
    downloadCsv(
      `applications-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Applicant', 'Email', 'Programme', 'Status', 'Submitted'],
      filtered.map((a) => [a.applicant, a.email, a.programme, a.statusLabel, a.submitted]),
    )
  }
  function exportCerts() {
    downloadCsv(
      `certificates-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Certificate', 'Holder', 'Programme', 'Issued', 'Expires', 'Status'],
      certRows.map((c) => [c.number, c.applicant, c.programme, c.issued, c.expires, c.status]),
    )
  }

  const selectStyle = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Live application &amp; certificate register — filter and export to CSV.</p>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${t.color}14` }}>
              <t.Icon className="w-5 h-5" style={{ color: t.color }} />
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: '#0F172A' }}>{t.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t.label}</p>
          </div>
        ))}
      </div>

      {/* Applications register */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-3 flex-wrap p-4 border-b" style={{ borderColor: '#F1F5F9' }}>
          <div className="flex items-center gap-2 mr-auto">
            <FileBarChart className="w-4 h-4" style={{ color: '#2563EB' }} />
            <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Applications</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>{filtered.length}</span>
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search applicant…"
            className="text-sm px-3 py-2 rounded-xl outline-none" style={selectStyle} />
          <select value={programme} onChange={(e) => setProgramme(e.target.value)} className="text-sm px-3 py-2 rounded-xl outline-none bg-white" style={selectStyle}>
            <option value="">All programmes</option>
            {programmes.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm px-3 py-2 rounded-xl outline-none bg-white" style={selectStyle}>
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={exportApps} disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#2563EB' }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: '#94A3B8' }}>
                  <th className="font-semibold px-5 py-2.5">Applicant</th>
                  <th className="font-semibold px-5 py-2.5">Programme</th>
                  <th className="font-semibold px-5 py-2.5">Status</th>
                  <th className="font-semibold px-5 py-2.5">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t" style={{ borderColor: '#F1F5F9' }}>
                    <td className="px-5 py-3">
                      <p className="font-semibold" style={{ color: '#1E293B' }}>{a.applicant}</p>
                      {a.email && <p className="text-xs" style={{ color: '#94A3B8' }}>{a.email}</p>}
                    </td>
                    <td className="px-5 py-3" style={{ color: '#475569' }}>{a.programme}</td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: a.statusBg, color: a.statusColor }}>{a.statusLabel}</span>
                    </td>
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
          </div>
          <button onClick={exportCerts} disabled={certRows.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#C8A951' }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {certRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: '#94A3B8' }}>
                  <th className="font-semibold px-5 py-2.5">Certificate</th>
                  <th className="font-semibold px-5 py-2.5">Holder</th>
                  <th className="font-semibold px-5 py-2.5">Programme</th>
                  <th className="font-semibold px-5 py-2.5">Issued</th>
                  <th className="font-semibold px-5 py-2.5">Expires</th>
                </tr>
              </thead>
              <tbody>
                {certRows.map((c) => (
                  <tr key={c.number} className="border-t" style={{ borderColor: '#F1F5F9' }}>
                    <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: '#1E293B' }}>{c.number}</td>
                    <td className="px-5 py-3" style={{ color: '#475569' }}>{c.applicant}</td>
                    <td className="px-5 py-3" style={{ color: '#475569' }}>{c.programme}</td>
                    <td className="px-5 py-3" style={{ color: '#64748B' }}>{c.issued || '—'}</td>
                    <td className="px-5 py-3" style={{ color: '#64748B' }}>{c.expires || '—'}</td>
                  </tr>
                ))}
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
