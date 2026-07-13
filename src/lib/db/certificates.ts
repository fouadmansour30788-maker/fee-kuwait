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
}

// A single certificate (RLS: holder sees own, staff see all).
export async function getCertificate(id: string): Promise<CertificateDetail | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('id, programme, certificate_number, issued_at, expires_at, status, applicant:users!applicant_id(name_en, email)')
    .eq('id', id)
    .single()
  if (error) { console.error('getCertificate:', error.message); return null }
  const applicant = Array.isArray(data.applicant) ? data.applicant[0] : data.applicant
  return {
    id: data.id, programme: data.programme, certificate_number: data.certificate_number,
    issued_at: data.issued_at, expires_at: data.expires_at, status: data.status,
    holder: applicant?.name_en || applicant?.email || null,
  }
}

export const CERT_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active:  { label: 'Active',  color: '#059669', bg: '#D1FAE5' },
  expired: { label: 'Expired', color: '#D97706', bg: '#FEF3C7' },
  revoked: { label: 'Revoked', color: '#DC2626', bg: '#FEE2E2' },
}
