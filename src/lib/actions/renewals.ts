import { createAdminClient } from '@/lib/supabase/admin'
import { renewalReminderEmail, sendEmail } from '@/lib/email'
import { sendWhatsApp } from '@/lib/whatsapp'
import { PROGRAMME_LABEL } from '@/lib/db/applications'

// How far ahead of expiry we reach out to begin re-certification.
const REMIND_WINDOW_DAYS = 90

export interface RenewalSweepResult {
  scanned: number
  reminded: number
  errors: number
}

// Find active certificates within REMIND_WINDOW_DAYS of expiring that we haven't
// contacted yet, then notify the establishment (in-app + email) to start
// re-certification. Runs with the service role — no user session — so it is
// intended to be triggered by the daily cron route, never the browser.
// Idempotent: each certificate is stamped `renewal_reminded_at` after the first
// contact, so re-running the sweep the next day won't email anyone twice.
export async function runRenewalReminders(): Promise<RenewalSweepResult> {
  const admin = createAdminClient()
  const now = new Date()
  const cutoff = new Date(now.getTime() + REMIND_WINDOW_DAYS * 24 * 60 * 60 * 1000)

  const { data: certs, error } = await admin
    .from('certificates')
    .select('id, application_id, applicant_id, entity_type, programme, certificate_number, expires_at, status, renewal_reminded_at')
    .eq('status', 'active')
    .is('renewal_reminded_at', null)
    .not('expires_at', 'is', null)
    .gt('expires_at', now.toISOString())
    .lte('expires_at', cutoff.toISOString())

  if (error) { console.error('[renewals] query failed', error.message); return { scanned: 0, reminded: 0, errors: 1 } }

  const rows = certs ?? []
  let reminded = 0, errors = 0
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

  for (const c of rows) {
    try {
      const label = PROGRAMME_LABEL[c.programme] ?? c.programme
      const portalUrl = base
        ? `${base}/${c.entity_type === 'school' ? 'school' : 'business'}/application/${c.application_id}`
        : undefined

      // In-app notification for the establishment.
      await admin.from('notifications').insert({
        user_id: c.applicant_id,
        type: 'application',
        title_en: `${label} certificate expiring soon`,
        message_en: `Your certificate ${c.certificate_number} expires on ${new Date(c.expires_at as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kuwait' })}. Start re-certification to avoid a gap.`,
        action_url: portalUrl ? `/${c.entity_type === 'school' ? 'school' : 'business'}/application/${c.application_id}` : null,
      })

      // Email + WhatsApp (both best-effort — need the applicant's contact details).
      const { data: user } = await admin.from('users').select('email, phone').eq('id', c.applicant_id).maybeSingle()
      if (user?.email) {
        const mail = renewalReminderEmail({ programme: label, certificateNumber: c.certificate_number, expiresAt: c.expires_at as string, portalUrl })
        await sendEmail({ to: user.email, subject: mail.subject, html: mail.html })
      }
      await sendWhatsApp({ to: user?.phone, body: `Your ${label} certificate ${c.certificate_number} expires on ${new Date(c.expires_at as string).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', day: '2-digit', month: 'long', year: 'numeric' })}. Start re-certification to avoid a gap.` })

      await admin.from('certificates').update({ renewal_reminded_at: now.toISOString() }).eq('id', c.id)
      reminded++
    } catch (err) {
      console.error('[renewals] reminder failed for', c.id, err)
      errors++
    }
  }

  return { scanned: rows.length, reminded, errors }
}
