'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardCheck, Lock, Info, ShieldAlert, Clock3 } from 'lucide-react'
import {
  AUDIT_APPLICATIONS, AUDIT_STATUS_META, auditorById,
  criterionStage, resultsPublished, canPostCriterion, nonConformityPlan,
  type CriterionMessage,
} from '@/lib/data/audits'
import CriteriaTable from '@/components/audit/CriteriaTable'

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
            <button key={a.id} onClick={() => setAppId(a.id)}
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
      <CriteriaTable
        items={app.checklist}
        status={app.status}
        viewerRole="establishment"
        externalAuditorName={auditorById(app.auditorId)?.name}
        threads={threads[appId]}
        draft={draft}
        onDraft={(ref, text) => setDraft(d => ({ ...d, [ref]: text }))}
        onPost={post}
        onAttach={attach}
      />

      {stage === 1 && (
        <p className="flex items-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
          <Clock3 className="w-3.5 h-3.5" /> When every criterion is ready, the National Operator submits your application to the Certification Body.
        </p>
      )}
    </div>
  )
}
