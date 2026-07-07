'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// The assigned auditor submits their completed audit: this freezes their
// per-criterion results, reveals them read-only to all parties, and hands the
// application to the Certification Body for the final decision. The status write
// uses the service role (auditor-gated here) since auditors don't update
// applications directly under RLS.
export async function submitAudit(applicationId: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: app } = await supabase.from('applications').select('status, auditor_id').eq('id', applicationId).single()
  if (!app || app.auditor_id !== user.id) return { error: 'Not allowed' }
  if (app.status !== 'audit') return { error: 'This audit is not in progress.' }

  const admin = createAdminClient()
  const { error } = await admin.from('applications').update({ status: 'cb_review', updated_at: new Date().toISOString() }).eq('id', applicationId)
  if (error) return { error: error.message }

  revalidatePath(`/auditor/applications/${applicationId}`)
  revalidatePath(`/applications/${applicationId}`)
  revalidatePath('/cb/dashboard')
  revalidatePath(`/cb/applications/${applicationId}`)
  return { ok: true }
}
