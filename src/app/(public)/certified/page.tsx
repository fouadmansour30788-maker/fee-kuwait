import { Leaf, Award, MapPin } from 'lucide-react'
import { getPublicCertifiedDirectory } from '@/lib/db/certificates'
import GovernorateMap, { type GovDatum } from '@/components/dashboard/GovernorateMap'
import CertifiedDirectory from '@/components/public/CertifiedDirectory'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Green Key certified establishments in Kuwait',
  description: 'The public register of Green Key certified hotels, restaurants and establishments across Kuwait, by the Foundation for Environmental Education.',
}

const GOV_DEFS = [
  { key: 'capital', label: 'Al Asimah' },
  { key: 'hawalli', label: 'Hawalli' },
  { key: 'farwaniyah', label: 'Al Farwaniyah' },
  { key: 'mubarak', label: 'Mubarak Al-Kabeer' },
  { key: 'ahmadi', label: 'Al Ahmadi' },
  { key: 'jahra', label: 'Al Jahra' },
]

export default async function CertifiedPage() {
  const entries = await getPublicCertifiedDirectory()

  // Aggregate into the shape GovernorateMap expects (certified = establishments).
  const agg: Record<string, { total: number; schools: number; establishments: number }> = {}
  for (const d of [...GOV_DEFS.map((g) => g.key), 'other']) agg[d] = { total: 0, schools: 0, establishments: 0 }
  for (const e of entries) {
    const a = agg[e.govKey] ?? agg.other
    a.total++
    if (e.category === 'School') a.schools++
    else a.establishments++
  }
  const govData: GovDatum[] = GOV_DEFS.map((g) => ({ key: g.key, label: g.label, active: agg[g.key].total, ...agg[g.key] }))
  const govOther: GovDatum = { key: 'other', label: 'Other / unspecified', active: agg.other.total, ...agg.other }

  return (
    <div style={{ background: '#F7FBF8' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #0F2318, #1B4332)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Leaf className="w-4 h-4" style={{ color: '#74C69D' }} />
            <span className="text-xs font-semibold text-white">Foundation for Environmental Education · Kuwait</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Green Key certified in Kuwait</h1>
          <p className="mt-3 text-base max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            The official public register of establishments that meet the Green Key standard for environmental
            responsibility and sustainable tourism.
          </p>
          <div className="mt-8 flex items-center justify-center gap-8">
            <div>
              <p className="text-4xl font-bold text-white">{entries.length}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Certified now</p>
            </div>
            <div className="w-px h-12" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <div>
              <p className="text-4xl font-bold text-white">{GOV_DEFS.filter((g) => agg[g.key].total > 0).length}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Governorates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {entries.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border bg-white" style={{ borderColor: '#D4E7DA' }}>
            <Award className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: '#40916C' }} />
            <p className="text-base font-semibold" style={{ color: '#0F2318' }}>No certified establishments to show yet</p>
            <p className="text-sm mt-1" style={{ color: '#5B7568' }}>As establishments earn Green Key, they will appear here on the public register.</p>
          </div>
        ) : (
          <>
            {/* Map */}
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4" style={{ color: '#0891B2' }} />
                <h2 className="font-bold text-sm" style={{ color: '#0F2318' }}>Certified establishments by governorate</h2>
                <span className="text-[11px]" style={{ color: '#94A3B8' }}>— click a region to focus</span>
              </div>
              <GovernorateMap data={govData} other={govOther} />
            </div>

            {/* Directory */}
            <div>
              <h2 className="font-bold text-lg mb-4" style={{ color: '#0F2318' }}>Certified establishments</h2>
              <CertifiedDirectory entries={entries} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
