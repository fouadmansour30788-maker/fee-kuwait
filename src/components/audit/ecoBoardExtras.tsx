import type { ReactNode } from 'react'
import EcoThemesPicker from '@/components/audit/EcoThemesPicker'
import GreenFlagSection, { GreenFlagTotal } from '@/components/audit/GreenFlagScorecard'
import { ES_THEMES_STEP } from '@/lib/data/ecoSchoolsCriteria'
import { GREEN_FLAG_SECTIONS, sectionScore } from '@/lib/data/greenFlagScorecard'
import GreenFlagResults from '@/components/audit/GreenFlagResults'
import type { EcoBoard } from '@/lib/db/ecoSchools'

// Eco-Schools content shown inside the criteria board: under each step its
// Green Flag questions (and the themes picker on Step 2), plus the score strip
// above the table. `scoreEditable` = operator; others see saved answers only.
export function ecoRowExtras({ applicationId, eco, themes, themesEditable, scoreEditable }: {
  applicationId: string
  eco: EcoBoard
  themes: string[]
  themesEditable: boolean
  scoreEditable: boolean
}): Record<string, ReactNode> {
  const showScores = scoreEditable || !!eco.state.score
  const out: Record<string, ReactNode> = {}
  for (const sec of GREEN_FLAG_SECTIONS) {
    out[sec.step] = (
      <>
        {sec.step === ES_THEMES_STEP && <EcoThemesPicker applicationId={applicationId} selected={themes} editable={themesEditable} />}
        {showScores && (
          <GreenFlagSection applicationId={applicationId} sectionId={sec.id} initial={eco.state.score} editable={scoreEditable}
            open={eco.allReady} themes={themes} stepDocs={eco.stepDocs} />
        )}
      </>
    )
  }
  return out
}

export function ecoHeaderExtra(eco: EcoBoard, scoreEditable: boolean): ReactNode {
  if (!scoreEditable && !eco.state.score) return null
  return <GreenFlagTotal total={eco.state.scoreTotal} scoredAt={eco.state.scoredAt} open={eco.allReady} />
}

// Green Flag results panel (replaces the imperative/guideline panel for Eco-Schools).
export function EcoResults({ eco }: { eco: EcoBoard }) {
  const answers = eco.state.score ?? {}
  const sections = GREEN_FLAG_SECTIONS.map((sec) => ({ step: sec.step, title: sec.title, got: sectionScore(sec, answers), max: sec.max }))
  return <GreenFlagResults sections={sections} total={eco.state.scoreTotal ?? 0} scored={!!eco.state.score} scoredAt={eco.state.scoredAt} />
}
