import { createClient } from '@/lib/supabase/server'

export interface Certificate {
  id: string
  application_id: string
  programme: string
  certificate_number: string
  issued_at: string
  expires_at: string | null
  status: string
  applicant: { name_en: string | null; email: string | null } | null
}

// Operators see all certificates; establishments see their own (via RLS).
export async function listCertificates(): Promise<Certificate[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('id, application_id, programme, certificate_number, issued_at, expires_at, status, applicant:users!applicant_id(name_en, email)')
    .order('issued_at', { ascending: false })
  if (error) { console.error('listCertificates:', error.message); return [] }
  return (data ?? []) as unknown as Certificate[]
}

export interface CertificateDetail {
  id: string
  programme: string
  certificate_number: string
  issued_at: string
  expires_at: string | null
  status: string
  holder: string | null
  address: string | null
  governorate: string | null
}

// A single certificate (RLS: holder sees own, staff see all).
export async function getCertificate(id: string): Promise<CertificateDetail | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('id, programme, certificate_number, issued_at, expires_at, status, application_id, applicant:users!applicant_id(name_en, email)')
    .eq('id', id)
    .single()
  if (error) { console.error('getCertificate:', error.message); return null }
  const applicant = Array.isArray(data.applicant) ? data.applicant[0] : data.applicant

  // The establishment's registered name + address (for the certificate face).
  let holder: string | null = applicant?.name_en || applicant?.email || null
  let address: string | null = null
  let governorate: string | null = null
  const { data: app } = await supabase.from('applications').select('entity_type, entity_id').eq('id', data.application_id).maybeSingle()
  if (app?.entity_id && app.entity_type) {
    const { data: ent } = await supabase.from(app.entity_type === 'school' ? 'schools' : 'businesses').select('name_en, address, governorate').eq('id', app.entity_id).maybeSingle()
    if (ent) { holder = ent.name_en ?? holder; address = ent.address ?? null; governorate = ent.governorate ?? null }
  }

  return {
    id: data.id, programme: data.programme, certificate_number: data.certificate_number,
    issued_at: data.issued_at, expires_at: data.expires_at, status: data.status,
    holder, address, governorate,
  }
}

export const CERT_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: '#059669', bg: '#D1FAE5' },
  expired:   { label: 'Expired',   color: '#D97706', bg: '#FEF3C7' },
  revoked:   { label: 'Revoked',   color: '#DC2626', bg: '#FEE2E2' },
  suspended: { label: 'Suspended', color: '#B45309', bg: '#FEF3C7' },
  withdrawn: { label: 'Withdrawn', color: '#DC2626', bg: '#FEE2E2' },
}

export interface PublicCertificate {
  number: string
  programme: string
  holder: string | null
  governorate: string | null
  issuedAt: string
  expiresAt: string | null
  status: string
  valid: boolean
}

export interface PublicCertifiedEntry {
  number: string
  name: string | null
  governorate: string | null
  govKey: string
  category: string | null
  programme: string
  issuedAt: string
  expiresAt: string | null
}

// Canonicalise any governorate string to Kuwait's six ADM1 keys (+ 'other').
export function canonGovKey(raw: string | null): string {
  const n = (raw ?? '').toLowerCase().replace(/[^a-z]/g, '')
  if (n.includes('asimah') || n.includes('capital') || n.includes('kuwaitcity') || n === 'alkuwait' || n === 'kuwait') return 'capital'
  if (n.includes('hawalli')) return 'hawalli'
  if (n.includes('farwani')) return 'farwaniyah'
  if (n.includes('mubarak')) return 'mubarak'
  if (n.includes('ahmadi')) return 'ahmadi'
  if (n.includes('jahra')) return 'jahra'
  return 'other'
}

// Public directory of currently-certified establishments (service role, only
// non-sensitive fields). Powers the public "Green Key in Kuwait" map & listing.
// Bulk-fetches to avoid N+1: certs → applications → businesses/schools.
export async function getPublicCertifiedDirectory(): Promise<PublicCertifiedEntry[]> {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()
  const now = Date.now()

  const { data: certs } = await admin
    .from('certificates')
    .select('certificate_number, programme, issued_at, expires_at, status, application_id')
    .eq('status', 'active')
  if (!certs?.length) return []

  const notExpired = certs.filter((c) => !c.expires_at || new Date(c.expires_at).getTime() >= now)
  const appIds = Array.from(new Set(notExpired.map((c) => c.application_id)))
  const { data: apps } = await admin.from('applications').select('id, entity_type, entity_id').in('id', appIds)
  const appById = new Map((apps ?? []).map((a) => [a.id, a]))

  const bizIds = (apps ?? []).filter((a) => a.entity_type !== 'school' && a.entity_id).map((a) => a.entity_id)
  const schoolIds = (apps ?? []).filter((a) => a.entity_type === 'school' && a.entity_id).map((a) => a.entity_id)
  const [{ data: biz }, { data: sch }] = await Promise.all([
    bizIds.length ? admin.from('businesses').select('id, name_en, governorate, type').in('id', bizIds) : Promise.resolve({ data: [] as { id: string; name_en: string | null; governorate: string | null; type: string | null }[] }),
    schoolIds.length ? admin.from('schools').select('id, name_en, governorate').in('id', schoolIds) : Promise.resolve({ data: [] as { id: string; name_en: string | null; governorate: string | null }[] }),
  ])
  const bizById = new Map((biz ?? []).map((b) => [b.id, b]))
  const schById = new Map((sch ?? []).map((s) => [s.id, s]))

  return notExpired.map((c) => {
    const app = appById.get(c.application_id)
    const isSchool = app?.entity_type === 'school'
    const ent = isSchool ? schById.get(app?.entity_id ?? '') : bizById.get(app?.entity_id ?? '')
    const governorate = ent?.governorate ?? null
    return {
      number: c.certificate_number,
      name: ent?.name_en ?? null,
      governorate,
      govKey: canonGovKey(governorate),
      category: isSchool ? 'School' : ((ent as { type?: string | null })?.type ?? null),
      programme: c.programme,
      issuedAt: c.issued_at,
      expiresAt: c.expires_at,
    }
  }).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

// Public verification lookup by certificate number — no auth (service role), and
// returns only non-sensitive fields. Used by the /verify and /certificate pages.
export async function getPublicCertificate(number: string): Promise<PublicCertificate | null> {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()
  const { data: cert } = await admin
    .from('certificates')
    .select('programme, certificate_number, issued_at, expires_at, status, application_id, applicant:users!applicant_id(name_en)')
    .eq('certificate_number', number.trim())
    .maybeSingle()
  if (!cert) return null

  const ap = cert.applicant as { name_en: string | null } | { name_en: string | null }[] | null
  let holder: string | null = (Array.isArray(ap) ? ap[0]?.name_en : ap?.name_en) ?? null
  let governorate: string | null = null
  const { data: app } = await admin.from('applications').select('entity_type, entity_id').eq('id', cert.application_id).maybeSingle()
  if (app?.entity_id && app.entity_type) {
    const { data: ent } = await admin.from(app.entity_type === 'school' ? 'schools' : 'businesses').select('name_en, governorate').eq('id', app.entity_id).maybeSingle()
    if (ent) { holder = ent.name_en ?? holder; governorate = ent.governorate ?? null }
  }

  const expired = cert.expires_at ? new Date(cert.expires_at).getTime() < Date.now() : false
  return {
    number: cert.certificate_number, programme: cert.programme, holder, governorate,
    issuedAt: cert.issued_at, expiresAt: cert.expires_at, status: cert.status,
    valid: cert.status === 'active' && !expired,
  }
}
