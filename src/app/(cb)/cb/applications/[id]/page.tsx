'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, FileText, Check, X, Clock, Download, Send, ShieldCheck, History,
  Info, Gavel, Award, FileDown, Lock,
} from 'lucide-react'
import {
  getAuditApplication, CURRENT_CB, auditorById, DOC_STATUS_META, AUDIT_STATUS_META,
  CONFORMITY_META, CB_DECISION_META,
  type AuditComment, type TrailEntry, type AuditStatus, type CbDecision,
} from '@/lib/data/audits'

const DECISIONS: { value: CbDecision; status: AuditStatus; label: string }[] = [
  { value: 'certified',               status: 'certified',               label: 'Certified' },
  { value: 'certified_rectification', status: 'certified_rectification', label: 'Certified · subject to rectification' },
  { value: 'not_certified',           status: 'not_certified',           label: 'Not certified' },
]

export default function CbReviewPage({ params }: { params: { id: string } }) {
  const base = useMemo(() => getAuditApplication(params.id), [params.id])

  const [status, setStatus] = useState<AuditStatus>(base?.status ?? 'cb_review')
  const [decision, setDecision] = useState<CbDecision>(base?.cbDecision ?? 'pending')
  const [comments, setComments] = useState<AuditComment[]>(base?.comments ?? [])
  const [trail, setTrail] = useState<TrailEntry[]>(base?.trail ?? [])
  const [draft, setDraft] = useState('')
  const [shared, setShared] = useState(true)

  if (!base) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-lg font-bold" style={{ color: '#0F172A' }}>Application not found</p>
        <Link href="/cb/dashboard" className="text-sm font-semibold mt-3 inline-block" style={{ color: '#C8A951' }}>← Back to reviews</Link>
      </div>
    )
  }

  const auditor = auditorById(base.auditorId)
  const decided = ['certified', 'certified_rectification', 'not_certified'].includes(status)
  const now = () => new Date().toISOString().slice(0, 16).replace('T', ' ')

  function record(d: CbDecision, s: AuditStatus, label: string) {
    setTrail(t => [...t, { id: `T${t.length + 1}-${Date.now()}`, field: 'Certification decision', prev: CB_DECISION_META[decision].label, next: label, user: CURRENT_CB.name, role: 'Certification Body', at: now() }])
    setDecision(d); setStatus(s)
    setComments(prev => [...prev, { id: `C${prev.length + 1}-${Date.now()}`, author: CURRENT_CB.name, role: 'cb', visibility: 'shared', body: `Certification decision recorded: ${label}.`, at: now() }])
  }
  function addComment() {
    const body = draft.trim()
    if (!body) return
    setComments(prev => [...prev, { id: `C${prev.length + 1}-${Date.now()}`, author: CURRENT_CB.name, role: 'cb', visibility: shared ? 'shared' : 'internal', body, at: now() }])
    setDraft('')
  }

  const meta = AUDIT_STATUS_META[status]
  const cm = CONFORMITY_META[base.conformity]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/cb/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-4 h-4" /> Certification Reviews
        </Link>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>{base.entity}</h1>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
              </div>
              <p className="text-sm mt-1" style={{ color: '#64748B' }}>{base.id} · {base.programme} · {base.mainCategory}{base.subCategories.length ? ` (+ ${base.subCategories.join(', ')})` : ''}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>Conformity</p>
              <p className="text-2xl font-bold" style={{ color: '#854D0E' }}>{base.conformityPct}%</p>
            </div>
          </div>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: '#475569' }}>{base.summary}</p>
        </motion.div>
      </div>

      {/* Role banner */}
      <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF9EC', border: '1px solid #FDE68A', color: '#854D0E' }}>
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>You review the auditor&apos;s report and record the certification decision. You <strong>cannot conduct audits or modify auditor findings</strong> — those are shown read-only below.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Audit report (read-only) */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
            className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Audit report</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cm.bg, color: cm.color }}>{cm.label}</span>
            </div>
            <p className="text-sm mb-4" style={{ color: '#64748B' }}>
              Submitted by <span className="font-semibold" style={{ color: '#1E293B' }}>{auditor?.name ?? 'Auditor'}</span>. Evidence findings (read-only):
            </p>
            <div className="space-y-2.5">
              {base.documents.map(doc => {
                const dm = DOC_STATUS_META[doc.status]
                return (
                  <div key={doc.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: '#E2E8F0' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                      <FileText className="w-4 h-4" style={{ color: '#64748B' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>{doc.name}</p>
                      {doc.note && <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{doc.note}</p>}
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: dm.bg, color: dm.color }}>
                      {doc.status === 'conform' ? <Check className="w-3 h-3" /> : doc.status === 'non_conform' ? <X className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {dm.label}
                    </span>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100" style={{ color: '#94A3B8' }} aria-label="Download"><Download className="w-4 h-4" /></button>
                  </div>
                )
              })}
            </div>
            <p className="flex items-center gap-1.5 text-xs mt-3" style={{ color: '#94A3B8' }}>
              <Lock className="w-3 h-3" /> Auditor findings are immutable for the Certification Body.
            </p>
          </motion.section>

          {/* Decision */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center gap-2 mb-1">
              <Gavel className="w-4 h-4" style={{ color: '#C8A951' }} />
              <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Certification decision</h2>
            </div>
            <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Record the formal decision. This is communicated to the establishment by the National Operator.</p>

            {decided ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: CB_DECISION_META[decision].bg, color: CB_DECISION_META[decision].color }}>
                  <Award className="w-4 h-4" /> Decision recorded: {CB_DECISION_META[decision].label}
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#1E293B', color: '#fff' }}>
                  <FileDown className="w-4 h-4" /> Generate Certification Body report (PDF)
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {DECISIONS.map(d => {
                  const m = CB_DECISION_META[d.value]
                  return (
                    <button key={d.value} onClick={() => record(d.value, d.status, d.label)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}33` }}>
                      {d.label}
                    </button>
                  )
                })}
              </div>
            )}
          </motion.section>

          {/* Traceability */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.14 }}
            className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4" style={{ color: '#64748B' }} />
              <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Audit trail</h2>
            </div>
            <ol className="space-y-3">
              {trail.map(e => (
                <li key={e.id} className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#C8A951' }} />
                  <div className="min-w-0">
                    <p className="text-sm" style={{ color: '#1E293B' }}>
                      <span className="font-semibold">{e.field}</span>: <span style={{ color: '#94A3B8' }}>{e.prev}</span> → <span style={{ color: '#854D0E' }}>{e.next}</span>
                    </p>
                    <p className="text-[11px]" style={{ color: '#94A3B8' }}>{e.user} · {e.role} · {e.at}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.section>
        </div>

        {/* Clarifications / comments */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 }}
          className="lg:col-span-2 bg-white rounded-2xl border p-6 flex flex-col" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Clarifications & comments</h2>
          <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>
            <Lock className="w-3 h-3 inline -mt-0.5" /> Internal · <ShieldCheck className="w-3 h-3 inline -mt-0.5" /> Shared with applicant.
          </p>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-1">
            {comments.map(c => (
              <div key={c.id} className="rounded-xl p-3.5" style={{ background: c.visibility === 'shared' ? '#ECFDF3' : '#F8FAFC', border: `1px solid ${c.visibility === 'shared' ? '#A7F3D0' : '#E2E8F0'}` }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: '#1E293B' }}>{c.author}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#854D0E' }}>{c.role.toUpperCase()}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{c.body}</p>
                <p className="text-[10px] mt-1.5" style={{ color: '#94A3B8' }}>{c.at}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F1F5F9' }}>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3}
              placeholder="Request a clarification or add a note…"
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#1E293B' }} />
            <div className="flex items-center justify-between mt-2.5">
              <button onClick={() => setShared(s => !s)} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                style={shared ? { background: '#D1FAE5', color: '#047857' } : { background: '#F1F5F9', color: '#64748B' }}>
                {shared ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {shared ? 'Shared with applicant' : 'Internal only'}
              </button>
              <button onClick={addComment} disabled={!draft.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: '#C8A951' }}>
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
