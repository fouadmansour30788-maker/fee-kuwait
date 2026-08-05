'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, AlertCircle, Link2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { recordDocument } from '@/lib/actions/documents'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export default function DocumentUpload({ applicationId }: { applicationId: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [linking, setLinking] = useState(false)
  const [url, setUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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

    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${applicationId}/${Date.now()}-${safe}`

    const up = await supabase.storage.from('application-docs').upload(path, file)
    if (up.error) { setError(up.error.message); setBusy(false); return }

    const ins = await recordDocument({ applicationId, name: file.name, path, size: file.size, mimeType: file.type || null })
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

    const ins = await recordDocument({ applicationId, name: href.replace(/^https?:\/\//i, '').slice(0, 80), linkUrl: href })
    if (ins.error) { setError(ins.error); setBusy(false); return }

    setBusy(false); setLinking(false); setUrl('')
    router.refresh()
  }

  return (
    <div>
      {linking ? (
        <div className="flex items-center gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} autoFocus disabled={busy} placeholder="Paste a link…"
            onKeyDown={(e) => { if (e.key === 'Enter') saveLink(); if (e.key === 'Escape') { setLinking(false); setError('') } }}
            className="text-sm px-3 py-2 rounded-xl outline-none w-56" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
          <button onClick={saveLink} disabled={busy || !url.trim()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Add link
          </button>
          <button onClick={() => { setLinking(false); setError('') }} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input ref={inputRef} id="doc-upload" type="file" onChange={onFile} disabled={busy} className="hidden" />
          <label htmlFor="doc-upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)', opacity: busy ? 0.6 : 1 }}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {busy ? 'Uploading…' : 'Upload document'}
          </label>
          <button onClick={() => { setLinking(true); setError('') }} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#F1F5F9', color: '#40916C' }}>
            <Link2 className="w-4 h-4" /> Add link
          </button>
        </div>
      )}
      <p className="text-[11px] mt-1.5" style={{ color: '#94A3B8' }}>Files up to 5 MB, or attach a link.</p>
      {error && (
        <p className="flex items-center gap-1.5 text-xs mt-2" style={{ color: '#E53E3E' }}>
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  )
}
