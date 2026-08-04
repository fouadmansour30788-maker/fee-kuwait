import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { roleCanAccess, roleHome } from '@/lib/auth'

// Protected areas — any unauthenticated request to these is sent to /login.
const PROTECTED = ['/school', '/business', '/auditor', '/cb', '/dashboard',
  '/applications', '/auditors', '/certificates', '/members', '/registrations',
  '/analytics', '/content', '/reports', '/staff', '/tracker', '/resources']

export async function middleware(request: NextRequest) {
  const { response, user, role } = await updateSession(request)
  const path = request.nextUrl.pathname
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + '/'))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Role-based lockdown: a signed-in user hitting an area their role can't access
  // is redirected to their own home (e.g. a business account can't open operator
  // or auditor/CB screens).
  if (user && !roleCanAccess(role, path)) {
    const url = request.nextUrl.clone()
    url.pathname = roleHome(role)
    url.search = ''
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {
  // Run on everything except static assets and Next internals.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
