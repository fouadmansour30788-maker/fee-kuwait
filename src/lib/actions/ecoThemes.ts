'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { establishmentCanEdit } from '@/lib/workflow'
import { normalizeThemes } from '@/lib/data/ecoSchoolsCriteria'

// Save the Eco-Schools themes (Step 2). The school may change them while its
// application is editable; the National Operator may change them at any time.
export async function setEcoThemes(applicationId: string, themes: string[]): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  const admin = createAdminClient()
  const { data: app } = await admin.from('applications').select('applicant_id, status, programme').eq('id', applicationId).single()
  if (!app || app.programme !== 'eco-schools') return { error: 'Application not found' }

  const isStaff = !!me && ['admin', 'super_admin'].includes(me.role)
  if (!isStaff) {
    if (app.applicant_id !== user.id) return { error: 'Not allowed' }
    if (!establishmentCanEdit(app.status)) return { error: 'This application is locked.' }
  }

  const { error } = await admin.from('applications').update({ es_themes: normalizeThemes(themes), updated_at: new Date().toISOString() }).eq('id', applicationId)
  if (error) return { error: error.message.includes('es_themes') ? 'Run migration 052 (Eco-Schools themes) first.' : error.message }

  revalidatePath(`/school/application/${applicationId}`)
  revalidatePath(`/applications/${applicationId}`)
  revalidatePath(`/cb/applications/${applicationId}`)
  revalidatePath(`/auditor/applications/${applicationId}`)
  return { ok: true }
}
