'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getEcoGate } from '@/lib/db/ecoSchools'
import { criteriaForProgramme } from '@/lib/criteria'
import { GREEN_FLAG_SECTIONS, totalScore, type ScoreAnswers } from '@/lib/data/greenFlagScorecard'

async function requireOperator(): Promise<{ userId: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' }
  return { userId: user.id }
}

function revalidate(id: string) {
  revalidatePath(`/applications/${id}`)
  revalidatePath(`/school/application/${id}`)
  revalidatePath(`/cb/applications/${id}`)
  revalidatePath(`/auditor/applications/${id}`)
}

// Operator approves Steps 1–2 → Steps 3–7 open for the school.
export async function approveEcoSteps(applicationId: string): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if ('error' in gate) return { error: gate.error }
  const admin = createAdminClient()
  const { data: app } = await admin.from('applications').select('programme, applicant_id').eq('id', applicationId).single()
  if (!app || app.programme !== 'eco-schools') return { error: 'Not an Eco-Schools application.' }

  const g = await getEcoGate(applicationId)
  if (!g.met) return { error: 'Steps 1–2 are not ready: each needs an attachment, and at least 2 themes must be selected on Step 2.' }

  const { error } = await admin.from('applications').update({
    es_unlocked_at: new Date().toISOString(), es_unlocked_by: gate.userId, updated_at: new Date().toISOString(),
  }).eq('id', applicationId)
  if (error) return { error: error.message.includes('es_unlocked') ? 'Run migration 053 (Eco-Schools phases) first.' : error.message }

  await admin.from('notifications').insert({
    user_id: app.applicant_id, type: 'application',
    title_en: 'Steps 1–2 approved — all steps are now open', title_ar: 'تمت الموافقة على الخطوتين 1–2 — جميع الخطوات مفتوحة الآن',
    message_en: 'The National Operator approved your Eco-Committee and Sustainability Audit. You can now work on Steps 3–7.',
    message_ar: 'وافق المشغّل الوطني على اللجنة البيئية والتدقيق البيئي. يمكنك الآن العمل على الخطوات 3–7.',
    action_url: `/school/application/${applicationId}`,
  })
  revalidate(applicationId)
  return { ok: true }
}

// Operator saves ONE step's Green Flag questions (shown under that step on the
// criteria board). Merged into the stored scorecard; the total is recomputed here.
// Opens once every step is marked Ready (or N/A Confirmed).
export async function saveGreenFlagSection(applicationId: string, sectionId: string, answers: ScoreAnswers): Promise<{ ok?: true; total?: number; error?: string }> {
  const gate = await requireOperator()
  if ('error' in gate) return { error: gate.error }
  const sec = GREEN_FLAG_SECTIONS.find((s) => s.id === sectionId)
  if (!sec) return { error: 'Unknown section.' }
  const admin = createAdminClient()
  const { data: app, error: readErr } = await admin.from('applications').select('programme, es_score').eq('id', applicationId).single()
  if (readErr) return { error: readErr.message.includes('es_score') ? 'Run migration 053 (Eco-Schools phases) first.' : readErr.message }
  if (!app || app.programme !== 'eco-schools') return { error: 'Not an Eco-Schools application.' }
  if (!(await allStepsReady(applicationId))) return { error: 'The Green Flag questions open once every step is marked Ready.' }

  const merged: ScoreAnswers = { ...((app.es_score as ScoreAnswers | null) ?? {}) }
  for (const q of sec.questions) delete merged[q.id]
  Object.assign(merged, cleanAnswers(answers, sec.questions.map((q) => q.id)))
  const total = totalScore(merged)

  const { error } = await admin.from('applications').update({
    es_score: merged, es_score_total: total, es_scored_at: new Date().toISOString(), es_scored_by: gate.userId, updated_at: new Date().toISOString(),
  }).eq('id', applicationId)
  if (error) return { error: error.message }
  revalidate(applicationId)
  return { ok: true, total }
}

async function allStepsReady(applicationId: string): Promise<boolean> {
  const steps = criteriaForProgramme('eco-schools')
  const { data: rows } = await createAdminClient().from('criterion_assessments').select('criterion_ref, internal_result').eq('application_id', applicationId)
  const ready = new Set((rows ?? []).filter((r) => r.internal_result === 'pass' || r.internal_result === 'na').map((r) => r.criterion_ref))
  return steps.every((s) => ready.has(s.ref))
}

// Keep only known questions (optionally limited to `onlyIds`) and valid values.
function cleanAnswers(answers: ScoreAnswers, onlyIds?: string[]): ScoreAnswers {
  const clean: ScoreAnswers = {}
  for (const sec of GREEN_FLAG_SECTIONS) for (const q of sec.questions) {
    if (onlyIds && !onlyIds.includes(q.id)) continue
    const a = answers?.[q.id]
    if (!a) continue
    const out: ScoreAnswers[string] = {}
    if (q.kind === 'choice' && typeof a.choice === 'number' && q.options?.[a.choice]) out.choice = a.choice
    if (typeof a.value === 'string' && a.value.trim()) out.value = a.value.trim().slice(0, 2000)
    if (typeof a.link === 'string' && a.link.trim()) out.link = a.link.trim().slice(0, 500)
    if (a.values && typeof a.values === 'object') {
      const v: Record<string, string> = {}
      for (const [k, val] of Object.entries(a.values)) if (typeof val === 'string' && val.trim()) v[k.slice(0, 40)] = val.trim().slice(0, 40)
      if (Object.keys(v).length) out.values = v
    }
    if (Object.keys(out).length) clean[q.id] = out
  }
  return clean
}
