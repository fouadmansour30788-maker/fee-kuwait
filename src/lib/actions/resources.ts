'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { RESOURCE_PROGRAMMES } from '@/lib/resources'

const BUCKET = 'programme-resources'

async function requireStaff(): Promise<{ userId: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: staff } = await supabase.rpc('is_staff')
  if (!staff) return { error: 'Not authorised' }
  return { userId: user.id }
}

function revalidate() {
  revalidatePath('/resources')
  revalidatePath('/school/resources')
  revalidatePath('/business/resources')
}

export interface NewResource {
  titleEn: string
  titleAr?: string
  descriptionEn?: string
  descriptionAr?: string
  programme: string | null
  language: 'en' | 'ar' | 'both'
  category?: string
  path?: string | null       // already uploaded to the private bucket
  linkUrl?: string | null
  fileType?: string | null
  fileSize?: number | null
}

// Operator adds a resource (an uploaded file or a link) for one programme or all.
export async function createResource(r: NewResource): Promise<{ ok?: true; error?: string }> {
  const gate = await requireStaff()
  if ('error' in gate) return gate
  if (!r.titleEn?.trim()) return { error: 'A title is required.' }
  if (r.programme && !RESOURCE_PROGRAMMES.some((p) => p.id === r.programme)) return { error: 'Unknown programme.' }
  let link = r.linkUrl?.trim() || null
  if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`
  if (!r.path && !link) return { error: 'Upload a file or add a link.' }

  const { error } = await createAdminClient().from('resources').insert({
    title_en: r.titleEn.trim(), title_ar: r.titleAr?.trim() || null,
    description_en: r.descriptionEn?.trim() || null, description_ar: r.descriptionAr?.trim() || null,
    programme: r.programme, language: r.language, category: r.category || null,
    path: r.path ?? null, file_url: link, file_type: r.fileType ?? (link ? 'link' : null), file_size: r.fileSize ?? null,
    published: true, created_by: gate.userId,
  })
  if (error) return { error: error.message.includes('path') || error.message.includes('created_by') ? 'Run migration 055 (programme resources) first.' : error.message }
  revalidate()
  return { ok: true }
}

export async function setResourcePublished(id: string, published: boolean): Promise<{ ok?: true; error?: string }> {
  const gate = await requireStaff()
  if ('error' in gate) return gate
  const { error } = await createAdminClient().from('resources').update({ published }).eq('id', id)
  if (error) return { error: error.message }
  revalidate()
  return { ok: true }
}

export async function deleteResource(id: string): Promise<{ ok?: true; error?: string }> {
  const gate = await requireStaff()
  if ('error' in gate) return gate
  const admin = createAdminClient()
  const { data: row } = await admin.from('resources').select('path').eq('id', id).maybeSingle()
  const { error } = await admin.from('resources').delete().eq('id', id)
  if (error) return { error: error.message }
  if (row?.path) await admin.storage.from(BUCKET).remove([row.path])
  revalidate()
  return { ok: true }
}
