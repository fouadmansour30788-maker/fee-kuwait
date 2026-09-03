'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { can } from '@/lib/permissions-server'

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60) || 'article'
}
const str = (v: FormDataEntryValue | null) => (v?.toString().trim() || null)

type MediaItem = { type: string; url?: string; urls?: string[]; title?: string; caption?: string }
const ALLOWED_MEDIA = new Set(['image', 'video', 'link', 'slideshow'])

// Parse + sanitise the media JSON coming from the editor. Drops empty/invalid items.
function parseMedia(raw: FormDataEntryValue | null): MediaItem[] {
  if (!raw) return []
  let arr: unknown
  try { arr = JSON.parse(raw.toString()) } catch { return [] }
  if (!Array.isArray(arr)) return []
  const out: MediaItem[] = []
  for (const it of arr) {
    if (!it || typeof it !== 'object') continue
    const m = it as Record<string, unknown>
    const type = String(m.type ?? '')
    if (!ALLOWED_MEDIA.has(type)) continue
    const title = typeof m.title === 'string' ? m.title.trim() : ''
    const caption = typeof m.caption === 'string' ? m.caption.trim() : ''
    if (type === 'slideshow') {
      const urls = Array.isArray(m.urls) ? m.urls.map((u) => String(u).trim()).filter(Boolean) : []
      if (urls.length === 0) continue
      out.push({ type, urls, ...(title && { title }), ...(caption && { caption }) })
    } else {
      const url = typeof m.url === 'string' ? m.url.trim() : ''
      if (!url) continue
      out.push({ type, url, ...(title && { title }), ...(caption && { caption }) })
    }
  }
  return out
}

export async function saveArticle(formData: FormData) {
  if (!(await can('manage_content'))) return
  const supabase = createClient()
  const id = str(formData.get('id'))
  const title_en = str(formData.get('title_en'))
  if (!title_en) return
  const status = str(formData.get('status')) ?? 'draft'

  const fields = {
    title_en,
    title_ar: str(formData.get('title_ar')),
    excerpt_en: str(formData.get('excerpt_en')),
    excerpt_ar: str(formData.get('excerpt_ar')),
    body_en: str(formData.get('body_en')),
    body_ar: str(formData.get('body_ar')),
    image_url: str(formData.get('image_url')),
    media: parseMedia(formData.get('media')),
    programme: str(formData.get('programme')),
    status,
    published_at: status === 'published' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }

  if (id) {
    await supabase.from('news_articles').update(fields).eq('id', id)
  } else {
    const slug = `${slugify(title_en)}-${Date.now().toString(36).slice(-4)}`
    await supabase.from('news_articles').insert({ ...fields, slug })
  }

  revalidatePath('/content')
  revalidatePath('/news')
  redirect('/content')
}

export async function deleteArticle(id: string) {
  if (!(await can('manage_content'))) return
  const supabase = createClient()
  await supabase.from('news_articles').delete().eq('id', id)
  revalidatePath('/content')
  revalidatePath('/news')
  redirect('/content')
}
