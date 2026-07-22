'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ESTABLISHMENT_EDITABLE_STATUSES } from '@/lib/db/applications'
import { revalidatePath } from 'next/cache'

const BUCKET = 'application-docs'

// Remove an attached document (file or link). The establishment may remove its
// own evidence while the application is still editable — re-attaching a new file
// is how a document gets replaced. Staff may always remove.
export async function deleteDocument(documentId: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const admin = createAdminClient()
  const { data: doc } = await admin
    .from('application_documents')
    .select('id, path, application_id, uploaded_by')
    .eq('id', documentId)
    .single()
  if (!doc) return { error: 'Document not found' }

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  const isStaff = !!me && ['admin', 'super_admin', 'auditor', 'certification_body'].includes(me.role)

  if (!isStaff) {
    // The applicant may only remove their own upload, and only while editable.
    const { data: app } = await admin.from('applications').select('applicant_id, status').eq('id', doc.application_id).single()
    if (!app || app.applicant_id !== user.id) return { error: 'Not allowed' }
    if (doc.uploaded_by !== user.id) return { error: 'You can only remove documents you uploaded.' }
    if (!ESTABLISHMENT_EDITABLE_STATUSES.includes(app.status)) return { error: 'The application is locked — documents can no longer be changed.' }
  }

  // Links have no storage object.
  if (doc.path) await admin.storage.from(BUCKET).remove([doc.path])
  const { error } = await admin.from('application_documents').delete().eq('id', documentId)
  if (error) return { error: error.message }

  revalidatePath(`/business/application/${doc.application_id}`)
  revalidatePath(`/school/application/${doc.application_id}`)
  revalidatePath(`/applications/${doc.application_id}`)
  return { ok: true }
}
