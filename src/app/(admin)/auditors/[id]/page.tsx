'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ClipboardList, Send, Lock, Info, History, ShieldCheck,
  CheckCircle2, ShieldAlert, RotateCcw, MessageSquare,
} from 'lucide-react'
import {
  getAuditApplication, CURRENT_NO, cbById, auditorById, AUDIT_STATUS_META, NO_OPEN,
  resultsPublished, nonConformityPlan,
  type AuditComment, type TrailEntry, type AuditStatus, type ChecklistItem,
  type CriterionMessage, type CriterionResult,
} from '@/lib/data/audits'
import CriteriaTable from '@/components/audit/CriteriaTable'
import CriteriaScorecard from '@/components/audit/CriteriaScorecard'

export default function NoReviewPage({ params }: { params: { id: string } }) {
  const base = useMemo(() => getAuditApplication(params.id), [params.id])

  const [status, setStatus] = useState<AuditStatus>(base?.status ?? 'no_review')
  const [checklist, setChecklist] = useState<ChecklistItem[]>(base?.checklist ?? [])
  const [locked, setLocked] = useState<boolean>(base?.checklistLocked ?? false)
  const [submittedAt, setSubmittedAt] = useState<string | null>(base?.submittedToCbAt ?? null)
  const [comments, setComments] = useState<AuditComment[]>(base?.comments ?? [])
  const [trail, setTrail] = useState<TrailEntry[]>(base?.trail ?? [])
  const [draft, setDraft] = useState('')
  const [threads, setThreads] = useState<Record<string, CriterionMessage[]>>(
    () => Object.fromEntries((base?.checklist ?? []).map(c => [c.ref, c.thread]))
  )
  const [cdraft, setCdraft] = useState<Record<string, string>>({})

  if (!base) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-lg font-bold" style={{ color: '#0F172A' }}>Application not found</p>
        <Link href="/auditors" className="text-sm font-semibold mt-3 inline-block" style={{ color: '#40916C' }}>← Back to reviews</Link>
      </div>
    )
  }

  const editable = NO_OPEN.includes(status) && !locked
  const published = resultsPublished(status)
  const cb = cbById(base.cbId)
  const auditorName = auditorById(base.auditorId)?.name
  const now = () => new Date().toISOString().slice(0, 16).replace('T', ' ')
  const met = checklist.filter(c => c.met).length
  const pct = checklist.length ? Math.round((met / checklist.length) * 100) : 0
  const nc = nonConformityPlan(checklist)

  function logTrail(field: string, prev: string, next: string) {
    setTrail(t => [...t, { id: `T${t.length + 1}-${Date.now()}`, field, prev, next, user: CURRENT_NO.name, role: 'National Operator', at: now() }])
  }
  function setInternal(ref: string, internalResult: CriterionResult) {
    if (!editable) return
    setChecklist(prev => prev.map(c => c.ref === ref ? { ...c, internalResult } : c))
  }
  function postCriterion(ref: string) {
    const body = (cdraft[ref] ?? '').trim()
    if (!body || !NO_OPEN.includes(status)) return
    const msg: CriterionMessage = { id: `M${Date.now()}`, author: CURRENT_NO.name, role: 'no', body, at: now() }
    setThreads(prev => ({ ...prev, [ref]: [...(prev[ref] ?? []), msg] }))
    setCdraft(d => ({ ...d, [ref]: '' }))
  }
  function reopenForRevision() {
    if (!published || !nc?.canReopen) return
    logTrail('Re-opened for revision', AUDIT_STATUS_META[status].label, AUDIT_STATUS_META['changes_requested'].label)
    setStatus('changes_requested')
    setLocked(false)
    setComments(prev => [...prev, {
      id: `C${prev.length + 1}-${Date.now()}`, author: CURRENT_NO.name, role: 'no', visibility: 'shared',
      body: `Application re-opened for revision of ${nc.count} non-conforming criterion(ia). The establishment has ${nc.window} to adjust.`, at: now(),
    }])
  }
  function submitToCb() {
    if (!editable) return
    const at = now()
    logTrail('Submitted to Certification Body', AUDIT_STATUS_META[status].label, AUDIT_STATUS_META['cb_review'].label)
    setStatus('cb_review')
    setLocked(true)
    setSubmittedAt(at)
    setComments(prev => [...prev, {
      id: `C${prev.length + 1}-${Date.now()}`, author: CURRENT_NO.name, role: 'no', visibility: 'shared',
      body: `Checklist reviewed with the establishment (${met}/${checklist.length} criteria met) and submitted to ${cb?.name ?? 'the Certification Body'}. The checklist is now locked for audit integrity.`, at,
    }])
  }
  function addComment() {
    const body = draft.trim()
    if (!body) return
    setComments(prev => [...prev, { id: `C${prev.length + 1}-${Date.now()}`, author: CURRENT_NO.name, role: 'no', visibility: 'shared', body, at: now() }])
    setDraft('')
  }

  const meta = AUDIT_STATUS_META[status]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/auditors" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4" style={{ color: '#64748B' }}>
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
              <p className="text-sm mt-1" style={{ color: '#64748B' }}>{base.id} · {base.programme} · {base.mainCategory}</p>
              {submittedAt && (
                <p className="text-xs mt-1.5 inline-flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
                  <Lock className="w-3 h-3" /> Submitted to {cb?.name ?? 'the Certification Body'} on {submittedAt} — locked.
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>Criteria met</p>
              <p className="text-2xl font-bold" style={{ color: '#1B4332' }}>{met}/{checklist.length}</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>{pct}%</p>
            </div>
          </div>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: '#475569' }}>{base.summary}</p>
        </motion.div>
      </div>

      {/* Guidance banner */}
      <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF' }}>
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        {status === 'changes_requested' ? (
          <p>The Certification Body returned this for changes. Update the checklist with the establishment and resubmit.</p>
        ) : locked ? (
          <p>This submission is locked. It is now with the Certification Body — you can no longer edit the checklist.</p>
        ) : (
          <p>Review each criterion with the establishment. When the checklist is complete, submit it to the Certification Body. <strong>Submission locks the checklist</strong> and records a timestamp.</p>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Checklist */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
            className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" style={{ color: '#0891B2' }} />
                <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Criteria checklist</h2>
              </div>
              {locked && <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}><Lock className="w-3 h-3" /> Locked</span>}
            </div>
            <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>Record your internal Pass / Not Pass on each indicator and discuss it with the establishment. The external result is filled by the assigned auditor after the on-site audit.</p>
            {published && <div className="mb-4"><CriteriaScorecard items={checklist} /></div>}
            <CriteriaTable
              items={checklist}
              status={status}
              viewerRole="no"
              externalAuditorName={auditorName}
              onSetInternal={setInternal}
              threads={threads}
              draft={cdraft}
              onDraft={(ref, text) => setCdraft(d => ({ ...d, [ref]: text }))}
              onPost={postCriterion}
            />

            {/* Stage 4 — non-conformity handling */}
            {published && nc && (
              <div className="mt-4 rounded-xl p-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#B91C1C' }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: '#991B1B' }}>{nc.count} non-conformity{nc.count === 1 ? '' : 'ies'} — {nc.window} to adjust</p>
                    <p className="text-xs mt-0.5" style={{ color: '#B91C1C' }}>{nc.note}</p>
                    {nc.canReopen && (
                      <button onClick={reopenForRevision}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#fff', color: '#B91C1C', border: '1px solid #FECACA' }}>
                        <RotateCcw className="w-4 h-4" /> Re-open affected criteria for revision
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {editable ? (
              <div className="mt-5 pt-5 border-t flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: '#F1F5F9' }}>
                <p className="text-xs" style={{ color: '#94A3B8' }}>Submitting sends this to {cb?.name ?? 'the Certification Body'} and locks the checklist.</p>
                <button onClick={submitToCb}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #0891B2, #0E7490)' }}>
                  <Send className="w-4 h-4" /> {status === 'changes_requested' ? 'Resubmit to CB' : 'Submit to Certification Body'}
                </button>
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-xs mt-4 pt-4 border-t" style={{ color: '#94A3B8', borderColor: '#F1F5F9' }}>
                <Lock className="w-3 h-3" /> The checklist is locked and can only be changed if the CB returns it for revision.
              </p>
            )}
          </motion.section>

          {/* Trail */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4" style={{ color: '#64748B' }} />
              <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Audit trail</h2>
            </div>
            <ol className="space-y-3">
              {trail.map(e => (
                <li key={e.id} className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#40916C' }} />
                  <div className="min-w-0">
                    <p className="text-sm" style={{ color: '#1E293B' }}>
                      <span className="font-semibold">{e.field}</span>: <span style={{ color: '#94A3B8' }}>{e.prev}</span> → <span style={{ color: '#1B4332' }}>{e.next}</span>
                    </p>
                    <p className="text-[11px]" style={{ color: '#94A3B8' }}>{e.user} · {e.role} · {e.at}</p>
                  </div>
                </li>
              ))}
              {trail.length === 0 && (
                <li className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                  <CheckCircle2 className="w-4 h-4" /> No changes recorded yet.
                </li>
              )}
            </ol>
          </motion.section>
        </div>

        {/* Comments */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 }}
          className="lg:col-span-2 bg-white rounded-2xl border p-6 flex flex-col" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4" style={{ color: '#40916C' }} />
            <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Comments</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Shared with the establishment and the Certification Body.</p>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
            {comments.map(c => (
              <div key={c.id} className="rounded-xl p-3.5" style={{ background: c.visibility === 'shared' ? '#ECFDF3' : '#F8FAFC', border: `1px solid ${c.visibility === 'shared' ? '#A7F3D0' : '#E2E8F0'}` }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: '#1E293B' }}>{c.author}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#166534' }}>{c.role.toUpperCase()}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{c.body}</p>
                <p className="text-[10px] mt-1.5" style={{ color: '#94A3B8' }}>{c.at}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-center py-6" style={{ color: '#94A3B8' }}>No comments yet.</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F1F5F9' }}>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3}
              placeholder="Add a note for the establishment…"
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#1E293B' }} />
            <div className="flex items-center justify-between mt-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#059669' }}>
                <ShieldCheck className="w-3.5 h-3.5" /> Shared
              </span>
              <button onClick={addComment} disabled={!draft.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: '#40916C' }}>
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
