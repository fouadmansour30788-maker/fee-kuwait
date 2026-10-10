'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { myEntity } from '@/lib/db/establishment'
import { PROGRAMME_LABEL, STATUS_META } from '@/lib/db/applications'
import { revalidatePath } from 'next/cache'
import { establishmentCanEdit } from '@/lib/workflow'
import { sendEmail } from '@/lib/email'
import { siteUrl } from '@/lib/qr'
import { REVIEW_SUBMISSION_FIELD } from '@/lib/db/reviewSubmission'
import { isYearClosed } from '@/lib/db/academicYears'

const PROGRAMMES = ['eco-schools', 'blue-flag', 'green-key', 'leaf', 'yre', 'eco-campus']

// Shared by the establishment and school portals: create an application for the
// signed-in applicant's institution. One application per programme per applicant.
export async function createApplication(programme: string): Promise<{ ok?: true; error?: string }> {
  if (!PROGRAMMES.includes(programme)) return { error: 'Invalid programme' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  // Block duplicates — one application per programme for this applicant.
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('applicant_id', user.id)
    .eq('programme', programme)
    .limit(1)
  if (existing && existing.length > 0) {
    return { error: `You already have a ${PROGRAMME_LABEL[programme] ?? programme} application.` }
  }

  const ent = await myEntity()
  // Registration must be approved by the National Operator before applying (Step 1).
  if (ent && ent.status !== 'active') return { error: 'Your registration is pending approval by the National Operator.' }

  const { error } = await supabase.from('applications').insert({
    applicant_id: user.id,
    entity_type: ent?.entityType ?? null,
    entity_id: ent?.entityId ?? null,
    programme,
    status: 'pending_eligibility',
  })
  if (error) return { error: error.message }

  revalidatePath('/business/application'); revalidatePath('/business/dashboard')
  revalidatePath('/school/application'); revalidatePath('/school/dashboard')
  return { ok: true }
}

// Manual override by an authorised administrator (National Operator): force an
// application's status outside the normal workflow, for flexibility in
// unforeseen cases. A reason is mandatory and the change is recorded in the
// audit trail (previous value, new value, user, role, time) for traceability.
export async function manualOverrideStatus(applicationId: string, newStatus: string, reason: string): Promise<{ ok?: true; error?: string }> {
  if (!Object.keys(STATUS_META).includes(newStatus)) return { error: 'Invalid status' }
  if (!reason?.trim()) return { error: 'A reason is required for a manual override.' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { data: me } = await supabase.from('users').select('role, name_en, email').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not authorised' }

  const admin = createAdminClient()
  const { data: app } = await admin.from('applications').select('status').eq('id', applicationId).single()
  const prev = app?.status ?? null
  if (prev === newStatus) return { error: 'The application is already at that status.' }

  const { error } = await admin.from('applications').update({ status: newStatus }).eq('id', applicationId)
  if (error) return { error: error.message }

  await admin.from('audit_trail').insert({
    application_id: applicationId, entity: 'application', field: 'Manual status override',
    previous_value: prev, new_value: `${newStatus} — ${reason.trim()}`,
    user_id: user.id, user_name: me.name_en || me.email, user_role: me.role,
  })

  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}

// Programmes whose applicants can declare "I hereby submit my application for review".
const REVIEW_PROGRAMMES = ['green-key', 'eco-schools']

const escapeHtml = (t: string) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

// Establishment declares "I hereby submit my application for review": records it
// in the audit trail and notifies the National Operator (in-app + email). It does
// not lock or move the application — the operator decides the next step.
export async function submitForReview(applicationId: string, declared: boolean): Promise<{ ok?: true; at?: string; error?: string }> {
  if (!declared) return { error: 'Please tick the declaration first.' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const admin = createAdminClient()
  const { data: app } = await admin.from('applications').select('applicant_id, programme, status').eq('id', applicationId).single()
  if (!app || app.applicant_id !== user.id) return { error: 'Not allowed' }
  if (!REVIEW_PROGRAMMES.includes(app.programme)) return { error: 'Not available for this programme.' }
  const prog = PROGRAMME_LABEL[app.programme] ?? app.programme
  const progAr = app.programme === 'eco-schools' ? 'المدارس البيئية' : 'المفتاح الأخضر'
  if (!establishmentCanEdit(app.status)) return { error: 'The application is not open for submission at this stage.' }
  if (await isYearClosed(applicationId)) return { error: 'This academic year is closed — it is read-only.' }

  const { data: me } = await admin.from('users').select('name_en, email, role').eq('id', user.id).maybeSingle()
  const { data: ent } = await admin.from(app.programme === 'eco-schools' ? 'schools' : 'businesses').select('name_en').eq('user_id', user.id).maybeSingle()
  const estName = ent?.name_en || me?.name_en || me?.email || 'An applicant'
  const at = new Date().toISOString()

  const { error } = await admin.from('audit_trail').insert({
    application_id: applicationId, entity: 'application', field: REVIEW_SUBMISSION_FIELD,
    previous_value: app.status, new_value: 'I hereby submit my application for review',
    user_id: user.id, user_name: estName, user_role: me?.role ?? null,
  })
  if (error) return { error: error.message }

  const url = `/applications/${applicationId}`
  const { data: staff } = await admin.from('users').select('id, email').in('role', ['admin', 'super_admin'])
  if (staff?.length) {
    await admin.from('notifications').insert(staff.map((s) => ({
      user_id: s.id, type: 'submitted_for_review',
      title_en: `${prog} application submitted for review`, title_ar: `تم تقديم طلب ${progAr} للمراجعة`,
      message_en: `${estName} has submitted its ${prog} application for your review.`,
      message_ar: `${estName} قدّم طلب ${progAr} للمراجعة.`,
      action_url: url,
    })))
    const link = `${siteUrl()}${url}`
    await Promise.all(staff.filter((s) => s.email).map((s) => sendEmail({
      to: s.email!, subject: `${prog} application submitted for review — ${estName}`,
      html: `<p><strong>${escapeHtml(estName)}</strong> has submitted its ${prog} application for review.</p><p><a href="${link}">Open the application</a></p>`,
    })))
  }

  revalidatePath(url)
  revalidatePath(`/business/application/${applicationId}`)
  revalidatePath(`/school/application/${applicationId}`)
  return { ok: true, at }
}
