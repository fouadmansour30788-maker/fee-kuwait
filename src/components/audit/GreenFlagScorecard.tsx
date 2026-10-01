'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Award, Save, Loader2, Check, AlertCircle, Lock, ChevronDown, Paperclip } from 'lucide-react'
import {
  GREEN_FLAG_SECTIONS, GREEN_FLAG_PASS, GREEN_FLAG_MAX, sectionScore, totalScore, scorecardComplete,
  type ScoreAnswers, type ScoreAnswer,
} from '@/lib/data/greenFlagScorecard'
import { saveGreenFlagScore } from '@/lib/actions/ecoSchools'

const GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Not disclosed']
const field = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

// "Is your school Green Flag ready?" — the operator's final scorecard (1000 pts,
// over 800 = ready for the Green Flag assessment). Read-only for everyone else.
export default function GreenFlagScorecard({ applicationId, initial, editable, open, themes, stepDocs, scoredAt }: {
  applicationId: string
  initial: ScoreAnswers | null
  editable: boolean        // operator may fill/save
  open: boolean            // every step is Ready → scorecard available
  themes: string[]         // Step 2 themes (shown for the "themes picked" question)
  stepDocs: Record<string, number> // attachments per step (mandatory uploads)
  scoredAt: string | null
}) {
  const [answers, setAnswers] = useState<ScoreAnswers>(initial ?? {})
  const [expanded, setExpanded] = useState<string | null>(editable ? GREEN_FLAG_SECTIONS[0].id : null)
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  const total = useMemo(() => totalScore(answers), [answers])
  const complete = useMemo(() => scorecardComplete(answers), [answers])
  const set = (id: string, patch: Partial<ScoreAnswer>) => { setMsg(null); setAnswers((a) => ({ ...a, [id]: { ...a[id], ...patch } })) }

  if (!open && !initial) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B' }}>
        <Lock className="w-4 h-4" /> The Green Flag scorecard opens once all seven steps are marked Ready by the National Operator.
      </div>
    )
  }
  if (!editable && !initial) return null

  const ready = total > GREEN_FLAG_PASS
  function save() {
    start(async () => {
      const r = await saveGreenFlagScore(applicationId, answers)
      if (r.error) setMsg({ text: r.error })
      else { setMsg({ ok: true, text: `Saved — ${r.total} / ${GREEN_FLAG_MAX} points.` }); router.refresh() }
    })
  }

  return (
    <div className="space-y-3">
      {/* Total */}
      <div className="flex items-center gap-3 flex-wrap rounded-xl px-4 py-3" style={{ background: ready ? '#ECFDF3' : '#F8FAFC', border: `1px solid ${ready ? '#A7F3D0' : '#E2E8F0'}` }}>
        <Award className="w-5 h-5" style={{ color: ready ? '#047857' : '#64748B' }} />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold" style={{ color: '#0F172A' }}>{total} <span className="text-sm font-medium" style={{ color: '#64748B' }}>/ {GREEN_FLAG_MAX} points</span></p>
          <p className="text-xs" style={{ color: ready ? '#047857' : '#64748B' }}>
            {ready ? 'Over 800 — ready to be assessed for the Eco-Schools Green Flag.' : `Over ${GREEN_FLAG_PASS} points means the school is ready for the Green Flag assessment.`}
            {!complete && ' Some questions are not answered yet.'}
          </p>
        </div>
        {scoredAt && <span className="text-[11px]" style={{ color: '#94A3B8' }}>Last saved {new Date(scoredAt).toLocaleString('en-GB', { timeZone: 'Asia/Kuwait' })}</span>}
        {editable && (
          <button onClick={save} disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save scorecard
          </button>
        )}
      </div>
      {msg && <p className="flex items-center gap-1.5 text-xs" style={{ color: msg.ok ? '#047857' : '#DC2626' }}>{msg.ok ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />} {msg.text}</p>}

      {/* Sections */}
      {GREEN_FLAG_SECTIONS.map((sec) => {
        const got = sectionScore(sec, answers)
        const isOpen = expanded === sec.id
        return (
          <div key={sec.id} className="rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            <button type="button" onClick={() => setExpanded(isOpen ? null : sec.id)} className="w-full flex items-center gap-2 px-4 py-3 text-left" style={{ background: '#F8FAFC' }}>
              <ChevronDown className="w-4 h-4 transition-transform" style={{ color: '#64748B', transform: isOpen ? 'none' : 'rotate(-90deg)' }} />
              <span className="text-xs font-mono font-semibold" style={{ color: '#94A3B8' }}>Step {sec.step}</span>
              <span className="text-sm font-bold flex-1" style={{ color: '#0F172A' }}>{sec.title}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#EDF7F1', color: '#40916C' }}>{got} / {sec.max}</span>
            </button>
            {isOpen && (
              <div className="p-4 space-y-4">
                {sec.questions.map((q) => {
                  const a = answers[q.id] ?? {}
                  return (
                    <div key={q.id} className="space-y-1.5">
                      <p className="text-sm font-semibold" style={{ color: '#1E293B' }}><span style={{ color: '#94A3B8' }}>{q.n}.</span> {q.text}</p>
                      {q.hint && <p className="text-[11px]" style={{ color: '#94A3B8' }}>{q.hint}</p>}

                      {q.kind === 'upload' && (
                        <p className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg" style={(stepDocs[sec.step] ?? 0) > 0 ? { background: '#ECFDF3', color: '#047857' } : { background: '#FEF2F2', color: '#B91C1C' }}>
                          <Paperclip className="w-3.5 h-3.5" /> {(stepDocs[sec.step] ?? 0) > 0 ? `${stepDocs[sec.step]} attachment(s) on Step ${sec.step} of the criteria board` : `No attachment yet on Step ${sec.step}`}
                        </p>
                      )}

                      {q.kind === 'themes' && (
                        <div className="flex flex-wrap gap-1">
                          {themes.length ? themes.map((t) => <span key={t} className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ECFDF3', color: '#065F46', border: '1px solid #A7F3D0' }}>{t}</span>)
                            : <span className="text-xs" style={{ color: '#94A3B8' }}>No themes selected on Step 2</span>}
                        </div>
                      )}

                      {q.kind === 'choice' && (
                        <div className="space-y-1">
                          {q.options!.map((opt, i) => {
                            const on = a.choice === i
                            if (!editable && !on) return null
                            return (
                              <label key={i} className={`flex items-start gap-2 text-xs rounded-lg px-2.5 py-1.5 ${editable ? 'cursor-pointer' : ''}`}
                                style={on ? { background: '#ECFDF3', border: '1px solid #A7F3D0' } : { border: '1px solid #F1F5F9' }}>
                                {editable && <input type="radio" name={q.id} checked={on} onChange={() => set(q.id, { choice: i })} className="mt-0.5 accent-green-700" />}
                                <span className="font-bold whitespace-nowrap" style={{ color: '#40916C' }}>{opt.pts} pts</span>
                                <span style={{ color: opt.earlyYears ? '#6366F1' : '#334155', fontStyle: opt.earlyYears ? 'italic' : 'normal' }}>
                                  {opt.earlyYears && 'Only for Early Years: '}{opt.text}
                                </span>
                              </label>
                            )
                          })}
                          {!editable && a.choice == null && <span className="text-xs" style={{ color: '#CBD5E1' }}>Not answered</span>}
                          {q.link && (editable
                            ? <input value={a.link ?? ''} onChange={(e) => set(q.id, { link: e.target.value })} placeholder="Link (optional)" className="w-full text-xs px-2.5 py-1.5 rounded-lg outline-none" style={field} />
                            : a.link ? <a href={a.link} target="_blank" rel="noopener" className="text-xs underline break-all" style={{ color: '#1D4ED8' }}>{a.link}</a> : null)}
                        </div>
                      )}

                      {(q.kind === 'number' || q.kind === 'date' || q.kind === 'text') && (editable ? (
                        q.kind === 'text'
                          ? <textarea value={a.value ?? ''} onChange={(e) => set(q.id, { value: e.target.value })} rows={3} className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-y" style={field} />
                          : <input type={q.kind} min={q.kind === 'number' ? 0 : undefined} value={a.value ?? ''} onChange={(e) => set(q.id, { value: e.target.value })} className="w-48 text-sm px-3 py-1.5 rounded-lg outline-none" style={field} />
                      ) : <p className="text-sm whitespace-pre-wrap" style={{ color: a.value ? '#334155' : '#CBD5E1' }}>{a.value || '—'}</p>)}

                      {q.kind === 'gender' && (
                        <div className="flex flex-wrap gap-2">
                          {GENDERS.map((g) => (
                            <label key={g} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
                              {g}
                              {editable
                                ? <input type="number" min={0} value={a.values?.[g] ?? ''} onChange={(e) => set(q.id, { values: { ...(a.values ?? {}), [g]: e.target.value } })} className="w-16 text-xs px-2 py-1 rounded-lg outline-none" style={field} />
                                : <b style={{ color: '#1E293B' }}>{a.values?.[g] || '—'}</b>}
                            </label>
                          ))}
                        </div>
                      )}

                      {q.kind === 'agerange' && (
                        <div className="flex flex-wrap gap-3">
                          {(['Youngest member', 'Oldest member'] as const).map((k) => (
                            <label key={k} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
                              {k}
                              {editable
                                ? <input type="number" min={0} value={a.values?.[k] ?? ''} onChange={(e) => set(q.id, { values: { ...(a.values ?? {}), [k]: e.target.value } })} className="w-16 text-xs px-2 py-1 rounded-lg outline-none" style={field} />
                                : <b style={{ color: '#1E293B' }}>{a.values?.[k] || '—'}</b>}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
