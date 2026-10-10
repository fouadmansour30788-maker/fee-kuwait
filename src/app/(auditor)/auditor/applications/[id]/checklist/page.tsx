import { notFound } from 'next/navigation'
import { getApplication } from '@/lib/db/applications'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { listApplicationDocuments } from '@/lib/db/documents'
import { getPreScreening, preScreeningApproved } from '@/lib/db/preScreening'
import { getEcoThemes } from '@/lib/db/ecoThemes'
import { getEcoBoard } from '@/lib/db/ecoSchools'
import { criteriaForProgramme, applicableCriteria } from '@/lib/criteria'
import SiteVisitChecklist, { type EvidenceItem } from '@/components/audit/SiteVisitChecklist'

export const dynamic = 'force-dynamic'

const EDITABLE = ['audit', 'audit_in_progress', 'auditor_reassessment_in_progress']

// Why the checklist is read-only, in plain words (null = it can be started here).
function notReadyReason(status: string): string | null {
  if (status === 'auditor_assigned') return 'Confirm the site-visit date on the full board first — then you can start the audit here.'
  if (['cb_final_review', 'cb_final_re_review', 'certified_active', 'certified_rectification_active', 'not_certified_recorded', 'not_certified_communicated'].includes(status))
    return 'The audit report has been submitted — this checklist is now read-only.'
  return 'This checklist opens when the audit is in progress.'
}

export default async function ChecklistPage({ params }: { params: { id: string } }) {
  const app = await getApplication(params.id)
  if (!app) notFound()
  const isEco = app.programme === 'eco-schools'
  const [assessments, ps, docs, ecoThemes] = await Promise.all([
    listCriterionAssessments(params.id), getPreScreening(params.id), listApplicationDocuments(params.id),
    isEco ? getEcoThemes(params.id) : Promise.resolve(null),
  ])
  const eco = ecoThemes ? await getEcoBoard(params.id) : null
  const criteria = app.programme === 'green-key' && preScreeningApproved(ps) && ps ? applicableCriteria(ps) : criteriaForProgramme(app.programme)
  const editable = EDITABLE.includes(app.status)
  const start = app.status === 'audit_scheduled' ? 'Start Audit' as const : app.status === 'auditor_reassessment' ? 'Start Reassessment' as const : null

  const initial: Record<string, { result: string; note: string }> = {}
  for (const c of criteria) {
    const a = assessments[c.ref]
    initial[c.ref] = { result: a?.external ?? 'pending', note: a?.note ?? '' }
  }

  // Each criterion's attachments: the school's evidence and the auditor's site photos.
  const evidence: Record<string, EvidenceItem[]> = {}
  for (const d of docs) {
    if (!d.criterion_ref || d.surveillance_id) continue
    ;(evidence[d.criterion_ref] ??= []).push({
      id: d.id, name: d.name, url: d.isLink ? d.link_url : d.url, isLink: d.isLink,
      byAuditor: !!d.uploaded_by && d.uploaded_by !== app.applicant_id,
    })
  }

  return (
    <div className="py-2">
      <SiteVisitChecklist
        applicationId={params.id}
        establishment={app.applicant?.name_en || app.applicant?.email || 'Establishment'}
        criteria={criteria}
        initial={initial}
        editable={editable}
        evidence={evidence}
        eco={eco ? { score: eco.state.score, themes: ecoThemes ?? [], stepDocs: eco.stepDocs } : null}
        start={editable ? null : start}
        notReady={editable || start ? null : notReadyReason(app.status)}
      />
    </div>
  )
}
