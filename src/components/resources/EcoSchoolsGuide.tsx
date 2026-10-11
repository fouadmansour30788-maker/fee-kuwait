'use client'

import { useState } from 'react'
import { Footprints, Palette, Trophy, ChevronDown } from 'lucide-react'
import { ES_CRITERIA, ES_THEMES } from '@/lib/data/ecoSchoolsCriteria'
import { GREEN_FLAG_SECTIONS, GREEN_FLAG_MAX, GREEN_FLAG_PASS } from '@/lib/data/greenFlagScorecard'
import { STEP_STYLE } from '@/lib/ecoStepStyle'
import { darken } from '@/lib/utils/color'
import { ThemeTile } from '@/components/audit/EcoThemesPicker'

function Card({ Icon, color, title, subtitle, children }: { Icon: typeof Trophy; color: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5" style={{ color }} />
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>{title}</h2>
      </div>
      <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>{subtitle}</p>
      {children}
    </div>
  )
}

// Eco-Schools resources for schools: the Seven Steps, the 13 themes and how the
// Green Flag readiness score works.
export default function EcoSchoolsGuide() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <Card Icon={Footprints} color="#E08A2E" title="The Seven Steps" subtitle="The Eco-Schools framework every school follows to earn the Green Flag — tap a step to read what it involves.">
        <div className="grid sm:grid-cols-2 gap-3">
          {ES_CRITERIA.map((s) => {
            const st = STEP_STYLE[s.id]
            const strong = darken(st.color, 0.36)
            const isOpen = open === s.id
            const [lead, ...rest] = s.note.split('\n\n')
            return (
              <button key={s.id} type="button" onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen}
                className={`text-start rounded-2xl p-4 transition-all ${isOpen ? 'sm:col-span-2' : ''}`}
                style={{ background: `${st.color}12`, border: `1.5px solid ${isOpen ? st.color : `${st.color}40`}`, borderLeft: `6px solid ${st.color}` }}>
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: st.color }}>
                    <st.Icon className="w-5 h-5 text-white" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[11px] font-extrabold uppercase tracking-wider" style={{ color: strong }}>Step {s.id}</span>
                    <span className="block text-base font-bold" style={{ color: '#14342A' }}>{s.title}</span>
                    <span className="block text-xs" dir="rtl" style={{ color: '#64748B' }}>{s.title_ar}</span>
                  </span>
                  <ChevronDown className="w-5 h-5 flex-shrink-0 transition-transform" style={{ color: strong, transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                </div>
                {isOpen && (
                  <div className="mt-3 space-y-2 text-sm leading-relaxed" style={{ color: '#334155' }}>
                    <p className="font-semibold" style={{ color: strong }}>{lead}</p>
                    {rest.join('\n\n').split('\n').map((line, k) => <p key={k}>{line}</p>)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      <Card Icon={Palette} color="#2D9A5A" title="The 13 Eco-Schools themes" subtitle="Your Eco-Committee picks the themes to work on (at least 2) as part of Step 2.">
        {(['main', 'cross'] as const).map((kind) => (
          <div key={kind} className="mb-4 last:mb-0">
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#475569' }}>{kind === 'main' ? 'Main themes' : 'Cross-cutting themes'}</p>
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }}>
              {ES_THEMES.filter((t) => t.kind === kind).map((t) => <ThemeTile key={t.en} t={t} on />)}
            </div>
          </div>
        ))}
      </Card>

      <Card Icon={Trophy} color="#B08D2E" title="Is your school Green Flag ready?" subtitle={`The Green Flag questions under each step add up to ${GREEN_FLAG_MAX} points — over ${GREEN_FLAG_PASS} means you're ready to be assessed.`}>
        <div className="space-y-2.5">
          {GREEN_FLAG_SECTIONS.map((sec) => {
            const st = STEP_STYLE[sec.step]
            return (
              <div key={sec.id} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: st.color }}>
                  <st.Icon className="w-4 h-4 text-white" />
                </span>
                <span className="w-44 text-sm font-semibold truncate" style={{ color: '#14342A' }}>{sec.title}</span>
                <span className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                  <span className="block h-full rounded-full" style={{ width: `${(sec.max / 200) * 100}%`, background: st.color }} />
                </span>
                <span className="w-16 text-end text-sm font-bold tabular-nums" style={{ color: darken(st.color, 0.36) }}>{sec.max} pts</span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 rounded-xl px-4 py-3 text-sm flex items-center gap-2 flex-wrap" style={{ background: '#ECFDF3', color: '#065F46' }}>
          <Trophy className="w-4 h-4" /> Total <strong>{GREEN_FLAG_MAX} points</strong> · over <strong>{GREEN_FLAG_PASS}</strong> = ready for the Green Flag assessment. You answer these questions on your application board.
        </div>
      </Card>
    </div>
  )
}
