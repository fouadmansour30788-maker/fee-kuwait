// Client-safe back-office permission model (no server imports).
//
// Defines the capabilities a staff role can hold, their code DEFAULTS, and which
// are GRANTABLE (toggleable per role from the Team page). Resolution order:
//   super_admin  → always allowed (everything)
//   grantable    → DB override wins, else default
//   fixed        → default only (cannot be toggled)
//
// This governs back-office (staff) actions only. It layers on top of RLS and
// never grants an applicant (school/business) a staff capability.

// Roles that participate in the capability matrix (applicants excluded).
export type StaffRole = 'admin' | 'certification_body' | 'auditor' | 'super_admin'
export const STAFF_ROLE_ORDER: StaffRole[] = ['admin', 'certification_body', 'auditor', 'super_admin']

export const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  admin: 'National Operator',
  certification_body: 'Certification Body',
  auditor: 'Auditor',
  super_admin: 'Super Admin',
}

export type CapabilityId =
  | 'review_applications'
  | 'assign_auditor'
  | 'conduct_audit'
  | 'issue_certificate'
  | 'revoke_certificate'
  | 'manage_surveillance'
  | 'review_surveillance'
  | 'manage_content'
  | 'view_reports'
  | 'create_auditor'
  | 'manage_team'

export interface Capability {
  id: CapabilityId
  label: string
  description: string
  area: string
  /** Roles that hold this by default (super_admin implicitly always holds all). */
  default: StaffRole[]
  /** Whether the operator can toggle this per role from the Team page. */
  grantable: boolean
}

export const CAPABILITIES: Capability[] = [
  // ── Applications ──────────────────────────────────────────────
  { id: 'review_applications', area: 'Applications', label: 'Review applications',
    description: 'Open applications, read submissions and move them through review.',
    default: ['admin', 'certification_body'], grantable: true },
  { id: 'assign_auditor', area: 'Applications', label: 'Assign auditor',
    description: 'Assign an auditor to an application approved for audit.',
    default: ['certification_body'], grantable: true },

  // ── Audit ─────────────────────────────────────────────────────
  { id: 'conduct_audit', area: 'Audit', label: 'Conduct site audit',
    description: 'Carry out the on-site assessment and record criterion results.',
    default: ['auditor'], grantable: false },

  // ── Certification ─────────────────────────────────────────────
  { id: 'issue_certificate', area: 'Certification', label: 'Issue certificate',
    description: 'Approve the final decision and issue the Green Key / programme certificate.',
    default: ['certification_body'], grantable: true },
  { id: 'revoke_certificate', area: 'Certification', label: 'Revoke / suspend certificate',
    description: 'Suspend or withdraw an active certification.',
    default: ['certification_body'], grantable: true },

  // ── Surveillance ──────────────────────────────────────────────
  { id: 'manage_surveillance', area: 'Surveillance', label: 'Request surveillance',
    description: 'Open between-audit surveillance requests to establishments.',
    default: ['admin'], grantable: true },
  { id: 'review_surveillance', area: 'Surveillance', label: 'Review surveillance',
    description: 'Approve, request clarification, or decide surveillance outcomes.',
    default: ['certification_body'], grantable: true },

  // ── Content ───────────────────────────────────────────────────
  { id: 'manage_content', area: 'Content', label: 'Manage content',
    description: 'Create, edit and publish news articles.',
    default: ['admin'], grantable: true },

  // ── Reports ───────────────────────────────────────────────────
  { id: 'view_reports', area: 'Reports', label: 'View reports & directory',
    description: 'Access operator reports, dashboards and the certified directory.',
    default: ['admin', 'certification_body'], grantable: true },

  // ── Team ──────────────────────────────────────────────────────
  { id: 'create_auditor', area: 'Team', label: 'Create auditor accounts',
    description: 'Create new auditor sign-in accounts (without full team management).',
    default: ['admin', 'certification_body'], grantable: true },
  { id: 'manage_team', area: 'Team', label: 'Manage team & roles',
    description: 'Add members, change roles and configure permissions.',
    default: ['admin'], grantable: false },
]

export const CAPABILITY_BY_ID: Record<string, Capability> =
  Object.fromEntries(CAPABILITIES.map((c) => [c.id, c]))

/** Key used in the overrides map and the role_permissions table. */
export function permKey(role: string, capability: string): string {
  return `${role}:${capability}`
}

/**
 * Resolve whether a role holds a capability, given DB overrides.
 * `overrides` maps `${role}:${capability}` → granted.
 */
export function resolveCan(
  role: string | null | undefined,
  capability: CapabilityId | string,
  overrides: Record<string, boolean> = {},
): boolean {
  if (!role) return false
  if (role === 'super_admin') return true
  const cap = CAPABILITY_BY_ID[capability]
  if (!cap) return false
  if (cap.grantable) {
    const key = permKey(role, capability)
    if (key in overrides) return overrides[key]
  }
  return cap.default.includes(role as StaffRole)
}
