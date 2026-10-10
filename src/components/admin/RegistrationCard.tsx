import { School, Building2, MapPin } from 'lucide-react'
import { MEMBER_STATUS_META } from '@/lib/db/members'
import { PROGRAMME_LABEL } from '@/lib/db/applications'
import type { RegistrationFull } from '@/lib/db/registrations'

type Field = { label: string; value: string }
type Section = { title: string; fields: Field[] }
type Contact = { name?: string | null; email?: string | null; phone?: string | null }

const PAYMENT_LABEL: Record<string, string> = {
  bank_transfer: 'Bank transfer', knet: 'KNET', cheque: 'Cheque', other: 'Other (see reference)',
}

const isIsoDateTime = (v: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)
const fmtDateTime = (v: string) => new Date(v).toLocaleString('en-GB', { timeZone: 'Asia/Kuwait', dateStyle: 'medium', timeStyle: 'short' })
const fmtDate = (v: string) => new Date(v).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', dateStyle: 'medium' })

// Render any stored value as text; '' means "not answered".
function text(v: unknown): string {
  if (v === null || v === undefined || v === '') return ''
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (Array.isArray(v)) return v.map(text).filter(Boolean).join(', ')
  if (typeof v === 'object') return Object.entries(v as Record<string, unknown>).map(([k, x]) => text(x) && `${humanize(k)}: ${text(x)}`).filter(Boolean).join(' · ')
  const s = String(v)
  return isIsoDateTime(s) ? fmtDateTime(s) : s
}
const humanize = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim()
const contactText = (c: Contact | null | undefined) => (c ? [c.name, c.email, c.phone].filter(Boolean).join(' · ') : '')
const f = (label: string, value: unknown): Field => ({ label, value: text(value) })

// Details keys rendered in a named section; anything else lands in "Other".
const KNOWN = new Set([
  'accountName', 'numTeachers', 'numAdminStaff', 'numOtherStaff', 'latitude', 'longitude', 'numEmployees', 'payment', 'institutionKind', 'sector', 'international', 'levels',
  'gender', 'specialNeedsSchool', 'socialLinks', 'coordinatorName', 'teachers', 'teacherContacts', 'parentRep', 'parentContact',
  'whyInterested', 'committeeFrequency', 'themes', 'comments', 'coordinatorSignature', 'declaration', 'signatureName', 'signedAt',
  'website', 'numRooms', 'numGuestsYear', 'numGuestNightsYear', 'generalManager', 'environmentalDirector', 'contactPerson',
  'previousCertification',
])

