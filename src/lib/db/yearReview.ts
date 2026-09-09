import { canonGovKey } from '@/lib/db/certificates'

export interface YearReview {
  year: number
  newThisYear: number
  totalCertifiedNow: number
  programmesActive: number
  governoratesCovered: number
  byMonth: number[]            // 12 entries — new certificates issued per month
  byProgramme: { programme: string; count: number }[]
  byGovKey: Record<string, { total: number; schools: number; establishments: number }>
  newlyCertified: { name: string | null; programme: string; governorate: string | null; issuedAt: string; category: string | null }[]
  firstEverYear: number | null // the year the first certificate was ever issued
  cumulativeToDate: number     // total certificates ever issued up to end of this year
}

// Aggregates a full "year in review" from the certificates issued in a given
// calendar year (service role, non-sensitive fields only). Powers the public
// year-in-review scroll-story.
export async function getYearInReview(year: number): Promise<YearReview> {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  const start = new Date(Date.UTC(year, 0, 1)).toISOString()
  const end = new Date(Date.UTC(year + 1, 0, 1)).toISOString()
  const now = Date.now()

  const { data: allCerts } = await admin
    .from('certificates')
    .select('certificate_number, programme, issued_at, expires_at, status, application_id')
  const certs = (allCerts ?? []).filter((c) => c.issued_at)

  const newThis = certs.filter((c) => c.issued_at >= start && c.issued_at < end)
  const activeNow = certs.filter((c) => c.status === 'active' && (!c.expires_at || new Date(c.expires_at).getTime() >= now))
  const firstEver = certs.reduce<string | null>((min, c) => (!min || c.issued_at < min ? c.issued_at : min), null)
  const cumulativeToDate = certs.filter((c) => c.issued_at < end).length

  // Resolve names/governorates for the year's new certificates (bulk join).
  const appIds = Array.from(new Set(newThis.map((c) => c.application_id)))
  const { data: apps } = appIds.length
    ? await admin.from('applications').select('id, entity_type, entity_id').in('id', appIds)
    : { data: [] as { id: string; entity_type: string | null; entity_id: string | null }[] }
  const appById = new Map((apps ?? []).map((a) => [a.id, a]))
  const bizIds = (apps ?? []).filter((a) => a.entity_type !== 'school' && a.entity_id).map((a) => a.entity_id as string)
  const schIds = (apps ?? []).filter((a) => a.entity_type === 'school' && a.entity_id).map((a) => a.entity_id as string)
  const [{ data: biz }, { data: sch }] = await Promise.all([
    bizIds.length ? admin.from('businesses').select('id, name_en, governorate, type').in('id', bizIds) : Promise.resolve({ data: [] as { id: string; name_en: string | null; governorate: string | null; type: string | null }[] }),
    schIds.length ? admin.from('schools').select('id, name_en, governorate').in('id', schIds) : Promise.resolve({ data: [] as { id: string; name_en: string | null; governorate: string | null }[] }),
  ])
  const bizById = new Map((biz ?? []).map((b) => [b.id, b]))
  const schById = new Map((sch ?? []).map((s) => [s.id, s]))

  const byMonth = Array(12).fill(0) as number[]
  const progCount: Record<string, number> = {}
  const byGovKey: Record<string, { total: number; schools: number; establishments: number }> = {}
  const newlyCertified: YearReview['newlyCertified'] = []

  for (const c of newThis) {
    byMonth[new Date(c.issued_at).getUTCMonth()]++
    progCount[c.programme] = (progCount[c.programme] ?? 0) + 1
    const app = appById.get(c.application_id)
    const isSchool = app?.entity_type === 'school'
    const ent = isSchool ? schById.get(app?.entity_id ?? '') : bizById.get(app?.entity_id ?? '')
    const governorate = ent?.governorate ?? null
    const gk = canonGovKey(governorate)
    if (!byGovKey[gk]) byGovKey[gk] = { total: 0, schools: 0, establishments: 0 }
    byGovKey[gk].total++
    if (isSchool) byGovKey[gk].schools++; else byGovKey[gk].establishments++
    newlyCertified.push({
      name: ent?.name_en ?? null, programme: c.programme, governorate,
      category: isSchool ? 'School' : ((ent as { type?: string | null })?.type ?? null),
      issuedAt: c.issued_at,
    })
  }

  return {
    year,
    newThisYear: newThis.length,
    totalCertifiedNow: activeNow.length,
    programmesActive: Object.keys(progCount).length,
    governoratesCovered: Object.values(byGovKey).filter((g) => g.total > 0).length,
    byMonth,
    byProgramme: Object.entries(progCount).map(([programme, count]) => ({ programme, count })).sort((a, b) => b.count - a.count),
    byGovKey,
    newlyCertified: newlyCertified.sort((a, b) => a.issuedAt.localeCompare(b.issuedAt)),
    firstEverYear: firstEver ? new Date(firstEver).getUTCFullYear() : null,
    cumulativeToDate,
  }
}
