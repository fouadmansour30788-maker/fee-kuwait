// Pure server-rendered SVG charts (no client JS, no dependencies). Each takes
// already-computed numbers and renders labelled, legible marks. Colours follow
// the entity, never rank; single-series charts use direct labels, multi-series
// ship a legend from the caller.

// ── Line / area trend ────────────────────────────────────────────────
export function LineChart({
  labels, series, height = 220,
}: {
  labels: string[]
  series: { name: string; color: string; values: number[] }[]
  height?: number
}) {
  const W = 640, H = height, padL = 34, padR = 44, padT = 16, padB = 28
  const n = labels.length
  const max = Math.max(1, ...series.flatMap((s) => s.values))
  const x = (i: number) => padL + (n <= 1 ? 0 : (i / (n - 1)) * (W - padL - padR))
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB)
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet" role="img">
      {gridVals.map((gv, i) => {
        const gy = y(gv)
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={gy} y2={gy} stroke="#EEF2F6" strokeWidth={1} />
            <text x={padL - 6} y={gy + 3} textAnchor="end" fontSize={9} fill="#94A3B8">{gv}</text>
          </g>
        )
      })}
      {labels.map((lb, i) => (
        <text key={lb + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={9} fill="#94A3B8">{lb}</text>
      ))}
      {series.map((s) => {
        const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
        const area = `${padL},${y(0)} ${pts} ${x(n - 1)},${y(0)}`
        const last = s.values.length - 1
        return (
          <g key={s.name}>
            <polygon points={area} fill={s.color} opacity={0.07} />
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={2.6} fill="#fff" stroke={s.color} strokeWidth={1.6} />)}
            <text x={x(last) + 6} y={y(s.values[last]) + 3} fontSize={10} fontWeight={700} fill={s.color}>{s.values[last]}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Funnel (pipeline stages) ─────────────────────────────────────────
export function Funnel({ stages }: { stages: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...stages.map((s) => s.value))
  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const pct = (s.value / max) * 100
        const prev = i > 0 ? stages[i - 1].value : null
        const conv = prev && prev > 0 ? Math.round((s.value / prev) * 100) : null
        return (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-28 flex-shrink-0 text-right">
              <p className="text-xs font-semibold" style={{ color: '#334155' }}>{s.label}</p>
              {conv !== null && <p className="text-[10px]" style={{ color: '#94A3B8' }}>{conv}% of prev</p>}
            </div>
            <div className="flex-1 flex justify-center">
              <div className="h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold transition-all"
                style={{ width: `${Math.max(pct, 8)}%`, background: s.color, minWidth: 44 }}>
                {s.value}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Radar (per-category comparison) ──────────────────────────────────
export function Radar({
  axes, series, size = 240,
}: {
  axes: string[]
  series: { name: string; color: string; values: number[] }[]
  size?: number
}) {
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 34
  const n = axes.length
  const max = Math.max(1, ...series.flatMap((s) => s.values))
  const ang = (i: number) => (-90 + (i * 360) / n) * (Math.PI / 180)
  const pt = (i: number, r: number) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))]
  const rings = [0.34, 0.67, 1]

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size} preserveAspectRatio="xMidYMid meet" role="img">
      {rings.map((f, ri) => (
        <polygon key={ri} points={axes.map((_, i) => pt(i, maxR * f).join(',')).join(' ')}
          fill="none" stroke="#EEF2F6" strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const [ex, ey] = pt(i, maxR)
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#EEF2F6" strokeWidth={1} />
      })}
      {series.map((s) => {
        const poly = s.values.map((v, i) => pt(i, (v / max) * maxR).join(',')).join(' ')
        return (
          <g key={s.name}>
            <polygon points={poly} fill={s.color} fillOpacity={0.14} stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
            {s.values.map((v, i) => { const [px, py] = pt(i, (v / max) * maxR); return <circle key={i} cx={px} cy={py} r={2.4} fill={s.color} /> })}
          </g>
        )
      })}
      {axes.map((a, i) => {
        const [lx, ly] = pt(i, maxR + 16)
        return <text key={a} x={lx} y={ly + 3} textAnchor="middle" fontSize={9} fontWeight={600} fill="#64748B">{a}</text>
      })}
    </svg>
  )
}

// ── Donut ────────────────────────────────────────────────────────────
export function Donut({
  segments, centerLabel, centerValue, size = 168,
}: {
  segments: { label: string; value: number; color: string }[]
  centerLabel?: string
  centerValue?: string | number
  size?: number
}) {
  const stroke = 20, r = (size - stroke) / 2, cx = size / 2, cy = size / 2
  const C = 2 * Math.PI * r
  const total = Math.max(1, segments.reduce((a, s) => a + s.value, 0))
  let offset = 0

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {segments.map((s) => {
          const len = (s.value / total) * C
          const el = (
            <circle key={s.label} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />
          )
          offset += len
          return el
        })}
      </g>
      {(centerValue !== undefined || centerLabel) && (
        <>
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize={22} fontWeight={800} fill="#0F172A">{centerValue}</text>
          {centerLabel && <text x={cx} y={cy + 15} textAnchor="middle" fontSize={9} fill="#94A3B8">{centerLabel}</text>}
        </>
      )}
    </svg>
  )
}
