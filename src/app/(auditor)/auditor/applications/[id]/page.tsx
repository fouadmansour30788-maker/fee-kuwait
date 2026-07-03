'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, FileText, Check, X, Clock, Download,
  Lock, Send, Building2, CalendarClock, ShieldCheck, Mail, History, Info, FileCheck2,
  ClipboardCheck, EyeOff,
} from 'lucide-react'
import {
  getAuditApplication, CURRENT_AUDITOR, DOC_STATUS_META, AUDIT_STATUS_META, CONFORMITY_META,
  CRITERION_RESULT_META, canSetCriterionResults, canPostCriterion, deriveConformity,
  type AuditDoc, type AuditComment, type TrailEntry, type AuditStatus, type Conformity,
  type ChecklistItem, type CriterionMessage, type CriterionResult, type NcSeverity,
} from '@/lib/data/audits'
import CriteriaTable from '@/components/audit/CriteriaTable'
import CriteriaScorecard from '@/components/audit/CriteriaScorecard'

export default function AuditorReviewPage({ params }: { params: { id: string } }) {
  const base = useMemo(() => getAuditApplication(params.id), [params.id])

  const [status, setStatus] = useState<AuditStatus>(base?.status ?? 'audit')
  const [docs, setDocs] = useState<AuditDoc[]>(base?.documents ?? [])
  const [comments, setComments] = useState<AuditComment[]>(base?.comments ?? [])
  const [trail, setTrail] = useState<TrailEntry[]>(base?.trail ?? [])
  const [criteria, setCriteria] = useState<ChecklistItem[]>(base?.checklist ?? [])
  const [cthreads, setCthreads] = useState<Record<string, CriterionMessage[]>>(
    () => Object.fromEntries((base?.checklist ?? []).map(c => [c.ref, c.thread]))
  )
  const [cdraft, setCdraft] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState('')
  const [shared, setShared] = useState(false)

  if (!base) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-lg font-bold" style={{ color: '#0F172A' }}>Application not found</p>
        <Link href="/auditor/applications" className="text-sm font-semibold mt-3 inline-block" style={{ color: '#40916C' }}>
          ← Back to assigned applications
        </Link>
      </div>
    )
  }

  // The auditor may only record findings while the CB-assigned audit is in progress.
  const locked = status !== 'audit'
  const canSetResults = canSetCriterionResults(status)
  const canPostCrit = canPostCriterion('auditor', status)
  const now = () => new Date().toISOString().slice(0, 16).replace('T', ' ')
  const graded = criteria.filter(c => c.result !== 'pending').length
  const conformity: Conformity = deriveConformity(criteria)  // auto-derived from per-criterion results

  function logTrail(field: string, prev: string, next: string) {
    setTrail(t => [...t, { id: `T${t.length + 1}-${Date.now()}`, field, prev, next, user: CURRENT_AUDITOR.name, role: 'Auditor', at: now() }])
  }
  function setResult(ref: string, result: CriterionResult) {
    if (!canSetResults) return
    setCriteria(prev => prev.map(c => {
      if (c.ref !== ref) return c
      if (c.result !== result) logTrail(`Criterion ${ref}`, CRITERION_RESULT_META[c.result].label, CRITERION_RESULT_META[result].label)
      return { ...c, result }
    }))
  }
  function setNarrative(ref: string, externalNarrative: string) {
    if (!canSetResults) return
    setCriteria(prev => prev.map(c => c.ref === ref ? { ...c, externalNarrative } : c))
  }
  function setSeverity(ref: string, severity: NcSeverity) {
    if (!canSetResults) return
    setCriteria(prev => prev.map(c => c.ref === ref ? { ...c, severity } : c))
  }
  function setDue(ref: string, dueDate: string) {
    if (!canSetResults) return
    setCriteria(prev => prev.map(c => c.ref === ref ? { ...c, dueDate: dueDate || null } : c))
  }
  function postCriterion(ref: string) {
    const body = (cdraft[ref] ?? '').trim()
    if (!body || !canPostCrit) return
    const msg: CriterionMessage = { id: `M${Date.now()}`, author: CURRENT_AUDITOR.name, role: 'auditor', body, at: now() }
    setCthreads(prev => ({ ...prev, [ref]: [...(prev[ref] ?? []), msg] }))
    setCdraft(d => ({ ...d, [ref]: '' }))
  }
  function setDoc(id: string, patch: Partial<AuditDoc>, label?: string) {
    setDocs(prev => prev.map(d => {
      if (d.id !== id) return d
      if (label && patch.status && patch.status !== d.status) {
        logTrail(`Document: ${d.name}`, DOC_STATUS_META[d.status].label, DOC_STATUS_META[patch.status].label)
      }
      return { ...d, ...patch }
    }))
  }
  function addComment() {
    const body = draft.trim()
    if (!body) return
    setComments(prev => [...prev, {
      id: `C${prev.length + 1}-${Date.now()}`, author: CURRENT_AUDITOR.name, role: 'auditor',
      visibility: shared ? 'shared' : 'internal', body, at: now(),
    }])
    setDraft('')
  }
  const allGraded = criteria.length > 0 && graded === criteria.length
  function submitReport() {
    if (locked || conformity === 'pending' || !allGraded) return
    const passed = criteria.filter(c => c.result === 'pass').length
    logTrail('Audit report', 'Draft', 'Submitted to CB — results published')
    setStatus('cb_final')   // publishes per-criterion results; returns to the CB for the final assessment
    setComments(prev => [...prev, {
      id: `C${prev.length + 1}-${Date.now()}`, author: CURRENT_AUDITOR.name, role: 'auditor', visibility: 'internal',
      body: `Audit complete — ${passed}/${criteria.length} criteria passed, conformity ${CONFORMITY_META[conformity].label}. Per-criterion results are now published; returned to the Certification Body.`, at: now(),
    }])
  }

  const meta = AUDIT_STATUS_META[status]
  const pending = docs.filter(d => d.status === 'pending').length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/auditor/applications" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-4 h-4" /> Assigned Applications
        </Link>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>{base.entity}</h1>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
              </div>
              <p className="text-sm mt-1" style={{ color: '#64748B' }}>{base.id} · {base.programme}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>Conformity</p>
              <p className="text-2xl font-bold" style={{ color: '#1B4332' }}>{base.conformityPct}%</p>
            </div>
          </div>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: '#475569' }}>{base.summary}</p>
          {/* Category */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#ECFDF3', color: '#1B4332' }}>Main: {base.mainCategory}</span>
            {base.subCategories.map(s => (
              <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#F1F5F9', color: '#475569' }}>+ {s}</span>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t" style={{ borderColor: '#F1F5F9' }}>
            {[
              { Icon: Building2, label: 'Type', value: `${base.type} · ${base.governorate}` },
              { Icon: Mail, label: 'Contact', value: base.contact },
              { Icon: FileText, label: 'Submitted', value: base.submitted },
              { Icon: CalendarClock, label: 'Deadline', value: base.deadline },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#94A3B8' }}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </div>
                <p className="text-sm truncate" style={{ color: '#1E293B' }} title={value}>{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Role banner */}
      <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF' }}>
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>As an auditor you record findings and a conformity judgement, then submit the audit report. The <strong>certification decision is made by the Certification Body</strong>, not by you.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Documents */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
            className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Evidence & findings</h2>
              <span className="text-xs" style={{ color: pending ? '#D97706' : '#94A3B8' }}>{pending} of {docs.length} pending</span>
            </div>
            <div className="space-y-3">
              {docs.map(doc => {
                const dm = DOC_STATUS_META[doc.status]
                return (
                  <div key={doc.id} className="rounded-xl border p-3.5" style={{ borderColor: '#E2E8F0' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                        <FileText className="w-4 h-4" style={{ color: '#64748B' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>{doc.name}</p>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>{doc.type} · {doc.size}</p>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: dm.bg, color: dm.color }}>
                        {doc.status === 'conform' ? <Check className="w-3 h-3" /> : doc.status === 'non_conform' ? <X className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {dm.label}
                      </span>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100" style={{ color: '#94A3B8' }} aria-label="Download"><Download className="w-4 h-4" /></button>
                    </div>
                    {!locked && (
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => setDoc(doc.id, { status: 'conform' }, 'log')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={doc.status === 'conform' ? { background: '#059669', color: '#fff' } : { background: '#F1F5F9', color: '#059669' }}>
                          <Check className="w-3.5 h-3.5" /> Conform
                        </button>
                        <button onClick={() => setDoc(doc.id, { status: 'non_conform' }, 'log')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={doc.status === 'non_conform' ? { background: '#DC2626', color: '#fff' } : { background: '#F1F5F9', color: '#DC2626' }}>
                          <X className="w-3.5 h-3.5" /> Non-conform
                        </button>
                        <input value={doc.note ?? ''} onChange={e => setDoc(doc.id, { note: e.target.value })}
                          placeholder="Record a finding for this evidence…"
                          className="flex-1 text-xs px-3 py-1.5 rounded-lg outline-none" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#1E293B' }} />
                      </div>
                    )}
                    {locked && doc.note && <p className="text-xs mt-2" style={{ color: '#64748B' }}>{doc.note}</p>}
                  </div>
                )
              })}
            </div>
          </motion.section>

          {/* Per-criterion assessment (Pass / No Pass) + private notes */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}
            className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" style={{ color: '#0891B2' }} />
                <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Criteria assessment</h2>
              </div>
              <span className="text-xs" style={{ color: graded === criteria.length ? '#059669' : '#D97706' }}>{graded}/{criteria.length} graded</span>
            </div>
            <p className="text-xs mb-4 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
              <EyeOff className="w-3.5 h-3.5" /> Your results and notes stay hidden from the establishment until you submit the report.
            </p>
            <div className="mb-4"><CriteriaScorecard items={criteria} /></div>
            <CriteriaTable
              items={criteria}
              status={status}
              viewerRole="auditor"
              externalAuditorName={CURRENT_AUDITOR.name}
              onSetExternal={setResult}
              onSetSeverity={setSeverity}
              onSetDue={setDue}
              onSetNarrative={setNarrative}
              threads={cthreads}
              draft={cdraft}
              onDraft={(ref, text) => setCdraft(d => ({ ...d, [ref]: text }))}
              onPost={postCriterion}
            />
          </motion.section>

          {/* Conformity judgement + submit audit report */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Conformity judgement & audit report</h2>
            <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>The overall conformity is derived automatically from your per-criterion results, then submit the audit report to the Certification Body.</p>

            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm mb-4" style={{ background: CONFORMITY_META[conformity].bg, color: CONFORMITY_META[conformity].color }}>
              <FileCheck2 className="w-4 h-4" />
              <span>Derived conformity: <strong>{CONFORMITY_META[conformity].label}</strong>{conformity === 'major_nc' && <span> — an imperative or major non-conformity is present.</span>}</span>
            </div>

            {locked ? (
              <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#ECFDF3', border: '1px solid #A7F3D0', color: '#047857' }}>
                <FileCheck2 className="w-4 h-4" />
                Audit report submitted ({CONFORMITY_META[conformity].label}) — awaiting the Certification Body decision.
              </div>
            ) : (
              <>
                <button onClick={submitReport} disabled={conformity === 'pending' || !allGraded}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
                  <Send className="w-4 h-4" /> Submit audit report &amp; publish results
                </button>
                {!allGraded && (
                  <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>
                    Grade all {criteria.length} criteria (Pass / No Pass) to enable submission. Submitting publishes results to all parties.
                  </p>
                )}
              </>
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
                  <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#40916C' }} />
                  <div className="min-w-0">
                    <p className="text-sm" style={{ color: '#1E293B' }}>
                      <span className="font-semibold">{e.field}</span>: <span style={{ color: '#94A3B8' }}>{e.prev}</span> → <span style={{ color: '#059669' }}>{e.next}</span>
                    </p>
                    <p className="text-[11px]" style={{ color: '#94A3B8' }}>{e.user} · {e.role} · {e.at}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.section>
        </div>

        {/* Comments / feedback */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 }}
          className="lg:col-span-2 bg-white rounded-2xl border p-6 flex flex-col" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Feedback & comments</h2>
          <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>
            <Lock className="w-3 h-3 inline -mt-0.5" /> Internal stays with FEE · <ShieldCheck className="w-3 h-3 inline -mt-0.5" /> Shared is visible to the applicant.
          </p>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-1">
            {comments.map(c => (
              <div key={c.id} className="rounded-xl p-3.5" style={{ background: c.visibility === 'shared' ? '#ECFDF3' : '#F8FAFC', border: `1px solid ${c.visibility === 'shared' ? '#A7F3D0' : '#E2E8F0'}` }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: '#1E293B' }}>{c.author}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={c.visibility === 'shared' ? { background: '#D1FAE5', color: '#047857' } : { background: '#E2E8F0', color: '#475569' }}>
                    {c.visibility === 'shared' ? 'Shared' : 'Internal'}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{c.body}</p>
                <p className="text-[10px] mt-1.5" style={{ color: '#94A3B8' }}>{c.role} · {c.at}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F1F5F9' }}>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3}
              placeholder="Write feedback or an internal note…"
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#1E293B' }} />
            <div className="flex items-center justify-between mt-2.5">
              <button onClick={() => setShared(s => !s)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                style={shared ? { background: '#D1FAE5', color: '#047857' } : { background: '#F1F5F9', color: '#64748B' }}>
                {shared ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {shared ? 'Shared with applicant' : 'Internal only'}
              </button>
              <button onClick={addComment} disabled={!draft.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
