// Client-safe role constants (no server imports).
export const ROLES = ['school', 'business', 'auditor', 'certification_body', 'admin', 'super_admin']

export const ROLE_LABEL: Record<string, string> = {
  school: 'School',
  business: 'Establishment',
  auditor: 'Auditor',
  certification_body: 'Certification Body',
  admin: 'National Operator',
  super_admin: 'Super Admin',
}
