// Client-safe impact-page content type + defaults (no server imports).

export interface ImpactStat { target: number; suffix: string; label_en: string; label_ar: string }
export interface GrowthPoint { year: number; certified: number }

export interface ImpactSettings {
  heroStats: ImpactStat[]         // the four headline counters
  growth: GrowthPoint[]           // the growth chart, year → certified establishments
  countries: string               // global-context tiles
  memberOrgs: string
  established: string
}

// Defaults mirror the values currently on the impact page.
export const DEFAULT_IMPACT: ImpactSettings = {
  heroStats: [
    { target: 23, suffix: '', label_en: 'Certified Establishments', label_ar: 'منشأة معتمدة' },
    { target: 6, suffix: '', label_en: 'Programmes Offered', label_ar: 'برامج متاحة' },
    { target: 100, suffix: '+', label_en: 'Countries Connected', label_ar: 'دولة متصلة' },
    { target: 110, suffix: '+', label_en: 'Global Member Orgs', label_ar: 'منظمة عضو عالمياً' },
  ],
  growth: [
    { year: 2023, certified: 0 },
    { year: 2024, certified: 9 },
    { year: 2025, certified: 15 },
    { year: 2026, certified: 23 },
  ],
  countries: '100+',
  memberOrgs: '110+',
  established: '1981',
}

// Fixed accent colours applied to the hero counters by index.
export const IMPACT_STAT_COLORS = ['#40916C', '#52B788', '#006994', '#C8A951']
