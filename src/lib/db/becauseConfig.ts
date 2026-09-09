import { createClient } from '@/lib/supabase/server'

export type FieldMap = Record<string, { dataPointId?: string; unitId?: string }>

export interface BecauseConfig {
  framework_id: string | null
  group_id: string | null
  gk_property_id: string | null
  field_map: FieldMap
}

export const CONSUMPTION_FIELDS = ['electricity', 'water', 'waste'] as const
export type ConsumptionField = typeof CONSUMPTION_FIELDS[number]

const EMPTY: BecauseConfig = { framework_id: null, group_id: null, gk_property_id: null, field_map: {} }

export async function getBecauseConfig(): Promise<BecauseConfig> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('because_config')
    .select('framework_id, group_id, gk_property_id, field_map')
    .eq('id', 'default')
    .maybeSingle()
  if (error || !data) return EMPTY
  return {
    framework_id: data.framework_id ?? null,
    group_id: data.group_id ?? null,
    gk_property_id: data.gk_property_id ?? null,
    field_map: (data.field_map ?? {}) as FieldMap,
  }
}
