import { Radar, Inbox } from 'lucide-react'
import { PROGRAMME_LABEL } from '@/lib/db/applications'
import { listAllSurveillance } from '@/lib/db/surveillance'
import { criteriaForProgramme } from '@/lib/criteria'
import SurveillanceCard from '@/components/surveillance/SurveillanceCard'
import { CBDecision } from '@/components/surveillance/SurveillanceStaffActions'

export const dynamic = 'force-dynamic'

export default async function CbSurveillancePage() {
  const activities = await listAllSurveillance()
  const programmes = Array.from(new Set(activities.map((a) => a.programme)))
  const titlesByProgramme = Object.fromEntries(programmes.map((p) => [p, Object.fromEntries(criteriaForProgramme(p).map((c) => [c.ref, c.title]))]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#0F172A' }}><Radar className="w-6 h-6" style={{ color: '#40916C' }} /> Surveillance</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Review the surveillance responses and record whether certification is maintained.</p>
      </div>

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
              {(act.status === 'submitted' || act.status === 'reviewed') && <CBDecision id={act.id} />}
            </SurveillanceCard>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border py-14 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
          <Inbox className="w-9 h-9 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>No surveillance activities to review</p>
        </div>
      )}
    </div>
  )
}
