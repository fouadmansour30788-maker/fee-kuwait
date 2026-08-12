// Shared, server-rendered dashboard building blocks (no client JS). Used by the
// establishment, auditor and CB dashboards so they read as one system.
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'

// ── KPI tile ──────────────────────────────────────────────────────────
export function Kpi({ label, value, Icon, color, hint }: {
  label: string; value: string | number; Icon: LucideIcon; color: string; hint?: string
}) {
  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}14` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: '#0F172A' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{label}</p>
      {hint && <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>{hint}</p>}
    </div>
  )
}

// ── Section card ──────────────────────────────────────────────────────
export function Card({ title, sub, right, children }: {
  title: string; sub?: string; right?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>{title}</h2>
          {sub && <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{sub}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}

// ── Horizontal labelled bars (magnitude by category) ──────────────────
export function StatBars({ rows, empty = 'Nothing to show yet.' }: {
  rows: { label: string; count: number; color: string }[]; empty?: string
}) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  if (rows.length === 0) return <p className="text-sm" style={{ color: '#94A3B8' }}>{empty}</p>
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: '#334155' }}>{r.label}</span>
            <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{r.count}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.round((r.count / max) * 100)}%`, background: r.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Insights & recommendations ────────────────────────────────────────
export type Tone = 'good' | 'warn' | 'info'
const TONE: Record<Tone, { color: string; bg: string; Icon: LucideIcon }> = {
  good: { color: '#059669', bg: '#ECFDF3', Icon: CheckCircle2 },
  warn: { color: '#B45309', bg: '#FEF9EC', Icon: AlertTriangle },
  info: { color: '#2563EB', bg: '#EFF6FF', Icon: Info },
}
export function Insights({ items }: { items: { tone: Tone; title: string; text: string }[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {items.map((ins, i) => {
        const m = TONE[ins.tone]
        return (
          <div key={i} className="flex items-start gap-3 rounded-xl p-3.5" style={{ background: m.bg }}>
            <m.Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: m.color }} />
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{ins.title}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#475569' }}>{ins.text}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Monthly buckets over the trailing n months (Kuwait calendar) ──────
export interface MonthBucket { key: string; label: string; count: number }
export function lastMonths(n: number): MonthBucket[] {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1) + i, 1)
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', month: 'short' }), count: 0 }
  })
}
export function tallyByMonth(buckets: MonthBucket[], dates: (string | null | undefined)[]) {
  for (const ds of dates) {
    if (!ds) continue
    const d = new Date(ds)
    const b = buckets.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (b) b.count++
  }
  return buckets
}

// ── Programme meta (colour follows the programme, never rank) ──────────
export const PROGRAMME_COLOR: Record<string, string> = {
  'eco-schools': '#2563EB', 'blue-flag': '#0891B2', 'green-key': '#00A95D',
  'leaf': '#16A34A', 'yre': '#7C3AED', 'eco-campus': '#DB2777',
}
