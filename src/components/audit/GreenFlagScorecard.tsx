'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Award, Save, Loader2, Check, AlertCircle, ChevronDown, Paperclip } from 'lucide-react'
import {
  GREEN_FLAG_SECTIONS, GREEN_FLAG_PASS, GREEN_FLAG_MAX, sectionScore,
  type ScoreAnswers, type ScoreAnswer,
} from '@/lib/data/greenFlagScorecard'
import { saveGreenFlagSection } from '@/lib/actions/ecoSchools'
import { ES_THEMES } from '@/lib/data/ecoSchoolsCriteria'
import { ThemeTile } from '@/components/audit/EcoThemesPicker'

const GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Not disclosed']
const field = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

// Score strip shown above the criteria table (like the Auditor / CB strips).
export function GreenFlagTotal({ total, scoredAt }: { total: number | null; scoredAt: string | null }) {
  const t = total ?? 0
  const ready = t > GREEN_FLAG_PASS
  return (
    <div className="flex items-center gap-3 flex-wrap rounded-2xl px-5 py-3"
      style={{ background: ready ? '#ECFDF3' : '#F0FDF4', border: `1px solid ${ready ? '#A7F3D0' : '#BBF7D0'}` }}>
      <Award className="w-4 h-4" style={{ color: '#047857' }} />
      <span className="text-sm font-semibold" style={{ color: '#065F46' }}>Is the school Green Flag ready?</span>
      <span className="text-sm font-bold px-2.5 py-0.5 rounded-full" style={{ background: '#fff', color: '#065F46', border: '1px solid #A7F3D0' }}>{t} / {GREEN_FLAG_MAX} pts</span>
      <span className="text-xs flex-1" style={{ color: ready ? '#047857' : '#64748B' }}>
        {total == null ? 'The school answers the Green Flag questions under each step.'
          : ready ? 'Over 800 — ready to be assessed for the Eco-Schools Green Flag.'
            : `Over ${GREEN_FLAG_PASS} points = ready for the Green Flag assessment.`}
      </span>
      {scoredAt && <span className="text-[11px]" style={{ color: '#94A3B8' }}>Last updated {new Date(scoredAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait' })}</span>}
    </div>
  )
}

// One step's Green Flag questions, shown in a full-width row under that step on
// the criteria board. The school answers/saves them while the step is open to it;
// the operator, CB and auditor see the saved answers read-only.
export default function GreenFlagSection({ applicationId, sectionId, initial, editable, themes, stepDocs }: {
  applicationId: string
  sectionId: string
  initial: ScoreAnswers | null
  editable: boolean
  themes: string[]
  stepDocs: Record<string, number>
}) {
  const sec = GREEN_FLAG_SECTIONS.find((s) => s.id === sectionId)!
  const [answers, setAnswers] = useState<ScoreAnswers>(initial ?? {})
  const [expanded, setExpanded] = useState(editable && !initial)
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()
  const got = useMemo(() => sectionScore(sec, answers), [sec, answers])
  const canEdit = editable
  const answered = sec.questions.filter((q) => q.kind !== 'upload' && q.kind !== 'themes' && answers[q.id]).length
  const toAnswer = sec.questions.filter((q) => q.kind !== 'upload' && q.kind !== 'themes').length
  const set = (id: string, patch: Partial<ScoreAnswer>) => { setMsg(null); setAnswers((a) => ({ ...a, [id]: { ...a[id], ...patch } })) }

  function save() {
    const mine: ScoreAnswers = {}
    for (const q of sec.questions) if (answers[q.id]) mine[q.id] = answers[q.id]
    start(async () => {
      const r = await saveGreenFlagSection(applicationId, sec.id, mine)
      if (r.error) setMsg({ text: r.error })
      else { setMsg({ ok: true, text: `Saved — ${sec.title}: ${got} / ${sec.max} pts. Total ${r.total} / ${GREEN_FLAG_MAX}.` }); router.refresh() }
    })
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #D1FAE5', background: '#FBFEFC' }}>
      <button type="button" onClick={() => setExpanded((e) => !e)} className="w-full flex items-center gap-2 px-3 py-2 text-left">
        <ChevronDown className="w-4 h-4 transition-transform" style={{ color: '#40916C', transform: expanded ? 'none' : 'rotate(-90deg)' }} />
        <Award className="w-3.5 h-3.5" style={{ color: '#40916C' }} />
        <span className="text-xs font-bold flex-1" style={{ color: '#065F46' }}>
          Green Flag questions — {sec.title}
          <span className="font-medium ml-2" style={{ color: answered === toAnswer ? '#047857' : '#94A3B8' }}>{answered}/{toAnswer} answered</span>
          {editable && answered < toAnswer && <span className="font-medium ml-2" style={{ color: '#B45309' }}>· please answer</span>}
        </span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#ECFDF3', color: '#047857' }}>{got} / {sec.max} pts</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-4">
          {sec.questions.map((q) => {
            const a = answers[q.id] ?? {}
            return (
              <div key={q.id} className="space-y-1.5">
                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}><span style={{ color: '#94A3B8' }}>{sec.step}.{q.n}</span> {q.text}</p>
                {q.hint && <p className="text-[11px]" style={{ color: '#94A3B8' }}>{q.hint}</p>}

                {q.kind === 'upload' && (
                  <p className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg" style={(stepDocs[sec.step] ?? 0) > 0 ? { background: '#ECFDF3', color: '#047857' } : { background: '#FEF2F2', color: '#B91C1C' }}>
                    <Paperclip className="w-3.5 h-3.5" /> {(stepDocs[sec.step] ?? 0) > 0 ? `${stepDocs[sec.step]} attachment(s) on this step` : 'No attachment yet on this step'}
                  </p>
                )}

                {q.kind === 'themes' && (
                  <div className="flex flex-wrap gap-2">
                    {themes.length ? ES_THEMES.filter((t) => themes.includes(t.en)).map((t) => <div key={t.en} className="w-[88px]"><ThemeTile t={t} on size="sm" /></div>)
                      : <span className="text-xs" style={{ color: '#94A3B8' }}>No themes selected on Step 2</span>}
                  </div>
                )}

                {q.kind === 'choice' && (
                  <div className="space-y-1">
                    {q.options!.map((opt, i) => {
                      const on = a.choice === i
                      if (!canEdit && !on) return null
                      return (
                        <label key={i} className={`flex items-start gap-2 text-xs rounded-lg px-2.5 py-1.5 ${canEdit ? 'cursor-pointer' : ''}`}
                          style={on ? { background: '#ECFDF3', border: '1px solid #A7F3D0' } : { border: '1px solid #F1F5F9', background: '#fff' }}>
                          {canEdit && <input type="radio" name={`${applicationId}-${q.id}`} checked={on} onChange={() => set(q.id, { choice: i })} className="mt-0.5 accent-green-700" />}
                          <span className="font-bold whitespace-nowrap" style={{ color: '#40916C' }}>{opt.pts} pts</span>
                          <span style={{ color: opt.earlyYears ? '#6366F1' : '#334155', fontStyle: opt.earlyYears ? 'italic' : 'normal' }}>
                            {opt.earlyYears && 'Only for Early Years: '}{opt.text}
                          </span>
                        </label>
                      )
                    })}
                    {!canEdit && a.choice == null && <span className="text-xs" style={{ color: '#CBD5E1' }}>Not answered</span>}
                    {q.link && (canEdit
                      ? <input value={a.link ?? ''} onChange={(e) => set(q.id, { link: e.target.value })} placeholder="Link (optional)" className="w-full text-xs px-2.5 py-1.5 rounded-lg outline-none bg-white" style={field} />
                      : a.link ? <a href={a.link} target="_blank" rel="noopener" className="text-xs underline break-all" style={{ color: '#1D4ED8' }}>{a.link}</a> : null)}
                  </div>
                )}

                {(q.kind === 'number' || q.kind === 'date' || q.kind === 'text') && (canEdit ? (
                  q.kind === 'text'
                    ? <textarea value={a.value ?? ''} onChange={(e) => set(q.id, { value: e.target.value })} rows={3} className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-y bg-white" style={field} />
                    : <input type={q.kind} min={q.kind === 'number' ? 0 : undefined} value={a.value ?? ''} onChange={(e) => set(q.id, { value: e.target.value })} className="w-48 text-sm px-3 py-1.5 rounded-lg outline-none bg-white" style={field} />
                ) : <p className="text-sm whitespace-pre-wrap" style={{ color: a.value ? '#334155' : '#CBD5E1' }}>{a.value || '—'}</p>)}

                {(q.kind === 'gender' || q.kind === 'agerange') && (
                  <div className="flex flex-wrap gap-3">
                    {(q.kind === 'gender' ? GENDERS : ['Youngest member', 'Oldest member']).map((k) => (
                      <label key={k} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
                        {k}
                        {canEdit
                          ? <input type="number" min={0} value={a.values?.[k] ?? ''} onChange={(e) => set(q.id, { values: { ...(a.values ?? {}), [k]: e.target.value } })} className="w-16 text-xs px-2 py-1 rounded-lg outline-none bg-white" style={field} />
                          : <b style={{ color: '#1E293B' }}>{a.values?.[k] || '—'}</b>}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {canEdit && (
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <button onClick={save} disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save {sec.title} answers
              </button>
              {msg && <span className="flex items-center gap-1.5 text-xs" style={{ color: msg.ok ? '#047857' : '#DC2626' }}>{msg.ok ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />} {msg.text}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
