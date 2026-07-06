'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Paperclip, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Compact evidence uploader tied to a single criterion. Uploads straight to
// Storage (RLS: applicants write their own) and records the criterion_ref.
export default function CriterionUpload({ applicationId, criterionRef }: { applicationId: string; criterionRef: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const inputId = `up-${criterionRef}`

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not signed in'); setBusy(false); return }

    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${applicationId}/${criterionRef}/${Date.now()}-${safe}`

    const up = await supabase.storage.from('application-docs').upload(path, file)
    if (up.error) { setError(up.error.message); setBusy(false); return }

    const ins = await supabase.from('application_documents').insert({
      application_id: applicationId, uploaded_by: user.id, criterion_ref: criterionRef,
      name: file.name, path, size: file.size, mime_type: file.type || null,
    })
    if (ins.error) { setError(ins.error.message); setBusy(false); return }

    setBusy(false)
    if (inputRef.current) inputRef.current.value = ''
    router.refresh()
  }

  return (
    <span className="inline-flex items-center">
      <input ref={inputRef} id={inputId} type="file" onChange={onFile} disabled={busy} className="hidden" />
      <label htmlFor={inputId} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg cursor-pointer"
        style={{ background: '#F1F5F9', color: '#40916C', opacity: busy ? 0.6 : 1 }}>
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Paperclip className="w-3 h-3" />} {busy ? 'Uploading…' : 'Attach'}
      </label>
      {error && <span className="text-[11px] ml-2" style={{ color: '#E53E3E' }}>{error}</span>}
    </span>
  )
}
