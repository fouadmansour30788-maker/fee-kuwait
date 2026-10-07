'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { GREEN_FLAG_MAX, GREEN_FLAG_PASS } from '@/lib/data/greenFlagScorecard'

export interface ResultSection { step: string; title: string; got: number; max: number }

// Mark tokens (one series → one hue; threshold is a neutral reference).
const C = {
  fill: '#40916C', fillSoft: 'rgba(64,145,108,0.18)', track: '#E8EEF1', grid: '#E2E8F0',
  ref: '#475569', ink: '#0F172A', ink2: '#475569', muted: '#94A3B8',
}
const PASS_RATIO = GREEN_FLAG_PASS / GREEN_FLAG_MAX // 0.8

// Green Flag results — total vs the 800-point eligibility score, plus donut,
// per-step bars and a radar. Replaces the imperative/guideline panel for
// Eco-Schools (educational institutions).
export default function GreenFlagResults({ sections, total, scored, scoredAt }: {
  sections: ResultSection[]
  total: number
  scored: boolean
  scoredAt: string | null
}) {
  const [hover, setHover] = useState<string | null>(null)
  const ready = total > GREEN_FLAG_PASS
  const gap = Math.max(GREEN_FLAG_PASS + 1 - total, 0)

  if (!scored) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B' }}>
        <Clock className="w-4 h-4" /> No Green Flag score yet. The National Operator scores each step once all seven steps are Ready. Eligibility: over {GREEN_FLAG_PASS} / {GREEN_FLAG_MAX} points.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Headline + status (icon + label, never colour alone) */}
      <div className="flex items-center gap-3 flex-wrap rounded-xl px-4 py-3"
        style={ready ? { background: '#ECFDF3', border: '1px solid #A7F3D0' } : { background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        {ready ? <CheckCircle2 className="w-5 h-5" style={{ color: '#047857' }} /> : <AlertTriangle className="w-5 h-5" style={{ color: '#B45309' }} />}
        <p className="text-sm font-semibold flex-1" style={{ color: ready ? '#065F46' : '#92400E' }}>
          {ready ? 'Eligible — ready to be assessed for the Eco-Schools Green Flag.' : `Not yet eligible — ${gap} more point${gap === 1 ? '' : 's'} needed to pass ${GREEN_FLAG_PASS}.`}
        </p>
        <span className="text-sm" style={{ color: C.ink2 }}><b style={{ color: C.ink }}>{total}</b> / {GREEN_FLAG_MAX} pts · eligibility &gt; {GREEN_FLAG_PASS}</span>
        {scoredAt && <span className="text-[11px]" style={{ color: C.muted }}>Scored {new Date(scoredAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait' })}</span>}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Total score" subtitle={`vs eligibility (${GREEN_FLAG_PASS})`}>
          <Donut total={total} />
        </ChartCard>
        <ChartCard title="Score by step" subtitle="points vs step maximum">
          <Bars sections={sections} hover={hover} setHover={setHover} />
        </ChartCard>
        <ChartCard title="Profile across the seven steps" subtitle={`% of each step's maximum · dashed = ${Math.round(PASS_RATIO * 100)}%`}>
          <Radar sections={sections} hover={hover} setHover={setHover} />
        </ChartCard>
      </div>

      {/* Table view (accessible alternative to the charts) */}
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E2E8F0' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F8FAFC', color: C.muted }}>
              {['Step', 'Section', 'Score', 'Max', '% of max'].map((h) => <th key={h} className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => (
              <tr key={s.step} onMouseEnter={() => setHover(s.step)} onMouseLeave={() => setHover(null)}
                style={{ borderTop: '1px solid #F1F5F9', background: hover === s.step ? '#F4F9F5' : undefined }}>
                <td className="px-3 py-2 font-mono text-xs" style={{ color: C.muted }}>{s.step}</td>
                <td className="px-3 py-2" style={{ color: C.ink }}>{s.title}</td>
                <td className="px-3 py-2 font-semibold" style={{ color: C.ink }}>{s.got}</td>
                <td className="px-3 py-2" style={{ color: C.ink2 }}>{s.max}</td>
                <td className="px-3 py-2" style={{ color: C.ink2 }}>{Math.round((s.got / s.max) * 100)}%</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid #E2E8F0' }}>
              <td />
              <td className="px-3 py-2 font-bold" style={{ color: C.ink }}>Total</td>
              <td className="px-3 py-2 font-bold" style={{ color: C.ink }}>{total}</td>
              <td className="px-3 py-2" style={{ color: C.ink2 }}>{GREEN_FLAG_MAX}</td>
              <td className="px-3 py-2" style={{ color: C.ink2 }}>{Math.round((total / GREEN_FLAG_MAX) * 100)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4 min-w-0" style={{ borderColor: '#E2E8F0' }}>
      <p className="text-sm font-bold" style={{ color: C.ink }}>{title}</p>
      <p className="text-[11px] mb-3" style={{ color: C.muted }}>{subtitle}</p>
      {children}
    </div>
  )
}

// ── Donut: total / 1000 with a tick at the 800 eligibility mark ─────
function Donut({ total }: { total: number }) {
  const [tip, setTip] = useState(false)
  const size = 180, r = 66, sw = 16, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const frac = Math.min(total / GREEN_FLAG_MAX, 1)
  const ang = (PASS_RATIO * 360 - 90) * (Math.PI / 180)
  const tick = (rad: number) => [cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)]
  const [x1, y1] = tick(r - sw / 2 - 4), [x2, y2] = tick(r + sw / 2 + 4)
  const [lx, ly] = tick(r + sw / 2 + 16)
  return (
    <div className="relative flex justify-center" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px]" role="img" aria-label={`Total ${total} of ${GREEN_FLAG_MAX} points; eligibility above ${GREEN_FLAG_PASS}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.track} strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.fill} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${Math.max(frac * circ - 0.01, 0)} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ref} strokeWidth={2} />
        <text x={lx} y={ly} fontSize="9" fill={C.ref} textAnchor="middle" dominantBaseline="middle">{GREEN_FLAG_PASS}</text>
        <text x={cx} y={cy - 4} fontSize="28" fontWeight="700" fill={C.ink} textAnchor="middle">{total}</text>
        <text x={cx} y={cy + 16} fontSize="10" fill={C.muted} textAnchor="middle">of {GREEN_FLAG_MAX} pts</text>
      </svg>
      {tip && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] px-2 py-1 rounded-md shadow pointer-events-none whitespace-nowrap" style={{ background: C.ink, color: '#fff' }}>
          {total} / {GREEN_FLAG_MAX} · {Math.round(frac * 100)}% · eligibility &gt; {GREEN_FLAG_PASS}
        </div>
      )}
    </div>
  )
}

// ── Horizontal bars: each step's points against its own maximum ────
function Bars({ sections, hover, setHover }: { sections: ResultSection[]; hover: string | null; setHover: (s: string | null) => void }) {
  return (
    <div className="space-y-2.5">
      {sections.map((s) => {
        const pct = s.max ? s.got / s.max : 0
        const on = hover === s.step
        return (
          <div key={s.step} onMouseEnter={() => setHover(s.step)} onMouseLeave={() => setHover(null)} className="cursor-default">
            <div className="flex items-baseline justify-between gap-2 text-[11px] mb-1">
              <span className="truncate" style={{ color: on ? C.ink : C.ink2, fontWeight: on ? 700 : 500 }}>{s.step}. {s.title}</span>
              <span className="whitespace-nowrap" style={{ color: C.ink2 }}><b style={{ color: C.ink }}>{s.got}</b> / {s.max}</span>
            </div>
            <div className="relative h-2.5 rounded-full" style={{ background: C.track }}>
              <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${pct * 100}%`, background: C.fill, opacity: hover && !on ? 0.45 : 1 }} />
              {/* 80% reference tick */}
              <div className="absolute -top-0.5 -bottom-0.5 w-0.5" style={{ left: `${PASS_RATIO * 100}%`, background: C.ref, opacity: 0.6 }} />
            </div>
          </div>
        )
      })}
      <p className="text-[10px] pt-1" style={{ color: C.muted }}>Tick = 80% of each step&apos;s maximum.</p>
    </div>
  )
}

// ── Radar: % of each step's maximum, with the 80% reference ring ────
function Radar({ sections, hover, setHover }: { sections: ResultSection[]; hover: string | null; setHover: (s: string | null) => void }) {
  const size = 240, cx = size / 2, cy = size / 2 + 4, R = 82
  const n = sections.length
  const pt = (i: number, f: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    return [cx + R * f * Math.cos(a), cy + R * f * Math.sin(a)] as const
  }
  const poly = (f: (i: number) => number) => sections.map((_, i) => pt(i, f(i)).join(',')).join(' ')
  const hs = sections.find((s) => s.step === hover)
  return (
    <div className="relative flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[260px]" role="img" aria-label="Radar of each step's score as a percentage of its maximum">
        {[0.25, 0.5, 0.75, 1].map((f) => <polygon key={f} points={poly(() => f)} fill="none" stroke={C.grid} strokeWidth={1} />)}
        {sections.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.grid} strokeWidth={1} /> })}
        <polygon points={poly(() => PASS_RATIO)} fill="none" stroke={C.ref} strokeWidth={1.5} strokeDasharray="4 3" />
        <polygon points={poly((i) => (sections[i].max ? sections[i].got / sections[i].max : 0))} fill={C.fillSoft} stroke={C.fill} strokeWidth={2} strokeLinejoin="round" />
        {sections.map((s, i) => {
          const f = s.max ? s.got / s.max : 0
          const [x, y] = pt(i, f)
          const [lx, ly] = pt(i, 1.2)
          const on = hover === s.step
          return (
            <g key={s.step} onMouseEnter={() => setHover(s.step)} onMouseLeave={() => setHover(null)} style={{ cursor: 'default' }}>
              <circle cx={x} cy={y} r={12} fill="transparent" />
              <circle cx={x} cy={y} r={on ? 5.5 : 4} fill={C.fill} stroke="#fff" strokeWidth={2} />
              <text x={lx} y={ly} fontSize="10" fontWeight={on ? 700 : 500} fill={on ? C.ink : C.ink2} textAnchor="middle" dominantBaseline="middle">{s.step}</text>
            </g>
          )
        })}
      </svg>
      {hs && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[11px] px-2 py-1 rounded-md shadow pointer-events-none whitespace-nowrap" style={{ background: C.ink, color: '#fff' }}>
          Step {hs.step} · {hs.title}: {hs.got} / {hs.max} ({Math.round((hs.got / hs.max) * 100)}%)
        </div>
      )}
    </div>
  )
}
