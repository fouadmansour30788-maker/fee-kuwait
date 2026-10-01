'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Save } from 'lucide-react'
import { ES_THEMES } from '@/lib/data/ecoSchoolsCriteria'
import { setEcoThemes } from '@/lib/actions/ecoThemes'

// Step 2 — the Eco-Schools themes the school is working on. Editable by the
// school (while its application is open) and the operator; read-only otherwise.
export default function EcoThemesPicker({ applicationId, selected, editable }: { applicationId: string; selected: string[]; editable: boolean }) {
  const [picked, setPicked] = useState<string[]>(selected)
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()
  const dirty = picked.slice().sort().join('|') !== selected.slice().sort().join('|')

  const toggle = (t: string) => { setMsg(null); setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t])) }
  function save() {
    start(async () => {
      const r = await setEcoThemes(applicationId, picked)
      if (r.error) setMsg({ text: r.error })
      else { setMsg({ ok: true, text: 'Themes saved.' }); router.refresh() }
    })
  }

  const chip = (t: string) => {
    const on = picked.includes(t)
    return editable ? (
      <button key={t} type="button" onClick={() => toggle(t)} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
        style={on ? { background: '#40916C', color: '#fff' } : { background: '#F4F9F5', color: '#40916C', border: '1px solid #C8E6D0' }}>
        {on && <Check className="w-2.5 h-2.5" />} {t}
      </button>
    ) : on ? (
      <span key={t} className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: '#ECFDF3', color: '#065F46', border: '1px solid #A7F3D0' }}>{t}</span>
    ) : null
  }

  return (
    <div className="mt-2 rounded-lg p-2 space-y-1.5" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#64748B' }}>
        Themes the school works on {editable && <span className="font-medium normal-case" style={{ color: '#94A3B8' }}>— select all that apply</span>}
      </p>
      {(['main', 'cross'] as const).map((kind) => {
        const items = ES_THEMES.filter((t) => t.kind === kind).map((t) => chip(t.en)).filter(Boolean)
        if (!items.length) return null
        return (
          <div key={kind}>
            <p className="text-[9px] font-semibold mb-1" style={{ color: '#94A3B8' }}>{kind === 'main' ? 'Main themes' : 'Cross-cutting themes'}</p>
            <div className="flex flex-wrap gap-1">{items}</div>
          </div>
        )
      })}
      {!editable && picked.length === 0 && <p className="text-[11px]" style={{ color: '#CBD5E1' }}>No themes selected yet</p>}
      {editable && (
        <div className="flex items-center gap-2">
          <button type="button" onClick={save} disabled={pending || !dirty} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg text-white disabled:opacity-50" style={{ background: '#40916C' }}>
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save themes
          </button>
          {msg && <span className="text-[10px]" style={{ color: msg.ok ? '#047857' : '#DC2626' }}>{msg.text}</span>}
        </div>
      )}
    </div>
  )
}
