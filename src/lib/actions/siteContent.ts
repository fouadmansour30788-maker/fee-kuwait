'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { GK_PARTNER_GROUPS, GK_GROUP_META } from '@/lib/data/greenKeyPartners'

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

// ── Green Key International logo wall ─────────────────────────────────
const GK_GROUP_IDS = GK_GROUP_META.map((g) => g.id)

function revalidateGk() {
  revalidatePath('/partners'); revalidatePath('/settings')
}

// Seed the DB wall from the built-in list (only when it's still empty).
export async function importGkDefaults(): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const admin = createAdminClient()
  const { count } = await admin.from('gk_partners').select('id', { count: 'exact', head: true })
  if ((count ?? 0) > 0) return { ok: true } // already seeded — don't duplicate
  let order = 0
  const rows = GK_PARTNER_GROUPS.flatMap((g) =>
    g.partners.map((pt) => ({ group_id: g.id, name: pt.name || null, logo_url: pt.logo, sort_order: order++, active: true })),
  )
  const { error } = await admin.from('gk_partners').insert(rows)
  if (error) return { error: error.message }
  revalidateGk()
  return { ok: true }
}

async function uploadWallLogo(file: File): Promise<{ url?: string; error?: string }> {
  if (file.size > 3 * 1024 * 1024) return { error: 'Logo must be 3 MB or smaller.' }
  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png'
  const path = `gk/${crypto.randomUUID()}.${ext}`
  const admin = createAdminClient()
  const { error } = await admin.storage.from('site-assets').upload(path, file, { contentType: file.type || 'image/png', upsert: true })
  if (error) return { error: `Logo upload failed: ${error.message}` }
  return { url: admin.storage.from('site-assets').getPublicUrl(path).data.publicUrl }
}

export async function saveGkPartner(formData: FormData): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const group_id = formData.get('group_id')?.toString() || ''
  if (!GK_GROUP_IDS.includes(group_id)) return { error: 'Invalid category.' }
  const admin = createAdminClient()

  let logo_url = str(formData.get('logo_url'))
  const file = formData.get('logo_file')
  if (file instanceof File && file.size > 0) {
    const up = await uploadWallLogo(file)
    if (up.error) return { error: up.error }
    logo_url = up.url ?? logo_url
  }

  const id = str(formData.get('id'))
  if (!id && !logo_url) return { error: 'A logo image (upload or URL) is required.' }

  if (id) {
    const fields: Record<string, unknown> = {
      group_id, name: str(formData.get('name')),
      active: formData.get('active') === 'on' || formData.get('active') === 'true',
      updated_at: new Date().toISOString(),
    }
    if (logo_url) fields.logo_url = logo_url // keep existing logo if none supplied
    const { error } = await admin.from('gk_partners').update(fields).eq('id', id)
    if (error) return { error: error.message }
  } else {
    // Append to the end of its group.
    const { data: last } = await admin.from('gk_partners').select('sort_order').eq('group_id', group_id).order('sort_order', { ascending: false }).limit(1).maybeSingle()
    const { error } = await admin.from('gk_partners').insert({
      group_id, name: str(formData.get('name')), logo_url,
      sort_order: (last?.sort_order ?? -1) + 1,
      active: formData.get('active') === 'on' || formData.get('active') === 'true',
    })
    if (error) return { error: error.message }
  }
  revalidateGk()
  return { ok: true }
}

export async function deleteGkPartner(id: string): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const { error } = await createAdminClient().from('gk_partners').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateGk()
  return { ok: true }
}

// Swap sort_order with the neighbour in the SAME group.
export async function reorderGkPartner(id: string, direction: 'up' | 'down'): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const admin = createAdminClient()
  const { data: row } = await admin.from('gk_partners').select('id, group_id, sort_order').eq('id', id).single()
  if (!row) return { error: 'Not found.' }
  const { data: siblings } = await admin.from('gk_partners').select('id, sort_order').eq('group_id', row.group_id).order('sort_order')
  if (!siblings) return { error: 'Could not load.' }
  const idx = siblings.findIndex((r) => r.id === id)
  const swap = direction === 'up' ? idx - 1 : idx + 1
  if (idx < 0 || swap < 0 || swap >= siblings.length) return { ok: true }
  const a = siblings[idx], b = siblings[swap]
  await admin.from('gk_partners').update({ sort_order: b.sort_order }).eq('id', a.id)
  await admin.from('gk_partners').update({ sort_order: a.sort_order }).eq('id', b.id)
  revalidateGk()
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
