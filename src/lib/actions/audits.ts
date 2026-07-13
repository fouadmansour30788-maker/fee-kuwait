'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const TYPES = ['onsite', 'offsite']

// The operator archives the current (live) audit: it snapshots the assigned
// auditor's per-criterion results + feedback from criterion_assessments into the
// audits history, tagged with the audit type (on-site / off-site) and period.
// The live board is left untouched, so the next cycle's auditor works on it.
export async function archiveAudit(
  applicationId: string,
  type: string,
  period: number,
): Promise<{ ok?: true; error?: string }> {
  if (!TYPES.includes(type)) return { error: 'Invalid audit type' }
  if (!Number.isInteger(period) || period < 2000 || period > 2100) return { error: 'Invalid period' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  // Current assigned auditor (name snapshot).
  const { data: app } = await supabase.from('applications').select('auditor_id').eq('id', applicationId).single()
  let auditorName: string | null = null
  if (app?.auditor_id) {
    const { data: u } = await supabase.from('users').select('name_en, email').eq('id', app.auditor_id).single()
    auditorName = u?.name_en || u?.email || null
  }

  // Snapshot the auditor's external results + notes for every assessed criterion.
  const { data: rows, error: readErr } = await supabase
    .from('criterion_assessments')
    .select('criterion_ref, result, note')
    .eq('application_id', applicationId)
  if (readErr) return { error: readErr.message }

  const results: Record<string, { result: string; note: string | null }> = {}
  for (const r of rows ?? []) {
    if ((r.result && r.result !== 'pending') || r.note) {
      results[r.criterion_ref] = { result: r.result ?? 'pending', note: r.note ?? null }
    }
  }
  if (Object.keys(results).length === 0) return { error: 'Nothing to archive — the auditor has not recorded any results yet.' }

  const { error } = await supabase.from('audits').insert({
    application_id: applicationId,
    auditor_id: app?.auditor_id ?? null,
    auditor_name: auditorName,
    type,
    period,
    results,
    created_by: user.id,
  })
  if (error) return { error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}
