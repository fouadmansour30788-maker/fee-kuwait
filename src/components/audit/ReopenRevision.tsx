'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, AlertCircle } from 'lucide-react'
import { reopenForRevision } from '@/app/(admin)/applications/[id]/actions'

export default function ReopenRevision({ applicationId, ncCount, deadline }: { applicationId: string; ncCount: number; deadline: string | null }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()
  const window = ncCount <= 5 ? '15 days' : '3 months'

  function go() {
    setError('')
    start(async () => { const r = await reopenForRevision(applicationId); if (r.error) setError(r.error); else router.refresh() })
  }

  return (
    <div className="space-y-2">
      {deadline && (
        <p className="text-xs" style={{ color: '#B45309' }}>Currently in revision — due {new Date(deadline).toLocaleDateString('en-GB')}.</p>
      )}
      <p className="text-xs" style={{ color: '#64748B' }}>
        <span className="font-semibold" style={{ color: '#B91C1C' }}>{ncCount}</span> non-conformity{ncCount === 1 ? '' : 'ies'} — re-opening gives the establishment <strong>{window}</strong> to revise the flagged criteria.
      </p>
      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
      <button onClick={go} disabled={pending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
        <RotateCcw className="w-4 h-4" /> {pending ? 'Re-opening…' : 'Re-open for revision'}
      </button>
    </div>
  )
}
