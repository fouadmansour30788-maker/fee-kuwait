import { createClient } from '@/lib/supabase/server'
import { DEFAULT_SETTINGS, type SiteSettings } from '@/lib/siteSettings'

export type { SiteSettings } from '@/lib/siteSettings'
export { DEFAULT_SETTINGS } from '@/lib/siteSettings'

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient()
  const { data } = await supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle()
  if (!data) return DEFAULT_SETTINGS
  return {
    contact_email: data.contact_email ?? DEFAULT_SETTINGS.contact_email,
    contact_phone: data.contact_phone ?? DEFAULT_SETTINGS.contact_phone,
    contact_person: data.contact_person ?? DEFAULT_SETTINGS.contact_person,
    whatsapp: data.whatsapp ?? DEFAULT_SETTINGS.whatsapp,
    address_en: data.address_en ?? DEFAULT_SETTINGS.address_en,
    address_ar: data.address_ar ?? DEFAULT_SETTINGS.address_ar,
    hours_en: data.hours_en ?? DEFAULT_SETTINGS.hours_en,
    hours_ar: data.hours_ar ?? DEFAULT_SETTINGS.hours_ar,
    instagram: data.instagram ?? null,
    x_url: data.x_url ?? null,
    linkedin: data.linkedin ?? null,
  }
}
