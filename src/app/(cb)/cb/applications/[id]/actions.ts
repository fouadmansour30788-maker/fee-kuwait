'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { issueCertificate, notifyApplicant } from '@/lib/certify'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const CB_DECISIONS = ['certified', 'certified_rectification', 'not_certified']

// The assigned Certification Body records its formal decision. RLS ("CB updates
// assigned applications", migration 013) ensures only the assigned CB can write
// this row; we also re-check the role here. A "certified" outcome issues the
// certificate via the service-role client (the CB is not staff, so RLS on
// certificates would otherwise block the insert).
export async function recordCbDecision(applicationId: string, formData: FormData) {
  const decision = formData.get('decision')?.toString() ?? ''
  const note = formData.get('cb_note')?.toString()?.trim() || null
  if (!CB_DECISIONS.includes(decision)) return

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || me.role !== 'certification_body') return

  await supabase.from('applications').update({
    cb_decision: decision,
    cb_note: note,
    cb_decision_at: new Date().toISOString(),
    status: decision,
    updated_at: new Date().toISOString(),
  }).eq('id', applicationId)

  const { data: appRow } = await supabase
    .from('applications')
    .select('applicant_id, entity_type, programme, applicant:users!applicant_id(email)')
    .eq('id', applicationId)
    .single()

  let certificateNumber: string | null = null
  if ((decision === 'certified' || decision === 'certified_rectification') && appRow) {
    certificateNumber = await issueCertificate(createAdminClient(), {
      id: applicationId, applicant_id: appRow.applicant_id, entity_type: appRow.entity_type, programme: appRow.programme,
    })
  }

  const applicant = Array.isArray(appRow?.applicant) ? appRow?.applicant[0] : appRow?.applicant
  await notifyApplicant({
    email: applicant?.email, programme: appRow?.programme ?? '', entityType: appRow?.entity_type ?? null,
    applicationId, status: decision, note, certificateNumber,
  })

  revalidatePath(`/cb/applications/${applicationId}`)
  revalidatePath('/cb/dashboard')
  revalidatePath(`/applications/${applicationId}`)
  revalidatePath('/certificates')
  redirect(`/cb/applications/${applicationId}?decided=1`)
}
