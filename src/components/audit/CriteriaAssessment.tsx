'use client'

import { Fragment, useState, useTransition } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'
import { setCriterionResult } from '@/lib/actions/assessments'
import type { CriterionRef } from '@/lib/criteria'

type Result = 'pending' | 'pass' | 'no_pass'

export default function CriteriaAssessment({ applicationId, criteria, initial }: {
  applicationId: string
  criteria: CriterionRef[]
  initial: Record<string, Result>
}) {
  const [results, setResults] = useState<Record<string, Result>>(initial)
  const [, start] = useTransition()
  const [error, setError] = useState('')

  function setR(ref: string, result: Result) {
    setResults((prev) => ({ ...prev, [ref]: result }))
    setError('')
    start(async () => {
      const res = await setCriterionResult(applicationId, ref, result)
      if (res.error) setError(res.error)
    })
  }

  const graded = criteria.filter((c) => (results[c.ref] ?? 'pending') !== 'pending').length
  const passed = criteria.filter((c) => results[c.ref] === 'pass').length
  const noPass = criteria.filter((c) => results[c.ref] === 'no_pass').length

  const areas: { area: string; items: CriterionRef[] }[] = []
  for (const c of criteria) {
    let g = areas.find((x) => x.area === c.area)
    if (!g) { g = { area: c.area, items: [] }; areas.push(g) }
    g.items.push(c)
  }

  const tiles = [
    { label: 'Graded', value: `${graded}/${criteria.length}`, color: '#0891B2' },
    { label: 'Pass', value: passed, color: '#059669' },
    { label: 'No Pass', value: noPass, color: '#DC2626' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border p-3 text-center bg-white" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-2xl font-bold" style={{ color: t.color }}>{t.value}</p>
            <p className="text-[11px]" style={{ color: '#94A3B8' }}>{t.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}>
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
          {areas.map((g) => (
            <Fragment key={g.area}>
              <div className="px-4 py-2" style={{ background: '#ECFDF3' }}>
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#1B4332' }}>{g.area}</span>
              </div>
              {g.items.map((c) => {
                const r = results[c.ref] ?? 'pending'
                return (
                  <div key={c.ref} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-xs font-mono font-semibold w-10 flex-shrink-0" style={{ color: '#94A3B8' }}>{c.ref}</span>
                    <p className="text-sm flex-1 min-w-0" style={{ color: '#1E293B' }}>{c.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => setR(c.ref, 'pass')} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                        style={r === 'pass' ? { background: '#059669', color: '#fff' } : { background: '#F1F5F9', color: '#059669' }}>
                        <Check className="w-3 h-3" /> Pass
                      </button>
                      <button onClick={() => setR(c.ref, 'no_pass')} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                        style={r === 'no_pass' ? { background: '#DC2626', color: '#fff' } : { background: '#F1F5F9', color: '#DC2626' }}>
                        <X className="w-3 h-3" /> No Pass
                      </button>
                    </div>
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
