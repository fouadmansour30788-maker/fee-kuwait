import { Users } from 'lucide-react'
import { listRegistrationsFull } from '@/lib/db/registrations'
import RegistrationCard from '@/components/admin/RegistrationCard'

export const dynamic = 'force-dynamic'

export default async function RegistrationsPage() {
  const rows = await listRegistrationsFull()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Registrations</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{rows.length} registration{rows.length === 1 ? '' : 's'} · all information submitted in the registration form.</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border py-16 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>No registrations yet</p>
        </div>
      ) : rows.map((r) => <RegistrationCard key={`${r.kind}-${r.id}`} r={r} />)}
    </div>
  )
}
