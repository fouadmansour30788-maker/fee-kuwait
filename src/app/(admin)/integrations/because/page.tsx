import { redirect } from 'next/navigation'
import { Cable } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth-server'
import { becauseConfigured, becauseBaseUrl } from '@/lib/because/client'
import { getBecauseConfig } from '@/lib/db/becauseConfig'
import BecauseExplorer from '@/components/because/BecauseExplorer'
import BecauseImporter from '@/components/because/BecauseImporter'

export const dynamic = 'force-dynamic'

export default async function BecausePage() {
  const me = await getCurrentUser()
  if (!me || !['admin', 'super_admin'].includes(me.role)) redirect('/dashboard')

  const configured = becauseConfigured()
  const cfg = configured ? await getBecauseConfig() : { framework_id: null, group_id: null, gk_property_id: null, field_map: {} }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#0F172A' }}>
          <Cable className="w-6 h-6" style={{ color: '#40916C' }} /> BeCause integration
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
          Export Green Key consumption data (electricity, water, waste) as companies&apos; framework answers to BeCause.
          Use the panels below to discover the IDs the import needs, then wire them into the scheduled export.
        </p>
      </div>

      <BecauseExplorer configured={configured} baseUrl={becauseBaseUrl()} />

      {configured && <BecauseImporter config={cfg} />}
    </div>
  )
}
