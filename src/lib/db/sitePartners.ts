import { createClient } from '@/lib/supabase/server'
import { PARTNERS_DATA } from '@/lib/data/partners'

export interface DbPartner {
  id: string
  name_en: string
  name_ar: string | null
  type: string
  logo_url: string | null
  initials: string | null
  color: string | null
  desc_en: string | null
  desc_ar: string | null
  website: string | null
  sort_order: number
  active: boolean
}

const COLS = 'id, name_en, name_ar, type, logo_url, initials, color, desc_en, desc_ar, website, sort_order, active'

// Static fallback (the original hard-coded set) if the table is empty/missing.
function fallback(): DbPartner[] {
  return PARTNERS_DATA.map((p, i) => ({
    id: `static-${i}`, name_en: p.name_en, name_ar: p.name_ar, type: p.type,
    logo_url: p.logo_url || null, initials: p.initials, color: p.color,
    desc_en: p.desc_en, desc_ar: p.desc_ar, website: p.website, sort_order: i, active: true,
  }))
}

// Public: active partners in order (falls back to the static set if empty).
export async function listPublicPartners(): Promise<DbPartner[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('partners').select(COLS).eq('active', true).order('sort_order').order('created_at')
  if (error || !data || data.length === 0) return fallback()
  return data as DbPartner[]
}

// Operator: every partner (including inactive) for management.
export async function listAllPartners(): Promise<DbPartner[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('partners').select(COLS).order('sort_order').order('created_at')
  if (error) { console.error('listAllPartners:', error.message); return [] }
  return (data ?? []) as DbPartner[]
}
