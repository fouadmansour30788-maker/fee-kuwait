'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Minus, ChevronLeft, ChevronRight, Loader2, ArrowLeft, ListChecks, Info } from 'lucide-react'
import Link from 'next/link'
import { setCriterionResult, setCriterionNote } from '@/lib/actions/assessments'

type Crit = { ref: string; title: string; area: string; description?: string; type?: string }
type State = Record<string, { result: string; note: string }>

const CHOICES = [
  { value: 'pass', label: 'Conforming', color: '#059669', bg: '#ECFDF3', Icon: Check },
  { value: 'no_pass', label: 'Non-conforming', color: '#DC2626', bg: '#FEE2E2', Icon: X },
  { value: 'na', label: 'N/A', color: '#64748B', bg: '#F1F5F9', Icon: Minus },
]

export default function SiteVisitChecklist({ applicationId, establishment, criteria, initial, editable }: {
  applicationId: string; establishment: string; criteria: Crit[]; initial: State; editable: boolean
}) {
  const [state, setState] = useState<State>(initial)
  const [i, setI] = useState(0)
  const [saving, setSaving] = useState(false)
  const [, start] = useTransition()
  const router = useRouter()

  const cur = criteria[i]
  const assessedCount = useMemo(() => criteria.filter((c) => state[c.ref]?.result && state[c.ref].result !== 'pending').length, [criteria, state])
  const pct = Math.round((assessedCount / Math.max(1, criteria.length)) * 100)

  function choose(result: string) {
    if (!editable || !cur) return
    const prev = state[cur.ref]?.result
    const next = prev === result ? 'pending' : result   // tap again to clear
    setState((s) => ({ ...s, [cur.ref]: { ...(s[cur.ref] ?? { note: '' }), result: next } }))
    setSaving(true)
    start(async () => { await setCriterionResult(applicationId, cur.ref, next); setSaving(false) })
  }
  function saveNote(note: string) {
    if (!editable || !cur) return
    setSaving(true)
    start(async () => { await setCriterionNote(applicationId, cur.ref, note); setSaving(false); router.refresh() })
  }

  if (!cur) return null
  const sel = state[cur.ref]?.result ?? 'pending'

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link href={`/auditor/applications/${applicationId}`} className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-4 h-4" /> Full board
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: saving ? '#0891B2' : '#94A3B8' }}>
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><ListChecks className="w-3.5 h-3.5" /> {assessedCount}/{criteria.length} assessed</>}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-1">
        <h1 className="text-lg font-bold flex-1 truncate" style={{ color: '#0F172A' }}>{establishment}</h1>
      </div>
      <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>Site-visit checklist{!editable && ' · read only (audit not in progress)'}</p>

      {/* Progress */}
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-5">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#0891B2' }} />
      </div>

      {/* Criterion card */}
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: '#F1F5F9', color: '#475569' }}>{cur.area}</span>
          {cur.type && <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: cur.type.includes('I') ? '#FEF3C7' : '#EFF6FF', color: cur.type.includes('I') ? '#854D0E' : '#1D4ED8' }}>{cur.type.includes('I') ? 'Imperative' : 'Guideline'}</span>}
        </div>
        <p className="text-[11px] font-mono font-bold" style={{ color: '#94A3B8' }}>{cur.ref}</p>
        <p className="text-base font-semibold mt-0.5" style={{ color: '#1E293B' }}>{cur.title}</p>
        {cur.description && (
          <details className="mt-2">
            <summary className="text-xs font-semibold cursor-pointer inline-flex items-center gap-1" style={{ color: '#0891B2' }}><Info className="w-3.5 h-3.5" /> Guidance</summary>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#64748B' }}>{cur.description}</p>
          </details>
        )}

        {/* Choices */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {CHOICES.map((c) => {
            const on = sel === c.value
            return (
              <button key={c.value} onClick={() => choose(c.value)} disabled={!editable}
                className="flex flex-col items-center gap-1 py-3 rounded-xl font-semibold text-xs transition-all disabled:opacity-50"
                style={on ? { background: c.color, color: '#fff' } : { background: c.bg, color: c.color }}>
                <c.Icon className="w-5 h-5" /> {c.label}
              </button>
            )
          })}
        </div>

        {/* Note */}
        <textarea defaultValue={state[cur.ref]?.note ?? ''} disabled={!editable} onBlur={(e) => saveNote(e.target.value)}
          rows={2} placeholder="Finding / note (optional)…"
          className="w-full text-sm mt-3 px-3 py-2 rounded-xl outline-none resize-none disabled:opacity-60"
          style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between gap-3 mt-4">
        <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0}
          className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40" style={{ background: '#F1F5F9', color: '#334155' }}>
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <span className="text-xs font-semibold" style={{ color: '#94A3B8' }}>{i + 1} / {criteria.length}</span>
        <button onClick={() => setI((n) => Math.min(criteria.length - 1, n + 1))} disabled={i === criteria.length - 1}
          className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #0E7490, #0891B2)' }}>
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick jump dots */}
      <div className="flex flex-wrap gap-1.5 mt-5 justify-center">
        {criteria.map((c, idx) => {
          const r = state[c.ref]?.result
          const color = r === 'pass' ? '#059669' : r === 'no_pass' ? '#DC2626' : r === 'na' ? '#94A3B8' : '#E2E8F0'
          return <button key={c.ref} onClick={() => setI(idx)} title={c.ref} aria-label={c.ref}
            className="w-3 h-3 rounded-full" style={{ background: color, outline: idx === i ? '2px solid #0891B2' : 'none', outlineOffset: 1 }} />
        })}
      </div>
    </div>
  )
}
