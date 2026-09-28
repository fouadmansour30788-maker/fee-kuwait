import { createClient } from '@/lib/supabase/server'

export interface CriterionMessage {
  id: string
  criterion_ref: string
  author_role: string | null
  body: string
  visibility: string
  phase: string           // 'pre_audit' | 'post_audit'
  created_at: string
  edited_at?: string | null
  mine?: boolean          // written by the signed-in user (can edit)
}

// Per-criterion comment threads, grouped by criterion_ref. RLS decides what the
// viewer sees (the establishment never receives auditor_internal messages).
export async function listCriterionMessages(applicationId: string): Promise<Record<string, CriterionMessage[]>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const base = 'id, criterion_ref, author_id, author_role, body, visibility, phase, created_at'
  const query = (cols: string) => supabase.from('criterion_messages').select(cols).eq('application_id', applicationId).order('created_at', { ascending: true })
  let { data, error } = await query(`${base}, edited_at`)
  // Before migration 051 the edited_at column doesn't exist — fall back.
  if (error) ({ data, error } = await query(base))
  if (error) { console.error('listCriterionMessages:', error.message); return {} }
  const map: Record<string, CriterionMessage[]> = {}
  for (const row of (data ?? []) as unknown as (CriterionMessage & { author_id: string | null })[]) {
    const { author_id, ...m } = row
    ;(map[m.criterion_ref] ??= []).push({ ...m, mine: !!user && author_id === user.id })
  }
  return map
}
