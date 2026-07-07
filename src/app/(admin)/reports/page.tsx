import { listApplications, PROGRAMME_LABEL, statusMeta, STATUS_META } from '@/lib/db/applications'
import { listCertificates } from '@/lib/db/certificates'
import ReportsClient, { type AppReportRow, type CertReportRow } from './ReportsClient'

const iso = (d: string | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : '')

export default async function ReportsPage() {
  const [apps, certs] = await Promise.all([listApplications(), listCertificates()])

  const appRows: AppReportRow[] = apps.map((a) => {
    const m = statusMeta(a.status)
    return {
      id: a.id,
      applicant: a.applicant?.name_en || a.applicant?.email || '—',
      email: a.applicant?.email ?? '',
      programme: PROGRAMME_LABEL[a.programme] ?? a.programme,
      programmeKey: a.programme,
      status: a.status,
      statusLabel: m.label,
      statusColor: m.color,
      statusBg: m.bg,
      submitted: iso(a.submitted_at),
    }
  })

  const certRows: CertReportRow[] = certs.map((c) => ({
    number: c.certificate_number,
    applicant: c.applicant?.name_en || c.applicant?.email || '—',
    programme: PROGRAMME_LABEL[c.programme] ?? c.programme,
    issued: iso(c.issued_at),
    expires: iso(c.expires_at),
    status: c.status,
  }))

  const programmes = Object.keys(PROGRAMME_LABEL).map((key) => ({ key, label: PROGRAMME_LABEL[key] }))
  // Only offer status filters that actually occur in the data (label from STATUS_META).
  const present = Array.from(new Set(apps.map((a) => a.status)))
  const statuses = present.map((key) => ({ key, label: STATUS_META[key]?.label ?? statusMeta(key).label }))

  // Average time from submission to certificate (join certs -> app submitted_at).
  const submittedById = new Map(apps.map((a) => [a.id, a.submitted_at]))
  const durations = certs
    .map((c) => {
      const sub = submittedById.get(c.application_id)
      if (!sub || !c.issued_at) return null
      return (new Date(c.issued_at).getTime() - new Date(sub).getTime()) / 86_400_000
    })
    .filter((d): d is number => d !== null && d >= 0)
  const avgDays = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null

  return <ReportsClient appRows={appRows} certRows={certRows} programmes={programmes} statuses={statuses} avgDays={avgDays} />
}
