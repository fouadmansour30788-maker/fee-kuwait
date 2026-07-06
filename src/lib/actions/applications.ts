'use server'

import { createClient } from '@/lib/supabase/server'
import { myEntity } from '@/lib/db/establishment'
import { revalidatePath } from 'next/cache'

const PROGRAMMES = ['eco-schools', 'blue-flag', 'green-key', 'leaf', 'yre', 'eco-campus']

// Shared by the establishment and school portals: create an application for the
// signed-in applicant's institution.
export async function createApplication(programme: string): Promise<{ ok?: true; error?: string }> {
  if (!PROGRAMMES.includes(programme)) return { error: 'Invalid programme' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const ent = await myEntity()
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
