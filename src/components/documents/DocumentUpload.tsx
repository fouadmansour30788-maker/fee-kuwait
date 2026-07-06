'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DocumentUpload({ applicationId }: { applicationId: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not signed in'); setBusy(false); return }

    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${applicationId}/${Date.now()}-${safe}`

    const up = await supabase.storage.from('application-docs').upload(path, file)
    if (up.error) { setError(up.error.message); setBusy(false); return }

    const ins = await supabase.from('application_documents').insert({
      application_id: applicationId, uploaded_by: user.id,
      name: file.name, path, size: file.size, mime_type: file.type || null,
    })
    if (ins.error) { setError(ins.error.message); setBusy(false); return }

    setBusy(false)
    if (inputRef.current) inputRef.current.value = ''
    router.refresh()
  }

  return (
    <div>
      <input ref={inputRef} id="doc-upload" type="file" onChange={onFile} disabled={busy} className="hidden" />
      <label htmlFor="doc-upload"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)', opacity: busy ? 0.6 : 1 }}>
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {busy ? 'Uploading…' : 'Upload document'}
      </label>
      {error && (
        <p className="flex items-center gap-1.5 text-xs mt-2" style={{ color: '#E53E3E' }}>
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  )
}
