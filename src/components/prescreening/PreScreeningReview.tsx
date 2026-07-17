'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardCheck, CheckCircle2, XCircle, Unlock, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { PS_QUESTIONS, evaluatePreScreening } from '@/lib/data/preScreening'
import type { PSAnswers } from '@/lib/data/preScreening'
import { ESTABLISHMENT_CATEGORIES } from '@/lib/data/greenKeyCriteria'
import type { EstablishmentCategory } from '@/lib/data/greenKeyCriteria'
import { reviewPreScreening, unlockPreScreening } from '@/lib/actions/preScreening'

const catLabel = (c: string) => ESTABLISHMENT_CATEGORIES.find((x) => x.code === c)?.label ?? c
const fmt = (v: unknown) => (v === true ? 'Yes' : Array.isArray(v) ? (v.length ? v.join(', ') : '—') : v === '' || v == null ? '—' : String(v))

export default function PreScreeningReview({
  applicationId, answers, status, mainCategory, subCategories,
}: {
  applicationId: string
  answers: PSAnswers
  status: 'draft' | 'submitted' | 'eligible' | 'rejected'
  mainCategory: EstablishmentCategory | null
  subCategories: EstablishmentCategory[]
}) {
  const result = useMemo(() => evaluatePreScreening(answers), [answers])
  const [main, setMain] = useState<string>(mainCategory ?? result.mainCategory ?? '')
  const [subs, setSubs] = useState<string[]>(subCategories.length ? subCategories : result.subCategories)
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('')
  const [showAnswers, setShowAnswers] = useState(false)
  const [err, setErr] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  const visible = PS_QUESTIONS.filter((q) => !q.showIf || q.showIf(answers))
  const toggleSub = (c: string) => setSubs((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))

  function run(fn: () => Promise<{ error?: string }>) { setErr(''); start(async () => { const r = await fn(); if (r.error) setErr(r.error); else router.refresh() }) }
  const approve = () => run(() => reviewPreScreening(applicationId, 'eligible', note, main || null, subs))
  const reject = () => run(() => reviewPreScreening(applicationId, 'rejected', note))
  const unlock = () => run(() => unlockPreScreening(applicationId, reason))

  const badge = { draft: ['Draft', '#64748B', '#F1F5F9'], submitted: ['Submitted — awaiting review', '#1D4ED8', '#EFF6FF'], eligible: ['Eligible', '#047857', '#ECFDF3'], rejected: ['Rejected', '#B91C1C', '#FEE2E2'] }[status]

  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2 mb-1">
        <ClipboardCheck className="w-5 h-5" style={{ color: '#40916C' }} />
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Pre-screening review</h2>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full ml-1" style={{ color: badge[1], background: badge[2] }}>{badge[0]}</span>
      </div>

      {/* Computed result */}
      <div className="text-sm mt-2 space-y-0.5" style={{ color: '#334155' }}>
        {result.eligible === false
          ? <div style={{ color: '#B91C1C' }}>Applicant answers indicate: not eligible — {result.ineligibleReason}</div>
          : <div>Suggested category: <strong>{result.mainCategory ? `${catLabel(result.mainCategory)} (${result.mainCategory})` : '—'}</strong>{result.subCategories.length ? ` + ${result.subCategories.map(catLabel).join(', ')}` : ''}</div>}
        <div className="text-xs" style={{ color: '#64748B' }}>Green area: {fmt(result.flags.hasGreenArea)} · Lawn &gt; 4,000 m²: {fmt(result.flags.lawnOver4000)} · &lt;50 employees: {fmt(result.flags.under50Employees)}{result.needsOperationalData ? ' · needs 3 months data' : ''}</div>
      </div>

      {/* Answers */}
      <button onClick={() => setShowAnswers((s) => !s)} className="inline-flex items-center gap-1 text-xs font-semibold mt-3" style={{ color: '#40916C' }}>
        {showAnswers ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />} {showAnswers ? 'Hide' : 'View'} answers
      </button>
      {showAnswers && (
        <div className="mt-2 rounded-xl border divide-y" style={{ borderColor: '#E2E8F0' }}>
          {visible.map((q) => (
            <div key={q.id} className="px-3 py-2 text-xs flex gap-3">
              <span className="flex-1" style={{ color: '#64748B' }}>{q.text}</span>
              <span className="font-semibold whitespace-nowrap" style={{ color: '#1E293B' }}>{fmt(answers[q.id])}</span>
            </div>
          ))}
        </div>
      )}

      {/* NO controls */}
      <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: '#F1F5F9' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-semibold" style={{ color: '#475569' }}>Confirm main category</label>
          <select value={main} onChange={(e) => setMain(e.target.value)} className="text-sm px-3 py-1.5 rounded-lg bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
            <option value="">—</option>
            {ESTABLISHMENT_CATEGORIES.map((c) => <option key={c.code} value={c.code}>{c.label} ({c.code})</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-semibold" style={{ color: '#475569' }}>Sub-categories</label>
          {ESTABLISHMENT_CATEGORIES.filter((c) => c.code !== main).map((c) => (
            <button key={c.code} onClick={() => toggleSub(c.code)} className="text-[11px] font-semibold px-2 py-1 rounded-lg" style={subs.includes(c.code) ? { background: '#40916C', color: '#fff' } : { background: '#F1F5F9', color: '#475569' }}>{c.code}</button>
          ))}
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Note to the applicant (optional)…" className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={approve} disabled={pending || !main} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve eligibility
          </button>
          <button onClick={reject} disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: '#FEE2E2', color: '#B91C1C' }}>
            <XCircle className="w-4 h-4" /> Reject
          </button>
        </div>
        {!main && <p className="text-xs" style={{ color: '#B45309' }}>Confirm a main category above to enable approval.</p>}

        {status !== 'draft' && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason to unlock for editing…" className="flex-1 min-w-[180px] text-sm px-3 py-2 rounded-xl outline-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
            <button onClick={unlock} disabled={pending || !reason.trim()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: '#F1F5F9', color: '#334155' }}>
              <Unlock className="w-4 h-4" /> Unlock
            </button>
          </div>
        )}
        {err && <p className="text-xs" style={{ color: '#E53E3E' }}>{err}</p>}
      </div>
    </div>
  )
}
