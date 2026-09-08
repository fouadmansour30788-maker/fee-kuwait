'use server'

import { createClient } from '@/lib/supabase/server'
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
