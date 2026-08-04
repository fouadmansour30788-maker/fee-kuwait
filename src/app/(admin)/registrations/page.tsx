import { School, Building2, Users, MapPin } from 'lucide-react'
import { listRegistrationsFull } from '@/lib/db/registrations'
import { MEMBER_STATUS_META } from '@/lib/db/members'

export const dynamic = 'force-dynamic'

// Flatten a details JSONB into readable label/value pairs for display.
function flatten(obj: Record<string, unknown>, prefix = ''): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = []
  const label = (k: string) => (prefix ? `${prefix} · ` : '') + k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim()
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || v === '') continue
    if (Array.isArray(v)) { if (v.length) out.push({ label: label(k), value: v.join(', ') }); continue }
    if (typeof v === 'object') { out.push(...flatten(v as Record<string, unknown>, label(k))); continue }
    out.push({ label: label(k), value: String(v) })
  }
  return out
}

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
      ) : rows.map((r) => {
        const st = MEMBER_STATUS_META[r.status ?? ''] ?? { label: r.status ?? '—', color: '#64748B', bg: '#F1F5F9' }
        const Icon = r.kind === 'School' ? School : Building2
        const core: { label: string; value: string }[] = [
          { label: 'Kind', value: r.kind },
          ...(r.type ? [{ label: 'Type', value: r.type }] : []),
          ...(r.governorate ? [{ label: 'Governorate', value: r.governorate }] : []),
          ...(r.address ? [{ label: 'Address', value: r.address }] : []),
          ...(r.contactName ? [{ label: 'Contact', value: r.contactName }] : []),
          ...(r.contactEmail ? [{ label: 'Contact email', value: r.contactEmail }] : []),
          ...(r.contactPhone ? [{ label: 'Contact phone', value: r.contactPhone }] : []),
          ...(r.studentsCount != null ? [{ label: 'Students', value: String(r.studentsCount) }] : []),
          ...(r.greenKeyNumber ? [{ label: 'Green Key #', value: r.greenKeyNumber }] : []),
        ]
        const extra = flatten(r.details)
        return (
          <div key={`${r.kind}-${r.id}`} className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                <Icon className="w-4.5 h-4.5" style={{ color: '#64748B' }} />
              </div>
              <div className="min-w-0">
                <p className="font-bold" style={{ color: '#0F172A' }}>{r.name}{r.nameAr ? ` · ${r.nameAr}` : ''}</p>
                {r.createdAt && <p className="text-xs" style={{ color: '#94A3B8' }}>Registered {new Date(r.createdAt).toLocaleDateString('en-GB')}</p>}
              </div>
              <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: st.bg, color: st.color }}>{st.label}</span>
              {(r.details.latitude != null && r.details.longitude != null) && (
                <a href={`https://www.google.com/maps?q=${r.details.latitude},${r.details.longitude}`} target="_blank" rel="noopener"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                  <MapPin className="w-3.5 h-3.5" /> Map
                </a>
              )}
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {[...core, ...extra].map((f, i) => (
                <div key={i} className="flex gap-2 text-sm border-b py-1.5" style={{ borderColor: '#F1F5F9' }}>
                  <dt className="font-medium min-w-[140px]" style={{ color: '#64748B' }}>{f.label}</dt>
                  <dd className="flex-1" style={{ color: '#1E293B' }}>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )
      })}
    </div>
  )
}
