import { createClient } from '@/lib/supabase/server'
import { DEFAULT_IMPACT, type ImpactSettings } from '@/lib/impact'

export type { ImpactSettings } from '@/lib/impact'
export { DEFAULT_IMPACT } from '@/lib/impact'

export async function getImpactSettings(): Promise<ImpactSettings> {
  const supabase = createClient()
  const { data } = await supabase.from('site_settings').select('impact').eq('id', 'default').maybeSingle()
  const raw = data?.impact as Partial<ImpactSettings> | null | undefined
  if (!raw) return DEFAULT_IMPACT
  return {
    heroStats: Array.isArray(raw.heroStats) && raw.heroStats.length ? raw.heroStats : DEFAULT_IMPACT.heroStats,
    growth: Array.isArray(raw.growth) && raw.growth.length ? raw.growth : DEFAULT_IMPACT.growth,
    countries: raw.countries ?? DEFAULT_IMPACT.countries,
    memberOrgs: raw.memberOrgs ?? DEFAULT_IMPACT.memberOrgs,
    established: raw.established ?? DEFAULT_IMPACT.established,
  }
}
