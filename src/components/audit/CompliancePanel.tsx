'use client'

import { useState } from 'react'
import { ShieldCheck, ListChecks, BookOpen, CheckCircle2, AlertTriangle } from 'lucide-react'
import { GUIDELINE_CYCLE } from '@/lib/data/greenKeyCriteria'
import type { CriterionRef } from '@/lib/criteria'
import type { CriterionAssessment } from '@/lib/db/assessments'

// Certification requirement, computed automatically from the programme's criteria:
// 100% of imperative criteria + a growing share of guideline criteria depending on
// how long the certificate has been held (GUIDELINE_CYCLE). When audit results are
// available it also shows current progress and whether the requirement is met.
export default function CompliancePanel({
  criteria, assessments, showProgress = false,
}: {
  criteria: CriterionRef[]
  assessments: Record<string, CriterionAssessment>
  showProgress?: boolean
}) {
  const [idx, setIdx] = useState(0)
  if (criteria.length === 0) return null

  // Effective result per criterion: prefer the auditor's final result, then the
  // operator's review, then the establishment's self-assessment — so progress is
  // calculated automatically from whatever results are recorded so far.
  const effective = (ref: string) => {
    const a = assessments[ref]
    if (!a) return 'pending'
    if (a.external !== 'pending') return a.external
    if (a.internal !== 'pending') return a.internal
    if (a.applicantStatus === 'complete') return 'pass'
    return a.applicantResult ?? 'pending'
  }
  // A criterion confirmed Not Applicable (operator/auditor 'na') drops out of the
  // requirement entirely — excluded from both the count and the pass tally.
  const isNA = (ref: string) => effective(ref) === 'na'
  const impRefs = criteria.filter((c) => !!c.type && c.type.includes('I') && !isNA(c.ref))
  const guideRefs = criteria.filter((c) => c.type === 'G' && !isNA(c.ref))
  const imperative = impRefs.length
  const guideline = guideRefs.length
  const passed = (ref: string) => effective(ref) === 'pass'
  const impPassed = impRefs.filter((c) => passed(c.ref)).length
  const guidePassed = guideRefs.filter((c) => passed(c.ref)).length

  const cyc = GUIDELINE_CYCLE[idx]
  const reqGuide = Math.ceil((guideline * cyc.guideline) / 100)
  const reqTotal = imperative + reqGuide
  const impOk = impPassed >= imperative
  const guideOk = guidePassed >= reqGuide
  const meets = impOk && guideOk

  const tiles = [
    { label: 'Applicable', value: criteria.length, Icon: ListChecks, color: '#40916C' },
    { label: 'Imperative', value: imperative, Icon: ShieldCheck, color: '#1B4332' },
    { label: 'Guideline', value: guideline, Icon: BookOpen, color: '#C8A951' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border p-3 text-center" style={{ borderColor: '#E2E8F0' }}>
            <t.Icon className="w-4 h-4 mx-auto mb-1" style={{ color: t.color }} />
            <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{t.value}</p>
            <p className="text-[11px]" style={{ color: '#94A3B8' }}>{t.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap rounded-xl border p-3" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
        <label className="text-xs font-semibold" style={{ color: '#475569' }}>Certification period</label>
        <select value={idx} onChange={(e) => setIdx(Number(e.target.value))} className="text-sm px-3 py-1.5 rounded-lg bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
          {GUIDELINE_CYCLE.map((r, i) => <option key={r.period} value={i}>{r.period} ({r.years} yrs)</option>)}
        </select>
        <span className="text-sm ml-auto" style={{ color: '#334155' }}>
          Required now: <strong>{imperative}</strong> imperative + <strong>{reqGuide}</strong> guideline = <strong>{reqTotal}</strong>
        </span>
      </div>

      {showProgress && (
        <div className="flex items-center gap-3 flex-wrap rounded-xl px-4 py-3 text-sm" style={meets ? { background: '#ECFDF3', border: '1px solid #A7F3D0' } : { background: '#FEF9EC', border: '1px solid #FDE68A' }}>
          {meets ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#047857' }} /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#B45309' }} />}
          <span style={{ color: meets ? '#047857' : '#854D0E', fontWeight: 600 }}>{meets ? 'Meets the requirement for this period.' : 'Requirement not yet met.'}</span>
          <span className="ml-auto" style={{ color: impOk ? '#059669' : '#B91C1C' }}>Imperative {impPassed}/{imperative}</span>
          <span style={{ color: guideOk ? '#059669' : '#B45309' }}>Guideline {guidePassed}/{reqGuide}</span>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <p className="text-xs px-4 py-2.5" style={{ color: '#64748B', background: '#F8FAFC' }}>
          100% of imperative criteria are always required, plus a growing share of guideline criteria by how long the certificate has been held.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: '#94A3B8', background: '#F8FAFC' }}>
                {['Period', 'Years', 'Imperative', 'Guideline', 'Req. now'].map((h) => (
                  <th key={h} className="text-left px-4 py-2 font-semibold text-[11px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GUIDELINE_CYCLE.map((r, i) => (
                <tr key={r.period} className="border-t" style={{ borderColor: '#F1F5F9', background: i === idx ? '#F0FDF4' : undefined }}>
                  <td className="px-4 py-2 font-medium whitespace-nowrap" style={{ color: '#1B4332' }}>{r.period}</td>
                  <td className="px-4 py-2" style={{ color: '#64748B' }}>{r.years}</td>
                  <td className="px-4 py-2" style={{ color: '#1B4332' }}>{r.imperative}%</td>
                  <td className="px-4 py-2" style={{ color: '#8a6d1f' }}>{r.guideline}%</td>
                  <td className="px-4 py-2 font-semibold" style={{ color: '#0F172A' }}>{imperative} + {Math.ceil((guideline * r.guideline) / 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
