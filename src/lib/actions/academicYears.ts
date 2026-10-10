'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getYearInfo, listSchoolYears } from '@/lib/db/academicYears'
import { nextAcademicYear, formatAcademicYear } from '@/lib/academicYear'

// Operator closes an Eco-Schools academic year and opens the next one as a new
// application: all seven steps start fresh (Steps 1–2 gate again, no themes, new
// Green Flag questions). The closed year stays visible, read-only for the school.
export async function openNextAcademicYear(applicationId: string): Promise<{ ok?: true; id?: string; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role, name_en, email').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not authorised' }

  const admin = createAdminClient()
  const { data: app } = await admin.from('applications').select('id, applicant_id, entity_type, entity_id, programme, status').eq('id', applicationId).single()
  if (!app || app.programme !== 'eco-schools') return { error: 'Not an Eco-Schools application.' }
  const info = await getYearInfo(applicationId)
  if (!info) return { error: 'Not an Eco-Schools application.' }
  if (info.closedAt) return { error: 'This academic year is already closed.' }

  const years = await listSchoolYears(app.applicant_id)
  if (years[0] && years[0].id !== applicationId) return { error: `Only the latest academic year (${formatAcademicYear(years[0].academicYear)}) can be closed.` }
  const next = nextAcademicYear(info.academicYear)
  if (years.some((y) => y.academicYear === next)) return { error: `${formatAcademicYear(next)} already exists for this school.` }

  const now = new Date().toISOString()
  const { error: closeErr } = await admin.from('applications')
    .update({ academic_year: info.academicYear, year_closed_at: now, year_closed_by: user.id, updated_at: now }).eq('id', applicationId)
  if (closeErr) return { error: closeErr.message.includes('academic_year') || closeErr.message.includes('year_closed') ? 'Run migration 054 (Eco-Schools academic years) first.' : closeErr.message }

  const { data: created, error: insErr } = await admin.from('applications').insert({
    applicant_id: app.applicant_id, entity_type: app.entity_type, entity_id: app.entity_id,
    programme: 'eco-schools', status: 'in_progress', academic_year: next, es_themes: [], submitted_at: now,
  }).select('id').single()
  if (insErr || !created) {
    // Re-open the old year so the school isn't left without an open one.
    await admin.from('applications').update({ year_closed_at: null, year_closed_by: null }).eq('id', applicationId)
    return { error: insErr?.message ?? 'Could not create the new academic year.' }
  }

  const who = me.name_en || me.email
  await admin.from('audit_trail').insert([
    { application_id: applicationId, entity: 'application', field: 'Academic year closed', previous_value: formatAcademicYear(info.academicYear), new_value: `Next: ${formatAcademicYear(next)}`, user_id: user.id, user_name: who, user_role: me.role },
    { application_id: created.id, entity: 'application', field: 'Academic year opened', previous_value: formatAcademicYear(info.academicYear), new_value: formatAcademicYear(next), user_id: user.id, user_name: who, user_role: me.role },
  ])
  await admin.from('notifications').insert({
    user_id: app.applicant_id, type: 'application',
    title_en: `Eco-Schools ${formatAcademicYear(next)} is open`, title_ar: `تم فتح سنة المدارس البيئية ${formatAcademicYear(next)}`,
    message_en: `Your new Eco-Schools academic year has started. ${formatAcademicYear(info.academicYear)} is now closed and read-only — choose new themes and work through the Seven Steps again.`,
    message_ar: `بدأت سنتكم الدراسية الجديدة في برنامج المدارس البيئية. السنة ${formatAcademicYear(info.academicYear)} مغلقة الآن للقراءة فقط.`,
    action_url: `/school/application/${created.id}`,
  })

  revalidatePath(`/applications/${applicationId}`)
  revalidatePath(`/school/application/${applicationId}`)
  revalidatePath('/school/application')
  revalidatePath('/applications')
  return { ok: true, id: created.id }
}
