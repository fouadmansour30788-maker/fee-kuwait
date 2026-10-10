'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { shareSource, directDownloadCandidates } from '@/lib/shareLinks'

const MAX_BYTES = 10 * 1024 * 1024
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif', 'image/svg+xml': 'svg' }

// Operator pastes a Google Drive / OneDrive / SharePoint / Dropbox share link:
// fetch the image server-side and store a copy in the public site-assets bucket,
// so the page shows it reliably (share links open a viewer, not the image).
export async function importImageFromShareLink(url: string): Promise<{ url?: string; source?: string; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' }

  const source = shareSource(url)
  if (!source) return { error: 'Not a Google Drive, OneDrive, SharePoint or Dropbox link.' }

  for (const candidate of directDownloadCandidates(url)) {
    try {
      const res = await fetch(candidate, { redirect: 'follow', cache: 'no-store' })
      const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
      if (!res.ok || !type.startsWith('image/')) continue
      const buf = new Uint8Array(await res.arrayBuffer())
      if (buf.byteLength > MAX_BYTES) return { error: 'That image is larger than 10 MB — please use a smaller one.' }
      const admin = createAdminClient()
      const path = `news/${crypto.randomUUID()}.${EXT[type] ?? 'jpg'}`
      const { error } = await admin.storage.from('site-assets').upload(path, buf, { contentType: type })
      if (error) return { error: `Could not store the image: ${error.message}` }
      return { url: admin.storage.from('site-assets').getPublicUrl(path).data.publicUrl, source }
    } catch { /* try the next candidate */ }
  }
  return { error: `Couldn't read the image from ${source}. Set the file's sharing to "Anyone with the link" (view), make sure it's an image (not a folder or document), or download it and use Upload instead.` }
}
