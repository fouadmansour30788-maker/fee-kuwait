'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, Loader2, Unlock, Lock, AlertCircle } from 'lucide-react'
import { approveEcoSteps } from '@/lib/actions/ecoSchools'
import { ES_MIN_THEMES } from '@/lib/data/ecoSchoolsCriteria'

// Eco-Schools phase: Steps 1–2 first, then the operator opens Steps 3–7.
// `canApprove` shows the approve button (operator); otherwise it's informational.
export default function EcoPhasePanel({ applicationId, unlockedAt, gate, canApprove }: {
  applicationId: string
  unlockedAt: string | null
  gate: { step1Docs: number; step2Docs: number; themes: number; met: boolean }
  canApprove: boolean
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  if (unlockedAt) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#ECFDF3', border: '1px solid #A7F3D0', color: '#047857' }}>
        <Unlock className="w-4 h-4 flex-shrink-0" />
        Steps 1–2 approved on {new Date(unlockedAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait' })} — all seven steps are open.
      </div>
    )
  }

  const items = [
    { ok: gate.step1Docs > 0, text: 'Step 1 — Eco-Committee document attached' },
    { ok: gate.step2Docs > 0, text: 'Step 2 — Sustainability Audit attached' },
    { ok: gate.themes >= ES_MIN_THEMES, text: `Step 2 — at least ${ES_MIN_THEMES} themes selected (${gate.themes} selected)` },
  ]

  return (
    <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: '#FDE68A', background: '#FFFBEB' }}>
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4" style={{ color: '#B45309' }} />
        <h2 className="text-sm font-bold flex-1" style={{ color: '#92400E' }}>Eco-Schools — Steps 1–2 first</h2>
      </div>
      <p className="text-xs" style={{ color: '#92400E' }}>
        {canApprove
          ? 'Steps 3–7 stay locked until you review and approve Steps 1–2.'
          : 'Complete Steps 1–2 below. Steps 3–7 open once the National Operator reviews and approves them.'}
      </p>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i.text} className="flex items-center gap-2 text-xs" style={{ color: i.ok ? '#047857' : '#64748B' }}>
            {i.ok ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />} {i.text}
          </li>
        ))}
      </ul>
      {canApprove && (
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <button disabled={pending || !gate.met}
            onClick={() => { setError(''); start(async () => { const r = await approveEcoSteps(applicationId); if (r.error) setError(r.error); else router.refresh() }) }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />} Approve Steps 1–2 &amp; open remaining steps
          </button>
          {!gate.met && <span className="text-[11px]" style={{ color: '#92400E' }}>Available once the three items above are done.</span>}
        </div>
      )}
      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#DC2626' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
    </div>
  )
}
