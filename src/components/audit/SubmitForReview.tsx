'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { submitForReview } from '@/lib/actions/applications'

const fmt = (d: string) => new Date(d).toLocaleString('en-GB', { timeZone: 'Asia/Kuwait', dateStyle: 'medium', timeStyle: 'short' })

// Green Key: the establishment declares its application ready and notifies the
// National Operator. Can be sent again (e.g. after making changes).
export default function SubmitForReview({ applicationId, lastSubmittedAt, done, total }: {
  applicationId: string
  lastSubmittedAt: string | null
  done: number
  total: number
}) {
  const [declared, setDeclared] = useState(false)
  const [sentAt, setSentAt] = useState<string | null>(lastSubmittedAt)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()
  const incomplete = total - done

  function submit() {
    setError('')
    start(async () => {
      const r = await submitForReview(applicationId, declared)
      if (r.error) setError(r.error)
      else { setSentAt(r.at ?? new Date().toISOString()); setDeclared(false); router.refresh() }
    })
  }

  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
      <h2 className="text-base font-bold mb-1" style={{ color: '#0F2318' }}>Submit for review</h2>
      <p className="text-xs mb-4" style={{ color: '#5B7568' }}>When your criteria and evidence are ready, notify the National Operator to review your application.</p>

      <p className="text-sm mb-3" style={{ color: '#334155' }}>
        Criteria marked Complete / N/A: <strong>{done} / {total}</strong>
      </p>
      {incomplete > 0 && (
        <p className="flex items-start gap-1.5 text-xs mb-3 rounded-lg px-3 py-2" style={{ background: '#FEF9EC', color: '#92400E' }}>
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          {incomplete} criteri{incomplete === 1 ? 'on is' : 'a are'} not yet marked Complete or N/A. You can still submit, but the operator may ask you to complete {incomplete === 1 ? 'it' : 'them'}.
        </p>
      )}

      <label className="flex items-start gap-2.5 text-sm cursor-pointer rounded-xl px-3 py-2.5" style={{ background: '#F4F9F5', border: '1px solid #D4E7DA', color: '#1E293B' }}>
        <input type="checkbox" checked={declared} onChange={(e) => setDeclared(e.target.checked)} className="mt-0.5 accent-green-700" />
        <span className="font-semibold">I hereby submit my application for review.</span>
      </label>

      <div className="flex items-center gap-3 flex-wrap mt-3">
        <button onClick={submit} disabled={!declared || pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Notify the National Operator
        </button>
        {sentAt && !error && (
          <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#047857' }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Submitted for review on {fmt(sentAt)}
          </span>
        )}
        {error && <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#DC2626' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</span>}
      </div>
    </div>
  )
}
