'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  listFrameworks, getFrameworkStructure, listGroups, listCustomProperties, listUnitTypes,
  upsertFrameworkAnswers, getBulkTask, BecauseError,
  type UpsertPayload,
} from '@/lib/because/client'

// Discovery + import are operator-only (National Operator / Super Admin).
async function requireOperator() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' as const }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' as const }
  return { ok: true as const }
}

type Result<T> = { data: T } | { error: string }

async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  try {
    return { data: await fn() }
  } catch (e) {
    return { error: e instanceof BecauseError ? e.message : (e as Error).message }
  }
}

export const discoverFrameworks = () => run(() => listFrameworks())
export const discoverGroups = () => run(() => listGroups())
export const discoverCustomProperties = () => run(() => listCustomProperties())
export const discoverUnitTypes = () => run(() => listUnitTypes())
export const discoverFrameworkStructure = (frameworkId: string) => {
  if (!frameworkId?.trim()) return Promise.resolve({ error: 'Enter a framework id' } as Result<unknown>)
  return run(() => getFrameworkStructure(frameworkId.trim()))
}

export const importFrameworkAnswers = (payload: UpsertPayload) => run(() => upsertFrameworkAnswers(payload))
export const checkImportTask = (correlationId: string) => {
  if (!correlationId?.trim()) return Promise.resolve({ error: 'Enter a correlation id' } as Result<unknown>)
  return run(() => getBulkTask(correlationId.trim()))
}

// ── Configuration (saved discovered IDs) ──────────────────────────────

type FieldMap = Record<string, { dataPointId?: string; unitId?: string }>

// Save the IDs discovered from the API so the import can build its payload.
export async function saveBecauseConfig(input: {
  frameworkId: string; groupId: string; gkPropertyId: string; fieldMap: FieldMap
}): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const supabase = createClient()
  const { error } = await supabase.from('because_config').upsert({
    id: 'default',
    framework_id: input.frameworkId?.trim() || null,
    group_id: input.groupId?.trim() || null,
    gk_property_id: input.gkPropertyId?.trim() || null,
    field_map: input.fieldMap ?? {},
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })
  if (error) return { error: error.message }
  revalidatePath('/integrations/because')
  return { ok: true }
}

// Build + send a consumption upsert for one establishment/month using the saved
// config. Identifies the company by its Green Key number via the GK-ID custom
// property; answers carry each field's data-point id + unit id.
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export async function importConsumption(input: {
  greenKeyNumber: string; year: number; month: number; periodType?: 'Monthly' | 'Yearly'
  electricity?: number | null; water?: number | null; waste?: number | null
}): Promise<Result<{ correlationId: string }>> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }

  const { getBecauseConfig } = await import('@/lib/db/becauseConfig')
  const cfg = await getBecauseConfig()
  if (!cfg.framework_id) return { error: 'Set the framework id in configuration first.' }
  if (!cfg.gk_property_id) return { error: 'Set the GK-ID custom property id in configuration first.' }

  const gk = input.greenKeyNumber?.trim()
  if (!gk) return { error: 'Enter the establishment Green Key number.' }
  const year = Number(input.year)
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return { error: 'Invalid year.' }
  const periodType = input.periodType === 'Yearly' ? 'Yearly' : 'Monthly'
  const month = Number(input.month)
  if (periodType === 'Monthly' && (!Number.isInteger(month) || month < 1 || month > 12)) return { error: 'Invalid month.' }

  const vals: [string, number | null | undefined][] = [
    ['electricity', input.electricity], ['water', input.water], ['waste', input.waste],
  ]
  const answers = [] as { dataPointId: string; answer: { number: number }; unitId?: string }[]
  const missingUnit: string[] = []
  for (const [field, v] of vals) {
    if (v == null || v === undefined || Number.isNaN(Number(v))) continue
    const map = cfg.field_map[field]
    if (!map?.dataPointId) continue
    if (!map.unitId) { missingUnit.push(field); continue }
    // unitId must be a real unit GUID; the datapoint declares units so it is required.
    answers.push({ dataPointId: map.dataPointId, answer: { number: Number(v) }, unitId: map.unitId })
  }
  if (missingUnit.length > 0) return { error: `Set a unit id for: ${missingUnit.join(', ')} (required by BeCause when the field declares units).` }
  if (answers.length === 0) return { error: 'Enter at least one value whose field has a configured data-point id + unit id.' }

  // v2: a Monthly reading is its own bucket and REQUIRES `month` as the month
  // NAME (e.g. "September"), not a number. Yearly omits month.
  const period = periodType === 'Yearly'
    ? { periodType: 'Yearly' as const, year, answers }
    : { periodType: 'Monthly' as const, year, month: MONTH_NAMES[month - 1], answers }

  const payload: UpsertPayload = {
    frameworkId: cfg.framework_id,
    companies: [{
      identifiedBy: { customProperty: { customPropertyId: cfg.gk_property_id, value: gk } },
      periods: [period],
    }],
  }
  return run(() => upsertFrameworkAnswers(payload))
}
