'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB per image

// Upload images from the computer to the public site-assets bucket (staff may
// write there — migration 049) and hand back their public URLs.
async function uploadImages(files: File[]): Promise<{ urls: string[]; error?: string }> {
  const supabase = createClient()
  const urls: string[] = []
  for (const file of files) {
    if (!file.type.startsWith('image/')) return { urls, error: `${file.name} is not an image.` }
    if (file.size > MAX_BYTES) return { urls, error: `${file.name} is larger than 10 MB.` }
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `news/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('site-assets').upload(path, file, { contentType: file.type })
    if (error) return { urls, error: `Upload failed: ${error.message}` }
    urls.push(supabase.storage.from('site-assets').getPublicUrl(path).data.publicUrl)
  }
  return { urls }
}

export function ImageUploadButton({ onUploaded, multiple = false, label }: { onUploaded: (urls: string[]) => void; multiple?: boolean; label?: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setBusy(true); setError('')
    const r = await uploadImages(files)
    setBusy(false)
    if (r.urls.length) onUploaded(r.urls)
    if (r.error) setError(r.error)
    e.target.value = ''
  }

  return (
    <span className="inline-flex items-center gap-2 flex-shrink-0">
      <input ref={ref} type="file" accept="image/*" multiple={multiple} onChange={onChange} className="hidden" />
      <button type="button" onClick={() => ref.current?.click()} disabled={busy}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap disabled:opacity-60"
        style={{ background: '#ECFDF3', color: '#047857', border: '1px solid #A7F3D0' }}>
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {busy ? 'Uploading…' : label ?? (multiple ? 'Upload photos' : 'Upload photo')}
      </button>
      {error && <span className="text-[11px]" style={{ color: '#DC2626' }}>{error}</span>}
    </span>
  )
}

export function Thumb({ url }: { url: string }) {
  if (!/^https?:\/\//i.test(url)) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-16 w-24 object-cover rounded-lg border" style={{ borderColor: '#E2E8F0' }} />
}

// Article cover image: paste a URL or upload from the computer.
export function CoverImageField({ value }: { value?: string | null }) {
  const [url, setUrl] = useState(value ?? '')
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Cover image</label>
      <div className="flex items-center gap-2">
        <input name="image_url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… or upload"
          className="w-full min-w-0 text-sm px-3 py-2.5 rounded-xl outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
        <ImageUploadButton onUploaded={(u) => setUrl(u[0])} label="Upload" />
      </div>
      {url && <div className="mt-2"><Thumb url={url} /></div>}
    </div>
  )
}
