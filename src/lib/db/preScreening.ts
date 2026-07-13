import { createClient } from '@/lib/supabase/server'
import type { PSAnswers } from '@/lib/data/preScreening'
import type { EstablishmentCategory } from '@/lib/data/greenKeyCriteria'

export type PSStatus = 'draft' | 'submitted' | 'eligible' | 'rejected'

export interface PreScreeningRecord {
  answers: PSAnswers
  eligible: boolean | null
  ineligibleReason: string | null
  mainCategory: EstablishmentCategory | null
  subCategories: EstablishmentCategory[]
  flags: { hasGreenArea?: boolean; lawnOver4000?: boolean; under50Employees?: boolean; externalFnbCore?: boolean }
  status: PSStatus
  submittedAt: string | null
  reviewNote: string | null
  unlockReason: string | null
}

export async function getPreScreening(applicationId: string): Promise<PreScreeningRecord | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pre_screening')
    .select('answers, eligible, ineligible_reason, main_category, sub_categories, flags, status, submitted_at, review_note, unlock_reason')
    .eq('application_id', applicationId)
    .maybeSingle()
  if (error) { console.error('getPreScreening:', error.message); return null }
  if (!data) return null
  return {
    answers: (data.answers ?? {}) as PSAnswers,
    eligible: data.eligible,
    ineligibleReason: data.ineligible_reason ?? null,
    mainCategory: (data.main_category ?? null) as EstablishmentCategory | null,
    subCategories: (data.sub_categories ?? []) as EstablishmentCategory[],
    flags: (data.flags ?? {}) as PreScreeningRecord['flags'],
    status: (data.status ?? 'draft') as PSStatus,
    submittedAt: data.submitted_at ?? null,
    reviewNote: data.review_note ?? null,
    unlockReason: data.unlock_reason ?? null,
  }
}

// The result to drive dynamic criteria filtering — only once eligibility is
// approved by the National Operator (status 'eligible').
export function preScreeningApproved(rec: PreScreeningRecord | null): boolean {
  return rec?.status === 'eligible' && !!rec.mainCategory
}
