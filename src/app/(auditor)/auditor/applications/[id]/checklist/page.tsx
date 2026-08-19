import { notFound } from 'next/navigation'
import { getApplication } from '@/lib/db/applications'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { getPreScreening, preScreeningApproved } from '@/lib/db/preScreening'
import { criteriaForProgramme, applicableCriteria } from '@/lib/criteria'
import SiteVisitChecklist from '@/components/audit/SiteVisitChecklist'

export const dynamic = 'force-dynamic'

export default async function ChecklistPage({ params }: { params: { id: string } }) {
  const app = await getApplication(params.id)
  if (!app) notFound()
  const [assessments, ps] = await Promise.all([listCriterionAssessments(params.id), getPreScreening(params.id)])
  const criteria = app.programme === 'green-key' && preScreeningApproved(ps) && ps ? applicableCriteria(ps) : criteriaForProgramme(app.programme)
  const editable = ['audit', 'audit_in_progress', 'auditor_reassessment_in_progress'].includes(app.status)

  const initial: Record<string, { result: string; note: string }> = {}
  for (const c of criteria) {
    const a = assessments[c.ref]
    initial[c.ref] = { result: a?.external ?? 'pending', note: a?.note ?? '' }
  }

  return (
    <div className="py-2">
      <SiteVisitChecklist
        applicationId={params.id}
        establishment={app.applicant?.name_en || app.applicant?.email || 'Establishment'}
        criteria={criteria}
        initial={initial}
        editable={editable}
      />
    </div>
  )
}
