'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, ClipboardCheck, Loader2, AlertCircle, MessageCircleQuestion } from 'lucide-react'
import { reviewSurveillance, decideSurveillance, requestSurveillanceClarification } from '@/lib/actions/surveillance'

export function OperatorReview({ id }: { id: string }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()
  return (
    <div>
      <button onClick={() => { setError(''); start(async () => { const r = await reviewSurveillance(id); if (r.error) setError(r.error); else router.refresh() }) }}
        disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#7C3AED' }}>
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />} Mark reviewed
      </button>
      {error && <p className="text-xs mt-1" style={{ color: '#E53E3E' }}>{error}</p>}
    </div>
  )
}

export function CBDecision({ id }: { id: string }) {
  const [note, setNote] = useState('')
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()
  function decide(d: 'certified' | 'not_certified') {
    setError('')
    start(async () => { const r = await decideSurveillance(id, d, note); if (r.error) setError(r.error); else router.refresh() })
  }
  function clarify() {
    setError('')
    start(async () => { const r = await requestSurveillanceClarification(id, note); if (r.error) setError(r.error); else router.refresh() })
  }
  return (
    <div className="space-y-2">
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Decision note, or what needs clarification…"
        className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => decide('certified')} disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#059669' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve — certification maintained
        </button>
        <button onClick={clarify} disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: '#FEF3C7', color: '#854D0E' }}>
          <MessageCircleQuestion className="w-4 h-4" /> Request clarification
        </button>
        <button onClick={() => decide('not_certified')} disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#DC2626' }}>
          <X className="w-4 h-4" /> Not maintained
        </button>
      </div>
      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
    </div>
  )
}
