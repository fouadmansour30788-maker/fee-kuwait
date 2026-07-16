import { Radar, Inbox } from 'lucide-react'
import { listApplications, PROGRAMME_LABEL } from '@/lib/db/applications'
import { listAllSurveillance } from '@/lib/db/surveillance'
import { criteriaForProgramme } from '@/lib/criteria'
import SurveillanceCreate from '@/components/surveillance/SurveillanceCreate'
import SurveillanceCard from '@/components/surveillance/SurveillanceCard'
import { OperatorReview } from '@/components/surveillance/SurveillanceStaffActions'

export const dynamic = 'force-dynamic'

export default async function AdminSurveillancePage() {
  const [apps, activities] = await Promise.all([listApplications(), listAllSurveillance()])

  const programmes = Array.from(new Set([...apps.map((a) => a.programme), ...activities.map((a) => a.programme)]))
  const criteriaByProgramme = Object.fromEntries(programmes.map((p) => [p, criteriaForProgramme(p).map((c) => ({ ref: c.ref, title: c.title }))]))
  const titlesByProgramme = Object.fromEntries(programmes.map((p) => [p, Object.fromEntries(criteriaForProgramme(p).map((c) => [c.ref, c.title]))]))

  const createApps = apps
    .filter((a) => criteriaForProgramme(a.programme).length > 0)
    .map((a) => ({ id: a.id, programme: a.programme, label: `${PROGRAMME_LABEL[a.programme] ?? a.programme} · ${a.applicant?.name_en || a.applicant?.email || '—'}` }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#0F172A' }}><Radar className="w-6 h-6" style={{ color: '#40916C' }} /> Surveillance</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Between-audit checks. Request updates or documents on selected criteria; the establishment responds and the Certification Body decides.</p>
      </div>

      <SurveillanceCreate apps={createApps} criteriaByProgramme={criteriaByProgramme} />

      {activities.length > 0 ? (
        <div>
          {activities.map((act) => (
            <SurveillanceCard key={act.id} activity={act} titles={titlesByProgramme[act.programme] ?? {}}
              subtitle={`${PROGRAMME_LABEL[act.programme] ?? act.programme} · ${act.applicant ?? '—'}`}>
              {act.responseNote && (
                <div className="rounded-xl px-3 py-2 text-sm mb-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155' }}>
                  <span className="text-[11px] font-semibold block mb-0.5" style={{ color: '#64748B' }}>Establishment response</span>{act.responseNote}
                </div>
              )}
              {act.status === 'submitted' && <OperatorReview id={act.id} />}
            </SurveillanceCard>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border py-14 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
          <Inbox className="w-9 h-9 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>No surveillance activities yet</p>
          <p className="text-xs mt-0.5">Use “Request a surveillance update” above to start one.</p>
        </div>
      )}
    </div>
  )
}
