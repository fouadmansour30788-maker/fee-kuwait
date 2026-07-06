'use client'

import { Fragment, useMemo, useState, useTransition } from 'react'
import { Check, X, Search, FileText, Download, AlertCircle } from 'lucide-react'
import { setInternalResult, setInternalNote, setApplicantNote } from '@/lib/actions/assessments'
import CriterionUpload from '@/components/documents/CriterionUpload'
import type { CriterionRef } from '@/lib/criteria'
import type { CriterionAssessment } from '@/lib/db/assessments'
import type { AppDoc } from '@/lib/db/documents'

type Result = 'pending' | 'pass' | 'no_pass'
type Role = 'admin' | 'establishment'

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

function Toggle({ value, onChange }: { value: Result; onChange: (r: Result) => void }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <button onClick={() => onChange('pass')} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold"
        style={value === 'pass' ? { background: '#059669', color: '#fff' } : { background: '#F1F5F9', color: '#059669' }}>
        <Check className="w-3 h-3" /> Pass
      </button>
      <button onClick={() => onChange('no_pass')} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold"
        style={value === 'no_pass' ? { background: '#DC2626', color: '#fff' } : { background: '#F1F5F9', color: '#DC2626' }}>
        <X className="w-3 h-3" /> Not pass
      </button>
    </div>
  )
}

