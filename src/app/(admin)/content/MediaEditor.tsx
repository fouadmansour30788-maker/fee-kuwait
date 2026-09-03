'use client'

import { useState } from 'react'
import { Image as ImageIcon, Film, LinkIcon, GalleryHorizontal, Plus, Trash2, GripVertical } from 'lucide-react'
import type { MediaItem, MediaType } from '@/lib/db/news'

const TYPES: { type: MediaType; label: string; Icon: React.ElementType; hint: string }[] = [
  { type: 'image',     label: 'Photo',     Icon: ImageIcon,          hint: 'Image URL (https://…)' },
  { type: 'video',     label: 'Video',     Icon: Film,               hint: 'YouTube / Vimeo / .mp4 URL' },
  { type: 'link',      label: 'Link',      Icon: LinkIcon,           hint: 'Destination URL (https://…)' },
  { type: 'slideshow', label: 'Slideshow', Icon: GalleryHorizontal,  hint: 'One image URL per line' },
]
const META = Object.fromEntries(TYPES.map((t) => [t.type, t])) as Record<MediaType, typeof TYPES[number]>

const inputCls = 'w-full text-sm px-3 py-2 rounded-lg outline-none'
const inputStyle = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

export default function MediaEditor({ initial }: { initial: MediaItem[] }) {
  const [items, setItems] = useState<MediaItem[]>(initial ?? [])

  const add = (type: MediaType) =>
    setItems((xs) => [...xs, type === 'slideshow' ? { type, urls: [] } : { type, url: '' }])
  const remove = (i: number) => setItems((xs) => xs.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) =>
    setItems((xs) => {
      const j = i + dir
      if (j < 0 || j >= xs.length) return xs
      const next = [...xs]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  const patch = (i: number, p: Partial<MediaItem>) =>
    setItems((xs) => xs.map((it, idx) => (idx === i ? { ...it, ...p } : it)))

  return (
    <div className="space-y-3">
      {/* Serialized value the server action reads */}
      <input type="hidden" name="media" value={JSON.stringify(items)} />

      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold" style={{ color: '#475569' }}>Media attachments</label>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map(({ type, label, Icon }) => (
            <button key={type} type="button" onClick={() => add(type)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ background: '#F1F5F9', color: '#334155' }}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 && (
        <p className="text-xs px-3 py-4 rounded-xl text-center" style={{ background: '#F8FAFC', color: '#94A3B8', border: '1px dashed #E2E8F0' }}>
          No media yet. Add a photo, video, link, or slideshow with the buttons above.
        </p>
      )}

      {items.map((it, i) => {
        const { label, Icon, hint } = META[it.type as MediaType] ?? META.link
        return (
          <div key={i} className="rounded-xl p-3 space-y-2.5" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2">
              <div className="flex flex-col -my-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  className="p-0.5 disabled:opacity-25" style={{ color: '#94A3B8' }} title="Move up"><GripVertical className="w-3.5 h-3.5" /></button>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md" style={{ background: '#E2E8F0', color: '#334155' }}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </span>
              <div className="flex-1" />
              <button type="button" onClick={() => remove(i)} className="p-1.5 rounded-lg" style={{ color: '#DC2626' }} title="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {it.type === 'slideshow' ? (
              <textarea
                value={(it.urls ?? []).join('\n')}
                onChange={(e) => patch(i, { urls: e.target.value.split('\n') })}
                rows={3} placeholder={hint}
                className={inputCls + ' resize-y font-mono text-[13px]'} style={inputStyle} />
            ) : (
              <input
                value={it.url ?? ''}
                onChange={(e) => patch(i, { url: e.target.value })}
                placeholder={hint} className={inputCls} style={inputStyle} />
            )}

            <div className="grid sm:grid-cols-2 gap-2">
              {it.type === 'link' && (
                <input value={it.title ?? ''} onChange={(e) => patch(i, { title: e.target.value })}
                  placeholder="Link title (optional)" className={inputCls} style={inputStyle} />
              )}
              <input value={it.caption ?? ''} onChange={(e) => patch(i, { caption: e.target.value })}
                placeholder="Caption (optional)" className={inputCls + (it.type === 'link' ? '' : ' sm:col-span-2')} style={inputStyle} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
