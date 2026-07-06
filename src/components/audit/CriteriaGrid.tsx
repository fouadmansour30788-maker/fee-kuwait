'use client'

import { Fragment, useMemo, useState, useTransition } from 'react'
import { Check, X, Search, Download, AlertCircle } from 'lucide-react'
import { setCriterionResult, setCriterionNote, setInternalResult } from '@/lib/actions/assessments'
import type { CriterionRef } from '@/lib/criteria'

type Result = 'pending' | 'pass' | 'no_pass'
export interface GridAssessment { internal: Result; external: Result; note: string | null }
type Role = 'admin' | 'auditor' | 'establishment'

const RESULT_META: Record<Result, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#64748B', bg: '#F1F5F9' },
  pass: { label: 'Pass', color: '#059669', bg: '#D1FAE5' },
  no_pass: { label: 'Not pass', color: '#DC2626', bg: '#FEE2E2' },
}

function Chip({ r }: { r: Result }) {
  const m = RESULT_META[r]
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: m.bg, color: m.color }}>
      {r === 'pass' ? <Check className="w-3 h-3" /> : r === 'no_pass' ? <X className="w-3 h-3" /> : null}{m.label}
    </span>
  )
}

function Toggle({ value, onChange, disabled }: { value: Result; onChange: (r: Result) => void; disabled?: boolean }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <button onClick={() => onChange('pass')} disabled={disabled}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold disabled:opacity-50"
        style={value === 'pass' ? { background: '#059669', color: '#fff' } : { background: '#F1F5F9', color: '#059669' }}>
        <Check className="w-3 h-3" /> Pass
      </button>
      <button onClick={() => onChange('no_pass')} disabled={disabled}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold disabled:opacity-50"
        style={value === 'no_pass' ? { background: '#DC2626', color: '#fff' } : { background: '#F1F5F9', color: '#DC2626' }}>
        <X className="w-3 h-3" /> Not pass
      </button>
    </div>
  )
}

