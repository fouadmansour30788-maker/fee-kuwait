'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { updateApplication } from './actions'

export default function ReviewForm({
  id, status, notes, rejection, statuses,
}: {
  id: string
  status: string
  notes: string
  rejection: string
  statuses: { value: string; label: string }[]
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(''); setSaved(false)
    start(async () => {
      const res = await updateApplication(id, fd)
      if (res?.error) setError(res.error)
      else { setSaved(true); router.refresh() }
    })
  }

  const field = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: '#E2E8F0' }}>
      <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Review</h2>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Status</label>
        <select name="status" defaultValue={status} className="w-full text-sm px-3 py-2.5 rounded-xl outline-none bg-white" style={field}>
          {statuses.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Review notes</label>
        <textarea name="review_notes" defaultValue={notes} rows={3} placeholder="Internal notes about this application…"
          className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none" style={field} />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Rejection reason <span className="font-normal" style={{ color: '#94A3B8' }}>(only used if status is Rejected)</span></label>
        <input name="rejection_reason" defaultValue={rejection} placeholder="Reason shared with the applicant if rejected"
          className="w-full text-sm px-3 py-2.5 rounded-xl outline-none" style={field} />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-sm" style={{ color: '#E53E3E' }}><AlertCircle className="w-4 h-4" /> {error}</p>
      )}
      {saved && !pending && (
        <p className="flex items-center gap-1.5 text-sm" style={{ color: '#047857' }}><CheckCircle2 className="w-4 h-4" /> Application updated.</p>
      )}

      <button type="submit" disabled={pending}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
        <Save className="w-4 h-4" /> {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
