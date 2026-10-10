'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Minus, ChevronLeft, ChevronRight, Loader2, ArrowLeft, ListChecks, Info, Paperclip, ExternalLink, Camera, Play, Lock, Film } from 'lucide-react'
import Link from 'next/link'
import { setCriterionResult, setCriterionNote } from '@/lib/actions/assessments'
import { recordDocument } from '@/lib/actions/documents'
import { applyWorkflowAction } from '@/lib/actions/workflow'
import { createClient } from '@/lib/supabase/client'
import { STEP_STYLE } from '@/lib/ecoStepStyle'
import { darken } from '@/lib/utils/color'
import EcoThemesPicker from '@/components/audit/EcoThemesPicker'
import GreenFlagSection from '@/components/audit/GreenFlagScorecard'
import { GREEN_FLAG_SECTIONS, type ScoreAnswers } from '@/lib/data/greenFlagScorecard'
import { ES_THEMES_STEP } from '@/lib/data/ecoSchoolsCriteria'

type Crit = { ref: string; title: string; area: string; description?: string; type?: string }
type State = Record<string, { result: string; note: string }>
export type EvidenceItem = { id: string; name: string; url: string | null; isLink: boolean; byAuditor: boolean }

const CHOICES = [
  { value: 'pass', label: 'Conforming', color: '#059669', bg: '#ECFDF3', Icon: Check },
  { value: 'no_pass', label: 'Non-conforming', color: '#DC2626', bg: '#FEE2E2', Icon: X },
  { value: 'na', label: 'N/A', color: '#64748B', bg: '#F1F5F9', Icon: Minus },
]
const isImage = (n: string) => /\.(jpe?g|png|gif|webp|heic|avif)$/i.test(n)
const isVideo = (n: string) => /\.(mp4|mov|webm|m4v)$/i.test(n)
const MAX_BYTES = 15 * 1024 * 1024

