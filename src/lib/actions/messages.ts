'use server'

import { createClient } from '@/lib/supabase/server'
import { ESTABLISHMENT_EDITABLE_STATUSES } from '@/lib/db/applications'
import { revalidatePath } from 'next/cache'

// Post a message to a criterion's thread. The author role is derived from the
// signed-in user; auditor messages are marked auditor_internal so RLS keeps them
// hidden from the establishment until the audit is published.
export async function postCriterionMessage(applicationId: string, criterionRef: string, body: string): Promise<{ ok?: true; error?: string }> {
  const text = body.trim()
  if (!text) return { error: 'Empty message' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  const role = me?.role
  const authorRole =
    role === 'admin' || role === 'super_admin' ? 'operator'
      : role === 'auditor' ? 'auditor'
        : role === 'certification_body' ? 'cb'
          : 'establishment'
  const visibility = authorRole === 'auditor' ? 'auditor_internal' : 'shared'

  // The establishment cannot comment once the application is locked (submitted to CB).
  if (authorRole === 'establishment') {
    const { data: appRow } = await supabase.from('applications').select('status').eq('id', applicationId).single()
    if (!appRow || !ESTABLISHMENT_EDITABLE_STATUSES.includes(appRow.status)) return { error: 'This application is locked.' }
  }

  const { error } = await supabase.from('criterion_messages').insert({
    application_id: applicationId,
    criterion_ref: criterionRef,
    author_id: user.id,
    author_role: authorRole,
    body: text.slice(0, 4000),
    visibility,
  })
  if (error) return { error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  revalidatePath(`/business/application/${applicationId}`)
  revalidatePath(`/school/application/${applicationId}`)
  revalidatePath(`/auditor/applications/${applicationId}`)
  revalidatePath(`/cb/applications/${applicationId}`)
  return { ok: true }
}
