import { createClient } from '@/lib/supabase/server'

export type SurveillanceStatus = 'requested' | 'submitted' | 'reviewed' | 'certified' | 'not_certified'

export interface SurveillanceActivity {
  id: string
  applicationId: string
  period: number
  criteria: string[]
  requestNote: string | null
  responseNote: string | null
  status: SurveillanceStatus
  decisionNote: string | null
  requestedAt: string
  submittedAt: string | null
  decidedAt: string | null
}

export const SURVEILLANCE_STATUS_META: Record<SurveillanceStatus, { label: string; color: string; bg: string }> = {
  requested:     { label: 'Update requested', color: '#B45309', bg: '#FEF3C7' },
  submitted:     { label: 'Response submitted', color: '#1D4ED8', bg: '#EFF6FF' },
  reviewed:      { label: 'Reviewed by operator', color: '#7C3AED', bg: '#F3E8FF' },
  certified:     { label: 'Certification maintained', color: '#059669', bg: '#D1FAE5' },
  not_certified: { label: 'Not maintained', color: '#DC2626', bg: '#FEE2E2' },
}

function map(r: Record<string, unknown>): SurveillanceActivity {
  return {
    id: r.id as string,
    applicationId: r.application_id as string,
    period: r.period as number,
    criteria: (r.criteria ?? []) as string[],
    requestNote: (r.request_note ?? null) as string | null,
    responseNote: (r.response_note ?? null) as string | null,
    status: (r.status ?? 'requested') as SurveillanceStatus,
    decisionNote: (r.decision_note ?? null) as string | null,
    requestedAt: r.requested_at as string,
    submittedAt: (r.submitted_at ?? null) as string | null,
    decidedAt: (r.decided_at ?? null) as string | null,
  }
}

const COLS = 'id, application_id, period, criteria, request_note, response_note, status, decision_note, requested_at, submitted_at, decided_at'

// Surveillance activities for one application, newest first.
export async function listSurveillance(applicationId: string): Promise<SurveillanceActivity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('surveillance_activities')
    .select(COLS)
    .eq('application_id', applicationId)
    .order('period', { ascending: false })
    .order('requested_at', { ascending: false })
  if (error) { console.error('listSurveillance:', error.message); return [] }
  return (data ?? []).map(map)
}

// All surveillance activities visible to the signed-in user (RLS scopes them),
// with the applicant + programme, for the operator/CB list views.
export interface SurveillanceRow extends SurveillanceActivity {
  programme: string
  applicant: string | null
}
export async function listAllSurveillance(): Promise<SurveillanceRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('surveillance_activities')
    .select(`${COLS}, application:applications!application_id(programme, applicant:users!applicant_id(name_en, email))`)
    .order('requested_at', { ascending: false })
  if (error) { console.error('listAllSurveillance:', error.message); return [] }
  return (data ?? []).map((r) => {
    const app = (r as Record<string, unknown>).application as { programme?: string; applicant?: { name_en?: string; email?: string } | { name_en?: string; email?: string }[] } | null
    const applicant = Array.isArray(app?.applicant) ? app?.applicant[0] : app?.applicant
    return { ...map(r as Record<string, unknown>), programme: app?.programme ?? '', applicant: applicant?.name_en || applicant?.email || null }
  })
}
