// Client-safe audit type metadata (no server-only imports), so both server db
// helpers and client components can use it.
export type AuditType = 'onsite' | 'offsite'

export const AUDIT_TYPE_META: Record<AuditType, { label: string; cadence: string }> = {
  onsite:  { label: 'On-site',  cadence: 'every 2 years' },
  offsite: { label: 'Off-site', cadence: 'every year' },
}
