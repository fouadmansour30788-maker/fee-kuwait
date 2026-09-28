'use server'

import { createClient } from '@/lib/supabase/server'
import { establishmentCanEdit } from '@/lib/workflow'
import { revalidatePath } from 'next/cache'

// Post a message to a criterion's thread. The author role is derived from the
// signed-in user; auditor messages are marked auditor_internal so RLS keeps them
// hidden from the establishment until the audit is published.
export async function postCriterionMessage(applicationId: string, criterionRef: string, body: string, phase: 'pre_audit' | 'post_audit' = 'pre_audit'): Promise<{ ok?: true; error?: string }> {
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
    if (!appRow || !establishmentCanEdit(appRow.status)) return { error: 'This application is locked.' }
  }

  const { error } = await supabase.from('criterion_messages').insert({
    application_id: applicationId,
    criterion_ref: criterionRef,
    author_id: user.id,
    author_role: authorRole,
    body: text.slice(0, 4000),
    visibility,
    phase,
  })
  if (error) return { error: error.message }

  revalidatePath(`/applications/${applicationId}`)
  revalidatePath(`/business/application/${applicationId}`)
  revalidatePath(`/school/application/${applicationId}`)
  revalidatePath(`/auditor/applications/${applicationId}`)
  revalidatePath(`/cb/applications/${applicationId}`)
  return { ok: true }
}

// Edit one of your own comments. Only the author may edit; the establishment
// can't edit once its application is locked (same rule as posting).
export async function editCriterionMessage(messageId: string, body: string): Promise<{ ok?: true; error?: string }> {
  const text = body.trim()
  if (!text) return { error: 'Comment cannot be empty.' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: msg } = await supabase.from('criterion_messages').select('id, author_id, author_role, application_id').eq('id', messageId).single()
  if (!msg) return { error: 'Comment not found.' }
  if (msg.author_id !== user.id) return { error: 'You can only edit your own comments.' }
  if (msg.author_role === 'establishment') {
    const { data: appRow } = await supabase.from('applications').select('status').eq('id', msg.application_id).single()
    if (!appRow || !establishmentCanEdit(appRow.status)) return { error: 'This application is locked.' }
  }

  const { error } = await supabase.from('criterion_messages')
    .update({ body: text.slice(0, 4000), edited_at: new Date().toISOString() })
    .eq('id', messageId).eq('author_id', user.id)
  if (error) return { error: error.message }

  const id = msg.application_id
  revalidatePath(`/applications/${id}`)
  revalidatePath(`/business/application/${id}`)
  revalidatePath(`/school/application/${id}`)
  revalidatePath(`/auditor/applications/${id}`)
  revalidatePath(`/cb/applications/${id}`)
  return { ok: true }
}
