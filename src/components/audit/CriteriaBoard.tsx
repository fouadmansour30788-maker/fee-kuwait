'use client'

import { Fragment, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Search, FileText, Download, ChevronDown, MessageSquare, Send, Info, AlertCircle, Lock } from 'lucide-react'
import { setInternalResult, setApplicantResult, setCriterionResult, setCriterionNote } from '@/lib/actions/assessments'
import { postCriterionMessage } from '@/lib/actions/messages'
import CriterionUpload from '@/components/documents/CriterionUpload'
import type { CriterionRef } from '@/lib/criteria'
import type { CriterionAssessment } from '@/lib/db/assessments'
import type { AppDoc } from '@/lib/db/documents'
import type { CriterionMessage } from '@/lib/db/messages'

type Result = 'pending' | 'pass' | 'no_pass'
type Role = 'admin' | 'establishment' | 'auditor' | 'cb'

const RESULT_META: Record<Result, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#64748B', bg: '#F1F5F9' },
  pass: { label: 'Pass', color: '#059669', bg: '#D1FAE5' },
  no_pass: { label: 'Not pass', color: '#DC2626', bg: '#FEE2E2' },
}
const ROLE_LABEL: Record<string, string> = { establishment: 'Establishment', operator: 'Operator', auditor: 'Auditor', cb: 'CB' }

function Chip({ r }: { r: Result }) {
  const m = RESULT_META[r]
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap" style={{ background: m.bg, color: m.color }}>
      {r === 'pass' ? <Check className="w-3 h-3" /> : r === 'no_pass' ? <X className="w-3 h-3" /> : null}{m.label}
    </span>
  )
}

