'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Download, ClipboardList, Inbox } from 'lucide-react'
import type { TrackerRow } from '@/lib/db/tracker'

type Meta = { label: string; color: string; bg: string }

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\r\n')
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const iso = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

export default function TrackerClient({
  rows, statusMeta, programmeLabel, cbDecisionLabel,
}: {
  rows: TrackerRow[]
  statusMeta: Record<string, Meta>
  programmeLabel: Record<string, string>
  cbDecisionLabel: Record<string, string>
}) {
  const [q, setQ] = useState('')
  const [programme, setProgramme] = useState('')
  const [status, setStatus] = useState('')
  const [gov, setGov] = useState('')

  const programmes = useMemo(() => Array.from(new Set(rows.map((r) => r.programme))), [rows])
  const statuses = useMemo(() => Array.from(new Set(rows.map((r) => r.status))), [rows])
  const govs = useMemo(() => Array.from(new Set(rows.map((r) => r.governorate).filter(Boolean) as string[])), [rows])

  const sm = (s: string) => statusMeta[s] ?? { label: s.replace(/_/g, ' '), color: '#475569', bg: '#F1F5F9' }
  const prog = (p: string) => programmeLabel[p] ?? p

  const filtered = useMemo(() => rows.filter((r) => {
    const needle = q.toLowerCase()
    const matchQ = !needle || [r.entityName, r.contactName, r.contactEmail, r.applicantEmail, r.auditorName].some((v) => (v ?? '').toLowerCase().includes(needle))
    return matchQ && (!programme || r.programme === programme) && (!status || r.status === status) && (!gov || r.governorate === gov)
  }), [rows, q, programme, status, gov])

  function exportCsv() {
    downloadCsv(
      `tracker-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Establishment', 'Kind', 'Type', 'Governorate', 'Contact', 'Contact email', 'Contact phone', 'Registered', 'Reg. status', 'Programme', 'Application status', 'Auditor', 'Certification Body', 'CB decision', 'Submitted'],
      filtered.map((r) => [
        r.entityName, r.kind, r.type ?? '', r.governorate ?? '', r.contactName ?? '', r.contactEmail ?? '', r.contactPhone ?? '',
        iso(r.registeredAt), r.registrationStatus ?? '', prog(r.programme), sm(r.status).label, r.auditorName ?? '', r.cbName ?? '',
        r.cbDecision ? (cbDecisionLabel[r.cbDecision] ?? r.cbDecision) : '', iso(r.submittedAt),
      ]),
    )
  }

  const th = 'text-left px-4 py-2.5 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap'
  const sel = { border: '1px solid #E2E8F0', color: '#475569' } as const

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Tracker</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Every application with its establishment, registration details, auditor &amp; status.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white flex-1 min-w-[180px]" style={{ border: '1px solid #E2E8F0' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search establishment, contact, auditor…" className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }} />
        </div>
        <select value={programme} onChange={(e) => setProgramme(e.target.value)} className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={sel}>
          <option value="">All programmes</option>
          {programmes.map((p) => <option key={p} value={p}>{prog(p)}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={sel}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{sm(s).label}</option>)}
        </select>
        <select value={gov} onChange={(e) => setGov(e.target.value)} className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={sel}>
          <option value="">All governorates</option>
          {govs.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <button onClick={exportCsv} disabled={filtered.length === 0} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#1B4332' }}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#F1F5F9' }}>
          <ClipboardList className="w-4 h-4" style={{ color: '#2563EB' }} />
          <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>Applications</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>{filtered.length}</span>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 1100 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#94A3B8' }}>
                  <th className={th}>Establishment</th>
                  <th className={th}>Type</th>
                  <th className={th}>Governorate</th>
                  <th className={th}>Contact</th>
                  <th className={th}>Programme</th>
                  <th className={th}>Status</th>
                  <th className={th}>Auditor</th>
                  <th className={th}>Cert. Body</th>
                  <th className={th}>Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#F1F5F9' }}>
                {filtered.map((r) => {
                  const s = sm(r.status)
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/applications/${r.id}`} className="font-semibold hover:underline" style={{ color: '#1E293B' }}>{r.entityName}</Link>
                        <p className="text-[11px]" style={{ color: '#94A3B8' }}>{r.kind}</p>
                      </td>
                      <td className="px-4 py-3 capitalize" style={{ color: '#475569' }}>{r.type ?? '—'}</td>
                      <td className="px-4 py-3" style={{ color: '#475569' }}>{r.governorate ?? '—'}</td>
                      <td className="px-4 py-3">
                        <p style={{ color: '#334155' }}>{r.contactName ?? '—'}</p>
                        <p className="text-[11px]" style={{ color: '#94A3B8' }}>{r.contactEmail ?? r.applicantEmail ?? ''}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#475569' }}>{prog(r.programme)}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: r.auditorName ? '#475569' : '#CBD5E1' }}>{r.auditorName ?? 'Unassigned'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p style={{ color: r.cbName ? '#475569' : '#CBD5E1' }}>{r.cbName ?? 'Unassigned'}</p>
                        {r.cbDecision && r.cbDecision !== 'pending' && <p className="text-[11px]" style={{ color: '#B45309' }}>{cbDecisionLabel[r.cbDecision] ?? r.cbDecision}</p>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#64748B' }}>{iso(r.submittedAt) || '—'}</td>
                    </tr>
                  )
                })}
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
    </div>
  )
}
