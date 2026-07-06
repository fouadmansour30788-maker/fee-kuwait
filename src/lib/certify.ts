import type { SupabaseClient } from '@supabase/supabase-js'
import { applicationStatusEmail, sendEmail } from '@/lib/email'
import { PROGRAMME_LABEL } from '@/lib/db/applications'

const CERT_PREFIX: Record<string, string> = {
  'green-key': 'GK', 'blue-flag': 'BF', 'eco-schools': 'ES', 'leaf': 'LF', 'yre': 'YR', 'eco-campus': 'EC',
}

// Issue a certificate for an approved/certified application. Idempotent: one per
// application (onConflict application_id, ignoreDuplicates) so it never overwrites
// or double-issues. Returns the certificate number.
export async function issueCertificate(
  supabase: SupabaseClient,
  appRow: { id: string; applicant_id: string; entity_type: string | null; programme: string },
): Promise<string> {
  const number = `${CERT_PREFIX[appRow.programme] ?? 'FEE'}-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
  const expires = new Date(); expires.setFullYear(expires.getFullYear() + 2)
  await supabase.from('certificates').upsert({
    application_id: appRow.id,
    applicant_id: appRow.applicant_id,
    entity_type: appRow.entity_type,
    programme: appRow.programme,
    certificate_number: number,
    expires_at: expires.toISOString(),
  }, { onConflict: 'application_id', ignoreDuplicates: true })
  return number
}

// Best-effort applicant notification for a status change. Never throws.
export async function notifyApplicant(opts: {
  email: string | null | undefined
  programme: string
  entityType: string | null
  applicationId: string
  status: string
  note?: string | null
  certificateNumber?: string | null
}): Promise<void> {
  if (!opts.email) return
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const portalUrl = base
    ? `${base}/${opts.entityType === 'school' ? 'school' : 'business'}/application/${opts.applicationId}`
    : undefined
  const mail = applicationStatusEmail({
    programme: PROGRAMME_LABEL[opts.programme] ?? opts.programme,
    status: opts.status,
    rejectionReason: opts.note,
    certificateNumber: opts.certificateNumber,
    portalUrl,
  })
  if (mail) await sendEmail({ to: opts.email, subject: mail.subject, html: mail.html })
}
