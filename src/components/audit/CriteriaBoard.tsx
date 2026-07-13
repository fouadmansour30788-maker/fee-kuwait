'use client'

import { Fragment, memo, useCallback, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Search, FileText, Download, Send, AlertCircle, Lock } from 'lucide-react'
import { setInternalResult, setApplicantResult, setCriterionResult, setCriterionNote } from '@/lib/actions/assessments'
import { postCriterionMessage } from '@/lib/actions/messages'
import CriterionUpload from '@/components/documents/CriterionUpload'
import type { CriterionRef } from '@/lib/criteria'
import type { CriterionAssessment } from '@/lib/db/assessments'
import type { AppDoc } from '@/lib/db/documents'
import type { CriterionMessage } from '@/lib/db/messages'
import type { AuditRecord } from '@/lib/db/audits'
import { AUDIT_TYPE_META } from '@/lib/audit-types'

type Result = 'pending' | 'pass' | 'no_pass'
type Role = 'admin' | 'establishment' | 'auditor' | 'cb'

const RESULT_META: Record<Result, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#64748B', bg: '#F1F5F9' },
  pass: { label: 'Pass', color: '#059669', bg: '#D1FAE5' },
  no_pass: { label: 'Not pass', color: '#DC2626', bg: '#FEE2E2' },
}
const ROLE_LABEL: Record<string, string> = { establishment: 'Establishment', operator: 'Operator', auditor: 'Auditor', cb: 'CB' }
const BLANK: CriterionAssessment = { applicantResult: 'pending', internal: 'pending', internalNote: null, external: 'pending', note: null, applicantNote: null }
const EMPTY_DOCS: AppDoc[] = []
const EMPTY_MSGS: CriterionMessage[] = []

