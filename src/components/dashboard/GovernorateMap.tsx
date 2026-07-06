'use client'

import { useMemo, useState } from 'react'
import { MapPin, School, Building2, Users } from 'lucide-react'

export interface GovDatum {
  key: string
  label: string
  total: number
  schools: number
  establishments: number
  active: number
}

// Schematic choropleth of Kuwait's six governorates — positioned to mirror the
// real layout (Al Jahra NW, Al Asimah NE on the bay, Hawalli on the east coast,
// Al Farwaniyah west-central, Mubarak Al-Kabeer central, Al Ahmadi across the
// south). Pure SVG: interactive, themeable, no external tiles or dependencies.
const REGIONS = [
  { key: 'jahra',      label: 'Al Jahra',          x: 10,  y: 10,  w: 150, h: 130 },
  { key: 'capital',    label: 'Al Asimah',         x: 170, y: 10,  w: 120, h: 60 },
  { key: 'hawalli',    label: 'Hawalli',           x: 170, y: 80,  w: 120, h: 60 },
  { key: 'farwaniyah', label: 'Al Farwaniyah',     x: 10,  y: 150, w: 110, h: 110 },
  { key: 'mubarak',    label: 'Mubarak Al-Kabeer', x: 130, y: 150, w: 160, h: 110 },
  { key: 'ahmadi',     label: 'Al Ahmadi',         x: 10,  y: 270, w: 280, h: 60 },
] as const

type Metric = 'total' | 'schools' | 'establishments'
const METRICS: { key: Metric; label: string }[] = [
  { key: 'total', label: 'All members' },
  { key: 'schools', label: 'Schools' },
  { key: 'establishments', label: 'Establishments' },
]

const EMPTY = '#F1F5F9'
function hex(n: number) { return n.toString(16).padStart(2, '0') }
function lerp(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((c, i) => hex(Math.round(c + (pb[i] - c) * t))).join('')
}

export default function GovernorateMap({ data, other }: { data: GovDatum[]; other?: GovDatum }) {
  const [metric, setMetric] = useState<Metric>('total')
  const [selected, setSelected] = useState<string | null>(null)
  const byKey = useMemo(() => Object.fromEntries(data.map((d) => [d.key, d])), [data])

  const metricVal = (d?: GovDatum) => (d ? d[metric] : 0)
  const max = Math.max(1, ...data.map((d) => metricVal(d)))

  const fillFor = (key: string) => {
    const v = metricVal(byKey[key])
    if (!v) return EMPTY
    return lerp('#D3EFE0', '#1B4332', v / max)
  }
  const textDark = (key: string) => {
    const v = metricVal(byKey[key])
    return !v || v / max < 0.52
  }

  const scope = selected ? byKey[selected] : null
  const totals = useMemo(() => data.reduce((acc, d) => ({
    total: acc.total + d.total, schools: acc.schools + d.schools,
    establishments: acc.establishments + d.establishments, active: acc.active + d.active,
  }), { total: 0, schools: 0, establishments: 0, active: 0 }), [data])
  const shown = scope ?? { label: 'All Kuwait', ...totals }

  const figures = [
    { label: 'Members', value: shown.total, Icon: Users, color: '#7C3AED' },
    { label: 'Schools', value: shown.schools, Icon: School, color: '#2563EB' },
    { label: 'Establishments', value: shown.establishments, Icon: Building2, color: '#0891B2' },
    { label: 'Active', value: shown.active, Icon: MapPin, color: '#059669' },
  ]

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Map */}
      <div className="lg:col-span-3">
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {METRICS.map((m) => (
            <button key={m.key} onClick={() => setMetric(m.key)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
              style={metric === m.key ? { background: '#1B4332', color: '#fff' } : { background: '#F1F5F9', color: '#475569' }}>
              {m.label}
            </button>
          ))}
        </div>

        <svg viewBox="0 0 300 340" width="100%" height={300} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Kuwait governorates map">
          {/* Arabian Gulf accent */}
          <rect x={293} y={10} width={7} height={250} rx={3} fill="#DBEAFE" />
          {REGIONS.map((r) => {
            const d = byKey[r.key]
            const val = metricVal(d)
            const isSel = selected === r.key
            const dark = textDark(r.key)
            return (
              <g key={r.key} onClick={() => setSelected(isSel ? null : r.key)} style={{ cursor: 'pointer' }}>
                <title>{r.label}: {val}</title>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={7}
                  fill={fillFor(r.key)} stroke={isSel ? '#0F172A' : '#ffffff'} strokeWidth={isSel ? 3 : 3} />
                <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 3} textAnchor="middle" fontSize={9} fontWeight={600}
                  fill={dark ? '#334155' : '#EAF7F0'} pointerEvents="none">{r.label}</text>
                <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 13} textAnchor="middle" fontSize={14} fontWeight={800}
                  fill={dark ? '#0F172A' : '#ffffff'} pointerEvents="none">{val}</text>
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px]" style={{ color: '#94A3B8' }}>Fewer</span>
          <div className="flex-1 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #EFF6F2, #D3EFE0, #1B4332)' }} />
          <span className="text-[10px]" style={{ color: '#94A3B8' }}>More</span>
        </div>
        {other && other.total > 0 && (
          <p className="text-[11px] mt-2" style={{ color: '#94A3B8' }}>
            + {other.total} member{other.total === 1 ? '' : 's'} with an unspecified / other governorate.
          </p>
        )}
      </div>

      {/* Figures panel */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: '#0891B2' }} />
            <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{shown.label}</p>
          </div>
          {selected && (
            <button onClick={() => setSelected(null)} className="text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: '#F1F5F9', color: '#475569' }}>
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {figures.map((f) => (
            <div key={f.label} className="rounded-xl border p-3" style={{ borderColor: '#E2E8F0' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: `${f.color}14` }}>
                <f.Icon className="w-3.5 h-3.5" style={{ color: f.color }} />
              </div>
              <p className="text-xl font-bold" style={{ color: '#0F172A' }}>{f.value}</p>
              <p className="text-[11px]" style={{ color: '#64748B' }}>{f.label}</p>
            </div>
          ))}
        </div>

        {/* Region list = legend + filter */}
        <div className="space-y-1">
          {data.map((d) => {
            const isSel = selected === d.key
            return (
              <button key={d.key} onClick={() => setSelected(isSel ? null : d.key)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors text-left"
                style={{ background: isSel ? '#ECFDF3' : 'transparent' }}>
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: metricVal(d) ? lerp('#D3EFE0', '#1B4332', metricVal(d) / max) : EMPTY }} />
                <span className="text-xs flex-1 truncate" style={{ color: '#334155' }}>{d.label}</span>
                <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{metricVal(d)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
