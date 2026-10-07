import type { ReactNode } from 'react'
import EcoThemesPicker from '@/components/audit/EcoThemesPicker'
import GreenFlagSection, { GreenFlagTotal } from '@/components/audit/GreenFlagScorecard'
import { ES_THEMES_STEP } from '@/lib/data/ecoSchoolsCriteria'
import { GREEN_FLAG_SECTIONS } from '@/lib/data/greenFlagScorecard'
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
