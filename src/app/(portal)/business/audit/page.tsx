'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardCheck, Check, X, Lock, Info, Paperclip, Send, MessageSquare,
  ChevronDown, ShieldAlert, Clock3, EyeOff,
} from 'lucide-react'
import {
  AUDIT_APPLICATIONS, AUDIT_STATUS_META, CRITERION_RESULT_META, CRITERION_ROLE_META,
  criterionStage, resultsPublished, visibleCriterionThread, canPostCriterion, nonConformityPlan,
  type CriterionMessage,
} from '@/lib/data/audits'

const BUSINESS_APPS = AUDIT_APPLICATIONS.filter(a => a.type === 'Business')

export default function BusinessAuditPage() {
  const [appId, setAppId] = useState(BUSINESS_APPS[0].id)
  const app = BUSINESS_APPS.find(a => a.id === appId)!

  const establishment = app.contact.split(' · ')[0]
  const stage = criterionStage(app.status)
  const published = resultsPublished(app.status)
  const canPost = canPostCriterion('establishment', app.status)

  // Local thread state per app+criterion so the establishment can post in stage 1.
  const [threads, setThreads] = useState<Record<string, Record<string, CriterionMessage[]>>>(() =>
    Object.fromEntries(BUSINESS_APPS.map(a => [a.id, Object.fromEntries(a.checklist.map(c => [c.ref, c.thread]))]))
  )
  const [open, setOpen] = useState<string | null>(null)
  const [draft, setDraft] = useState<Record<string, string>>({})

  const nc = useMemo(() => nonConformityPlan(app.checklist), [app.checklist])
  const now = () => new Date().toISOString().slice(0, 16).replace('T', ' ')

  function post(ref: string) {
    const body = (draft[ref] ?? '').trim()
    if (!body || !canPost) return
    const msg: CriterionMessage = { id: `M${Date.now()}`, author: establishment, role: 'establishment', body, at: now() }
    setThreads(prev => ({ ...prev, [appId]: { ...prev[appId], [ref]: [...prev[appId][ref], msg] } }))
    setDraft(d => ({ ...d, [ref]: '' }))
  }
  function attach(ref: string) {
    if (!canPost) return
    const msg: CriterionMessage = { id: `M${Date.now()}`, author: establishment, role: 'establishment', body: '📎 Attached a document (demo).', at: now() }
    setThreads(prev => ({ ...prev, [appId]: { ...prev[appId], [ref]: [...prev[appId][ref], msg] } }))
  }

  const meta = AUDIT_STATUS_META[app.status]

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold" style={{ color: '#0F2318' }}>Criteria &amp; Audit</h1>
        <p className="text-sm mt-0.5" style={{ color: '#5B7568' }}>
          Discuss each criterion with the National Operator and attach evidence. Audit results appear here once the audit is complete.
        </p>
      </motion.div>

      {/* Application selector */}
      <div className="flex gap-2 flex-wrap">
        {BUSINESS_APPS.map(a => {
          const active = a.id === appId
          const s = criterionStage(a.status)
          return (
            <button key={a.id} onClick={() => { setAppId(a.id); setOpen(null) }}
              className="px-3.5 py-2 rounded-xl text-sm font-semibold transition-all text-left"
              style={active ? { background: '#1B4332', color: '#fff' } : { background: '#fff', color: '#5B7568', border: '1px solid #D4E7DA' }}>
              {a.entity}
              <span className="block text-[10px] font-medium mt-0.5" style={{ color: active ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>
                {a.id} · Stage {s}
              </span>
            </button>
          )
        })}
      </div>

      {/* App header */}
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#D4E7DA' }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-bold" style={{ color: '#0F2318' }}>{app.entity}</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{app.programme} · {app.mainCategory} · Deadline {app.deadline}</p>
          </div>
        </div>
      </div>

      {/* Stage banner */}
      {stage === 1 && (
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF' }}>
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p><strong>Stage 1 — Application.</strong> Add comments and attach evidence on each criterion. The National Operator will respond here. Once submitted, the application locks.</p>
        </div>
      )}
      {stage === 2 && (
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF9EC', border: '1px solid #FDE68A', color: '#854D0E' }}>
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p><strong>Stage 2 — Under audit.</strong> Your application is locked while the auditor completes their assessment. The auditor&apos;s observations are not visible until the audit is complete.</p>
        </div>
      )}
      {stage === 3 && (
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534' }}>
          <ClipboardCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p><strong>Stage 3 — Audit results.</strong> The audit is complete. Results below are read-only. The auditor&apos;s observations are now visible.</p>
        </div>
      )}

      {/* Non-conformity plan */}
      {published && nc && (
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            <strong>{nc.count} non-conformity{nc.count === 1 ? '' : 'ies'} — {nc.window} to adjust.</strong>{' '}
            {nc.count <= 5
              ? 'The National Operator can re-open the affected criteria for revision.'
              : 'Please revise the affected criteria within the deadline.'}
          </p>
        </div>
      )}

      {/* Criteria list */}
      <div className="space-y-3">
        {app.checklist.map(c => {
          const rm = CRITERION_RESULT_META[c.result]
          const isOpen = open === c.ref
          const msgs = visibleCriterionThread(threads[appId][c.ref], 'establishment', app.status)
          return (
            <div key={c.ref} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#D4E7DA' }}>
              <button onClick={() => setOpen(isOpen ? null : c.ref)} className="w-full flex items-center gap-3 p-4 text-left">
                <span className="text-xs font-mono font-semibold flex-shrink-0 w-8" style={{ color: '#94A3B8' }}>{c.ref}</span>
                <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: c.met ? '#DCFCE7' : '#FEE2E2' }}>
                  {c.met ? <Check className="w-3.5 h-3.5" style={{ color: '#16A34A' }} /> : <X className="w-3.5 h-3.5" style={{ color: '#DC2626' }} />}
                </span>
                <p className="text-sm flex-1 min-w-0 font-medium" style={{ color: '#1E293B' }}>{c.title}</p>

                {/* Audit result column */}
                {published ? (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: rm.bg, color: rm.color }}>
                    {c.result === 'pass' ? <Check className="w-3 h-3" /> : c.result === 'no_pass' ? <X className="w-3 h-3" /> : null}
                    {rm.label}
                  </span>
                ) : stage === 2 ? (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: '#F1F5F9', color: '#64748B' }}>
                    <EyeOff className="w-3 h-3" /> Under audit
                  </span>
                ) : (
                  <span className="hidden sm:inline text-[11px] font-medium" style={{ color: '#CBD5E1' }}>Awaiting audit</span>
                )}

                {msgs.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: '#40916C' }}>
                    <MessageSquare className="w-3.5 h-3.5" /> {msgs.length}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform" style={{ color: '#94A3B8', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {isOpen && (
                <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: '#EEF5F0', background: '#FCFEFD' }}>
                  {/* Thread */}
                  {msgs.length === 0 && <p className="text-xs text-center py-3" style={{ color: '#94A3B8' }}>No comments on this criterion yet.</p>}
                  {msgs.map(m => {
                    const role = CRITERION_ROLE_META[m.role]
                    const mine = m.role === 'establishment'
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[80%] rounded-xl p-3" style={{ background: mine ? '#ECFDF3' : '#F1F5F9', border: `1px solid ${mine ? '#A7F3D0' : '#E2E8F0'}` }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold" style={{ color: '#1E293B' }}>{m.author}</span>
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: role.bg, color: role.color }}>{role.label}</span>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{m.body}</p>
                          <p className="text-[10px] mt-1" style={{ color: '#94A3B8' }}>{m.at}</p>
                        </div>
                      </div>
                    )
                  })}

                  {/* Composer */}
                  {canPost ? (
                    <div className="pt-1">
                      <textarea value={draft[c.ref] ?? ''} onChange={e => setDraft(d => ({ ...d, [c.ref]: e.target.value }))} rows={2}
                        placeholder="Add a comment for the National Operator…"
                        className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none" style={{ background: '#fff', border: '1px solid #D4E7DA', color: '#1E293B' }} />
                      <div className="flex items-center justify-between mt-2">
                        <button onClick={() => attach(c.ref)} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: '#F1F5F9', color: '#475569' }}>
                          <Paperclip className="w-3.5 h-3.5" /> Attach
                        </button>
                        <button onClick={() => post(c.ref)} disabled={!(draft[c.ref] ?? '').trim()}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: '#40916C' }}>
                          <Send className="w-3.5 h-3.5" /> Send
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="flex items-center gap-1.5 text-xs pt-1" style={{ color: '#94A3B8' }}>
                      <Lock className="w-3 h-3" /> {stage === 2 ? 'Locked during the audit — you cannot comment at this stage.' : 'This criterion is read-only.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {stage === 1 && (
        <p className="flex items-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
          <Clock3 className="w-3.5 h-3.5" /> When every criterion is ready, the National Operator submits your application to the Certification Body.
        </p>
      )}
    </div>
  )
}
