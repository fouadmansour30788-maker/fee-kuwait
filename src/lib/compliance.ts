import { GUIDELINE_CYCLE } from '@/lib/data/greenKeyCriteria'
import type { CriterionRef } from '@/lib/criteria'
import type { CriterionAssessment } from '@/lib/db/assessments'

// Client-safe compliance maths, shared by the CompliancePanel (display) and the
// workflow guard (blocking certification when the requirement isn't met).

// The effective result of a criterion: auditor result first, then operator
// review, then the establishment's self-assessment.
export function effectiveResult(a: CriterionAssessment | undefined): string {
  if (!a) return 'pending'
  if (a.external !== 'pending') return a.external
  if (a.internal !== 'pending') return a.internal
  if (a.applicantStatus === 'complete') return 'pass'
  return a.applicantResult ?? 'pending'
}

export interface ComplianceResult {
  met: boolean
  imperative: { got: number; total: number; ok: boolean }
  guideline: { got: number; need: number; total: number; ok: boolean }
  cyclePeriod: string
}

// Requirement: 100% of applicable imperative criteria conforming, plus a growing
// share of guideline criteria by certification cycle. 'na' (Not Applicable) drops
// a criterion out of the count entirely.
export function complianceStatus(
  criteria: CriterionRef[], assessments: Record<string, CriterionAssessment>, cycleIndex = 0,
): ComplianceResult {
  const eff = (ref: string) => effectiveResult(assessments[ref])
  const isNA = (ref: string) => eff(ref) === 'na'
  const impRefs = criteria.filter((c) => !!c.type && c.type.includes('I') && !isNA(c.ref))
  const guideRefs = criteria.filter((c) => c.type === 'G' && !isNA(c.ref))
  const impGot = impRefs.filter((c) => eff(c.ref) === 'pass').length
  const guideGot = guideRefs.filter((c) => eff(c.ref) === 'pass').length

  const cyc = GUIDELINE_CYCLE[Math.min(Math.max(cycleIndex, 0), GUIDELINE_CYCLE.length - 1)]
  const guideNeed = Math.ceil((guideRefs.length * cyc.guideline) / 100)
  const impOk = impGot >= impRefs.length
  const guideOk = guideGot >= guideNeed
  return {
    met: impOk && guideOk,
    imperative: { got: impGot, total: impRefs.length, ok: impOk },
    guideline: { got: guideGot, need: guideNeed, total: guideRefs.length, ok: guideOk },
    cyclePeriod: cyc.period,
  }
}
