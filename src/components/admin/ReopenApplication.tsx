'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, Loader2, AlertCircle } from 'lucide-react'
import { reopenApplication } from '@/app/(admin)/applications/[id]/actions'

// Operator-only: re-open a locked/closed application for the establishment to edit again.
export default function ReopenApplication({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  function go() {
    setError('')
    start(async () => { const r = await reopenApplication(applicationId, reason); if (r.error) setError(r.error); else { setOpen(false); setReason(''); router.refresh() } })
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
        <RotateCcw className="w-4 h-4" /> Re-open application
      </button>
    )
  }
  return (
    <div className="space-y-2 max-w-md">
      <p className="text-xs" style={{ color: '#64748B' }}>Re-opens the application to <strong>Under Review</strong> so the establishment can edit its evidence, status and comments again. Recorded in the audit trail.</p>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Reason (optional)…"
        className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
      <div className="flex items-center gap-2">
        <button onClick={go} disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#1D4ED8' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Re-open
        </button>
        <button onClick={() => { setOpen(false); setError('') }} className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#F1F5F9', color: '#475569' }}>Cancel</button>
      </div>
    </div>
  )
}