function Toggle({ value, onChange }: { value: Result; onChange: (r: Result) => void }) {
  return (
    <div className="inline-flex items-center gap-1">
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

// Shared criteria board seen by the operator and the establishment (same table).
// Establishment edits self-assessment + evidence + comments; operator edits its
// feedback + evidence + comments. Description and the comment thread live in an
// expandable panel per criterion. The auditor result is read-only and shown to
// the establishment only once the audit is published.
export default function CriteriaBoard({
  applicationId, criteria, assessments, docs, messages, role, showExternal, locked = false, auditEditable = false,
}: {
  applicationId: string
  criteria: CriterionRef[]
  assessments: Record<string, CriterionAssessment>
  docs: AppDoc[]
  messages: Record<string, CriterionMessage[]>
  role: Role
  showExternal: boolean
  locked?: boolean
  auditEditable?: boolean
}) {
  const blank: CriterionAssessment = { applicantResult: 'pending', internal: 'pending', internalNote: null, external: 'pending', note: null, applicantNote: null }
  const [rows, setRows] = useState(assessments)
  const [msgs, setMsgs] = useState(messages)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [open, setOpen] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('all')
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  const isEstablishment = role === 'establishment'
  const isOperator = role === 'admin'
  const isAuditor = role === 'auditor'
  const isCb = role === 'cb'
  const myRole = isOperator ? 'operator' : isAuditor ? 'auditor' : isCb ? 'cb' : 'establishment'
  const canEditSelf = isEstablishment && !locked
  const canUpload = isOperator || (isEstablishment && !locked)
  const canComment = isOperator || isAuditor || isCb || (isEstablishment && !locked)
  const editAudit = isAuditor && auditEditable

  const get = (ref: string) => rows[ref] ?? blank
  const patch = (ref: string, p: Partial<CriterionAssessment>) => setRows((prev) => ({ ...prev, [ref]: { ...(prev[ref] ?? blank), ...p } }))
  const run = (fn: () => Promise<{ error?: string }>) => { setError(''); start(async () => { const r = await fn(); if (r?.error) setError(r.error) }) }

  const docsByRef = useMemo(() => {
    const m = new Map<string, AppDoc[]>()
    for (const d of docs) { if (!d.criterion_ref) continue; const arr = m.get(d.criterion_ref) ?? []; arr.push(d); m.set(d.criterion_ref, arr) }
    return m
  }, [docs])
  const years = useMemo(() => {
    const s = new Set<number>([currentYear])
    for (const d of docs) if (d.year) s.add(d.year)
    return Array.from(s).sort((a, b) => b - a)
  }, [docs, currentYear])

  function postMessage(ref: string) {
    const body = (draft[ref] ?? '').trim()
    if (!body) return
    setMsgs((prev) => ({ ...prev, [ref]: [...(prev[ref] ?? []), { id: `tmp-${Date.now()}`, criterion_ref: ref, author_role: myRole, body, visibility: isAuditor ? 'auditor_internal' : 'shared', created_at: new Date().toISOString() }] }))
    setDraft((d) => ({ ...d, [ref]: '' }))
    run(async () => { const r = await postCriterionMessage(applicationId, ref, body); if (!r.error) router.refresh(); return r })
  }

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
  const cols = 3 + 1 + (showExternal ? 1 : 0) + 1
  const evidenceCol = (ref: string) => {
    const list = (docsByRef.get(ref) ?? []).filter((d) => d.year === year || d.year == null)
    return (
      <div className="flex flex-col gap-1 items-start">
        {list.map((d) => (
          <a key={d.id} href={d.url ?? '#'} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
            <FileText className="w-3 h-3" /> <span className="max-w-[110px] truncate">{d.name}</span> <Download className="w-3 h-3" />
          </a>
        ))}
        {canUpload ? <CriterionUpload applicationId={applicationId} criterionRef={ref} year={year} /> : (list.length === 0 && <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span>)}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {isEstablishment && locked && (
        <div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF9EC', border: '1px solid #FDE68A', color: '#854D0E' }}>
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>This application has been submitted for review and is now locked. You can view everything, but edits, uploads and comments are closed until the review completes.</p>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white flex-1 min-w-[160px]" style={{ border: '1px solid #E2E8F0' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search indicators…" className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }} />
        </div>
        <select value={area} onChange={(e) => setArea(e.target.value)} className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
          <option value="all">All areas</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} title="Evidence year" className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 880 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#94A3B8' }}>
                <th className={th}>Indicator</th>
                <th className={th}>Self-assessment</th>
                <th className={th}>Evidence</th>
                <th className={th}>Operator</th>
                {showExternal && <th className={th}>Audit</th>}
                <th className={th}>Comments</th>
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
                    const thread = msgs[c.ref] ?? []
                    const isOpen = open === c.ref
                    return (
                      <Fragment key={c.ref}>
                        <tr className="align-top">
                          <td className="px-3 py-3 min-w-[220px]">
                            <button onClick={() => setOpen(isOpen ? null : c.ref)} className="flex items-start gap-1.5 text-left">
                              <ChevronDown className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 transition-transform" style={{ color: '#94A3B8', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                              <span className="text-xs font-mono font-semibold mt-0.5" style={{ color: '#94A3B8' }}>{c.ref}</span>
                              <span className="min-w-0">
                                <span style={{ color: '#1E293B' }}>{c.title}</span>
                                {c.type && <span className="ml-1.5 text-[10px] font-bold px-1 py-0.5 rounded" style={{ background: c.type.includes('I') ? '#FEF3C7' : '#EEF2F6', color: c.type.includes('I') ? '#92400E' : '#64748B' }}>{c.type}</span>}
                              </span>
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            {canEditSelf
                              ? <Toggle value={a.applicantResult} onChange={(r) => { patch(c.ref, { applicantResult: r }); run(() => setApplicantResult(applicationId, c.ref, r)) }} />
                              : <Chip r={a.applicantResult} />}
                          </td>
                          <td className="px-3 py-3 min-w-[140px]">{evidenceCol(c.ref)}</td>
                          <td className="px-3 py-3">
                            {isOperator
                              ? <Toggle value={a.internal} onChange={(r) => { patch(c.ref, { internal: r }); run(() => setInternalResult(applicationId, c.ref, r)) }} />
                              : (a.internal === 'pending' ? <span className="text-xs" style={{ color: '#CBD5E1' }}>Awaiting</span> : <Chip r={a.internal} />)}
                          </td>
                          {showExternal && (
                            <td className="px-3 py-3">
                              {editAudit
                                ? <Toggle value={a.external} onChange={(r) => { patch(c.ref, { external: r }); run(() => setCriterionResult(applicationId, c.ref, r)) }} />
                                : (a.external === 'pending' ? <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span> : <Chip r={a.external} />)}
                            </td>
                          )}
                          <td className="px-3 py-3">
                            <button onClick={() => setOpen(isOpen ? null : c.ref)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: thread.length ? '#40916C' : '#94A3B8' }}>
                              <MessageSquare className="w-3.5 h-3.5" /> {thread.length}
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr>
                            <td colSpan={cols} className="px-4 py-3" style={{ background: '#FCFDFE' }}>
                              {c.description && (
                                <div className="flex items-start gap-2 mb-3 max-w-3xl">
                                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#64748B' }} />
                                  <p className="text-xs" style={{ color: '#475569' }}>{c.description}</p>
                                </div>
                              )}
                              {editAudit ? (
                                <div className="mb-3 max-w-2xl">
                                  <label className="block text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>Auditor remark</label>
                                  <textarea defaultValue={a.note ?? ''} rows={2} placeholder="Your remark for this criterion…"
                                    onBlur={(e) => { if ((e.target.value.trim() || '') !== (a.note ?? '')) { patch(c.ref, { note: e.target.value }); run(() => setCriterionNote(applicationId, c.ref, e.target.value)) } }}
                                    className="w-full text-xs px-2.5 py-2 rounded-lg outline-none resize-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
                                </div>
                              ) : (showExternal && a.note && (
                                <p className="text-xs mb-3 max-w-3xl" style={{ color: '#475569' }}><span className="font-semibold">Auditor remark:</span> {a.note}</p>
                              ))}
                              <div className="max-w-2xl space-y-2">
                                {thread.length === 0 && <p className="text-xs" style={{ color: '#94A3B8' }}>No comments yet.</p>}
                                {thread.map((m) => (
                                  <div key={m.id} className="rounded-lg p-2.5" style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#EEF2F6', color: '#475569' }}>{ROLE_LABEL[m.author_role ?? ''] ?? m.author_role}</span>
                                      {m.visibility === 'auditor_internal' && <span className="text-[10px] font-semibold" style={{ color: '#B45309' }}>internal</span>}
                                      <span className="text-[10px]" style={{ color: '#94A3B8' }}>{new Date(m.created_at).toLocaleDateString('en-GB')}</span>
                                    </div>
                                    <p className="text-sm" style={{ color: '#334155' }}>{m.body}</p>
                                  </div>
                                ))}
                                {canComment ? (
                                  <div className="flex items-center gap-2 pt-1">
                                    <input value={draft[c.ref] ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [c.ref]: e.target.value }))}
                                      onKeyDown={(e) => { if (e.key === 'Enter') postMessage(c.ref) }} placeholder="Add a comment…"
                                      className="flex-1 text-sm px-3 py-2 rounded-lg outline-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
                                    <button onClick={() => postMessage(c.ref)} disabled={!(draft[c.ref] ?? '').trim()}
                                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: '#40916C' }}>
                                      <Send className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <p className="flex items-center gap-1.5 text-[11px] pt-1" style={{ color: '#94A3B8' }}><Lock className="w-3 h-3" /> Comments are closed at this stage.</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
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