function sections(r: RegistrationFull): Section[] {
  const d = r.details as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  const school = r.kind === 'School'
  const has = (p: string) => r.programmes.includes(p)
  const location = d.latitude != null && d.longitude != null ? `${d.latitude}, ${d.longitude}` : ''
  const out: Section[] = [
    { title: 'Account', fields: [f('Full name', r.accountName), f('Email (login)', r.accountEmail)] },
  ]

  if (school) {
    out.push({ title: 'Institution details', fields: [
      f('Institution name (EN)', r.name), f('Institution name (AR)', r.nameAr),
      f('School or university', d.institutionKind), f('Sector', d.sector ?? r.type),
      f('International school', d.international), f('School levels', d.levels),
      f('Students', d.gender), f('School for students with special needs', d.specialNeedsSchool),
      f('Governorate', r.governorate), f('Phone number', r.contactPhone),
      f('Principal name', r.contactName), f('Number of students', r.studentsCount),
      f('Number of teachers', d.numTeachers), f('Number of admin staff', d.numAdminStaff), f('Number of other staff', d.numOtherStaff),
      f('Address', r.address), f('Location (lat, lng)', location),
    ] })
  } else {
    out.push({ title: 'Institution details', fields: [
      f('Institution name (EN)', r.name), f('Institution name (AR)', r.nameAr),
      f('Establishment type', r.type), f('Governorate', r.governorate),
      f('Contact name', r.contactName ?? d.contactPerson?.name), f('Phone number', r.contactPhone ?? d.contactPerson?.phone),
      f('Number of employees', d.numEmployees), f('Address', r.address), f('Location (lat, lng)', location),
    ] })
  }

  out.push({ title: 'Programmes applied for', fields: [f('Programmes', r.programmes.map((p) => PROGRAMME_LABEL[p] ?? p))] })

  if (school && (has('eco-schools') || d.coordinatorName !== undefined)) {
    const teachers: Contact[] = Array.isArray(d.teacherContacts) && d.teacherContacts.length
      ? d.teacherContacts
      : (Array.isArray(d.teachers) ? d.teachers.map((name: string) => ({ name })) : [])
    out.push({ title: 'Eco-Schools application', fields: [
      f('Eco-Schools coordinator', d.coordinatorName), f('School social media', d.socialLinks),
      { label: 'Teacher 1', value: contactText(teachers[0]) }, { label: 'Teacher 2', value: contactText(teachers[1]) },
      { label: 'Parent representative (or other)', value: contactText(d.parentContact) || text(d.parentRep) },
      f('Why is your school interested in participating?', d.whyInterested),
      f('Student committee & meeting frequency', d.committeeFrequency),
      f('Eco-Schools themes achieved / working on', d.themes),
      f('Questions / comments', d.comments),
    ] })
  }

  if (!school && (has('green-key') || d.generalManager !== undefined)) {
    const prev = d.previousCertification as { certified?: boolean; greenKeyNumber?: string; firstIssuedAt?: string; lastIssuedAt?: string } | undefined
    out.push({ title: 'Green Key application', fields: [
      f('Green Key certified before', prev?.certified),
      ...(prev?.certified ? [
        f('Previous Green Key number', prev.greenKeyNumber),
        { label: 'Date of first issuance', value: prev.firstIssuedAt ? fmtDate(prev.firstIssuedAt) : '' },
        { label: 'Date of latest issuance', value: prev.lastIssuedAt ? fmtDate(prev.lastIssuedAt) : '' },
      ] : []),
      f('Website', d.website), f('Social media links', d.socialLinks),
      f('Number of rooms', d.numRooms), f('Guests / year', d.numGuestsYear), f('Guest-nights / year', d.numGuestNightsYear),
      { label: 'General Manager', value: contactText(d.generalManager) },
      { label: 'Environmental Director', value: contactText(d.environmentalDirector) },
      f('Contact person email', r.contactEmail ?? d.contactPerson?.email),
    ] })
  }

  out.push({ title: 'Declaration', fields: [
    f('Declaration accepted', d.declaration),
    f(school ? 'Principal signature' : 'Signature', d.signatureName),
    ...(school ? [f('Coordinator signature', d.coordinatorSignature)] : []),
    f('Signed at', d.signedAt),
  ] })

  out.push({ title: 'Fees & payment', fields: [
    f('Preferred payment method', d.payment?.method ? (PAYMENT_LABEL[d.payment.method] ?? d.payment.method) : ''),
    f('Payment reference', d.payment?.reference),
    f('Fee acknowledged at', d.payment?.acknowledgedAt),
  ] })

  const other = Object.entries(d).filter(([k, v]) => !KNOWN.has(k) && text(v)).map(([k, v]) => f(humanize(k), v))
  if (other.length) out.push({ title: 'Other', fields: other })
  return out
}

// Everything the establishment / school submitted in the registration form,
// grouped like the form itself. Unanswered questions show "—".
export default function RegistrationCard({ r, title }: { r: RegistrationFull; title?: string }) {
  const st = MEMBER_STATUS_META[r.status ?? ''] ?? { label: r.status ?? '—', color: '#64748B', bg: '#F1F5F9' }
  const Icon = r.kind === 'School' ? School : Building2
  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      {title && <h2 className="text-base font-bold mb-4" style={{ color: '#0F172A' }}>{title}</h2>}
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
          <Icon className="w-4.5 h-4.5" style={{ color: '#64748B' }} />
        </div>
        <div className="min-w-0">
          <p className="font-bold" style={{ color: '#0F172A' }}>{r.name}{r.nameAr ? ` · ${r.nameAr}` : ''}</p>
          {r.createdAt && <p className="text-xs" style={{ color: '#94A3B8' }}>Registered {fmtDate(r.createdAt)}</p>}
        </div>
        <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: st.bg, color: st.color }}>{st.label}</span>
        {(r.details.latitude != null && r.details.longitude != null) && (
          <a href={`https://www.google.com/maps?q=${r.details.latitude},${r.details.longitude}`} target="_blank" rel="noopener"
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
            <MapPin className="w-3.5 h-3.5" /> Map
          </a>
        )}
      </div>
      {sections(r).map((sec) => (
        <div key={sec.title} className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#40916C' }}>{sec.title}</p>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {sec.fields.map((fd) => (
              <div key={fd.label} className="flex gap-3 text-sm border-b py-2" style={{ borderColor: '#F1F5F9' }}>
                <dt className="font-medium w-[45%] flex-shrink-0" style={{ color: '#64748B' }}>{fd.label}</dt>
                <dd className="flex-1 min-w-0 whitespace-pre-wrap break-words" style={{ color: fd.value ? '#1E293B' : '#CBD5E1' }}>{fd.value || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}
