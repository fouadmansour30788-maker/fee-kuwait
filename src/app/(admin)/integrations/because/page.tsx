import { redirect } from 'next/navigation'
import { Cable } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth-server'
import { becauseConfigured } from '@/lib/because/client'
import BecauseExplorer from '@/components/because/BecauseExplorer'

export const dynamic = 'force-dynamic'

export default async function BecausePage() {
  const me = await getCurrentUser()
  if (!me || !['admin', 'super_admin'].includes(me.role)) redirect('/dashboard')

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

      <BecauseExplorer configured={becauseConfigured()} />
    </div>
  )
}
