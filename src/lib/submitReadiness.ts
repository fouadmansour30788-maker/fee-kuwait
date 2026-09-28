// Server-only readiness check for handing an application to the CB.
// Rule: EVERY applicable criterion must be marked Ready (or N/A Confirmed) by the
// National Operator, and required evidence must be attached for the imperative
// criteria. Returns an error message to block, or null when it may be submitted.
import { getPreScreening, preScreeningApproved } from '@/lib/db/preScreening'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { listApplicationDocuments } from '@/lib/db/documents'
import { criteriaForProgramme, applicableCriteria } from '@/lib/criteria'
import { GK_EVIDENCE } from '@/lib/data/greenKeyEvidence'

export async function submitToCbBlocker(applicationId: string, programme: string): Promise<string | null> {
  const ps = await getPreScreening(applicationId)
  const criteria = programme === 'green-key' && preScreeningApproved(ps) && ps ? applicableCriteria(ps) : criteriaForProgramme(programme)
  const assessments = await listCriterionAssessments(applicationId)

  const notReady = criteria.filter((c) => !['pass', 'na'].includes(assessments[c.ref]?.internal ?? ''))
  if (notReady.length) {
    const list = notReady.slice(0, 6).map((c) => c.ref).join(', ')
    return `Submit is blocked: every criterion must be marked Ready (or N/A Confirmed) — ${criteria.length - notReady.length}/${criteria.length} ready. Not yet ready: ${list}${notReady.length > 6 ? '…' : ''}.`
  }

  const docs = await listApplicationDocuments(applicationId)
  const imperative = criteria.filter((c) => !!c.type && c.type.includes('I') && assessments[c.ref]?.internal !== 'na')
  const missing = imperative.filter((c) => GK_EVIDENCE[c.ref]?.required === 'Yes' && !docs.some((d) => d.criterion_ref === c.ref))
  if (missing.length) return `Submit is blocked: required evidence is missing for ${missing.length} imperative criteri${missing.length === 1 ? 'on' : 'a'} (${missing.slice(0, 5).map((c) => c.ref).join(', ')}${missing.length > 5 ? '…' : ''}).`
  return null
}
