'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Upload, Link2, Loader2, Trash2, Eye, EyeOff, FileText, ExternalLink, AlertCircle, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createResource, setResourcePublished, deleteResource } from '@/lib/actions/resources'
import { RESOURCE_PROGRAMMES, RESOURCE_CATEGORIES, programmeLabel, type ResourceItem } from '@/lib/resources'

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB
const field = 'w-full text-sm px-3 py-2 rounded-xl outline-none bg-white'
const fieldStyle = { border: '1px solid #E2E8F0', color: '#1E293B' } as const
const fmtSize = (n: number | null) => (n == null ? '' : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

// Operator: add guides, toolkits, templates and links per programme (or for all
// programmes); publish/unpublish or remove them. Members see the published ones.
export default function ResourceManager({ resources }: { resources: ResourceItem[] }) {
  const [adding, setAdding] = useState(false)
  const [mode, setMode] = useState<'file' | 'link'>('file')
  const [form, setForm] = useState({ titleEn: '', titleAr: '', descriptionEn: '', programme: '', language: 'both' as 'en' | 'ar' | 'both', category: '', link: '' })
  const [file, setFile] = useState<File | null>(null)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, start] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const shown = useMemo(() => resources.filter((r) => filter === 'all' || (filter === 'general' ? !r.programme : r.programme === filter)), [resources, filter])

  function reset() {
    setForm({ titleEn: '', titleAr: '', descriptionEn: '', programme: '', language: 'both', category: '', link: '' })
    setFile(null); setMode('file'); setError(''); setAdding(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function save() {
    setError('')
    if (!form.titleEn.trim()) return setError('Add a title.')
    if (mode === 'file' && !file) return setError('Choose a file to upload.')
    if (mode === 'link' && !form.link.trim()) return setError('Add a link.')
    setBusy(true)
    let path: string | null = null
    if (mode === 'file' && file) {
      if (file.size > MAX_BYTES) { setBusy(false); return setError('File exceeds 50 MB — add it as a link instead (e.g. Drive / YouTube).') }
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      path = `${form.programme || 'all'}/${Date.now()}-${safe}`
      const up = await createClient().storage.from('programme-resources').upload(path, file)
      if (up.error) { setBusy(false); return setError(up.error.message.includes('Bucket') ? 'Run migration 055 (programme resources) first.' : up.error.message) }
    }
    const r = await createResource({
      titleEn: form.titleEn, titleAr: form.titleAr, descriptionEn: form.descriptionEn,
      programme: form.programme || null, language: form.language, category: form.category,
      path, linkUrl: mode === 'link' ? form.link : null,
      fileType: file ? (file.name.split('.').pop() ?? '').toUpperCase() : null, fileSize: file?.size ?? null,
    })
    setBusy(false)
    if (r.error) return setError(r.error)
    reset(); router.refresh()
  }

  const act = (fn: () => Promise<{ error?: string }>) => start(async () => { const r = await fn(); if (r.error) setError(r.error); else router.refresh() })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {[{ id: 'all', label: 'All' }, { id: 'general', label: 'All-programme' }, ...RESOURCE_PROGRAMMES].map((p) => (
          <button key={p.id} onClick={() => setFilter(p.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={filter === p.id ? { background: '#1B4332', color: '#fff' } : { background: '#F1F5F9', color: '#475569' }}>{p.label}</button>
        ))}
        {!adding && (
          <button onClick={() => setAdding(true)} className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            <Plus className="w-4 h-4" /> Add resource
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: '#B7E4C7', background: '#F7FCF8' }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} placeholder="Title (English) *" className={field} style={fieldStyle} />
            <input value={form.titleAr} onChange={(e) => set('titleAr', e.target.value)} placeholder="العنوان (عربي)" dir="rtl" className={field} style={fieldStyle} />
          </div>
          <textarea value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} rows={2} placeholder="Short description (optional)" className={`${field} resize-none`} style={fieldStyle} />
          <div className="grid sm:grid-cols-3 gap-3">
            <select value={form.programme} onChange={(e) => set('programme', e.target.value)} className={field} style={fieldStyle}>
              <option value="">All programmes</option>
              {RESOURCE_PROGRAMMES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={field} style={fieldStyle}>
              <option value="">Category…</option>
              {RESOURCE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.language} onChange={(e) => set('language', e.target.value)} className={field} style={fieldStyle}>
              <option value="both">English &amp; Arabic</option>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {(['file', 'link'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={mode === m ? { background: '#40916C', color: '#fff' } : { background: '#fff', color: '#475569', border: '1px solid #E2E8F0' }}>
                {m === 'file' ? <Upload className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />} {m === 'file' ? 'Upload file' : 'Add link'}
              </button>
            ))}
          </div>
          {mode === 'file'
            ? <input ref={fileRef} type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
            : <input value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="https://…" className={field} style={fieldStyle} />}

          <div className="flex items-center gap-2 pt-1">
            <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#1B4332' }}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save &amp; publish
            </button>
            <button onClick={reset} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#F1F5F9', color: '#334155' }}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#DC2626' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}

      <div className="rounded-2xl border divide-y" style={{ borderColor: '#E2E8F0' }}>
        {shown.length === 0 && <p className="px-4 py-8 text-center text-sm" style={{ color: '#94A3B8' }}>No resources yet — add the first one.</p>}
        {shown.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3" style={{ opacity: r.published ? 1 : 0.55 }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
              {r.path ? <FileText className="w-4 h-4" style={{ color: '#40916C' }} /> : <ExternalLink className="w-4 h-4" style={{ color: '#2563EB' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <a href={`/api/resources/${r.id}`} target="_blank" rel="noopener" className="text-sm font-semibold hover:underline" style={{ color: '#0F172A' }}>{r.title_en}</a>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {programmeLabel(r.programme)}{r.category ? ` · ${r.category}` : ''} · {r.language === 'both' ? 'EN & AR' : r.language.toUpperCase()}
                {r.file_size ? ` · ${fmtSize(r.file_size)}` : ''} · {r.downloads} open{r.downloads === 1 ? '' : 's'}{r.published ? '' : ' · hidden'}
              </p>
            </div>
            <button onClick={() => act(() => setResourcePublished(r.id, !r.published))} disabled={pending} title={r.published ? 'Hide from members' : 'Publish'}
              className="p-2 rounded-lg hover:bg-slate-100" style={{ color: '#475569' }}>
              {r.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <DeleteButton onConfirm={() => act(() => deleteResource(r.id))} disabled={pending} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Two-click delete (the viewer can't show confirm dialogs reliably).
function DeleteButton({ onConfirm, disabled }: { onConfirm: () => void; disabled: boolean }) {
  const [sure, setSure] = useState(false)
  return sure ? (
    <span className="inline-flex items-center gap-1">
      <button onClick={onConfirm} disabled={disabled} className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: '#FEE2E2', color: '#B91C1C' }}>Delete</button>
      <button onClick={() => setSure(false)} className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: '#F1F5F9', color: '#475569' }}>Keep</button>
    </span>
  ) : (
    <button onClick={() => setSure(true)} disabled={disabled} title="Delete" className="p-2 rounded-lg hover:bg-red-50" style={{ color: '#B91C1C' }}>
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
