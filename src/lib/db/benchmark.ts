import { createClient } from '@/lib/supabase/server'
import { GK_CRITERIA, GK_SECTIONS } from '@/lib/data/greenKeyCriteria'

// Anonymous peer benchmarking for the signed-in establishment: how its per-area
// Green Key completion compares to the average across other green-key applicants.
// Read-only; peers are never named.

type RawRow = { application_id: string; criterion_ref: string; result: string | null; internal_result: string | null; applicant_result: string | null; applicant_status: string | null }

function eff(r: RawRow | undefined): string {
  if (!r) return 'pending'
  if (r.result && r.result !== 'pending') return r.result
  if (r.internal_result && r.internal_result !== 'pending') return r.internal_result
  if (r.applicant_status === 'complete') return 'pass'
  return r.applicant_result ?? 'pending'
}

// Per-area pass rate (0..100) for one application's assessment rows.
function areaRates(rows: RawRow[]): Record<number, number> {
  const byRef = new Map(rows.map((r) => [r.criterion_ref, r]))
  const out: Record<number, number> = {}
  for (const sec of GK_SECTIONS) {
    const refs = GK_CRITERIA.filter((c) => c.section === sec.n)
    const applicable = refs.filter((c) => eff(byRef.get(c.id)) !== 'na')
    const passed = applicable.filter((c) => eff(byRef.get(c.id)) === 'pass').length
    out[sec.n] = applicable.length ? Math.round((passed / applicable.length) * 100) : 0
  }
  return out
}

export interface BenchmarkArea { n: number; title: string; mine: number; peerAvg: number }
export interface Benchmark {
  areas: BenchmarkArea[]
  overallMine: number
  overallPeerAvg: number
  percentile: number   // % of peers this establishment is at or above
  peerCount: number
}

export async function getBenchmark(): Promise<Benchmark | null> {
  const supabase = createClient()
  // My green-key application (RLS returns only mine).
  const { data: mineApp } = await supabase.from('applications').select('id').eq('programme', 'green-key').limit(1).maybeSingle()
  if (!mineApp) return null

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  // Peer applications: all green-key apps with assessment activity.
  const { data: peerApps } = await admin.from('applications')
    .select('id, status')
    .eq('programme', 'green-key')
    .in('status', ['in_progress', 'under_review', 'documents_pending', 'audit', 'audit_in_progress', 'cb_review', 'cb_final_review', 'certified', 'certified_active', 'certified_rectification', 'certified_rectification_active'])
  const allIds = Array.from(new Set([...(peerApps ?? []).map((a) => a.id), mineApp.id]))

  const { data: rows } = await admin.from('criterion_assessments')
    .select('application_id, criterion_ref, result, internal_result, applicant_result, applicant_status')
    .in('application_id', allIds)
  const byApp = new Map<string, RawRow[]>()
  for (const r of (rows ?? []) as RawRow[]) {
    const arr = byApp.get(r.application_id) ?? []
    arr.push(r); byApp.set(r.application_id, arr)
  }

  const mineRates = areaRates(byApp.get(mineApp.id) ?? [])
  const peerIds = allIds.filter((id) => id !== mineApp.id)
  const peerRatesList = peerIds.map((id) => areaRates(byApp.get(id) ?? []))

  const areas: BenchmarkArea[] = GK_SECTIONS.map((sec) => {
    const peerVals = peerRatesList.map((r) => r[sec.n])
    const peerAvg = peerVals.length ? Math.round(peerVals.reduce((a, b) => a + b, 0) / peerVals.length) : 0
    return { n: sec.n, title: sec.title, mine: mineRates[sec.n], peerAvg }
  })

  const overall = (r: Record<number, number>) => Math.round(GK_SECTIONS.reduce((a, s) => a + r[s.n], 0) / GK_SECTIONS.length)
  const overallMine = overall(mineRates)
  const peerOveralls = peerRatesList.map(overall)
  const overallPeerAvg = peerOveralls.length ? Math.round(peerOveralls.reduce((a, b) => a + b, 0) / peerOveralls.length) : 0
  const atOrBelow = peerOveralls.filter((v) => v <= overallMine).length
  const percentile = peerOveralls.length ? Math.round((atOrBelow / peerOveralls.length) * 100) : 100

  return { areas, overallMine, overallPeerAvg, percentile, peerCount: peerIds.length }
}
