import { createAdminClient } from '@/lib/supabase/admin'
import { ES_GATE_STEPS, ES_LOCKED_STEPS, ES_MIN_THEMES, normalizeThemes } from '@/lib/data/ecoSchoolsCriteria'
import type { ScoreAnswers } from '@/lib/data/greenFlagScorecard'

export interface EcoState {
  unlockedAt: string | null
  score: ScoreAnswers | null
  scoreTotal: number | null
  scoredAt: string | null
}

// Phase + scorecard state for an Eco-Schools application (service role, so the
// school, operator, CB and auditor all get the same answer). Before migration
// 053 the columns don't exist — treat as "not yet unlocked / not scored".
export async function getEcoState(applicationId: string): Promise<EcoState> {
  const { data, error } = await createAdminClient().from('applications')
    .select('es_unlocked_at, es_score, es_score_total, es_scored_at').eq('id', applicationId).maybeSingle()
  if (error || !data) return { unlockedAt: null, score: null, scoreTotal: null, scoredAt: null }
  return {
    unlockedAt: data.es_unlocked_at ?? null,
    score: (data.es_score as ScoreAnswers | null) ?? null,
    scoreTotal: data.es_score_total ?? null,
    scoredAt: data.es_scored_at ?? null,
  }
}

export interface EcoGate { step1Docs: number; step2Docs: number; themes: number; met: boolean }

// The conditions for the operator to approve Steps 1–2.
export async function getEcoGate(applicationId: string): Promise<EcoGate> {
  const admin = createAdminClient()
  const { data: docs } = await admin.from('application_documents').select('criterion_ref')
    .eq('application_id', applicationId).in('criterion_ref', ES_GATE_STEPS).is('surveillance_id', null)
  const step1Docs = (docs ?? []).filter((d) => d.criterion_ref === '1').length
  const step2Docs = (docs ?? []).filter((d) => d.criterion_ref === '2').length

  let themes: string[] = []
  const { data: app, error } = await admin.from('applications').select('es_themes, entity_type, entity_id').eq('id', applicationId).maybeSingle()
  if (!error && app) {
    if (Array.isArray(app.es_themes)) themes = normalizeThemes(app.es_themes)
    else if (app.entity_type === 'school' && app.entity_id) {
      const { data: school } = await admin.from('schools').select('details').eq('id', app.entity_id).maybeSingle()
      themes = normalizeThemes((school?.details as { themes?: unknown } | null)?.themes)
    }
  }
  return { step1Docs, step2Docs, themes: themes.length, met: step1Docs > 0 && step2Docs > 0 && themes.length >= ES_MIN_THEMES }
}

// True when this step is still locked (Eco-Schools, Steps 3–7, not yet approved).
export async function isEcoStepLocked(applicationId: string, criterionRef: string | null | undefined): Promise<boolean> {
  if (!criterionRef || !ES_LOCKED_STEPS.includes(criterionRef)) return false
  const admin = createAdminClient()
  const { data: app } = await admin.from('applications').select('programme').eq('id', applicationId).maybeSingle()
  if (app?.programme !== 'eco-schools') return false
  return !(await getEcoState(applicationId)).unlockedAt
}

// Tell the operator once Steps 1–2 meet the approval conditions (no repeat while
// an earlier alert is still unread).
export async function notifyEcoGateIfReady(applicationId: string): Promise<void> {
  const admin = createAdminClient()
  const { data: app } = await admin.from('applications').select('programme, applicant:users!applicant_id(name_en, email)').eq('id', applicationId).maybeSingle()
  if (app?.programme !== 'eco-schools') return
  if ((await getEcoState(applicationId)).unlockedAt) return
  if (!(await getEcoGate(applicationId)).met) return
  const url = `/applications/${applicationId}`
  const { count } = await admin.from('notifications').select('id', { count: 'exact', head: true }).eq('type', 'es_gate_ready').eq('action_url', url).eq('read', false)
  if (count) return
  const a = (Array.isArray(app.applicant) ? app.applicant[0] : app.applicant) as { name_en?: string; email?: string } | undefined
  const name = a?.name_en || a?.email || 'A school'
  const { data: staff } = await admin.from('users').select('id').in('role', ['admin', 'super_admin'])
  if (staff?.length) {
    await admin.from('notifications').insert(staff.map((s) => ({
      user_id: s.id, type: 'es_gate_ready',
      title_en: 'Eco-Schools: Steps 1–2 ready for review', title_ar: 'المدارس البيئية: الخطوتان 1–2 جاهزتان للمراجعة',
      message_en: `${name} has completed Steps 1–2 (Eco-Committee, Sustainability Audit). Review and approve to open the remaining steps.`,
      message_ar: `${name} أكمل الخطوتين 1–2. يرجى المراجعة والموافقة لفتح باقي الخطوات.`,
      action_url: url,
    })))
  }
}

export interface EcoBoard {
  state: EcoState
  gate: EcoGate
  stepDocs: Record<string, number>   // attachments per step (main board only)
  allReady: boolean                  // every step Ready / N/A Confirmed by the operator
  lockedRefs: string[]               // steps shown minimised + locked
}

export async function getEcoBoard(applicationId: string): Promise<EcoBoard> {
  const admin = createAdminClient()
  const [state, gate, docsRes, rowsRes] = await Promise.all([
    getEcoState(applicationId),
    getEcoGate(applicationId),
    admin.from('application_documents').select('criterion_ref').eq('application_id', applicationId).is('surveillance_id', null),
    admin.from('criterion_assessments').select('criterion_ref, internal_result').eq('application_id', applicationId),
  ])
  const stepDocs: Record<string, number> = {}
  for (const d of docsRes.data ?? []) if (d.criterion_ref) stepDocs[d.criterion_ref] = (stepDocs[d.criterion_ref] ?? 0) + 1
  const ready = new Set((rowsRes.data ?? []).filter((r) => r.internal_result === 'pass' || r.internal_result === 'na').map((r) => r.criterion_ref))
  const allReady = ['1', '2', '3', '4', '5', '6', '7'].every((r) => ready.has(r))
  return { state, gate, stepDocs, allReady, lockedRefs: state.unlockedAt ? [] : ES_LOCKED_STEPS }
}