// Description can be long (full explanatory notes) — clamp with a show more/less toggle.
function ExpandableText({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const long = text.length > 160
  return (
    <div>
      <p className="text-xs whitespace-pre-line" style={{ color: '#64748B', ...(open || !long ? {} : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }) }}>{text}</p>
      {long && (
        <button onClick={() => setOpen((o) => !o)} className="mt-0.5 text-[11px] font-semibold" style={{ color: '#40916C' }}>
          {open ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

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
      <button onClick={() => onChange('pass')} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold" style={value === 'pass' ? { background: '#059669', color: '#fff' } : { background: '#F1F5F9', color: '#059669' }}><Check className="w-3 h-3" /> Pass</button>
      <button onClick={() => onChange('no_pass')} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold" style={value === 'no_pass' ? { background: '#DC2626', color: '#fff' } : { background: '#F1F5F9', color: '#DC2626' }}><X className="w-3 h-3" /> Not pass</button>
    </div>
  )
}

interface RowProps {
  c: CriterionRef
  a: CriterionAssessment
  docsList: AppDoc[]
  thread: CriterionMessage[]
  year: number
  applicationId: string
  applicantId?: string
  estCanEdit: boolean
  isOperator: boolean
  canComment: boolean
  editAudit: boolean
  showExternal: boolean
  selAudit: AuditRecord | null
  onSelf: (ref: string, r: Result) => void
  onOp: (ref: string, r: Result) => void
  onAudit: (ref: string, r: Result) => void
  onAuditNote: (ref: string, note: string) => void
  onPost: (ref: string, body: string) => void
}

// One criterion row, memoized so an interaction only re-renders the affected row.
// The comment input keeps its text in local state, so typing never re-renders the
// rest of the (139-row) table.
const Row = memo(function Row({
  c, a, docsList, thread, year, applicationId, applicantId, estCanEdit, isOperator, canComment, editAudit, showExternal, selAudit,
  onSelf, onOp, onAudit, onAuditNote, onPost,
}: RowProps) {
  const [text, setText] = useState('')
  const list = docsList.filter((d) => d.year === year || d.year == null)
  const estDocs = list.filter((d) => applicantId && d.uploaded_by === applicantId)
  function send() { const b = text.trim(); if (!b) return; onPost(c.ref, b); setText('') }

  const Attach = ({ items, canUpload }: { items: AppDoc[]; canUpload: boolean }) => (
    <div className="flex flex-col gap-1 items-start">
      {items.map((d) => (
        <a key={d.id} href={d.url ?? '#'} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
          <FileText className="w-3 h-3" /> <span className="max-w-[100px] truncate">{d.name}</span> <Download className="w-3 h-3" />
        </a>
      ))}
      {canUpload ? <CriterionUpload applicationId={applicationId} criterionRef={c.ref} year={year} /> : (items.length === 0 && <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span>)}
    </div>
  )

  return (
    <tr className="align-top">
      <td className="px-3 py-3 min-w-[180px]">
        <div className="flex items-start gap-1.5">
          <span className="text-xs font-mono font-semibold mt-0.5" style={{ color: '#94A3B8' }}>{c.ref}</span>
          <span className="min-w-0">
            <span style={{ color: '#1E293B' }}>{c.title}</span>
            {c.type && <span className="ml-1.5 text-[10px] font-bold px-1 py-0.5 rounded" style={{ background: c.type.includes('I') ? '#FEF3C7' : '#EEF2F6', color: c.type.includes('I') ? '#92400E' : '#64748B' }}>{c.type}</span>}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 min-w-[240px] max-w-[380px] align-top">{c.description ? <ExpandableText text={c.description} /> : <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span>}</td>
      <td className="px-3 py-3">
        {estCanEdit ? <Toggle value={a.applicantResult} onChange={(r) => onSelf(c.ref, r)} /> : <Chip r={a.applicantResult} />}
      </td>
      <td className="px-3 py-3 min-w-[130px]"><Attach items={estDocs} canUpload={estCanEdit} /></td>
      <td className="px-3 py-3">
        {isOperator ? <Toggle value={a.internal} onChange={(r) => onOp(c.ref, r)} /> : (a.internal === 'pending' ? <span className="text-xs" style={{ color: '#CBD5E1' }}>Awaiting</span> : <Chip r={a.internal} />)}
      </td>
      <td className="px-3 py-3 min-w-[220px]">
        <div className="space-y-1.5">
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            {thread.length === 0 && <span className="text-xs" style={{ color: '#CBD5E1' }}>No comments yet</span>}
            {thread.map((m) => {
              const isEst = m.author_role === 'establishment'
              const internal = m.visibility === 'auditor_internal'
              const bg = isEst ? '#ECFDF3' : internal ? '#FEF9EC' : '#EFF6FF'
              const bd = isEst ? '#A7F3D0' : internal ? '#FDE68A' : '#BFDBFE'
              return (
                <div key={m.id} className={isEst ? 'flex justify-start' : 'flex justify-end'}>
                  <div className="rounded-lg px-2 py-1.5 max-w-[88%]" style={{ background: bg, border: `1px solid ${bd}` }}>
                    <span className="text-[9px] font-semibold block" style={{ color: '#64748B' }}>{ROLE_LABEL[m.author_role ?? ''] ?? m.author_role}{internal ? ' · internal' : ''}</span>
                    <span className="text-xs" style={{ color: '#334155' }}>{m.body}</span>
                  </div>
                </div>
              )
            })}
          </div>
          {canComment && (
            <div className="flex items-center gap-1">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send() }} placeholder="Message…"
                className="flex-1 min-w-[110px] text-xs px-2 py-1.5 rounded-lg outline-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
              <button onClick={send} disabled={!text.trim()} className="p-1.5 rounded-lg text-white disabled:opacity-50" style={{ background: '#40916C' }}><Send className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      </td>
      {showExternal && (
        <td className="px-3 py-3 min-w-[150px]">
          {selAudit ? (() => {
            const snap = selAudit.results[c.ref]
            const r = (snap?.result ?? 'pending') as Result
            return <>
              {r === 'pending' ? <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span> : <Chip r={r} />}
              {snap?.note && <p className="text-xs mt-1" style={{ color: '#64748B' }}>{snap.note}</p>}
            </>
          })() : <>
            {editAudit
              ? <Toggle value={a.external} onChange={(r) => onAudit(c.ref, r)} />
              : (a.external === 'pending' ? <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span> : <Chip r={a.external} />)}
            {editAudit
              ? <textarea defaultValue={a.note ?? ''} rows={2} placeholder="Auditor remark…" onBlur={(e) => { if ((e.target.value.trim() || '') !== (a.note ?? '')) onAuditNote(c.ref, e.target.value) }} className="mt-1.5 w-full text-xs px-2 py-1.5 rounded-lg outline-none resize-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
              : a.note && <p className="text-xs mt-1" style={{ color: '#64748B' }}>{a.note}</p>}
          </>}
        </td>
      )}
    </tr>
  )
})

// Shared collaborative criteria board.
export default function CriteriaBoard({
  applicationId, criteria, assessments, docs, messages, role, showExternal, locked = false, auditEditable = false, applicantId,
  audits = [], auditorName,
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
  applicantId?: string
  audits?: AuditRecord[]
  auditorName?: string | null
}) {
  const [rows, setRows] = useState(assessments)
  const [msgs, setMsgs] = useState(messages)
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('all')
  const [auditId, setAuditId] = useState('')
  const selAudit = useMemo(() => audits.find((a) => a.id === auditId) ?? null, [audits, auditId])
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
  const estCanEdit = isEstablishment && !locked
  const canComment = estCanEdit || isOperator || isAuditor || isCb
  const editAudit = isAuditor && auditEditable

  const docsByRef = useMemo(() => {
    const m = new Map<string, AppDoc[]>()
    for (const d of docs) { if (!d.criterion_ref) continue; const arr = m.get(d.criterion_ref) ?? []; arr.push(d); m.set(d.criterion_ref, arr) }
    return m
  }, [docs])
  const msgsByRef = useMemo(() => {
    const m = new Map<string, CriterionMessage[]>()
    for (const ref of Object.keys(msgs)) m.set(ref, msgs[ref])
    return m
  }, [msgs])
  const years = useMemo(() => {
    const s = new Set<number>([currentYear]); for (const d of docs) if (d.year) s.add(d.year); return Array.from(s).sort((a, b) => b - a)
  }, [docs, currentYear])

  const bump = useCallback((res: { error?: string } | undefined) => { if (res?.error) setError(res.error) }, [])
  const onSelf = useCallback((ref: string, r: Result) => {
    setRows((p) => ({ ...p, [ref]: { ...(p[ref] ?? BLANK), applicantResult: r } })); setError('')
    start(async () => bump(await setApplicantResult(applicationId, ref, r)))
  }, [applicationId, bump])
  const onOp = useCallback((ref: string, r: Result) => {
    setRows((p) => ({ ...p, [ref]: { ...(p[ref] ?? BLANK), internal: r } })); setError('')
    start(async () => bump(await setInternalResult(applicationId, ref, r)))
  }, [applicationId, bump])
  const onAudit = useCallback((ref: string, r: Result) => {
    setRows((p) => ({ ...p, [ref]: { ...(p[ref] ?? BLANK), external: r } })); setError('')
    start(async () => bump(await setCriterionResult(applicationId, ref, r)))
  }, [applicationId, bump])
  const onAuditNote = useCallback((ref: string, note: string) => {
    setRows((p) => ({ ...p, [ref]: { ...(p[ref] ?? BLANK), note } })); setError('')
    start(async () => bump(await setCriterionNote(applicationId, ref, note)))
  }, [applicationId, bump])
  const onPost = useCallback((ref: string, body: string) => {
    setMsgs((p) => ({ ...p, [ref]: [...(p[ref] ?? []), { id: `tmp-${Date.now()}`, criterion_ref: ref, author_role: myRole, body, visibility: isAuditor ? 'auditor_internal' : 'shared', created_at: new Date().toISOString() }] }))
    setError('')
    start(async () => { const r = await postCriterionMessage(applicationId, ref, body); if (r.error) setError(r.error); else router.refresh() })
  }, [applicationId, myRole, isAuditor, router])

  const areas = useMemo(() => Array.from(new Set(criteria.map((c) => c.area))), [criteria])
  const filtered = criteria.filter((c) => {
    const q = search.toLowerCase()
    return (!q || c.title.toLowerCase().includes(q) || c.ref.toLowerCase().includes(q)) && (area === 'all' || c.area === area)
  })
  const groups = useMemo(() => {
    const order: string[] = []; const map = new Map<string, CriterionRef[]>()
    for (const c of filtered) { if (!map.has(c.area)) { map.set(c.area, []); order.push(c.area) } map.get(c.area)!.push(c) }
    return order.map((a) => ({ area: a, rows: map.get(a)! }))
  }, [filtered])

  const th = 'text-left px-3 py-2.5 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap'
  const cols = 6 + (showExternal ? 1 : 0)

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
        {showExternal && audits.length > 0 && (
          <select value={auditId} onChange={(e) => setAuditId(e.target.value)} title="Audit" className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
            <option value="">Live audit{auditorName ? ` · ${auditorName}` : ''}</option>
            {audits.map((au) => <option key={au.id} value={au.id}>{AUDIT_TYPE_META[au.type].label} {au.period}{au.auditorName ? ` · ${au.auditorName}` : ''}</option>)}
          </select>
        )}
      </div>

      {selAudit && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs" style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569' }}>
          <span className="font-semibold" style={{ color: '#1B4332' }}>{AUDIT_TYPE_META[selAudit.type].label} audit {selAudit.period}</span>
          <span style={{ color: '#94A3B8' }}>· {AUDIT_TYPE_META[selAudit.type].cadence}</span>
          {selAudit.auditorName && <span>· Auditor: <span className="font-semibold" style={{ color: '#334155' }}>{selAudit.auditorName}</span></span>}
          <span className="ml-auto" style={{ color: '#94A3B8' }}>Read-only archived results</span>
        </div>
      )}

      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 1280 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#94A3B8' }}>
                <th className={th}>Indicator</th>
                <th className={th}>Description</th>
                <th className={th}>Self-assessment</th>
                <th className={th}>Est. attachment</th>
                <th className={th}>Operator feedback</th>
                <th className={th}>Comments</th>
                {showExternal && <th className={th}>{selAudit ? `${AUDIT_TYPE_META[selAudit.type].label} audit ${selAudit.period}` : 'Audit'}</th>}
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
                  {g.rows.map((c) => (
                    <Row key={c.ref} c={c} a={rows[c.ref] ?? BLANK} docsList={docsByRef.get(c.ref) ?? EMPTY_DOCS} thread={msgsByRef.get(c.ref) ?? EMPTY_MSGS}
                      year={year} applicationId={applicationId} applicantId={applicantId}
                      estCanEdit={estCanEdit} isOperator={isOperator} canComment={canComment} editAudit={editAudit} showExternal={showExternal} selAudit={selAudit}
                      onSelf={onSelf} onOp={onOp} onAudit={onAudit} onAuditNote={onAuditNote} onPost={onPost} />
                  ))}
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
