'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { importImageFromShareLink } from '@/lib/actions/media'
import { shareSource } from '@/lib/shareLinks'

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

// Turns pasted Google Drive / OneDrive / SharePoint / Dropbox share links into a
// stored copy (share links open a viewer page, not the image).
export function useShareImport() {
  const [status, setStatus] = useState<{ busy?: boolean; ok?: string; error?: string }>({})
  async function resolve(url: string): Promise<string> {
    const src = shareSource(url)
    if (!src) return url
    setStatus({ busy: true })
    const r = await importImageFromShareLink(url.trim())
    if (r.error || !r.url) { setStatus({ error: r.error ?? 'Import failed.' }); return url }
    setStatus({ ok: `Imported from ${r.source}` })
    return r.url
  }
  async function resolveAll(urls: string[]): Promise<string[]> {
    const out: string[] = []
    for (const u of urls) out.push(u.trim() ? await resolve(u) : u)
    return out
  }
  const note = status.busy
    ? <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: '#475569' }}><Loader2 className="w-3 h-3 animate-spin" /> Importing image from share link…</span>
    : status.error ? <span className="text-[11px]" style={{ color: '#DC2626' }}>{status.error}</span>
    : status.ok ? <span className="text-[11px]" style={{ color: '#047857' }}>✓ {status.ok} — stored on the site</span> : null
  return { resolve, resolveAll, note, busy: !!status.busy }
}

export function Thumb({ url }: { url: string }) {
  if (!/^https?:\/\//i.test(url)) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-16 w-24 object-cover rounded-lg border" style={{ borderColor: '#E2E8F0' }} />
}

// Article cover image: paste a URL or upload from the computer.
export function CoverImageField({ value }: { value?: string | null }) {
  const [url, setUrl] = useState(value ?? '')
  const share = useShareImport()
  const importIfShare = async (v: string) => { if (shareSource(v)) setUrl(await share.resolve(v)) }
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Cover image</label>
      <div className="flex items-center gap-2">
        <input name="image_url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…, a Drive/OneDrive link, or upload"
          onBlur={(e) => importIfShare(e.target.value)} onPaste={(e) => { const v = e.clipboardData.getData('text'); if (shareSource(v)) { e.preventDefault(); setUrl(v); importIfShare(v) } }}
          className="w-full min-w-0 text-sm px-3 py-2.5 rounded-xl outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
        <ImageUploadButton onUploaded={(u) => setUrl(u[0])} label="Upload" />
      </div>
      {share.note && <div className="mt-1">{share.note}</div>}
      {url && !shareSource(url) && <div className="mt-2"><Thumb url={url} /></div>}
    </div>
  )
}

const mediaInput = 'w-full min-w-0 text-sm px-3 py-2 rounded-lg outline-none'
const mediaInputStyle = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

// Photo media item: URL, share link (imported), or upload — with a preview.
export function PhotoUrlField({ value, onChange, placeholder }: { value: string; onChange: (url: string) => void; placeholder: string }) {
  const share = useShareImport()
  const importIfShare = async (v: string) => { if (shareSource(v)) onChange(await share.resolve(v)) }
  return (
    <>
      <div className="flex items-center gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          onBlur={(e) => importIfShare(e.target.value)} onPaste={(e) => { const v = e.clipboardData.getData('text'); if (shareSource(v)) { e.preventDefault(); onChange(v); importIfShare(v) } }}
          className={mediaInput} style={mediaInputStyle} />
        <ImageUploadButton onUploaded={(u) => onChange(u[0])} />
      </div>
      {share.note}
      {value && !shareSource(value) && <Thumb url={value} />}
    </>
  )
}

// Slideshow media item: one URL / share link per line (share links imported on
// leaving the box), or upload several photos at once.
export function SlideshowField({ urls, onChange, placeholder }: { urls: string[]; onChange: (urls: string[]) => void; placeholder: string }) {
  const share = useShareImport()
  const clean = urls.filter((x) => x.trim())
  return (
    <>
      <textarea value={urls.join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} rows={3} placeholder={placeholder}
        onBlur={async (e) => { const lines = e.target.value.split('\n'); if (lines.some((l) => shareSource(l))) onChange(await share.resolveAll(lines)) }}
        className={mediaInput + ' resize-y font-mono text-[13px]'} style={mediaInputStyle} />
      {share.note}
      <div className="flex items-center gap-2 flex-wrap">
        <ImageUploadButton multiple onUploaded={(u) => onChange([...clean, ...u])} />
        {clean.filter((u) => !shareSource(u)).map((u, k) => <Thumb key={k} url={u} />)}
      </div>
    </>
  )
}
