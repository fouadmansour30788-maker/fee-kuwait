'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function requireOperator() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' as const }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' as const }
  return { ok: true as const }
}

const str = (v: FormDataEntryValue | null) => (v?.toString().trim() || null)

function revalidatePublic() {
  revalidatePath('/'); revalidatePath('/contact'); revalidatePath('/partners'); revalidatePath('/settings')
}

// ── Contact / site settings ───────────────────────────────────────────
export async function saveSiteSettings(formData: FormData): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const admin = createAdminClient()
  const { error } = await admin.from('site_settings').upsert({
    id: 'default',
    contact_email: str(formData.get('contact_email')),
    contact_phone: str(formData.get('contact_phone')),
    contact_person: str(formData.get('contact_person')),
    whatsapp: str(formData.get('whatsapp')),
    address_en: str(formData.get('address_en')),
    address_ar: str(formData.get('address_ar')),
    hours_en: str(formData.get('hours_en')),
    hours_ar: str(formData.get('hours_ar')),
    instagram: str(formData.get('instagram')),
    x_url: str(formData.get('x_url')),
    linkedin: str(formData.get('linkedin')),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })
  if (error) return { error: error.message }
  revalidatePublic()
  return { ok: true }
}

// ── Impact page ───────────────────────────────────────────────────────
export async function saveImpactSettings(impact: unknown): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const admin = createAdminClient()
  const { error } = await admin.from('site_settings').upsert(
    { id: 'default', impact, updated_at: new Date().toISOString() },
    { onConflict: 'id' },
  )
  if (error) return { error: error.message }
  revalidatePath('/impact'); revalidatePath('/settings')
  return { ok: true }
}

export async function saveTestimonials(testimonials: unknown): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const admin = createAdminClient()
  const { error } = await admin.from('site_settings').upsert(
    { id: 'default', testimonials, updated_at: new Date().toISOString() },
    { onConflict: 'id' },
  )
  if (error) return { error: error.message }
  revalidatePath('/'); revalidatePath('/settings')
  return { ok: true }
}

// ── Partners ──────────────────────────────────────────────────────────
export async function savePartner(formData: FormData): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const name_en = str(formData.get('name_en'))
  if (!name_en) return { error: 'Name is required.' }
  const type = (formData.get('type')?.toString() || 'government')
  if (!['government', 'corporate', 'institutional'].includes(type)) return { error: 'Invalid type.' }

  const admin = createAdminClient()

  // If a logo image was uploaded, store it in the public site-assets bucket and
  // use its public URL; otherwise fall back to the (optional) logo URL field.
  let logo_url = str(formData.get('logo_url'))
  const file = formData.get('logo_file')
  if (file instanceof File && file.size > 0) {
    if (file.size > 3 * 1024 * 1024) return { error: 'Logo must be 3 MB or smaller.' }
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png'
    const path = `partners/${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await admin.storage.from('site-assets').upload(path, file, {
      contentType: file.type || 'image/png', upsert: true,
    })
    if (upErr) return { error: `Logo upload failed: ${upErr.message}` }
    logo_url = admin.storage.from('site-assets').getPublicUrl(path).data.publicUrl
  }

  const fields = {
    name_en,
    name_ar: str(formData.get('name_ar')),
    type,
    logo_url,
    initials: str(formData.get('initials')),
    color: str(formData.get('color')) || '#40916C',
    desc_en: str(formData.get('desc_en')),
    desc_ar: str(formData.get('desc_ar')),
    website: str(formData.get('website')),
    sort_order: Number(formData.get('sort_order')) || 0,
    active: formData.get('active') === 'on' || formData.get('active') === 'true',
    updated_at: new Date().toISOString(),
  }
  const id = str(formData.get('id'))
  const { error } = id
    ? await admin.from('partners').update(fields).eq('id', id)
    : await admin.from('partners').insert(fields)
  if (error) return { error: error.message }
  revalidatePublic()
  return { ok: true }
}

export async function deletePartner(id: string): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const { error } = await createAdminClient().from('partners').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePublic()
  return { ok: true }
}

// Move a partner up/down by swapping sort_order with its neighbour.
export async function reorderPartner(id: string, direction: 'up' | 'down'): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const admin = createAdminClient()
  const { data: rows } = await admin.from('partners').select('id, sort_order').order('sort_order').order('created_at')
  if (!rows) return { error: 'Could not load partners.' }
  const idx = rows.findIndex((r) => r.id === id)
  const swap = direction === 'up' ? idx - 1 : idx + 1
  if (idx < 0 || swap < 0 || swap >= rows.length) return { ok: true }
  const a = rows[idx], b = rows[swap]
  await admin.from('partners').update({ sort_order: b.sort_order }).eq('id', a.id)
  await admin.from('partners').update({ sort_order: a.sort_order }).eq('id', b.id)
  revalidatePublic()
  return { ok: true }
}
