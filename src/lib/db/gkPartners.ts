import { createClient } from '@/lib/supabase/server'
import { GK_GROUP_META, GK_PARTNER_GROUPS, type GkPartnerGroup } from '@/lib/data/greenKeyPartners'

export { GK_GROUP_META, GK_PARTNER_GROUPS } from '@/lib/data/greenKeyPartners'
export type { GkPartnerGroup, GkPartner } from '@/lib/data/greenKeyPartners'

export interface GkWallPartner {
  id: string
  group_id: string
  name: string | null
  logo_url: string
  sort_order: number
  active: boolean
}

// Group flat DB rows into the fixed category order for rendering.
function groupRows(rows: GkWallPartner[]): GkPartnerGroup[] {
  return GK_GROUP_META.map((g) => ({
    id: g.id,
    title_en: g.title_en,
    title_ar: g.title_ar,
    partners: rows
      .filter((r) => r.group_id === g.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => ({ id: r.id, name: r.name ?? '', logo: r.logo_url, active: r.active })),
  })).filter((g) => g.partners.length > 0)
}

async function fetchRows(includeHidden: boolean): Promise<GkWallPartner[] | null> {
  const supabase = createClient()
  let q = supabase.from('gk_partners').select('id, group_id, name, logo_url, sort_order, active').order('sort_order')
  if (!includeHidden) q = q.eq('active', true)
  const { data, error } = await q
  if (error) return null // table missing / not migrated yet
  return (data ?? []) as GkWallPartner[]
}

// Public wall: DB rows if seeded, otherwise the built-in hardcoded list.
export async function getPublicGkGroups(): Promise<GkPartnerGroup[]> {
  const rows = await fetchRows(false)
  if (!rows || rows.length === 0) return GK_PARTNER_GROUPS
  return groupRows(rows)
}

// Back office: all rows grouped (incl. hidden); `seeded` says whether the DB
// has taken over from the built-in list yet.
export async function getAllGkGroups(): Promise<{ seeded: boolean; groups: GkPartnerGroup[] }> {
  const rows = await fetchRows(true)
  if (!rows || rows.length === 0) return { seeded: false, groups: [] }
  return { seeded: true, groups: groupRows(rows) }
}