export default function SiteVisitChecklist({ applicationId, establishment, criteria, initial, editable, evidence, eco, start, notReady }: {
  applicationId: string
  establishment: string
  criteria: Crit[]
  initial: State
  editable: boolean
  evidence: Record<string, EvidenceItem[]>
  eco?: { score: ScoreAnswers | null; themes: string[]; stepDocs: Record<string, number> } | null
  start?: 'Start Audit' | 'Start Reassessment' | null   // auditor can begin the audit from here
  notReady?: string | null                              // why the checklist is read-only
}) {
  const [state, setState] = useState<State>(initial)
  const [i, setI] = useState(0)
  const [saving, setSaving] = useState(false)
  const [, startT] = useTransition()
  const router = useRouter()

  const cur = criteria[i]
  const assessedCount = useMemo(() => criteria.filter((c) => state[c.ref]?.result && state[c.ref].result !== 'pending').length, [criteria, state])
  const pct = Math.round((assessedCount / Math.max(1, criteria.length)) * 100)
  const step = eco && cur ? STEP_STYLE[cur.ref] : undefined
  const accent = step?.color ?? '#0891B2'
  const strong = step ? darken(step.color, 0.36) : '#0E7490'

  function choose(result: string) {
    if (!editable || !cur) return
    const prev = state[cur.ref]?.result
    const next = prev === result ? 'pending' : result   // tap again to clear
    setState((s) => ({ ...s, [cur.ref]: { ...(s[cur.ref] ?? { note: '' }), result: next } }))
    setSaving(true)
    startT(async () => { await setCriterionResult(applicationId, cur.ref, next); setSaving(false) })
  }
  function saveNote(note: string) {
    if (!editable || !cur) return
    setSaving(true)
    startT(async () => { await setCriterionNote(applicationId, cur.ref, note); setSaving(false); router.refresh() })
  }

  if (!cur) return null
  const sel = state[cur.ref]?.result ?? 'pending'
  const items = evidence[cur.ref] ?? []
  const schoolItems = items.filter((d) => !d.byAuditor)
  const auditorItems = items.filter((d) => d.byAuditor)
  const gfSection = eco ? GREEN_FLAG_SECTIONS.find((s) => s.step === cur.ref) : undefined

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link href={`/auditor/applications/${applicationId}`} className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-4 h-4" /> Full board
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: saving ? accent : '#94A3B8' }}>
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><ListChecks className="w-3.5 h-3.5" /> {assessedCount}/{criteria.length} assessed</>}
        </span>
      </div>

      <h1 className="text-xl font-bold truncate" style={{ color: '#0F172A' }}>{establishment}</h1>
      <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>Site-visit checklist</p>

      {!editable && <StartBanner applicationId={applicationId} start={start} notReady={notReady} />}

      {/* Progress */}
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mb-5">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: eco ? 'linear-gradient(90deg, #E2A92B, #E08A2E, #CF6A2C, #B4566A, #6E5C8E, #3F86C6, #4E9A5B)' : '#0891B2' }} />
      </div>

      {/* Criterion card */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: step ? `${accent}55` : '#E2E8F0', borderTop: step ? `6px solid ${accent}` : undefined }}>
        <div className="p-5">
          {step ? (
            <div className="flex items-center gap-3 mb-1">
              <span className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: accent, boxShadow: `0 6px 16px ${accent}55` }}>
                <step.Icon className="w-7 h-7 text-white" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: strong }}>Step {cur.ref} of {criteria.length}</p>
                <p className="text-xl font-bold leading-snug" style={{ color: '#14342A' }}>{cur.title}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: '#F1F5F9', color: '#475569' }}>{cur.area}</span>
                {cur.type && <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: cur.type.includes('I') ? '#FEF3C7' : '#EFF6FF', color: cur.type.includes('I') ? '#854D0E' : '#1D4ED8' }}>{cur.type.includes('I') ? 'Imperative' : 'Guideline'}</span>}
              </div>
              <p className="text-[11px] font-mono font-bold" style={{ color: '#94A3B8' }}>{cur.ref}</p>
              <p className="text-base font-semibold mt-0.5" style={{ color: '#1E293B' }}>{cur.title}</p>
            </>
          )}
          {cur.description && (
            <details className="mt-2">
              <summary className="text-sm font-semibold cursor-pointer inline-flex items-center gap-1" style={{ color: strong }}><Info className="w-4 h-4" /> Guidance</summary>
              <p className="text-sm mt-1.5 leading-relaxed whitespace-pre-line" style={{ color: '#64748B' }}>{cur.description}</p>
            </details>
          )}

          {/* What the school submitted */}
          <div className="mt-4 rounded-xl p-3" style={{ background: step ? `${accent}0F` : '#F8FAFC', border: `1px solid ${step ? `${accent}33` : '#E2E8F0'}` }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2 inline-flex items-center gap-1.5" style={{ color: strong }}><Paperclip className="w-3.5 h-3.5" /> School&apos;s evidence</p>
            {schoolItems.length === 0
              ? <p className="text-sm" style={{ color: '#94A3B8' }}>Nothing attached to this {eco ? 'step' : 'criterion'}.</p>
              : <EvidenceList items={schoolItems} />}
          </div>

          {/* Eco-Schools: themes (Step 2) + the school's Green Flag answers */}
          {eco && cur.ref === ES_THEMES_STEP && (
            <div className="mt-3"><EcoThemesPicker applicationId={applicationId} selected={eco.themes} editable={false} /></div>
          )}
          {eco && gfSection && (
            <div className="mt-3">
              <GreenFlagSection applicationId={applicationId} sectionId={gfSection.id} initial={eco.score} editable={false} themes={eco.themes} stepDocs={eco.stepDocs} accent={accent} />
            </div>
          )}

          {/* Assessment */}
          <p className="text-xs font-bold uppercase tracking-wide mt-5 mb-2" style={{ color: '#475569' }}>Your assessment</p>
          <div className="grid grid-cols-3 gap-2">
            {CHOICES.map((c) => {
              const on = sel === c.value
              return (
                <button key={c.value} onClick={() => choose(c.value)} disabled={!editable}
                  className="flex flex-col items-center gap-1.5 py-4 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                  style={on ? { background: c.color, color: '#fff', boxShadow: `0 6px 16px ${c.color}55` } : { background: c.bg, color: c.color }}>
                  <c.Icon className="w-6 h-6" /> {c.label}
                </button>
              )
            })}
          </div>

          <textarea key={cur.ref} defaultValue={state[cur.ref]?.note ?? ''} disabled={!editable} onBlur={(e) => saveNote(e.target.value)}
            rows={2} placeholder="Finding / note (optional)…"
            className="w-full text-sm mt-3 px-3 py-2.5 rounded-xl outline-none resize-none disabled:opacity-60"
            style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />

          {/* Auditor's on-site photos */}
          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1.5" style={{ color: '#475569' }}><Camera className="w-3.5 h-3.5" /> Site-visit photos</p>
              {editable && <SitePhotoUpload applicationId={applicationId} criterionRef={cur.ref} color={strong} />}
            </div>
            {auditorItems.length > 0
              ? <div className="mt-2"><EvidenceList items={auditorItems} /></div>
              : <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{editable ? 'Take or add photos during the visit — they’re saved to this ' + (eco ? 'step' : 'criterion') + '.' : 'No photos yet.'}</p>}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between gap-3 mt-4">
        <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0}
          className="inline-flex items-center gap-1 px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-40" style={{ background: '#F1F5F9', color: '#334155' }}>
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <span className="text-sm font-semibold" style={{ color: '#94A3B8' }}>{i + 1} / {criteria.length}</span>
        <button onClick={() => setI((n) => Math.min(criteria.length - 1, n + 1))} disabled={i === criteria.length - 1}
          className="inline-flex items-center gap-1 px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: step ? strong : 'linear-gradient(135deg, #0E7490, #0891B2)' }}>
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick jump */}
      <div className="flex flex-wrap gap-2 mt-5 justify-center">
        {criteria.map((c, idx) => {
          const r = state[c.ref]?.result
          const resultColor = r === 'pass' ? '#059669' : r === 'no_pass' ? '#DC2626' : r === 'na' ? '#94A3B8' : null
          const st = eco ? STEP_STYLE[c.ref] : undefined
          if (st) {
            return (
              <button key={c.ref} onClick={() => setI(idx)} title={c.title} aria-label={`Step ${c.ref}`}
                className="relative w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: st.color, outline: idx === i ? `3px solid ${darken(st.color, 0.36)}` : 'none', outlineOffset: 2, opacity: idx === i ? 1 : 0.85 }}>
                <st.Icon className="w-4 h-4 text-white" />
                {resultColor && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: resultColor }} />}
              </button>
            )
          }
          return <button key={c.ref} onClick={() => setI(idx)} title={c.ref} aria-label={c.ref}
            className="w-3 h-3 rounded-full" style={{ background: resultColor ?? '#E2E8F0', outline: idx === i ? '2px solid #0891B2' : 'none', outlineOffset: 1 }} />
        })}
      </div>
    </div>
  )
}

