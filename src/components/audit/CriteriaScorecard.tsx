'use client'

import { Gauge, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { scorecard, type ChecklistItem } from '@/lib/data/audits'

export default function CriteriaScorecard({ items }: { items: ChecklistItem[] }) {
  const s = scorecard(items)
  const impOk = s.allImperativePass

  const tiles = [
    { label: 'Overall score', value: `${s.scorePct}%`, sub: `${s.pointsEarned}/${s.points} pts`, Icon: Gauge, color: s.scorePct >= 80 ? '#059669' : s.scorePct >= 50 ? '#D97706' : '#DC2626' },
    { label: 'Pass rate', value: `${s.passed}/${s.total}`, sub: `${s.passRatePct}% of graded`, Icon: CheckCircle2, color: '#0891B2' },
    { label: 'Imperative', value: `${s.impPassed}/${s.impTotal}`, sub: impOk ? 'All imperatives pass' : `${s.impFailed} failing`, Icon: ShieldCheck, color: impOk ? '#059669' : '#DC2626' },
    { label: 'Non-conformities', value: `${s.ncCount}`, sub: s.ncCount ? `${s.ncMajor} major · ${s.ncMinor} minor` : 'None', Icon: AlertTriangle, color: s.ncCount ? '#B45309' : '#94A3B8' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiles.map(t => (
        <div key={t.label} className="rounded-xl border p-3.5 bg-white" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <t.Icon className="w-3.5 h-3.5" style={{ color: t.color }} />
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>{t.label}</span>
          </div>
          <p className="text-2xl font-bold tracking-tight" style={{ color: '#0F172A' }}>{t.value}</p>
          <p className="text-[11px] mt-0.5" style={{ color: t.color }}>{t.sub}</p>
        </div>
      ))}
    </div>
  )
}
