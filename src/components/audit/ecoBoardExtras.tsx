import type { ReactNode } from 'react'
import EcoThemesPicker from '@/components/audit/EcoThemesPicker'
import GreenFlagSection, { GreenFlagTotal } from '@/components/audit/GreenFlagScorecard'
import { ES_THEMES_STEP } from '@/lib/data/ecoSchoolsCriteria'
import { GREEN_FLAG_SECTIONS, sectionScore } from '@/lib/data/greenFlagScorecard'
import GreenFlagResults from '@/components/audit/GreenFlagResults'
import type { EcoBoard } from '@/lib/db/ecoSchools'

// Eco-Schools content shown inside the criteria board: under each step its
// Green Flag questions (and the themes picker on Step 2), plus the score strip
// above the table. The school answers the questions of the steps listed in
// `scoreEditableSteps`; the operator, CB and auditor see the answers read-only.
export function ecoRowExtras({ applicationId, eco, themes, themesEditable, scoreEditableSteps = [] }: {
  applicationId: string
  eco: EcoBoard
  themes: string[]
  themesEditable: boolean
  scoreEditableSteps?: string[]
}): Record<string, ReactNode> {
  const out: Record<string, ReactNode> = {}
  for (const sec of GREEN_FLAG_SECTIONS) {
    out[sec.step] = (
      <>
        {sec.step === ES_THEMES_STEP && <EcoThemesPicker applicationId={applicationId} selected={themes} editable={themesEditable} />}
        <GreenFlagSection applicationId={applicationId} sectionId={sec.id} initial={eco.state.score}
          editable={scoreEditableSteps.includes(sec.step)} themes={themes} stepDocs={eco.stepDocs} />
      </>
    )
  }
  return out
}

// Steps whose Green Flag questions the school may answer right now: the unlocked
// steps (1–2 until the operator approves them), limited to reopened steps during
// a rectification period.
export function ecoEditableSteps(eco: EcoBoard, locked: boolean, editableCriteria: string[] | null): string[] {
  if (locked) return []
  return GREEN_FLAG_SECTIONS.map((s) => s.step)
    .filter((st) => !eco.lockedRefs.includes(st) && (editableCriteria === null || editableCriteria.includes(st)))
}

export function ecoHeaderExtra(eco: EcoBoard): ReactNode {
  return <GreenFlagTotal total={eco.state.scoreTotal} scoredAt={eco.state.scoredAt} />
}

// Green Flag results panel (replaces the imperative/guideline panel for Eco-Schools).
export function EcoResults({ eco }: { eco: EcoBoard }) {
  const answers = eco.state.score ?? {}
  const sections = GREEN_FLAG_SECTIONS.map((sec) => ({ step: sec.step, title: sec.title, got: sectionScore(sec, answers), max: sec.max }))
  return <GreenFlagResults sections={sections} total={eco.state.scoreTotal ?? 0} scored={!!eco.state.score} scoredAt={eco.state.scoredAt} />
}
