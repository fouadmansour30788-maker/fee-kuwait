'use client'

import { Fragment, memo, useCallback, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Search, FileText, Download, Send, AlertCircle, Lock, Link2, ExternalLink } from 'lucide-react'
import { setInternalResult, setApplicantStatus, setCriterionResult, setCriterionNote } from '@/lib/actions/assessments'
import { postCriterionMessage } from '@/lib/actions/messages'
import CriterionUpload from '@/components/documents/CriterionUpload'
import DocumentRemove from '@/components/documents/DocumentRemove'
import type { CriterionRef } from '@/lib/criteria'
import type { CriterionAssessment } from '@/lib/db/assessments'
import type { AppDoc } from '@/lib/db/documents'
import type { CriterionMessage } from '@/lib/db/messages'
import type { AuditRecord } from '@/lib/db/audits'
import { AUDIT_TYPE_META } from '@/lib/audit-types'
import type { GKEvidence } from '@/lib/data/greenKeyEvidence'
import { GK_EVIDENCE, UPLOAD_REQ_META } from '@/lib/data/greenKeyEvidence'

type Result = 'pending' | 'pass' | 'no_pass' | 'na'
type PStatus = 'in_progress' | 'complete' | 'na'
type Role = 'admin' | 'establishment' | 'auditor' | 'cb'
type Meta = { label: string; color: string; bg: string }

// Est. Progress (establishment self-assessment).
const STATUS_META: Record<PStatus, Meta> = {
  complete:    { label: 'Complete',    color: '#059669', bg: '#D1FAE5' },
  in_progress: { label: 'In Progress', color: '#B45309', bg: '#FEF3C7' },
  na:          { label: 'N/A Req.',    color: '#64748B', bg: '#F1F5F9' },
}

// Operator Readiness Review — pending is the "Pending Review" default.
const OP_META: Record<Result, Meta> = {
  pending: { label: 'Pending Review', color: '#64748B', bg: '#F1F5F9' },
  pass:    { label: 'Ready',          color: '#059669', bg: '#D1FAE5' },
  no_pass: { label: 'Needs Action',   color: '#DC2626', bg: '#FEE2E2' },
  na:      { label: 'N/A Confirmed',  color: '#475569', bg: '#E2E8F0' },
}

// Auditor Conformity Assessment — pending is the "Not Assessed" default.
const AUD_META: Record<Result, Meta> = {
  pending: { label: 'Not Assessed',   color: '#64748B', bg: '#F1F5F9' },
  pass:    { label: 'Conforming',     color: '#059669', bg: '#D1FAE5' },
  no_pass: { label: 'Non-Conforming', color: '#DC2626', bg: '#FEE2E2' },
  na:      { label: 'Not Applicable', color: '#475569', bg: '#E2E8F0' },
}
const ROLE_LABEL: Record<string, string> = { establishment: 'Establishment', operator: 'Operator', auditor: 'Auditor', cb: 'CB' }
// One colour per author role so a thread is readable at a glance.
const ROLE_BUBBLE: Record<string, { bg: string; bd: string; fg: string }> = {
  establishment: { bg: '#ECFDF3', bd: '#A7F3D0', fg: '#047857' }, // green
  operator:      { bg: '#EFF6FF', bd: '#BFDBFE', fg: '#1D4ED8' }, // blue
  cb:            { bg: '#FEF9EC', bd: '#FDE68A', fg: '#B45309' }, // yellow
  auditor:       { bg: '#F5F3FF', bd: '#DDD6FE', fg: '#6D28D9' }, // purple
}
const ROLE_BUBBLE_FALLBACK = { bg: '#F1F5F9', bd: '#E2E8F0', fg: '#64748B' }

// The auditor's remark, shown in the same bubble style as the comment thread so
// it reads consistently (and long unbroken text wraps instead of overflowing).
function AuditorNote({ text, author }: { text: string; author?: string | null }) {
  const t = ROLE_BUBBLE.auditor
  return (
    <div className="mt-1.5 rounded-lg px-2 py-1.5 max-h-40 overflow-y-auto" style={{ background: t.bg, border: `1px solid ${t.bd}` }}>
      <span className="text-[9px] font-semibold block" style={{ color: t.fg }}>Auditor{author ? ` · ${author}` : ''}</span>
      <span className="text-xs whitespace-pre-wrap break-all" style={{ color: '#334155' }}>{text}</span>
    </div>
  )
}
const BLANK: CriterionAssessment = { applicantResult: 'pending', applicantStatus: null, internal: 'pending', internalNote: null, external: 'pending', note: null, applicantNote: null }
const EMPTY_DOCS: AppDoc[] = []
const EMPTY_MSGS: CriterionMessage[] = []

