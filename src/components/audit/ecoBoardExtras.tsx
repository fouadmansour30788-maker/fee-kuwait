import type { ReactNode } from 'react'
import { Users, Search, BookOpen, ClipboardList, LineChart, Megaphone, ScrollText, type LucideIcon } from 'lucide-react'
import EcoThemesPicker from '@/components/audit/EcoThemesPicker'
import GreenFlagSection, { GreenFlagTotal } from '@/components/audit/GreenFlagScorecard'
import { ES_THEMES_STEP } from '@/lib/data/ecoSchoolsCriteria'
import { GREEN_FLAG_SECTIONS, sectionScore } from '@/lib/data/greenFlagScorecard'
import GreenFlagResults from '@/components/audit/GreenFlagResults'
import type { EcoBoard } from '@/lib/db/ecoSchools'
import { darken } from '@/lib/utils/color'

// The Seven Steps, each with its own icon + colour (palette of the "How to apply
// for your certification" wheel) for the step badge and its Green Flag questions.
export const STEP_STYLE: Record<string, { Icon: LucideIcon; color: string }> = {
  '1': { Icon: Users, color: '#E2A92B' },          // Eco-Committee — yellow
  '2': { Icon: Search, color: '#E08A2E' },         // Sustainability Audit — orange
  '3': { Icon: BookOpen, color: '#CF6A2C' },       // Curriculum — burnt orange
  '4': { Icon: ClipboardList, color: '#B4566A' },  // Action Plan — rose
  '5': { Icon: LineChart, color: '#6E5C8E' },      // Monitor & Evaluate — purple
  '6': { Icon: Megaphone, color: '#3F86C6' },      // Inform & Involve — blue
  '7': { Icon: ScrollText, color: '#4E9A5B' },     // Eco-Code — green
}

export function ecoStepBadges(): Record<string, ReactNode> {
  return Object.fromEntries(Object.entries(STEP_STYLE).map(([ref, { Icon, color }]) => [ref, (
    <span key={ref} className="flex flex-col items-center flex-shrink-0 w-12">
      <span className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm" style={{ background: color, boxShadow: `0 4px 12px ${color}40` }}>
        <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
      </span>
      <span className="text-[10px] font-extrabold uppercase tracking-wider mt-1" style={{ color: darken(color, 0.36) }}>Step {ref}</span>
    </span>
  )]))
}

// Eco-Schools content shown inside the criteria board: under each step its
// Green Flag questions (and the themes picker on Step 2), plus the score strip
// above the table. The school answers the questions of the steps listed in
// `scoreEditableSteps`; the operator, CB and auditor see the answers read-only.
export function ecoRowExtras({ applicationId, eco, themes, themesEditable, scoreEditableSteps = [], previousThemes }: {
  applicationId: string
  eco: EcoBoard
  themes: string[]
  themesEditable: boolean
  scoreEditableSteps?: string[]
  previousThemes?: Record<string, string>   // themes from earlier academic years → year
}): Record<string, ReactNode> {
  const out: Record<string, ReactNode> = {}
  for (const sec of GREEN_FLAG_SECTIONS) {
    out[sec.step] = (
      <>
        {sec.step === ES_THEMES_STEP && <EcoThemesPicker applicationId={applicationId} selected={themes} editable={themesEditable} previous={previousThemes} />}
        <GreenFlagSection applicationId={applicationId} sectionId={sec.id} initial={eco.state.score} accent={STEP_STYLE[sec.step]?.color}
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
