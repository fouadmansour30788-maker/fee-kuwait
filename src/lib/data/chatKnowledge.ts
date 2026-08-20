// Knowledge base injected into the chatbot's system prompt so it can answer about
// specific Green Key criteria (e.g. "criterion 1.2") and every pre-screening
// question — data it otherwise doesn't have. Assembled once at module load from
// the same source of truth the portal uses.
import { criteriaForProgramme } from '@/lib/criteria'
import { GK_SECTIONS } from '@/lib/data/greenKeyCriteria'
import { PS_QUESTIONS, PS_SECTIONS } from '@/lib/data/preScreening'

const trim = (s: string | undefined, n: number) => (s ? (s.length > n ? s.slice(0, n).trimEnd() + '…' : s) : '')

// Full Green Key criteria list grouped by area: number, imperative/guideline, title, guidance.
export const GREEN_KEY_CRITERIA_REFERENCE = (() => {
  const criteria = criteriaForProgramme('green-key')
  const byArea = GK_SECTIONS.map((sec) => {
    const rows = criteria.filter((c) => c.area === sec.title)
    if (!rows.length) return ''
    const lines = rows.map((c) => {
      const kind = c.type?.includes('I') ? 'Imperative' : c.type === 'G' ? 'Guideline' : (c.type ?? '')
      const io = c.type && c.type.length > 1 ? ' (imperative for some categories, guideline for others)' : ''
      return `  ${c.ref} [${kind}${io}] ${c.title}${c.description ? ` — ${trim(c.description, 260)}` : ''}`
    })
    return `Area ${sec.n}. ${sec.title}\n${lines.join('\n')}`
  }).filter(Boolean)
  return byArea.join('\n\n')
})()

// Every pre-screening question in order, grouped by section, noting conditional ones.
export const PRE_SCREENING_REFERENCE = (() => {
  return PS_SECTIONS.map((section) => {
    const qs = PS_QUESTIONS.filter((q) => q.section === section)
    if (!qs.length) return ''
    const lines = qs.map((q) => `  - ${q.text}${q.showIf ? ' (only shown depending on earlier answers)' : ''}${q.help ? ` [${trim(q.help, 120)}]` : ''}`)
    return `${section}:\n${lines.join('\n')}`
  }).filter(Boolean).join('\n\n')
})()
