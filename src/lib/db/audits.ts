import { createClient } from '@/lib/supabase/server'
import type { CriterionResult } from './assessments'
import type { AuditType } from '@/lib/audit-types'

export type { AuditType } from '@/lib/audit-types'
export { AUDIT_TYPE_META } from '@/lib/audit-types'

export interface AuditRecord {
  id: string
  auditorName: string | null
  type: AuditType
  period: number
  createdAt: string
  // criterion_ref -> that auditor's result + feedback for this audit
  results: Record<string, { result: CriterionResult; note: string | null }>
}

// Archived audits for an application, newest first (RLS decides visibility).
export async function listAudits(applicationId: string): Promise<AuditRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('audits')
    .select('id, auditor_name, type, period, results, created_at')
    .eq('application_id', applicationId)
    .order('period', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) { console.error('listAudits:', error.message); return [] }
  return (data ?? []).map((a) => ({
    id: a.id,
    auditorName: a.auditor_name ?? null,
    type: a.type as AuditType,
    period: a.period,
    createdAt: a.created_at,
    results: (a.results ?? {}) as AuditRecord['results'],
  }))
}
