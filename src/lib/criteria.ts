import { GK_CRITERIA, GK_SECTIONS, isImperativeFor } from '@/lib/data/greenKeyCriteria'
import type { EstablishmentCategory } from '@/lib/data/greenKeyCriteria'
import { GK_FULL_NOTES } from '@/lib/data/greenKeyCriteriaNotes'
import { GK_PDF_NOTES } from '@/lib/data/greenKeyPdfNotes'
import { BF_CRITERIA, BF_SECTIONS } from '@/lib/data/blueFlagCriteria'

// Minimal shape needed to filter criteria (satisfied by both the pre-screening
// engine result and the stored pre-screening record).
export interface CriteriaFilter {
  mainCategory: EstablishmentCategory | null
  subCategories: EstablishmentCategory[]
  flags: { hasGreenArea?: boolean; lawnOver4000?: boolean; under50Employees?: boolean }
}

export interface CriterionRef { ref: string; title: string; area: string; description?: string; type?: string }

// The criteria an auditor grades for a given programme. Only Green Key and
// Blue Flag have structured criteria; others return an empty list for now.
export function criteriaForProgramme(programme: string): CriterionRef[] {
  if (programme === 'green-key') {
    return GK_CRITERIA.map((c) => ({
      ref: c.id, title: c.title, area: GK_SECTIONS.find((s) => s.n === c.section)?.title ?? '',
      description: GK_PDF_NOTES[c.id] ?? GK_FULL_NOTES[c.id] ?? c.note, type: c.type,
    }))
  }
  if (programme === 'blue-flag') {
    return BF_CRITERIA.map((c) => {
      const x = c as { id: string; title: string; section: number; note?: string; type?: string }
      return { ref: x.id, title: x.title, area: BF_SECTIONS.find((s) => s.n === x.section)?.title ?? '', description: x.note, type: x.type }
    })
  }
  return []
}

// Green-area biodiversity criteria removed when the establishment has no vegetation.
const GREEN_AREA_REFS = ['7.8', '7.9', '7.10', '7.12', '7.14']

// Dynamic criteria display: the Green Key criteria that apply to an establishment
// given its approved pre-screening result — filtered by main + sub-categories and
// operational filters, with each criterion's effective imperative/guideline type
// resolved (imperative prevails across the applicable categories).
export function applicableCriteria(result: CriteriaFilter): CriterionRef[] {
  if (!result.mainCategory) return []
  const cats: EstablishmentCategory[] = [result.mainCategory, ...result.subCategories]
  const catSet = new Set(cats)

  return GK_CRITERIA
    .filter((c) => c.categories.some((cat) => catSet.has(cat)))
    .filter((c) => result.flags.hasGreenArea || !GREEN_AREA_REFS.includes(c.id))
    .map((c) => {
      // Imperative if imperative for any applicable category (imperative prevails).
      let type: string = cats.some((cat) => isImperativeFor(c, cat)) ? 'I' : 'G'
      // Operational-filter overrides.
      if (c.id === '7.9') type = result.flags.lawnOver4000 ? 'G' : 'I'
      if (result.flags.under50Employees && (c.id === '1.6' || c.id === '1.10')) type = 'G'
      return {
        ref: c.id, title: c.title, area: GK_SECTIONS.find((s) => s.n === c.section)?.title ?? '',
        description: GK_PDF_NOTES[c.id] ?? GK_FULL_NOTES[c.id] ?? c.note, type,
      }
    })
}
