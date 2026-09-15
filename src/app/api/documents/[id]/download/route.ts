import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'application-docs'

// Stable, permanent link to an attached document. Unlike a raw signed URL
// (which expires after ~1 hour), this endpoint re-checks access and mints a
// fresh signed URL on every click, then redirects to it — so links printed
// into an exported Excel keep working days later.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Not signed in', { status: 401 })

  // RLS decides visibility: applicant sees own docs, staff see all. If the
  // row isn't visible to this user, the select returns nothing → 404.
  const { data: doc } = await supabase
    .from('application_documents')
    .select('path, link_url')
    .eq('id', params.id)
    .single()
  if (!doc) return new Response('Not found', { status: 404 })

  // A link row's "document" is the external link itself.
  if (doc.link_url) return NextResponse.redirect(doc.link_url)
  if (!doc.path) return new Response('No file', { status: 404 })

  const admin = createAdminClient()
  const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(doc.path, 3600)
  if (!signed?.signedUrl) return new Response('Could not sign', { status: 500 })
  return NextResponse.redirect(signed.signedUrl)
}