// Shared collaborative criteria table for the operator and the establishment.
// Same columns for both; each side edits only its own (establishment: evidence +
// comment; operator: feedback + comment). The external auditor's result is shown
// read-only (to the establishment only once the audit is published).
export default function CriteriaBoard({
  applicationId, criteria, assessments, docs, role, showExternal,
}: {
  applicationId: string
  criteria: CriterionRef[]
  assessments: Record<string, CriterionAssessment>
  docs: AppDoc[]
  role: Role
  showExternal: boolean
}) {
  const blank: CriterionAssessment = { internal: 'pending', internalNote: null, external: 'pending', note: null, applicantNote: null }
  const [rows, setRows] = useState<Record<string, CriterionAssessment>>(assessments)
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('all')
  const [, start] = useTransition()
  const [error, setError] = useState('')

  const isEstablishment = role === 'establishment'
  const isOperator = role === 'admin'

  const get = (ref: string) => rows[ref] ?? blank
  const patch = (ref: string, p: Partial<CriterionAssessment>) => setRows((prev) => ({ ...prev, [ref]: { ...(prev[ref] ?? blank), ...p } }))
  const run = (fn: () => Promise<{ error?: string }>) => { setError(''); start(async () => { const r = await fn(); if (r?.error) setError(r.error) }) }

  const docsByRef = useMemo(() => {
    const m = new Map<string, AppDoc[]>()
    for (const d of docs) { if (!d.criterion_ref) continue; const a = m.get(d.criterion_ref) ?? []; a.push(d); m.set(d.criterion_ref, a) }
    return m
  }, [docs])

  const areas = useMemo(() => Array.from(new Set(criteria.map((c) => c.area))), [criteria])
  const filtered = criteria.filter((c) => {
    const q = search.toLowerCase()
    return (!q || c.title.toLowerCase().includes(q) || c.ref.toLowerCase().includes(q)) && (area === 'all' || c.area === area)
  })
  const groups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, CriterionRef[]>()
    for (const c of filtered) { if (!map.has(c.area)) { map.set(c.area, []); order.push(c.area) } map.get(c.area)!.push(c) }
    return order.map((a) => ({ area: a, rows: map.get(a)! }))
  }, [filtered])

  const th = 'text-left px-3 py-2.5 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap'
  const taStyle = { background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' } as const
  const cols = 5 + (showExternal ? 1 : 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white flex-1 min-w-[160px]" style={{ border: '1px solid #E2E8F0' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search indicators…" className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }} />
        </div>
        <select value={area} onChange={(e) => setArea(e.target.value)} className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
          <option value="all">All areas</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 1080 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#94A3B8' }}>
                <th className={th}>Indicator</th>
                <th className={th}>Establishment evidence</th>
                <th className={th}>Establishment comment</th>
                <th className={th}>Operator feedback</th>
                <th className={th}>Operator comment</th>
                {showExternal && <th className={th}>Auditor</th>}
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
                    const myDocs = docsByRef.get(c.ref) ?? []
                    return (
                      <tr key={c.ref} className="align-top">
                        <td className="px-3 py-3 min-w-[200px]">
                          <div className="flex items-start gap-1.5">
                            <span className="text-xs font-mono font-semibold mt-0.5" style={{ color: '#94A3B8' }}>{c.ref}</span>
                            <p className="min-w-0" style={{ color: '#1E293B' }}>{c.title}</p>
                          </div>
                        </td>

                        {/* Establishment evidence */}
                        <td className="px-3 py-3 min-w-[170px]">
                          <div className="flex flex-col gap-1.5 items-start">
                            {myDocs.map((d) => (
                              <a key={d.id} href={d.url ?? '#'} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                                <FileText className="w-3 h-3" /> <span className="max-w-[120px] truncate">{d.name}</span> <Download className="w-3 h-3" />
                              </a>
                            ))}
                            {myDocs.length === 0 && !isEstablishment && <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span>}
                            {isEstablishment && <CriterionUpload applicationId={applicationId} criterionRef={c.ref} />}
                          </div>
                        </td>

                        {/* Establishment comment */}
                        <td className="px-3 py-3 min-w-[180px]">
                          {isEstablishment
                            ? <textarea defaultValue={a.applicantNote ?? ''} rows={2} placeholder="Add a comment…"
                                onBlur={(e) => { if ((e.target.value.trim() || '') !== (a.applicantNote ?? '')) { patch(c.ref, { applicantNote: e.target.value }); run(() => setApplicantNote(applicationId, c.ref, e.target.value)) } }}
                                className="w-full text-xs px-2.5 py-2 rounded-lg outline-none resize-none" style={taStyle} />
                            : <p className="text-xs" style={{ color: a.applicantNote ? '#475569' : '#CBD5E1' }}>{a.applicantNote || '—'}</p>}
                        </td>

                        {/* Operator feedback */}
                        <td className="px-3 py-3">
                          {isOperator
                            ? <Toggle value={a.internal} onChange={(r) => { patch(c.ref, { internal: r }); run(() => setInternalResult(applicationId, c.ref, r)) }} />
                            : (a.internal === 'pending' ? <span className="text-xs" style={{ color: '#CBD5E1' }}>Awaiting review</span> : <Chip r={a.internal} />)}
                        </td>

                        {/* Operator comment */}
                        <td className="px-3 py-3 min-w-[180px]">
                          {isOperator
                            ? <textarea defaultValue={a.internalNote ?? ''} rows={2} placeholder="Feedback to the establishment…"
                                onBlur={(e) => { if ((e.target.value.trim() || '') !== (a.internalNote ?? '')) { patch(c.ref, { internalNote: e.target.value }); run(() => setInternalNote(applicationId, c.ref, e.target.value)) } }}
                                className="w-full text-xs px-2.5 py-2 rounded-lg outline-none resize-none" style={taStyle} />
                            : <p className="text-xs" style={{ color: a.internalNote ? '#475569' : '#CBD5E1' }}>{a.internalNote || '—'}</p>}
                        </td>

                        {/* Auditor (read-only) */}
                        {showExternal && (
                          <td className="px-3 py-3 min-w-[150px]">
                            {a.external === 'pending' ? <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span> : <Chip r={a.external} />}
                            {a.note && <p className="text-xs mt-1" style={{ color: '#64748B' }}>{a.note}</p>}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={cols} className="px-4 py-8 text-center text-sm" style={{ color: '#94A3B8' }}>No indicators match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
