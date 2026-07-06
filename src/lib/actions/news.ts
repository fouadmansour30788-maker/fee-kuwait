'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60) || 'article'
}
const str = (v: FormDataEntryValue | null) => (v?.toString().trim() || null)

export async function saveArticle(formData: FormData) {
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
  const supabase = createClient()
  await supabase.from('news_articles').delete().eq('id', id)
  revalidatePath('/content')
  revalidatePath('/news')
  redirect('/content')
}
