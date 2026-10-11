import { createClient } from '@/lib/supabase/server'
import type { ResourceItem } from '@/lib/resources'

const COLS = 'id, title_en, title_ar, description_en, description_ar, programme, language, category, file_url, path, file_type, file_size, downloads, published, created_at'

// Programme resources. RLS: members read published ones; staff read all.
// `programmes` limits to those programmes plus the all-programme resources.
export async function listResources(programmes?: string[]): Promise<ResourceItem[]> {
  const supabase = createClient()
  const run = (cols: string) => {
    let q = supabase.from('resources').select(cols).order('created_at', { ascending: false })
    if (programmes) q = q.or(`programme.is.null,programme.in.(${programmes.join(',')})`)
    return q
  }
  // cover_url arrives with migration 056 — fall back without it until then.
  let { data, error } = await run(`${COLS}, cover_url`)
  if (error) ({ data, error } = await run(COLS))
  if (error) { console.error('listResources:', error.message); return [] }
  return (data ?? []) as unknown as ResourceItem[]
}
