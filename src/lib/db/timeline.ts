import { createClient } from '@/lib/supabase/server'
import { listAudits } from '@/lib/db/audits'
import { listSurveillance } from '@/lib/db/surveillance'
import { listAuditTrail } from '@/lib/db/applications'
import { AUDIT_TYPE_META } from '@/lib/audit-types'
import { PROGRAMME_LABEL, statusMeta, CB_DECISION_LABEL } from '@/lib/db/applications'

// A single event on the establishment's journey. `at` may be null for a
// milestone that has no precise timestamp (e.g. a Green Key number issued
// before we started tracking that moment).
export interface TimelineEvent {
  id: string
  at: string | null
  title: string
  detail: string | null
  tone: 'registration' | 'eligibility' | 'application' | 'audit' | 'surveillance' | 'decision' | 'override'
  actor?: string | null
}

export const TIMELINE_TONE: Record<TimelineEvent['tone'], { color: string; bg: string; label: string }> = {
  registration: { color: '#1D4ED8', bg: '#EFF6FF', label: 'Registration' },
  eligibility:  { color: '#7C3AED', bg: '#F5F3FF', label: 'Eligibility' },
  application:  { color: '#0F766E', bg: '#F0FDFA', label: 'Application' },
  audit:        { color: '#B45309', bg: '#FEF3C7', label: 'Audit' },
  surveillance: { color: '#0891B2', bg: '#ECFEFF', label: 'Surveillance' },
  decision:     { color: '#047857', bg: '#ECFDF3', label: 'Decision' },
  override:     { color: '#64748B', bg: '#F1F5F9', label: 'Record' },
}

// Assemble the full lifecycle of an application/establishment from the records
// that already carry timestamps — no separate event log needed. Sorted oldest
// → newest (undated milestones sink to the end).
export async function getApplicationTimeline(applicationId: string): Promise<TimelineEvent[]> {
  const supabase = createClient()

  const { data: app } = await supabase
    .from('applications')
    .select('id, entity_id, entity_type, programme, status, submitted_at, cb_decision, cb_note, created_at')
    .eq('id', applicationId)
    .single()
  if (!app) return []

  const [audits, surveillance, trail, ps] = await Promise.all([
    listAudits(applicationId),
    listSurveillance(applicationId),
    listAuditTrail(applicationId),
    supabase.from('pre_screening').select('status, submitted_at, reviewed_at, review_note, main_category').eq('application_id', applicationId).maybeSingle(),
  ])

  // Establishment registration record (created / approved / Green Key number).
  let entity: { name_en?: string; status?: string; created_at?: string; green_key_number?: string | null; updated_at?: string } | null = null
  if (app.entity_id && app.entity_type) {
    const table = app.entity_type === 'school' ? 'schools' : 'businesses'
    const { data } = await supabase.from(table).select('name_en, status, created_at, green_key_number, updated_at').eq('id', app.entity_id).maybeSingle()
    entity = data
  }

  const ev: TimelineEvent[] = []
  const push = (e: TimelineEvent) => ev.push(e)

  if (entity?.created_at) push({ id: 'reg', at: entity.created_at, tone: 'registration', title: 'Registered', detail: entity.name_en ?? null })

  const psRow = ps.data
  if (psRow?.submitted_at) push({ id: 'ps-sub', at: psRow.submitted_at, tone: 'eligibility', title: 'Pre-screening submitted', detail: psRow.main_category ? `Suggested category: ${psRow.main_category}` : null })
  if (psRow?.reviewed_at) {
    const approved = psRow.status === 'eligible'
    push({ id: 'ps-rev', at: psRow.reviewed_at, tone: 'eligibility', title: approved ? 'Eligibility approved' : psRow.status === 'rejected' ? 'Eligibility declined' : 'Eligibility reviewed', detail: psRow.review_note ?? null })
  } else if (entity?.status === 'active') {
    // Registration approved (e.g. an Eco-Schools school with no pre-screening).
    push({ id: 'reg-ok', at: null, tone: 'registration', title: 'Registration approved', detail: 'Application opened' })
  }

  if (app.submitted_at) push({ id: 'app-sub', at: app.submitted_at, tone: 'application', title: 'Application submitted', detail: PROGRAMME_LABEL[app.programme] ?? app.programme })

  for (const a of audits) {
    const meta = AUDIT_TYPE_META[a.type]
    push({ id: `audit-${a.id}`, at: a.createdAt, tone: 'audit', title: `${meta?.label ?? a.type} audit — period ${a.period}`, detail: a.auditorName ? `Auditor: ${a.auditorName}` : null, actor: a.auditorName })
  }

  for (const s of surveillance) {
    if (s.requestedAt) push({ id: `sv-req-${s.id}`, at: s.requestedAt, tone: 'surveillance', title: `Surveillance requested — period ${s.period}`, detail: s.criteria.length ? `${s.criteria.length} criteri${s.criteria.length === 1 ? 'on' : 'a'}` : null })
    if (s.submittedAt) push({ id: `sv-sub-${s.id}`, at: s.submittedAt, tone: 'surveillance', title: `Surveillance update submitted — period ${s.period}`, detail: s.responseNote ?? null })
    if (s.decidedAt) push({ id: `sv-dec-${s.id}`, at: s.decidedAt, tone: 'surveillance', title: `Surveillance ${s.status} — period ${s.period}`, detail: s.decisionNote ?? null })
  }

  if (app.cb_decision && app.cb_decision !== 'pending') {
    push({ id: 'cb', at: null, tone: 'decision', title: `Certification decision: ${CB_DECISION_LABEL[app.cb_decision] ?? app.cb_decision}`, detail: app.cb_note ?? null })
  }
  if (entity?.green_key_number) push({ id: 'gk', at: entity.updated_at ?? null, tone: 'decision', title: 'Green Key number issued', detail: entity.green_key_number })

  // Manual overrides / re-opens (operator view only — RLS hides these from the applicant).
  for (const t of trail) {
    push({ id: `tr-${t.id}`, at: t.createdAt, tone: 'override', title: t.field, detail: [t.previousValue && `from ${t.previousValue}`, t.newValue && `to ${t.newValue}`].filter(Boolean).join(' ') || null, actor: t.userName })
  }

  // Oldest → newest; undated milestones (null `at`) sink to the bottom.
  const s = statusMeta(app.status)
  push({ id: 'now', at: null, tone: 'application', title: `Current status: ${s.label}`, detail: null })

  return ev.sort((a, b) => {
    if (!a.at && !b.at) return 0
    if (!a.at) return 1
    if (!b.at) return -1
    return new Date(a.at).getTime() - new Date(b.at).getTime()
  })
}
