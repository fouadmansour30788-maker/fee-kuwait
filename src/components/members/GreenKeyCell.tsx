'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Loader2, Copy, Check } from 'lucide-react'
import { assignGreenKeyNumber } from '@/lib/actions/members'

export default function GreenKeyCell({ kind, id, number, status, canAssign = false }: { kind: 'School' | 'Establishment'; id: string; number: string | null; status: string | null; canAssign?: boolean }) {
  const [num, setNum] = useState(number)
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  if (num) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <code className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: '#ECFDF3', color: '#065F46', border: '1px solid #A7F3D0' }}>{num}</code>
        <button onClick={async () => { try { await navigator.clipboard.writeText(num); setCopied(true); setTimeout(() => setCopied(false), 1200) } catch { /* */ } }}
          className="text-slate-400 hover:text-slate-600" title="Copy">
          {copied ? <Check className="w-3.5 h-3.5" style={{ color: '#059669' }} /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </span>
    )
  }
  if (status !== 'active') return <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span>
  // Operator view: read-only. The number is assigned by the Certification Body
  // and syncs here once issued.
  if (!canAssign) return <span className="text-[11px] font-medium" style={{ color: '#94A3B8' }}>Awaiting CB</span>

  function generate() {
    setError('')
    start(async () => {
      const r = await assignGreenKeyNumber(kind, id)
      if (r.error) setError(r.error)
      else { setNum(r.number ?? null); router.refresh() }
    })
  }
  return (
    <div className="flex items-center gap-2">
      <button onClick={generate} disabled={pending} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg disabled:opacity-60" style={{ background: '#ECFDF3', color: '#047857' }}>
        {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />} Generate
      </button>
      {error && <span className="text-[11px]" style={{ color: '#E53E3E' }}>{error}</span>}
    </div>
  )
}
