'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

const AREAS = [
  { key: 'mgmt', label: 'Sustainable management', hint: 'Green Key representative, policy, targets & action plan' },
  { key: 'guest', label: 'Guest awareness', hint: 'Guests informed and involved in sustainability' },
  { key: 'water', label: 'Water', hint: 'Metering, efficient fittings, leak checks' },
  { key: 'energy', label: 'Energy & carbon', hint: 'Monitoring, efficient lighting/HVAC, renewables' },
  { key: 'waste', label: 'Waste', hint: 'Separation, reduction, recycling' },
  { key: 'procure', label: 'Procurement', hint: 'Eco-labelled products, local & sustainable sourcing' },
  { key: 'env', label: 'Living environment', hint: 'Indoor air quality, green spaces, biodiversity' },
]
const OPTS = [
  { v: 0, label: 'Not yet', color: '#DC2626' },
  { v: 50, label: 'In progress', color: '#D97706' },
  { v: 100, label: 'In place', color: '#059669' },
]

export default function ReadinessSelfCheck() {
  const [s, setS] = useState<Record<string, number>>({})
  const answered = AREAS.filter((a) => s[a.key] !== undefined).length
  const score = Math.round(AREAS.reduce((acc, a) => acc + (s[a.key] ?? 0), 0) / AREAS.length)
  const verdict = score >= 80 ? { t: 'Strong — likely ready to apply', c: '#059669', Icon: CheckCircle2 }
    : score >= 50 ? { t: 'Getting there — close some gaps first', c: '#D97706', Icon: Loader2 }
      : { t: 'Early stage — build the foundations', c: '#DC2626', Icon: Circle }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-xl border p-4" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-16 h-16">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={verdict.c} strokeWidth="3" strokeDasharray={`${score} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: '#0F172A' }}>{score}%</span>
        </div>
        <div>
          <p className="text-sm font-bold flex items-center gap-1.5" style={{ color: verdict.c }}><verdict.Icon className="w-4 h-4" /> {verdict.t}</p>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{answered}/{AREAS.length} areas assessed · your self-estimated readiness</p>
        </div>
      </div>

      <div className="space-y-2">
        {AREAS.map((a) => (
          <div key={a.key} className="rounded-xl border p-3" style={{ borderColor: '#EEF5F0' }}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{a.label}</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{a.hint}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {OPTS.map((o) => (
                  <button key={o.v} onClick={() => setS((prev) => ({ ...prev, [a.key]: o.v }))}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                    style={s[a.key] === o.v ? { background: o.color, color: '#fff' } : { background: '#F1F5F9', color: o.color }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px]" style={{ color: '#94A3B8' }}>This is a self-estimate to help you prepare — it isn&apos;t the official assessment.</p>
    </div>
  )
}
