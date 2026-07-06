import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface AppDoc {
  id: string
  name: string
  path: string
  size: number | null
  created_at: string
  url: string | null
}

const BUCKET = 'application-docs'

// Documents attached to an application, with short-lived signed download URLs.
// RLS decides which rows are visible (applicant sees own, staff see all); the
// signed URLs are generated with the service role so both sides can download.
export async function listApplicationDocuments(applicationId: string): Promise<AppDoc[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('application_documents')
    .select('id, name, path, size, created_at')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })
  if (error) { console.error('listApplicationDocuments:', error.message); return [] }

  const admin = createAdminClient()
  return Promise.all((data ?? []).map(async (d) => {
    const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(d.path, 3600)
    return { ...d, url: signed?.signedUrl ?? null } as AppDoc
  }))
}

export function formatBytes(n: number | null): string {
  if (!n) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
