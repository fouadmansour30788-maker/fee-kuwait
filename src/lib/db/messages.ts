import { createClient } from '@/lib/supabase/server'

export interface CriterionMessage {
  id: string
  criterion_ref: string
  author_role: string | null
  body: string
  visibility: string
  created_at: string
}

// Per-criterion comment threads, grouped by criterion_ref. RLS decides what the
// viewer sees (the establishment never receives auditor_internal messages).
export async function listCriterionMessages(applicationId: string): Promise<Record<string, CriterionMessage[]>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('criterion_messages')
    .select('id, criterion_ref, author_role, body, visibility, created_at')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true })
  if (error) { console.error('listCriterionMessages:', error.message); return {} }
  const map: Record<string, CriterionMessage[]> = {}
  for (const m of data ?? []) (map[m.criterion_ref] ??= []).push(m as CriterionMessage)
  return map
}
