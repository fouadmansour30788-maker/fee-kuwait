import { GK_CRITERIA, GK_SECTIONS } from '@/lib/data/greenKeyCriteria'
import { BF_CRITERIA, BF_SECTIONS } from '@/lib/data/blueFlagCriteria'

export interface CriterionRef { ref: string; title: string; area: string }

// The criteria an auditor grades for a given programme. Only Green Key and
// Blue Flag have structured criteria; others return an empty list for now.
export function criteriaForProgramme(programme: string): CriterionRef[] {
  if (programme === 'green-key') {
    return GK_CRITERIA.map((c) => ({ ref: c.id, title: c.title, area: GK_SECTIONS.find((s) => s.n === c.section)?.title ?? '' }))
  }
  if (programme === 'blue-flag') {
    return BF_CRITERIA.map((c) => ({ ref: c.id, title: c.title, area: BF_SECTIONS.find((s) => s.n === c.section)?.title ?? '' }))
  }
  return []
}
