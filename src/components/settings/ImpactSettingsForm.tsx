'use client'

import { useState, useTransition } from 'react'
import { TrendingUp, Save, Loader2, Check, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { saveImpactSettings } from '@/lib/actions/siteContent'
import type { ImpactSettings, ImpactStat, GrowthPoint } from '@/lib/impact'

const field = { border: '1px solid #E2E8F0', color: '#1E293B' } as const
const inp = 'text-sm px-3 py-2 rounded-lg outline-none'

export default function ImpactSettingsForm({ impact }: { impact: ImpactSettings }) {
  const [heroStats, setHeroStats] = useState<ImpactStat[]>(impact.heroStats)
  const [growth, setGrowth] = useState<GrowthPoint[]>(impact.growth)
  const [countries, setCountries] = useState(impact.countries)
  const [memberOrgs, setMemberOrgs] = useState(impact.memberOrgs)
  const [established, setEstablished] = useState(impact.established)
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null)

  const setStat = (i: number, p: Partial<ImpactStat>) => setHeroStats((s) => s.map((x, idx) => (idx === i ? { ...x, ...p } : x)))
  const setGrowthAt = (i: number, p: Partial<GrowthPoint>) => setGrowth((g) => g.map((x, idx) => (idx === i ? { ...x, ...p } : x)))

  function save() {
    setMsg(null)
    start(async () => {
      const r = await saveImpactSettings({
        heroStats: heroStats.map((s) => ({ target: Number(s.target) || 0, suffix: s.suffix, label_en: s.label_en, label_ar: s.label_ar })),
        growth: growth.map((g) => ({ year: Number(g.year) || 0, certified: Number(g.certified) || 0 })).sort((a, b) => a.year - b.year),
        countries, memberOrgs, established,
      })
      setMsg(r.error ? { text: r.error } : { ok: true, text: 'Impact page saved.' })
    })
  }

  return (
    <div className="bg-white rounded-2xl border p-6 space-y-5" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4" style={{ color: '#40916C' }} />
        <h2 className="text-base font-bold flex-1" style={{ color: '#0F172A' }}>Impact page</h2>
        <button onClick={save} disabled={pending} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
        </button>
      </div>

      {/* Hero counters */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#64748B' }}>Headline counters (4)</p>
        <div className="space-y-2">
          {heroStats.map((s, i) => (
            <div key={i} className="grid grid-cols-[80px_60px_1fr_1fr] gap-2">
              <input type="number" value={s.target} onChange={(e) => setStat(i, { target: Number(e.target.value) })} placeholder="Number" className={inp} style={field} />
              <input value={s.suffix} onChange={(e) => setStat(i, { suffix: e.target.value })} placeholder="+" className={inp} style={field} />
              <input value={s.label_en} onChange={(e) => setStat(i, { label_en: e.target.value })} placeholder="Label (EN)" className={inp} style={field} />
              <input value={s.label_ar} onChange={(e) => setStat(i, { label_ar: e.target.value })} dir="rtl" placeholder="التسمية" className={inp} style={field} />
            </div>
          ))}
        </div>
      </div>

      {/* Growth chart */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wide flex-1" style={{ color: '#64748B' }}>Growth chart — year → certified</p>
          <button onClick={() => setGrowth((g) => [...g, { year: (g[g.length - 1]?.year ?? 2025) + 1, certified: 0 }])} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#F1F5F9', color: '#334155' }}><Plus className="w-3.5 h-3.5" /> Add year</button>
        </div>
        <div className="space-y-2">
          {growth.map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="number" value={g.year} onChange={(e) => setGrowthAt(i, { year: Number(e.target.value) })} placeholder="Year" className={`${inp} w-28`} style={field} />
              <input type="number" value={g.certified} onChange={(e) => setGrowthAt(i, { certified: Number(e.target.value) })} placeholder="Certified" className={`${inp} w-32`} style={field} />
              <button onClick={() => setGrowth((arr) => arr.filter((_, idx) => idx !== i))} className="p-1.5 rounded-lg" style={{ color: '#DC2626' }} title="Remove"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Global-context tiles */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#64748B' }}>Global context tiles</p>
        <div className="grid sm:grid-cols-3 gap-2">
          <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Countries</label><input value={countries} onChange={(e) => setCountries(e.target.value)} className={`${inp} w-full`} style={field} /></div>
          <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Member orgs</label><input value={memberOrgs} onChange={(e) => setMemberOrgs(e.target.value)} className={`${inp} w-full`} style={field} /></div>
          <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Established</label><input value={established} onChange={(e) => setEstablished(e.target.value)} className={`${inp} w-full`} style={field} /></div>
        </div>
      </div>

      {msg && <p className="flex items-center gap-1.5 text-sm" style={{ color: msg.ok ? '#047857' : '#DC2626' }}>{msg.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}</p>}
    </div>
  )
}
