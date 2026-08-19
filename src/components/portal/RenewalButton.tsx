'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { startRenewal } from '@/lib/actions/renewalSelfService'

export default function RenewalButton({ applicationId }: { applicationId: string }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  function run() {
    setError('')
    start(async () => {
      const r = await startRenewal(applicationId)
      if (r.error) { setError(r.error); setConfirming(false) }
      else router.refresh()
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: '#B45309' }}>Reopen criteria for a new cycle?</span>
        <button onClick={run} disabled={pending} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60" style={{ background: '#B45309' }}>
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Yes, start
        </button>
        <button onClick={() => setConfirming(false)} disabled={pending} className="text-xs font-semibold px-2 py-1.5" style={{ color: '#64748B' }}>Cancel</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={() => setConfirming(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#FEF3C7', color: '#854D0E' }}>
        <RefreshCw className="w-3.5 h-3.5" /> Start re-certification
      </button>
      {error && <span className="flex items-center gap-1 text-[11px]" style={{ color: '#DC2626' }}><AlertCircle className="w-3 h-3" /> {error}</span>}
    </div>
  )
}
