import { createClient } from '@/lib/supabase/server'
import { normalizeThemes } from '@/lib/data/ecoSchoolsCriteria'

// Themes selected for an Eco-Schools application. Falls back to the themes the
// school ticked at registration until a selection is saved on the board.
export async function getEcoThemes(applicationId: string): Promise<string[]> {
  const supabase = createClient()
  const { data: app, error } = await supabase.from('applications').select('es_themes, entity_type, entity_id').eq('id', applicationId).maybeSingle()
  if (error || !app) {
    // Before migration 052 the column doesn't exist — use registration themes.
    const { data: base } = await supabase.from('applications').select('entity_type, entity_id').eq('id', applicationId).maybeSingle()
    return base ? registrationThemes(base.entity_type, base.entity_id) : []
  }
  if (Array.isArray(app.es_themes)) return normalizeThemes(app.es_themes)
  return registrationThemes(app.entity_type, app.entity_id)
}

async function registrationThemes(entityType: string | null, entityId: string | null): Promise<string[]> {
  if (entityType !== 'school' || !entityId) return []
  const { data } = await createClient().from('schools').select('details').eq('id', entityId).maybeSingle()
  return normalizeThemes((data?.details as { themes?: unknown } | null)?.themes)
}
