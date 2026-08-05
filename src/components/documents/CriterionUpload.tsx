'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Paperclip, Loader2, Link2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { recordDocument } from '@/lib/actions/documents'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

// Compact evidence uploader tied to a single criterion (and year). Uploads
// straight to Storage (RLS: applicants write their own) and records the
// criterion_ref + year.
export default function CriterionUpload({ applicationId, criterionRef, year, surveillanceId }: { applicationId: string; criterionRef: string; year?: number; surveillanceId?: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [linking, setLinking] = useState(false)
  const [url, setUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const inputId = `up-${criterionRef}`

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_BYTES) {
      setError('File exceeds the 5 MB limit.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    setBusy(true); setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not signed in'); setBusy(false); return }

    const yr = year ?? new Date().getFullYear()
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${applicationId}/${criterionRef}/${yr}/${Date.now()}-${safe}`

    const up = await supabase.storage.from('application-docs').upload(path, file)
    if (up.error) { setError(up.error.message); setBusy(false); return }

    const ins = await recordDocument({
      applicationId, criterionRef, year: yr, name: file.name, path, size: file.size, mimeType: file.type || null, surveillanceId,
    })
    if (ins.error) { setError(ins.error); setBusy(false); return }

    setBusy(false)
    if (inputRef.current) inputRef.current.value = ''
    router.refresh()
  }

  async function saveLink() {
    let href = url.trim()
    if (!href) return
    if (!/^https?:\/\//i.test(href)) href = `https://${href}`
    try { new URL(href) } catch { setError('Enter a valid link.'); return }
    setBusy(true); setError('')

    const yr = year ?? new Date().getFullYear()
    const ins = await recordDocument({
      applicationId, criterionRef, year: yr, name: href.replace(/^https?:\/\//i, '').slice(0, 80), linkUrl: href, surveillanceId,
    })
    if (ins.error) { setError(ins.error); setBusy(false); return }

    setBusy(false); setLinking(false); setUrl('')
    router.refresh()
  }

  if (linking) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <input value={url} onChange={(e) => setUrl(e.target.value)} autoFocus disabled={busy} placeholder="Paste a link…"
          onKeyDown={(e) => { if (e.key === 'Enter') saveLink(); if (e.key === 'Escape') { setLinking(false); setError('') } }}
          className="text-[11px] px-2 py-1 rounded-lg outline-none w-40" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
        <button onClick={saveLink} disabled={busy || !url.trim()} className="inline-flex items-center text-[11px] font-semibold px-2 py-1 rounded-lg disabled:opacity-60" style={{ background: '#ECFDF3', color: '#047857' }}>
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        </button>
        <button onClick={() => { setLinking(false); setError('') }} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
        {error && <span className="text-[11px]" style={{ color: '#E53E3E' }}>{error}</span>}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <input ref={inputRef} id={inputId} type="file" onChange={onFile} disabled={busy} className="hidden" />
      <label htmlFor={inputId} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg cursor-pointer"
        style={{ background: '#F1F5F9', color: '#40916C', opacity: busy ? 0.6 : 1 }}>
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Paperclip className="w-3 h-3" />} {busy ? 'Uploading…' : 'Attach'}
      </label>
      <button onClick={() => { setLinking(true); setError('') }} disabled={busy} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: '#F1F5F9', color: '#40916C' }}>
        <Link2 className="w-3 h-3" /> Link
      </button>
      {error && <span className="text-[11px] ml-1" style={{ color: '#E53E3E' }}>{error}</span>}
    </span>
  )
}
