'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Loader2, AlertCircle } from 'lucide-react'
import { manualOverrideStatus } from '@/lib/actions/applications'

export default function ManualOverride({
  applicationId, currentStatus, statuses,
}: {
  applicationId: string
  currentStatus: string
  statuses: { value: string; label: string }[]
}) {
  const [status, setStatus] = useState(currentStatus)
  const [reason, setReason] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  function go() {
    setMsg(''); setError('')
    start(async () => {
      const r = await manualOverrideStatus(applicationId, status, reason)
      if (r.error) setError(r.error)
      else { setMsg('Status overridden and recorded in the audit trail.'); setReason(''); router.refresh() }
    })
  }

  const field = 'text-sm px-3 py-2 rounded-xl bg-white outline-none'
  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: '#FCD9B6', background: '#FFFBF5' }}>
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert className="w-4 h-4" style={{ color: '#B45309' }} />
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Manual override</h2>
      </div>
      <p className="text-xs mb-4" style={{ color: '#92400E' }}>
        Authorised administrators only. Forces the application status outside the normal workflow for unforeseen cases. A reason is required and every override is recorded in the audit trail.
      </p>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <label className="text-xs font-semibold" style={{ color: '#78350F' }}>Set status to</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={field} style={{ border: '1px solid #FCD9B6', color: '#475569' }}>
          {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Reason for the override (required)…"
        className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none mb-3" style={{ background: '#fff', border: '1px solid #FCD9B6', color: '#1E293B' }} />
      {error && <p className="flex items-center gap-1.5 text-xs mb-2" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
      {msg && <p className="text-xs mb-2" style={{ color: '#059669' }}>{msg}</p>}
      <button onClick={go} disabled={pending || !reason.trim() || status === currentStatus} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#B45309' }}>
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />} Apply override
      </button>
    </div>
  )
}
