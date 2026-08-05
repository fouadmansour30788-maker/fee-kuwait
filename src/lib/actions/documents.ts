'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ESTABLISHMENT_EDITABLE_STATUSES } from '@/lib/db/applications'
import { revalidatePath } from 'next/cache'

const BUCKET = 'application-docs'

// Record an attached document (file already uploaded to storage, or a link).
// Written with the service role after an ownership/staff check so it never trips
// row-level security (the applicant, or any staff member, may attach).
export async function recordDocument(input: {
  applicationId: string
  name: string
  path?: string | null
  linkUrl?: string | null
  size?: number | null
  mimeType?: string | null
  criterionRef?: string | null
  year?: number | null
  surveillanceId?: string | null
}): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const admin = createAdminClient()
  const { data: app } = await admin.from('applications').select('applicant_id').eq('id', input.applicationId).single()
  if (!app) return { error: 'Application not found' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  const isStaff = !!me && ['admin', 'super_admin', 'auditor', 'certification_body'].includes(me.role)
  if (app.applicant_id !== user.id && !isStaff) return { error: 'Not allowed' }

  const { error } = await admin.from('application_documents').insert({
    application_id: input.applicationId, uploaded_by: user.id,
    name: input.name, path: input.path ?? null, link_url: input.linkUrl ?? null,
    size: input.size ?? null, mime_type: input.mimeType ?? null,
    criterion_ref: input.criterionRef ?? null, year: input.year ?? null,
    surveillance_id: input.surveillanceId ?? null,
  })
  if (error) return { error: error.message }

  revalidatePath(`/business/application/${input.applicationId}`)
  revalidatePath(`/school/application/${input.applicationId}`)
  revalidatePath(`/applications/${input.applicationId}`)
  return { ok: true }
}

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
