// Pure, client-safe helpers only — no server imports here, so this module can be
// imported from client components (e.g. the login page). The server-only
// getCurrentUser() lives in ./auth-server.

export type Role = 'school' | 'business' | 'admin' | 'super_admin' | 'auditor' | 'certification_body'

// Where each role lands after signing in / on hitting a protected root.
export function roleHome(role?: string | null): string {
  switch (role) {
    case 'school': return '/school/dashboard'
    case 'business': return '/business/dashboard'
    case 'auditor': return '/auditor/dashboard'
    case 'certification_body': return '/cb/dashboard'
    case 'admin':
    case 'super_admin': return '/dashboard'
    default: return '/school/dashboard'
  }
}

// Which roles may access a given path prefix.
const ACCESS: { prefix: string; roles: Role[] }[] = [
  { prefix: '/school', roles: ['school', 'admin', 'super_admin'] },
  { prefix: '/business', roles: ['business', 'admin', 'super_admin'] },
  { prefix: '/auditor', roles: ['auditor', 'admin', 'super_admin'] },
  { prefix: '/cb', roles: ['certification_body', 'admin', 'super_admin'] },
  { prefix: '/dashboard', roles: ['admin', 'super_admin'] },
  { prefix: '/applications', roles: ['admin', 'super_admin'] },
  { prefix: '/auditors', roles: ['admin', 'super_admin'] },
  { prefix: '/certificates', roles: ['admin', 'super_admin'] },
  { prefix: '/members', roles: ['admin', 'super_admin'] },
  { prefix: '/analytics', roles: ['admin', 'super_admin'] },
  { prefix: '/content', roles: ['admin', 'super_admin'] },
  { prefix: '/reports', roles: ['admin', 'super_admin'] },
  { prefix: '/staff', roles: ['admin', 'super_admin'] },
]

export function roleCanAccess(role: string | null | undefined, path: string): boolean {
  const rule = ACCESS.find((a) => path === a.prefix || path.startsWith(a.prefix + '/'))
  if (!rule) return true // not a gated area
  return !!role && rule.roles.includes(role as Role)
}

export interface CurrentUser { id: string; email: string | null; role: Role; nameEn: string | null; nameAr: string | null }