// Description can be long (full explanatory notes) — clamp with a show more/less toggle.
function ExpandableText({ text, onOpen }: { text: string; onOpen: () => void }) {
  const preview = text.length > 150 ? text.slice(0, 150).trimEnd() + '…' : text
  return (
    <div>
      <p className="text-xs" style={{ color: '#64748B', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{preview}</p>
      <button onClick={onOpen} className="mt-0.5 text-[11px] font-semibold" style={{ color: '#40916C' }}>View full description</button>
    </div>
  )
}

// Full-description modal (rendered once at board level).
function DescModal({ title, refId, text, onClose }: { title: string; refId: string; text: string; onClose: () => void }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-start gap-3 px-5 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <span className="text-xs font-mono font-semibold mt-1" style={{ color: '#40916C' }}>{refId}</span>
          <h3 className="flex-1 font-semibold leading-snug" style={{ color: '#0F2318' }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100" style={{ color: '#64748B' }}><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto text-sm whitespace-pre-line" style={{ color: '#334155', lineHeight: 1.65 }}>{text}</div>
      </div>
    </div>
  )
}

// Evidence-matrix hint: what to upload before the audit for this criterion.
function EvidenceHint({ ev }: { ev: GKEvidence }) {
  const [open, setOpen] = useState(false)
  const meta = UPLOAD_REQ_META[ev.required]
  const hasText = !!ev.upload
  return (
    <div className="mb-1.5">
      <div className="flex items-center gap-1 flex-wrap">
        {ev.required !== 'No' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>}
        {hasText && <button onClick={() => setOpen((o) => !o)} className="text-[10px] font-semibold" style={{ color: '#40916C' }}>{open ? 'Hide' : 'What to upload'}</button>}
      </div>
      {open && hasText && (
        <div className="mt-1 rounded-lg p-2 text-[11px] whitespace-pre-line" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569' }}>
          {ev.upload}
          {ev.format && <div className="mt-1 text-[10px]" style={{ color: '#94A3B8' }}>Format: {ev.format}</div>}
          {ev.method && <div className="text-[10px]" style={{ color: '#94A3B8' }}>Audit method: {ev.method}</div>}
        </div>
      )}
    </div>
  )
}

// A result chip using the given per-role option-set meta.
function Chip({ r, meta }: { r: Result; meta: Record<Result, Meta> }) {
  const m = meta[r]
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap" style={{ background: m.bg, color: m.color }}>
      {r === 'pass' ? <Check className="w-3 h-3" /> : r === 'no_pass' ? <X className="w-3 h-3" /> : null}{m.label}
    </span>
  )
}
function StatusChip({ s }: { s: PStatus | null }) {
  if (!s) return <span className="text-xs" style={{ color: '#CBD5E1' }}>Not Started</span>
  const m = STATUS_META[s]
  return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: m.bg, color: m.color }}>{m.label}</span>
}
function StatusSelect({ value, onChange }: { value: PStatus | null; onChange: (s: PStatus) => void }) {
  return (
    <div className="inline-flex flex-col gap-1 items-start">
      {(['complete', 'in_progress', 'na'] as const).map((s) => {
        const m = STATUS_META[s]; const on = value === s
        return (
          <button key={s} onClick={() => onChange(s)} className="px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
            style={on ? { background: m.color, color: '#fff' } : { background: '#F1F5F9', color: m.color }}>{m.label}</button>
        )
      })}
    </div>
  )
}
// Result picker for the operator / auditor columns. Renders the three actionable
// options from the given option set (pending is the unselected default).
function ResultSelect({ value, onChange, meta }: { value: Result; onChange: (r: Result) => void; meta: Record<Result, Meta> }) {
  return (
    <div className="inline-flex flex-col gap-1 items-start">
      {(['pass', 'no_pass', 'na'] as const).map((r) => {
        const m = meta[r]; const on = value === r
        return (
          <button key={r} onClick={() => onChange(r)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
            style={on ? { background: m.color, color: '#fff' } : { background: '#F1F5F9', color: m.color }}>
            {r === 'pass' ? <Check className="w-3 h-3" /> : r === 'no_pass' ? <X className="w-3 h-3" /> : null}{m.label}
          </button>
        )
      })}
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
  onStatus: (ref: string, s: PStatus) => void
  onOp: (ref: string, r: Result) => void
  onAudit: (ref: string, r: Result) => void
  onAuditNote: (ref: string, note: string) => void
  onPost: (ref: string, body: string) => void
  onDesc: (c: CriterionRef) => void
}

// One criterion row, memoized so an interaction only re-renders the affected row.
// The comment input keeps its text in local state, so typing never re-renders the
// rest of the (139-row) table.
const Row = memo(function Row({
  c, a, docsList, thread, year, applicationId, applicantId, estCanEdit, isOperator, canComment, editAudit, showExternal, selAudit,
  onStatus, onOp, onAudit, onAuditNote, onPost, onDesc,
}: RowProps) {
  const [text, setText] = useState('')
  const ev = GK_EVIDENCE[c.ref]
  // Surveillance evidence lives under the Surveillance Activities tab, never on
  // the main application board (the two can share a year).
  const list = docsList.filter((d) => !d.surveillance_id && (d.year === year || d.year == null))
  const estDocs = list.filter((d) => applicantId && d.uploaded_by === applicantId)
  function send() { const b = text.trim(); if (!b) return; onPost(c.ref, b); setText('') }

  const Attach = ({ items, canUpload }: { items: AppDoc[]; canUpload: boolean }) => (
    <div className="flex flex-col gap-1 items-start">
      {items.map((d) => (
        <span key={d.id} className="inline-flex items-center gap-1">
          <a href={d.url ?? '#'} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
            {d.isLink ? <Link2 className="w-3 h-3" /> : <FileText className="w-3 h-3" />} <span className="max-w-[100px] truncate">{d.name}</span> {d.isLink ? <ExternalLink className="w-3 h-3" /> : <Download className="w-3 h-3" />}
          </a>
          {canUpload && <DocumentRemove documentId={d.id} compact />}
        </span>
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
      <td className="px-3 py-3 min-w-[240px] max-w-[380px] align-top">{c.description ? <ExpandableText text={c.description} onOpen={() => onDesc(c)} /> : <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span>}</td>
      <td className="px-3 py-3">
        {estCanEdit ? <StatusSelect value={a.applicantStatus} onChange={(s) => onStatus(c.ref, s)} /> : <StatusChip s={a.applicantStatus} />}
      </td>
      <td className="px-3 py-3 min-w-[150px] max-w-[260px] align-top">
        {ev && (ev.required !== 'No' || ev.upload) && <EvidenceHint ev={ev} />}
        <Attach items={estDocs} canUpload={estCanEdit} />
      </td>
      <td className="px-3 py-3">
        {isOperator ? <ResultSelect value={a.internal} onChange={(r) => onOp(c.ref, r)} meta={OP_META} /> : (a.internal === 'pending' ? <span className="text-xs" style={{ color: '#CBD5E1' }}>Pending Review</span> : <Chip r={a.internal} meta={OP_META} />)}
      </td>
      <td className="px-3 py-3 min-w-[220px]">
        <div className="space-y-1.5">
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            {thread.length === 0 && <span className="text-xs" style={{ color: '#CBD5E1' }}>No comments yet</span>}
            {thread.map((m) => {
              const isEst = m.author_role === 'establishment'
              const internal = m.visibility === 'auditor_internal'
              const tone = ROLE_BUBBLE[m.author_role ?? ''] ?? ROLE_BUBBLE_FALLBACK
              return (
                <div key={m.id} className={isEst ? 'flex justify-start' : 'flex justify-end'}>
                  <div className="rounded-lg px-2 py-1.5 max-w-[88%]" style={{ background: tone.bg, border: `1px solid ${tone.bd}`, borderStyle: internal ? 'dashed' : 'solid' }}>
                    <span className="text-[9px] font-semibold block" style={{ color: tone.fg }}>{ROLE_LABEL[m.author_role ?? ''] ?? m.author_role}{internal ? ' · internal' : ''}</span>
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
        <td className="px-3 py-3 min-w-[260px] max-w-[320px] align-top">
          {selAudit ? (() => {
            const snap = selAudit.results[c.ref]
            const r = (snap?.result ?? 'pending') as Result
            return <>
              {r === 'pending' ? <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span> : <Chip r={r} meta={AUD_META} />}
              {snap?.note && <AuditorNote text={snap.note} author={selAudit.auditorName} />}
            </>
          })() : <>
            {editAudit
              ? <ResultSelect value={a.external} onChange={(r) => onAudit(c.ref, r)} meta={AUD_META} />
              : (a.external === 'pending' ? <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span> : <Chip r={a.external} meta={AUD_META} />)}
            {editAudit
              ? <textarea defaultValue={a.note ?? ''} rows={5} placeholder="Auditor remark…" onBlur={(e) => { if ((e.target.value.trim() || '') !== (a.note ?? '')) onAuditNote(c.ref, e.target.value) }} className="mt-1.5 w-full text-xs px-2 py-1.5 rounded-lg outline-none resize-y min-h-[80px] leading-relaxed" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
              : a.note && <AuditorNote text={a.note} />}
          </>}
        </td>
      )}
    </tr>
  )
})

// Shared collaborative criteria board.
export default function CriteriaBoard({
  applicationId, criteria, assessments, docs, messages, role, showExternal, locked = false, auditEditable = false, applicantId,
  audits = [], auditorName, editableCriteria = null,
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
  // When set, only these criterion refs are editable by the establishment
  // (selective reopen); null means the usual all-or-nothing lock applies.
  editableCriteria?: string[] | null
}) {
  const [rows, setRows] = useState(assessments)
  const [msgs, setMsgs] = useState(messages)
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all') // all | I (imperative) | G (guideline)
  const [auditId, setAuditId] = useState('')
  const selAudit = useMemo(() => audits.find((a) => a.id === auditId) ?? null, [audits, auditId])
  const [descOf, setDescOf] = useState<CriterionRef | null>(null)
  const onDesc = useCallback((c: CriterionRef) => setDescOf(c), [])
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
  const onStatus = useCallback((ref: string, s: PStatus) => {
    setRows((p) => ({ ...p, [ref]: { ...(p[ref] ?? BLANK), applicantStatus: s } })); setError('')
    start(async () => bump(await setApplicantStatus(applicationId, ref, s)))
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
    return (!q || c.title.toLowerCase().includes(q) || c.ref.toLowerCase().includes(q))
      && (area === 'all' || c.area === area)
      && (typeFilter === 'all' || (c.type ?? '').includes(typeFilter))
  })
  const groups = useMemo(() => {
    const order: string[] = []; const map = new Map<string, CriterionRef[]>()
    for (const c of filtered) { if (!map.has(c.area)) { map.set(c.area, []); order.push(c.area) } map.get(c.area)!.push(c) }
    return order.map((a) => ({ area: a, rows: map.get(a)! }))
  }, [filtered])

  const statusCounts = useMemo(() => {
    let complete = 0, inprog = 0, na = 0
    for (const c of criteria) { const s = rows[c.ref]?.applicantStatus; if (s === 'complete') complete++; else if (s === 'in_progress') inprog++; else if (s === 'na') na++ }
    return { complete, inprog, na, total: criteria.length, notset: criteria.length - complete - inprog - na }
  }, [rows, criteria])

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
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} title="Criterion type" className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
          <option value="all">I &amp; G</option>
          <option value="I">Imperative (I)</option>
          <option value="G">Guideline (G)</option>
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

      {/* Establishment progress summary */}
      <div className="flex items-center gap-2 flex-wrap rounded-xl border px-4 py-2.5" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
        <span className="text-xs font-semibold" style={{ color: '#475569' }}>Progress:</span>
        {([['complete', statusCounts.complete], ['in_progress', statusCounts.inprog], ['na', statusCounts.na]] as const).map(([k, n]) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: STATUS_META[k].bg, color: STATUS_META[k].color }}>
            {STATUS_META[k].label} <span className="font-bold">{n}</span>
          </span>
        ))}
        <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: '#F1F5F9', color: '#94A3B8' }}>Not Started <span className="font-bold">{statusCounts.notset}</span></span>
        <span className="text-xs ml-auto" style={{ color: '#94A3B8' }}>{statusCounts.complete} / {statusCounts.total} complete</span>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 1280 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#94A3B8' }}>
                <th className={th}>Criterion No.</th>
                <th className={th}>Criterion Description &amp; Guidance</th>
                <th className={th}>Est. Progress</th>
                <th className={th}>Est. Evidence</th>
                <th className={th}>Operator Readiness Review</th>
                <th className={th}>Comments &amp; Clarifications</th>
                {showExternal && <th className={th}>{selAudit ? `${AUDIT_TYPE_META[selAudit.type].label} audit ${selAudit.period}` : 'Auditor Conformity Assessment'}</th>}
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
                      estCanEdit={estCanEdit && (editableCriteria === null || editableCriteria.includes(c.ref))} isOperator={isOperator} canComment={canComment} editAudit={editAudit} showExternal={showExternal} selAudit={selAudit}
                      onStatus={onStatus} onOp={onOp} onAudit={onAudit} onAuditNote={onAuditNote} onPost={onPost} onDesc={onDesc} />
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

      {descOf && <DescModal refId={descOf.ref} title={descOf.title} text={descOf.description ?? ''} onClose={() => setDescOf(null)} />}
    </div>
  )
}
