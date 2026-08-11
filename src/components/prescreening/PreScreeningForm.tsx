'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Save, Send, Lock, CheckCircle2, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react'
import { PS_QUESTIONS, PS_SERVICES, PS_SECTIONS, evaluatePreScreening, isPreScreeningComplete } from '@/lib/data/preScreening'
import type { PSAnswers, PSQuestion } from '@/lib/data/preScreening'
import { ESTABLISHMENT_CATEGORIES } from '@/lib/data/greenKeyCriteria'
import { savePreScreening, submitPreScreening } from '@/lib/actions/preScreening'

const catLabel = (c: string) => ESTABLISHMENT_CATEGORIES.find((x) => x.code === c)?.label ?? c

export default function PreScreeningForm({
  applicationId, initialAnswers, locked, homeHref,
}: {
  applicationId: string
  initialAnswers: PSAnswers
  locked: boolean
  homeHref: string
}) {
  const [answers, setAnswers] = useState<PSAnswers>(initialAnswers)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  const set = (id: string, v: string | string[] | boolean) => { setAnswers((p) => ({ ...p, [id]: v })); setError(''); setMsg('') }
  const visible = useMemo(() => PS_QUESTIONS.filter((q) => !q.showIf || q.showIf(answers)), [answers])
  const result = useMemo(() => evaluatePreScreening(answers), [answers])
  const complete = useMemo(() => isPreScreeningComplete(answers), [answers])

  function toggleService(v: string) {
    const cur = Array.isArray(answers.q_services) ? answers.q_services : []
    set('q_services', cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
  }
  function toggleMulti(id: string, v: string) {
    const cur = Array.isArray(answers[id]) ? (answers[id] as string[]) : []
    set(id, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
  }

  function save() { start(async () => { const r = await savePreScreening(applicationId, answers); if (r.error) setError(r.error); else { setMsg('Draft saved.'); router.refresh() } }) }
  function submit() { start(async () => { const r = await submitPreScreening(applicationId, answers); if (r.error) setError(r.error); else router.refresh() }) }

  const bySection = PS_SECTIONS.map((s) => ({ section: s, qs: visible.filter((q) => q.section === s) })).filter((g) => g.qs.length)

  const YN = ({ id }: { id: string }) => (
    <div className="inline-flex items-center gap-1.5">
      {(['yes', 'no'] as const).map((v) => {
        const on = answers[id] === v
        return (
          <button key={v} disabled={locked} onClick={() => set(id, v)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
            style={on ? { background: v === 'yes' ? '#059669' : '#DC2626', color: '#fff' } : { background: '#F1F5F9', color: v === 'yes' ? '#059669' : '#DC2626' }}>
            {v === 'yes' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}{v === 'yes' ? 'Yes' : 'No'}
          </button>
        )
      })}
    </div>
  )

  function Field({ q }: { q: PSQuestion }) {
    if (q.field === 'yesno') return <YN id={q.id} />
    if (q.field === 'checkbox') return (
      <label className="inline-flex items-start gap-2 cursor-pointer">
        <input type="checkbox" disabled={locked} checked={answers[q.id] === true} onChange={(e) => set(q.id, e.target.checked)} className="mt-1 w-4 h-4 accent-green-700" />
        <span className="text-sm" style={{ color: '#334155' }}>{q.text}</span>
      </label>
    )
    if (q.field === 'multiservice') {
      const cur = Array.isArray(answers.q_services) ? answers.q_services : []
      return (
        <div className="flex flex-col gap-1.5">
          {PS_SERVICES.map((s) => (
            <label key={s.value} className="inline-flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#334155' }}>
              <input type="checkbox" disabled={locked} checked={cur.includes(s.value)} onChange={() => toggleService(s.value)} className="w-4 h-4 accent-green-700" />
              {s.label}
            </label>
          ))}
        </div>
      )
    }
    if (q.field === 'multi') {
      const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : []
      const opts = q.optionsFn ? q.optionsFn(answers) : (q.options ?? [])
      return (
        <div className="flex flex-col gap-1.5">
          {opts.map((s) => (
            <label key={s.value} className="inline-flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#334155' }}>
              <input type="checkbox" disabled={locked} checked={cur.includes(s.value)} onChange={() => toggleMulti(q.id, s.value)} className="w-4 h-4 accent-green-700" />
              {s.label}
            </label>
          ))}
        </div>
      )
    }
    const type = q.field === 'email' ? 'email' : 'text'
    return <input type={type} disabled={locked} value={(answers[q.id] as string) ?? ''} onChange={(e) => set(q.id, e.target.value)} placeholder={q.field === 'country' ? 'Country' : 'Type here…'}
      className="w-full max-w-md text-sm px-3 py-2 rounded-xl outline-none disabled:opacity-60" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
  }

  return (
    <div className="space-y-5">
      {locked && (
        <div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF9EC', border: '1px solid #FDE68A', color: '#854D0E' }}>
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>This pre-screening form has been submitted and is locked. The National Operator can unlock it if changes are needed.</p>
        </div>
      )}

      {bySection.map((g) => (
        <div key={g.section} className="bg-white rounded-2xl border p-5 sm:p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#1B4332' }}>{g.section}</h2>
          <div className="space-y-4">
            {g.qs.map((q) => (
              <div key={q.id}>
                {q.field !== 'checkbox' && <label className="block text-sm font-medium mb-1.5" style={{ color: '#1E293B' }}>{q.text}</label>}
                <Field q={q} />
                {q.help && <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{q.help}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Live result */}
      <div className="rounded-2xl border p-5" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4" style={{ color: '#40916C' }} />
          <h3 className="font-semibold" style={{ color: '#1E293B' }}>Provisional result</h3>
          <span className="text-[11px]" style={{ color: '#94A3B8' }}>· confirmed by the National Operator</span>
        </div>
        {result.eligible === false ? (
          <div className="flex items-start gap-2 text-sm" style={{ color: '#B91C1C' }}>
            <AlertTriangle className="w-4 h-4 mt-0.5" /> Not eligible — {result.ineligibleReason}
          </div>
        ) : result.mainCategory ? (
          <div className="space-y-1.5 text-sm" style={{ color: '#334155' }}>
            <div className="flex items-center gap-2" style={{ color: '#047857' }}><CheckCircle2 className="w-4 h-4" /> Seems eligible for Green Key certification.</div>
            <div>Main category: <strong>{catLabel(result.mainCategory)} ({result.mainCategory})</strong></div>
            {result.subCategories.length > 0 && <div>Sub-categories: <strong>{result.subCategories.map(catLabel).join(', ')}</strong></div>}
            <div className="text-xs" style={{ color: '#64748B' }}>
              Green area: {result.flags.hasGreenArea ? 'yes' : 'no'} · Lawn &gt; 4,000 m²: {result.flags.lawnOver4000 ? 'yes' : 'no'} · Fewer than 50 employees: {result.flags.under50Employees ? 'yes' : 'no'}
            </div>
            {result.needsOperationalData && <div className="text-xs" style={{ color: '#B45309' }}>You must be able to provide at least 3 months of operational data.</div>}
            {result.auditorAccessNote && <div className="text-xs" style={{ color: '#B45309' }}>{result.auditorAccessNote}</div>}
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#94A3B8' }}>Answer the questions above to see your eligibility and category.</p>
        )}
      </div>

      {error && <p className="flex items-center gap-1.5 text-sm" style={{ color: '#E53E3E' }}><AlertTriangle className="w-4 h-4" /> {error}</p>}
      {msg && <p className="text-sm" style={{ color: '#059669' }}>{msg}</p>}

      {!locked && (
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: '#F1F5F9', color: '#334155' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save draft
          </button>
          <button onClick={submit} disabled={pending || !complete} title={complete ? '' : 'Answer all applicable questions first'} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit for review
          </button>
        </div>
      )}
    </div>
  )
}
