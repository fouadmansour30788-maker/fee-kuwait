import { School, Building2, MapPin } from 'lucide-react'
import { MEMBER_STATUS_META } from '@/lib/db/members'
import type { RegistrationFull } from '@/lib/db/registrations'

type Field = { label: string; value: string }

const humanize = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim()

// Flatten a details JSONB into readable label/value pairs for display.
function flatten(obj: Record<string, unknown>, prefix = ''): Field[] {
  const out: Field[] = []
  const label = (k: string) => (prefix ? `${prefix} · ` : '') + humanize(k)
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || v === '') continue
    if (Array.isArray(v)) {
      if (!v.length) continue
      // Lists of contacts etc. — one numbered row group per entry.
      if (v.some((x) => x && typeof x === 'object')) {
        v.forEach((x, i) => out.push(...flatten((x ?? {}) as Record<string, unknown>, `${label(k)} ${i + 1}`)))
      } else out.push({ label: label(k), value: v.join(', ') })
      continue
    }
    if (typeof v === 'object') { out.push(...flatten(v as Record<string, unknown>, label(k))); continue }
    out.push({ label: label(k), value: typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v) })
  }
  return out
}

// Everything the establishment / school submitted in the registration form.
export default function RegistrationCard({ r, title }: { r: RegistrationFull; title?: string }) {
  const st = MEMBER_STATUS_META[r.status ?? ''] ?? { label: r.status ?? '—', color: '#64748B', bg: '#F1F5F9' }
  const Icon = r.kind === 'School' ? School : Building2
  const core: Field[] = [
    { label: 'Kind', value: r.kind },
    ...(r.type ? [{ label: 'Type', value: r.type }] : []),
    ...(r.governorate ? [{ label: 'Governorate', value: r.governorate }] : []),
    ...(r.address ? [{ label: 'Address', value: r.address }] : []),
    ...(r.contactName ? [{ label: r.kind === 'School' ? 'Principal' : 'Contact', value: r.contactName }] : []),
    ...(r.contactEmail ? [{ label: r.kind === 'School' ? 'Principal email' : 'Contact email', value: r.contactEmail }] : []),
    ...(r.contactPhone ? [{ label: r.kind === 'School' ? 'Principal phone' : 'Contact phone', value: r.contactPhone }] : []),
    ...(r.studentsCount != null ? [{ label: 'Students', value: String(r.studentsCount) }] : []),
    ...(r.greenKeyNumber ? [{ label: 'Green Key #', value: r.greenKeyNumber }] : []),
  ]
  const extra = flatten(r.details)
  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      {title && <h2 className="text-base font-bold mb-4" style={{ color: '#0F172A' }}>{title}</h2>}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
          <Icon className="w-4.5 h-4.5" style={{ color: '#64748B' }} />
        </div>
        <div className="min-w-0">
          <p className="font-bold" style={{ color: '#0F172A' }}>{r.name}{r.nameAr ? ` · ${r.nameAr}` : ''}</p>
          {r.createdAt && <p className="text-xs" style={{ color: '#94A3B8' }}>Registered {new Date(r.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait' })}</p>}
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
            <dd className="flex-1 whitespace-pre-wrap break-words" style={{ color: '#1E293B' }}>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