export default function CriteriaGrid({
  applicationId, criteria, initial, role, externalAuditorName,
}: {
  applicationId: string
  criteria: CriterionRef[]
  initial: Record<string, GridAssessment>
  role: Role
  externalAuditorName?: string | null
}) {
  const blank: GridAssessment = { internal: 'pending', external: 'pending', note: null }
  const [rows, setRows] = useState<Record<string, GridAssessment>>(initial)
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('all')
  const [resultFilter, setResultFilter] = useState<'all' | Result>('all')
  const [, start] = useTransition()
  const [error, setError] = useState('')

  const showInternal = role !== 'establishment'
  const showAuditor = role !== 'establishment'
  const editInternal = role === 'admin'
  const editExternal = role === 'auditor'
  const extName = externalAuditorName || (role === 'auditor' ? 'You' : '—')

  const get = (ref: string) => rows[ref] ?? blank
  function patch(ref: string, p: Partial<GridAssessment>) {
    setRows((prev) => ({ ...prev, [ref]: { ...(prev[ref] ?? blank), ...p } }))
  }
  function run(fn: () => Promise<{ error?: string }>) {
    setError('')
    start(async () => { const res = await fn(); if (res?.error) setError(res.error) })
  }

  const areas = useMemo(() => Array.from(new Set(criteria.map((c) => c.area))), [criteria])
  const filtered = criteria.filter((c) => {
    const q = search.toLowerCase()
    const matchQ = !q || c.title.toLowerCase().includes(q) || c.ref.toLowerCase().includes(q)
    const matchArea = area === 'all' || c.area === area
    const matchResult = resultFilter === 'all' || get(c.ref).external === resultFilter
    return matchQ && matchArea && matchResult
  })
  const groups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, CriterionRef[]>()
    for (const c of filtered) { if (!map.has(c.area)) { map.set(c.area, []); order.push(c.area) } map.get(c.area)!.push(c) }
    return order.map((a) => ({ area: a, rows: map.get(a)! }))
  }, [filtered])

  const extPass = criteria.filter((c) => get(c.ref).external === 'pass').length
  const extNoPass = criteria.filter((c) => get(c.ref).external === 'no_pass').length
  const intGraded = criteria.filter((c) => get(c.ref).internal !== 'pending').length

  function exportCsv() {
    const head = ['Area', 'Ref', 'Indicator', 'Internal (NO)', 'External auditor', 'External result', 'Feedback']
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
    const lines = criteria.map((c) => {
      const a = get(c.ref)
      return [c.area, c.ref, c.title, RESULT_META[a.internal].label, extName, RESULT_META[a.external].label, (a.note ?? '').replace(/\s+/g, ' ').trim()].map(esc).join(',')
    })
    const csv = ['﻿' + head.map(esc).join(','), ...lines].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const el = document.createElement('a')
    el.href = url; el.download = `criteria-${applicationId.slice(0, 8)}.csv`; el.click()
    URL.revokeObjectURL(url)
  }

  const th = 'text-left px-3 py-2.5 font-semibold text-[11px] uppercase tracking-wider'
  const cols = 1 + (showInternal ? 1 : 0) + (showAuditor ? 1 : 0) + 2

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: showInternal ? 'External graded' : 'Graded', value: `${extPass + extNoPass}/${criteria.length}`, color: '#0891B2' },
          { label: 'Pass', value: extPass, color: '#059669' },
          { label: 'Not pass', value: extNoPass, color: '#DC2626' },
          ...(showInternal ? [{ label: 'Internal graded', value: `${intGraded}/${criteria.length}`, color: '#7C3AED' }] : []),
        ].map((t) => (
          <div key={t.label} className="rounded-xl border p-2.5 text-center" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-lg font-bold" style={{ color: t.color }}>{t.value}</p>
            <p className="text-[11px]" style={{ color: '#94A3B8' }}>{t.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white flex-1 min-w-[160px]" style={{ border: '1px solid #E2E8F0' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search indicators…" className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }} />
        </div>
        <select value={area} onChange={(e) => setArea(e.target.value)} className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
          <option value="all">All areas</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={resultFilter} onChange={(e) => setResultFilter(e.target.value as 'all' | Result)} className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
          <option value="all">All results</option>
          <option value="pass">Pass</option>
          <option value="no_pass">Not pass</option>
          <option value="pending">Pending</option>
        </select>
        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl bg-white" style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
          <Download className="w-4 h-4" /> CSV
        </button>
      </div>

      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th className={th} style={{ color: '#94A3B8' }}>Indicator</th>
                {showInternal && <th className={th} style={{ color: '#94A3B8' }}>Internal (NO)</th>}
                {showAuditor && <th className={th} style={{ color: '#94A3B8' }}>Ext. auditor</th>}
                <th className={th} style={{ color: '#94A3B8' }}>{showInternal ? 'Ext. result' : 'Result'}</th>
                <th className={th} style={{ color: '#94A3B8' }}>Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#F1F5F9' }}>
              {groups.map((g) => (
                <Fragment key={g.area}>
                  <tr>
                    <td colSpan={cols} className="px-3 py-2" style={{ background: '#ECFDF3', borderTop: '1px solid #D1FAE5' }}>
                      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#1B4332' }}>{g.area}</span>
                      <span className="text-[11px] font-semibold ml-2" style={{ color: '#6B9080' }}>· {g.rows.length}</span>
                    </td>
                  </tr>
                  {g.rows.map((c) => {
                    const a = get(c.ref)
                    return (
                      <tr key={c.ref} className="align-top" style={a.external === 'no_pass' ? { background: '#FEF6F6' } : undefined}>
                        <td className="px-3 py-3">
                          <div className="flex items-start gap-1.5">
                            <span className="text-xs font-mono font-semibold mt-0.5" style={{ color: '#94A3B8' }}>{c.ref}</span>
                            <p className="min-w-0" style={{ color: '#1E293B' }}>{c.title}</p>
                          </div>
                        </td>
                        {showInternal && (
                          <td className="px-3 py-3">
                            {editInternal
                              ? <Toggle value={a.internal} onChange={(r) => { patch(c.ref, { internal: r }); run(() => setInternalResult(applicationId, c.ref, r)) }} />
                              : <Chip r={a.internal} />}
                          </td>
                        )}
                        {showAuditor && <td className="px-3 py-3 whitespace-nowrap" style={{ color: '#475569' }}>{extName}</td>}
                        <td className="px-3 py-3">
                          {editExternal
                            ? <Toggle value={a.external} onChange={(r) => { patch(c.ref, { external: r }); run(() => setCriterionResult(applicationId, c.ref, r)) }} />
                            : <Chip r={a.external} />}
                        </td>
                        <td className="px-3 py-3 min-w-[200px]">
                          {editExternal
                            ? <textarea defaultValue={a.note ?? ''} rows={2} placeholder="External auditor feedback…"
                                onBlur={(e) => { if ((e.target.value.trim() || '') !== (a.note ?? '')) { patch(c.ref, { note: e.target.value }); run(() => setCriterionNote(applicationId, c.ref, e.target.value)) } }}
                                className="w-full text-xs px-2.5 py-2 rounded-lg outline-none resize-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
                            : <p className="text-xs" style={{ color: a.note ? '#475569' : '#CBD5E1' }}>{a.note || '—'}</p>}
                        </td>
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={cols} className="px-4 py-8 text-center text-sm" style={{ color: '#94A3B8' }}>No indicators match the filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
