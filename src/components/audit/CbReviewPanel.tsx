'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, RotateCcw, Loader2, AlertCircle } from 'lucide-react'
import { cbAssignAuditor, cbReturnForRectification } from '@/app/(cb)/cb/applications/[id]/actions'

interface Auditor { id: string; name_en: string | null; email: string }

// Shown to the CB while an application sits at "CB Review": either assign an
// auditor (moves it into audit) or return it to the operator for rectification.
export default function CbReviewPanel({ applicationId, auditors }: { applicationId: string; auditors: Auditor[] }) {
  const [auditorId, setAuditorId] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  const run = (fn: () => Promise<{ error?: string }>) => {
    setError('')
    start(async () => { const r = await fn(); if (r.error) setError(r.error); else router.refresh() })
  }

  return (
    <div className="bg-white rounded-2xl border p-6 space-y-5" style={{ borderColor: '#E2E8F0' }}>
      <div>
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>CB review</h2>
        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
          The operator has handed this application over. Assign an auditor to proceed to audit, or return it for rectification.
        </p>
      </div>

      {/* Assign auditor */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#047857' }}>Proceed to audit</p>
        {auditors.length === 0 ? (
          <p className="text-xs" style={{ color: '#94A3B8' }}>No auditor accounts exist yet — ask the operator to create one under Team.</p>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <select value={auditorId} onChange={(e) => setAuditorId(e.target.value)} disabled={pending}
              className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
              <option value="">Select an auditor…</option>
              {auditors.map((a) => <option key={a.id} value={a.id}>{a.name_en || a.email}</option>)}
            </select>
            <button onClick={() => run(() => cbAssignAuditor(applicationId, auditorId))} disabled={pending || !auditorId}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} Assign auditor
            </button>
          </div>
        )}
      </div>

      {/* Return for rectification */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: '#FEF9EC', border: '1px solid #FDE68A' }}>
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#B45309' }}>Needs further rectification</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} disabled={pending}
          placeholder="What must be rectified before an audit can be scheduled…"
          className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={{ background: '#fff', border: '1px solid #FDE68A', color: '#1E293B' }} />
        <button onClick={() => run(() => cbReturnForRectification(applicationId, note))} disabled={pending || !note.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
          style={{ background: '#FEE2E2', color: '#B91C1C' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Return for rectification
        </button>
        <p className="text-[11px]" style={{ color: '#92722E' }}>The operator is notified and can re-open the application or override the status.</p>
      </div>

      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
    </div>
  )
}
