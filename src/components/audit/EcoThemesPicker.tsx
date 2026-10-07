'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Save, GraduationCap, Pencil } from 'lucide-react'
import { ES_THEMES, ES_MIN_THEMES, type ESTheme } from '@/lib/data/ecoSchoolsCriteria'
import { setEcoThemes } from '@/lib/actions/ecoThemes'

// Classroom look: chalkboard header over a ruled exercise-book page.
const CHALK = { board: '#1F3B2D', frame: '#8B5E34', chalk: '#F1F5EC', dust: 'rgba(241,245,236,0.55)' }
const PAPER = {
  backgroundColor: '#FFFEF8',
  backgroundImage: 'linear-gradient(to right, transparent 26px, #F3B8B8 26px, #F3B8B8 27px, transparent 27px), repeating-linear-gradient(to bottom, transparent 0, transparent 27px, #DCE8F5 27px, #DCE8F5 28px)',
}

// One theme tile — the official icon, like a sticker in the exercise book.
export function ThemeTile({ t, on, onClick, size = 'md' }: { t: ESTheme; on: boolean; onClick?: () => void; size?: 'sm' | 'md' }) {
  const img = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14'
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} title={t.en}
      className={`relative flex flex-col items-center gap-1 rounded-xl px-1.5 pt-2 pb-1.5 transition-all ${onClick ? 'hover:-translate-y-0.5 cursor-pointer' : ''}`}
      style={on
        ? { background: '#fff', border: '2px solid #2D9A5A', boxShadow: '0 3px 0 #CDE8D6' }
        : { background: 'rgba(255,255,255,0.7)', border: '2px dashed #CBD5E1', opacity: onClick ? 0.85 : 1 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={t.icon} alt="" className={`${img} rounded-full`} style={{ filter: on ? 'none' : 'grayscale(0.85)', opacity: on ? 1 : 0.6 }} />
      <span className="text-[10px] leading-tight text-center font-semibold" style={{ color: on ? '#14532D' : '#64748B' }}>{t.en}</span>
      {on && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#2D9A5A', boxShadow: '0 0 0 2px #fff' }}>
          <Check className="w-3 h-3 text-white" />
        </span>
      )}
    </Tag>
  )
}

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

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `4px solid ${CHALK.frame}`, boxShadow: '0 2px 0 #5C3D21' }}>
      {/* Chalkboard */}
      <div className="flex items-center gap-2.5 px-4 py-2.5" style={{ background: CHALK.board, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '6px 6px' }}>
        <GraduationCap className="w-5 h-5" style={{ color: CHALK.chalk }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold tracking-wide" style={{ color: CHALK.chalk, fontFamily: '"Comic Sans MS", "Chalkboard SE", "Segoe Print", cursive' }}>Our Eco-Themes</p>
          <p className="text-[10px]" style={{ color: CHALK.dust }}>
            {editable ? `Pick the themes your Eco-Committee is working on — at least ${ES_MIN_THEMES}` : 'Themes the school is working on'}
          </p>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ background: 'rgba(241,245,236,0.12)', color: CHALK.chalk, border: `1px dashed ${CHALK.dust}` }}>
          {picked.length} / {ES_THEMES.length}
        </span>
      </div>

      {/* Exercise-book page */}
      <div className="pl-9 pr-3 py-3 space-y-3" style={PAPER}>
        {(['main', 'cross'] as const).map((kind) => {
          const items = ES_THEMES.filter((t) => t.kind === kind && (editable || picked.includes(t.en)))
          if (!items.length) return null
          return (
            <div key={kind}>
              <p className="text-[11px] font-bold mb-1.5 inline-flex items-center gap-1" style={{ color: '#1E3A8A', fontFamily: '"Segoe Print", "Comic Sans MS", cursive' }}>
                <Pencil className="w-3 h-3" /> {kind === 'main' ? 'Main themes' : 'Cross-cutting themes'}
              </p>
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))' }}>
                {items.map((t) => <ThemeTile key={t.en} t={t} on={picked.includes(t.en)} onClick={editable ? () => toggle(t.en) : undefined} />)}
              </div>
            </div>
          )
        })}
        {!editable && picked.length === 0 && <p className="text-xs" style={{ color: '#94A3B8' }}>No themes selected yet</p>}

        {editable && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button type="button" onClick={save} disabled={pending || !dirty}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
              style={{ background: '#2D9A5A', boxShadow: '0 2px 0 #1F6E40' }}>
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save themes
            </button>
            {picked.length < ES_MIN_THEMES && <span className="text-[11px]" style={{ color: '#B45309' }}>Select at least {ES_MIN_THEMES} themes to complete Step 2.</span>}
            {msg && <span className="text-[11px] font-semibold" style={{ color: msg.ok ? '#047857' : '#DC2626' }}>{msg.text}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
