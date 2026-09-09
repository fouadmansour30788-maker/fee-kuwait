'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { submitToCb } from '@/app/(admin)/applications/[id]/actions'

// Explicit "submit to CB for pre-audit review" — separate from assigning the CB,
// so assigning a Certification Body never moves the application on its own.
export default function SubmitToCb({ applicationId, disabled }: { applicationId: string; disabled?: boolean }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  function submit() {
    if (!window.confirm('Submit this application to the Certification Body for pre-audit review? The applicant will be notified.')) return
    setError('')
    start(async () => {
      const res = await submitToCb(applicationId)
      if (res.error) setError(res.error)
      else router.refresh()
    })
  }

  return (
    <div className="mt-3">
      <button onClick={submit} disabled={disabled || pending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Submit for CB pre-audit review
      </button>
      {disabled && <p className="text-[11px] mt-1.5" style={{ color: '#94A3B8' }}>Assign a Certification Body above first.</p>}
      {error && <p className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: '#DC2626' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
    </div>
  )
}
