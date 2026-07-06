'use server'

import { createClient } from '@/lib/supabase/server'
import { OPERATOR_STATUSES } from '@/lib/db/applications'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Operator updates an application's status + review notes. RLS also enforces
// that only staff can manage all applications; we re-check the session here.
export async function updateApplication(id: string, formData: FormData) {
  const status = formData.get('status')?.toString() ?? ''
  const notes = formData.get('review_notes')?.toString()?.trim() || null
  const rejection = formData.get('rejection_reason')?.toString()?.trim() || null
  if (!OPERATOR_STATUSES.includes(status)) return

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('applications')
    .update({
      status,
      review_notes: notes,
      rejection_reason: status === 'rejected' ? rejection : null,
      assigned_to: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/applications')
  revalidatePath(`/applications/${id}`)
  revalidatePath('/dashboard')
  redirect(`/applications/${id}?saved=1`)
}
