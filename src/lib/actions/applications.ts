'use server'

import { createClient } from '@/lib/supabase/server'
import { myEntity } from '@/lib/db/establishment'
import { PROGRAMME_LABEL } from '@/lib/db/applications'
import { revalidatePath } from 'next/cache'

const PROGRAMMES = ['eco-schools', 'blue-flag', 'green-key', 'leaf', 'yre', 'eco-campus']

// Shared by the establishment and school portals: create an application for the
// signed-in applicant's institution. One application per programme per applicant.
export async function createApplication(programme: string): Promise<{ ok?: true; error?: string }> {
  if (!PROGRAMMES.includes(programme)) return { error: 'Invalid programme' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  // Block duplicates — one application per programme for this applicant.
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('applicant_id', user.id)
    .eq('programme', programme)
    .limit(1)
  if (existing && existing.length > 0) {
    return { error: `You already have a ${PROGRAMME_LABEL[programme] ?? programme} application.` }
  }

  const ent = await myEntity()
  // Registration must be approved by the National Operator before applying (Step 1).
  if (ent && ent.status !== 'active') return { error: 'Your registration is pending approval by the National Operator.' }

  const { error } = await supabase.from('applications').insert({
    applicant_id: user.id,
    entity_type: ent?.entityType ?? null,
    entity_id: ent?.entityId ?? null,
    programme,
    status: 'new',
  })
  if (error) return { error: error.message }

  revalidatePath('/business/application'); revalidatePath('/business/dashboard')
  revalidatePath('/school/application'); revalidatePath('/school/dashboard')
  return { ok: true }
}
