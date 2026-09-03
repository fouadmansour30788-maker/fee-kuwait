import { Radar, Inbox } from 'lucide-react'
import { myApplications } from '@/lib/db/establishment'
import { PROGRAMME_LABEL } from '@/lib/db/applications'
import { listApplicationDocuments } from '@/lib/db/documents'
import { listSurveillance } from '@/lib/db/surveillance'
import { criteriaForProgramme } from '@/lib/criteria'
import SurveillanceCard from '@/components/surveillance/SurveillanceCard'
import SurveillanceRespond from '@/components/surveillance/SurveillanceRespond'

export const dynamic = 'force-dynamic'

export default async function SchoolSurveillancePage() {
  const apps = await myApplications()
  const perApp = await Promise.all(apps.map(async (a) => ({
    app: a,
    activities: await listSurveillance(a.id),
    docs: await listApplicationDocuments(a.id),
    titles: Object.fromEntries(criteriaForProgramme(a.programme).map((c) => [c.ref, c.title])),
  })))
  const items = perApp
    .flatMap((p) => p.activities.map((act) => ({ act, ...p })))
    .sort((x, y) => y.act.period - x.act.period || +new Date(y.act.requestedAt) - +new Date(x.act.requestedAt))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#0F2318' }}><Radar className="w-6 h-6" style={{ color: '#40916C' }} /> Surveillance</h1>
        <p className="text-sm mt-0.5" style={{ color: '#5B7568' }}>Between-audit checks: respond to the National Operator&apos;s requests for updates or documents on specific criteria.</p>
      </div>

      {items.length > 0 ? (
        <div>
          {items.map(({ act, app, docs, titles }) => (
            <SurveillanceCard key={act.id} activity={act} titles={titles} subtitle={PROGRAMME_LABEL[app.programme] ?? app.programme}>
              <SurveillanceRespond id={act.id} applicationId={app.id} period={act.period} criteria={act.criteria} titles={titles}
                docs={docs} responseNote={act.responseNote} editable={act.status === 'requested' || act.status === 'clarification'} />
            </SurveillanceCard>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border py-14 text-center" style={{ borderColor: '#D4E7DA', color: '#94A3B8' }}>
          <Inbox className="w-9 h-9 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>No surveillance activities yet</p>
          <p className="text-xs mt-0.5">The National Operator will request updates here between audits.</p>
        </div>
      )}
    </div>
  )
}
