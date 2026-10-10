import { createAdminClient } from '@/lib/supabase/admin'
import { academicYearOf, shortAcademicYear } from '@/lib/academicYear'
import { getEcoThemes } from '@/lib/db/ecoThemes'

// Eco-Schools academic years. Service role, like the other Eco board loaders —
// callers only pass applications the viewer can already open. Before migration
// 054 the columns don't exist: every application then reads as an open year
// derived from its creation date, so nothing is locked by mistake.

export interface YearInfo { academicYear: string; closedAt: string | null }

export async function getYearInfo(applicationId: string): Promise<YearInfo | null> {
  const admin = createAdminClient()
  const { data, error } = await admin.from('applications').select('programme, submitted_at, academic_year, year_closed_at').eq('id', applicationId).maybeSingle()
  if (error) {
    const { data: base } = await admin.from('applications').select('programme, submitted_at').eq('id', applicationId).maybeSingle()
    return base?.programme === 'eco-schools' ? { academicYear: academicYearOf(base.submitted_at ?? undefined), closedAt: null } : null
  }
  if (!data || data.programme !== 'eco-schools') return null
  return { academicYear: data.academic_year ?? academicYearOf(data.submitted_at ?? undefined), closedAt: data.year_closed_at ?? null }
}

// True when the application belongs to a closed academic year (read-only for the school).
export async function isYearClosed(applicationId: string): Promise<boolean> {
  return !!(await getYearInfo(applicationId))?.closedAt
}

export interface SchoolYear { id: string; academicYear: string; status: string; closedAt: string | null }

// All Eco-Schools academic years of the applicant, newest first.
export async function listSchoolYears(applicantId: string): Promise<SchoolYear[]> {
  const admin = createAdminClient()
  let rows: { id: string; status: string; submitted_at: string | null; academic_year?: string | null; year_closed_at?: string | null }[] = []
  const full = await admin.from('applications').select('id, status, submitted_at, academic_year, year_closed_at')
    .eq('applicant_id', applicantId).eq('programme', 'eco-schools')
  if (full.error) {
    const base = await admin.from('applications').select('id, status, submitted_at').eq('applicant_id', applicantId).eq('programme', 'eco-schools')
    rows = base.data ?? []
  } else rows = full.data ?? []
  return rows.map((r) => ({
    id: r.id, status: r.status, closedAt: r.year_closed_at ?? null,
    academicYear: r.academic_year ?? academicYearOf(r.submitted_at ?? undefined),
  })).sort((a, b) => b.academicYear.localeCompare(a.academicYear))
}

// Themes the school worked on in academic years before this one → that year
// (short form, most recent wins), to mark them in the new year's theme picker.
export async function previousYearThemes(applicantId: string, applicationId: string): Promise<Record<string, string>> {
  const years = await listSchoolYears(applicantId)
  const current = years.find((y) => y.id === applicationId)
  if (!current) return {}
  const earlier = years.filter((y) => y.academicYear < current.academicYear).reverse() // oldest → newest
  const out: Record<string, string> = {}
  for (const y of earlier) for (const t of await getEcoThemes(y.id)) out[t] = shortAcademicYear(y.academicYear)
  return out
}
