import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface AppDoc {
  id: string
  name: string
  path: string | null
  size: number | null
  created_at: string
  criterion_ref: string | null
  year: number | null
  uploaded_by: string | null
  url: string | null
  link_url: string | null
  isLink: boolean
  surveillance_id: string | null
}

const BUCKET = 'application-docs'

export { AUDIT_REPORT_REF } from '@/lib/doc-refs'

// Documents attached to an application, with short-lived signed download URLs.
// RLS decides which rows are visible (applicant sees own, staff see all); the
// signed URLs are generated with the service role so both sides can download.
export async function listApplicationDocuments(applicationId: string): Promise<AppDoc[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('application_documents')
    .select('id, name, path, size, created_at, criterion_ref, year, uploaded_by, link_url, surveillance_id')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })
  if (error) { console.error('listApplicationDocuments:', error.message); return [] }

  const admin = createAdminClient()
  return Promise.all((data ?? []).map(async (d) => {
    // A link row has no storage object — its URL is the link itself.
    if (d.link_url) return { ...d, url: d.link_url, isLink: true } as AppDoc
    const { data: signed } = d.path ? await admin.storage.from(BUCKET).createSignedUrl(d.path, 3600) : { data: null }
    return { ...d, url: signed?.signedUrl ?? null, isLink: false } as AppDoc
  }))
}

export function formatBytes(n: number | null): string {
  if (!n) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
