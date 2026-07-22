'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import { deleteDocument } from '@/lib/actions/documents'

// Removes an attached file/link. Two-step (click → confirm) so a document is
// never lost to a stray click. Re-attaching is how you replace one.
export default function DocumentRemove({ documentId, label = 'Remove', compact = false }: { documentId: string; label?: string; compact?: boolean }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  function go() {
    setError('')
    start(async () => {
      const r = await deleteDocument(documentId)
      if (r.error) { setError(r.error); setConfirming(false) }
      else router.refresh()
    })
  }

  if (error) {
    return <span className="text-[11px]" style={{ color: '#E53E3E' }} title={error}>{error}</span>
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button onClick={go} disabled={pending} className="text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#FEE2E2', color: '#B91C1C' }}>
          {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#F1F5F9', color: '#475569' }}>No</button>
      </span>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} title={label}
      className={compact ? 'text-slate-400 hover:text-red-600 transition-colors' : 'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg'}
      style={compact ? undefined : { background: '#F1F5F9', color: '#B91C1C' }}>
      <X className="w-3.5 h-3.5" />{!compact && ` ${label}`}
    </button>
  )
}
