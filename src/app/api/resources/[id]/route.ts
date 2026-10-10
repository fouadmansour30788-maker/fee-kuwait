import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Download / open a programme resource. RLS on the user's client decides access
// (members: published only; staff: all); uploaded files get a short-lived signed
// URL from the private bucket, links redirect straight through.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const { data: r } = await supabase.from('resources').select('id, path, file_url, downloads').eq('id', params.id).maybeSingle()
  if (!r) return new NextResponse('Not found', { status: 404 })

  const admin = createAdminClient()
  await admin.from('resources').update({ downloads: (r.downloads ?? 0) + 1 }).eq('id', r.id)

  if (r.path) {
    const { data, error } = await admin.storage.from('programme-resources').createSignedUrl(r.path, 60)
    if (error || !data) return new NextResponse('File unavailable', { status: 404 })
    return NextResponse.redirect(data.signedUrl)
  }
  if (r.file_url) return NextResponse.redirect(r.file_url)
  return new NextResponse('Not found', { status: 404 })
}
