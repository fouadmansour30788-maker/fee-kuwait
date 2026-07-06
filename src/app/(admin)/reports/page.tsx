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

  return <ReportsClient appRows={appRows} certRows={certRows} programmes={programmes} statuses={statuses} />
}