function EvidenceList({ items }: { items: EvidenceItem[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((d) => {
        const href = d.url ?? '#'
        if (d.url && isImage(d.name)) {
          return (
            <a key={d.id} href={href} target="_blank" rel="noopener" title={d.name} className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.url} alt={d.name} className="w-24 h-20 object-cover rounded-lg border" style={{ borderColor: '#E2E8F0' }} />
            </a>
          )
        }
        const Icon = d.isLink ? ExternalLink : isVideo(d.name) ? Film : Paperclip
        return (
          <a key={d.id} href={href} target="_blank" rel="noopener"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-white border max-w-full" style={{ borderColor: '#E2E8F0', color: '#1D4ED8' }}>
            <Icon className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{d.name}</span>
          </a>
        )
      })}
    </div>
  )
}

// Auditor adds photos on site — opens the phone camera (or the gallery).
function SitePhotoUpload({ applicationId, criterionRef, color }: { applicationId: string; criterionRef: string; color: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setBusy(true); setError('')
    const supabase = createClient()
    for (const file of files) {
      if (file.size > MAX_BYTES) { setError(`${file.name} is larger than 15 MB.`); continue }
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${applicationId}/site-visit/${criterionRef}/${Date.now()}-${safe}`
      const up = await supabase.storage.from('application-docs').upload(path, file)
      if (up.error) { setError(up.error.message); continue }
      const r = await recordDocument({ applicationId, criterionRef, year: new Date().getFullYear(), name: `Site visit — ${file.name}`, path, size: file.size, mimeType: file.type || null })
      if (r.error) setError(r.error)
    }
    setBusy(false)
    e.target.value = ''
    router.refresh()
  }

  return (
    <span className="inline-flex items-center gap-2">
      <input ref={ref} type="file" accept="image/*" capture="environment" multiple onChange={onChange} className="hidden" />
      <button type="button" onClick={() => ref.current?.click()} disabled={busy}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white disabled:opacity-60" style={{ background: color }}>
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />} {busy ? 'Uploading…' : 'Add photo'}
      </button>
      {error && <span className="text-[11px]" style={{ color: '#DC2626' }}>{error}</span>}
    </span>
  )
}

// Read-only explanation, with a button to begin the audit when the visit is scheduled.
function StartBanner({ applicationId, start, notReady }: { applicationId: string; start?: string | null; notReady?: string | null }) {
  const [pending, startT] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()
  return (
    <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 flex-wrap" style={{ background: start ? '#ECFEFF' : '#F8FAFC', border: `1px solid ${start ? '#A5F3FC' : '#E2E8F0'}` }}>
      <Lock className="w-4 h-4 flex-shrink-0" style={{ color: start ? '#0E7490' : '#94A3B8' }} />
      <p className="text-sm flex-1 min-w-[180px]" style={{ color: '#334155' }}>
        {start ? 'Ready when you are — start the audit to record your assessment and photos.' : notReady ?? 'This checklist is read-only at the current stage.'}
      </p>
      {start && (
        <button disabled={pending}
          onClick={() => { setError(''); startT(async () => { const r = await applyWorkflowAction(applicationId, 'auditor', start); if (r.error) setError(r.error); else router.refresh() }) }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #0E7490, #0891B2)' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} {start}
        </button>
      )}
      {error && <p className="text-xs w-full" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  )
}
