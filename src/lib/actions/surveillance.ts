'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// National Operator opens a surveillance activity: requests updates/documents on
// selected criteria for a given surveillance year.
export async function requestSurveillance(
  applicationId: string,
  period: number,
  criteria: string[],
  requestNote: string,
): Promise<{ ok?: true; error?: string }> {
  if (!Number.isInteger(period) || period < 2000 || period > 2100) return { error: 'Invalid surveillance year' }
  if (!criteria.length) return { error: 'Select at least one criterion to request an update on.' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { error } = await supabase.from('surveillance_activities').insert({
    application_id: applicationId, period, criteria, request_note: requestNote || null,
    status: 'requested', created_by: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath('/surveillance')
  revalidatePath(`/applications/${applicationId}`)
  return { ok: true }
}

// The establishment submits its response (evidence is uploaded via the criteria
// documents for the surveillance year; here it records the note and submits).
export async function submitSurveillance(id: string, responseNote: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { error } = await supabase.from('surveillance_activities')
    .update({ response_note: responseNote || null, status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/business/surveillance')
  revalidatePath('/school/surveillance')
  revalidatePath('/surveillance')
  return { ok: true }
}

// National Operator marks the response reviewed for completeness.
export async function reviewSurveillance(id: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { error } = await supabase.from('surveillance_activities')
    .update({ status: 'reviewed', reviewed_by: user.id }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/surveillance')
  return { ok: true }
}

// The Certification Body records the surveillance decision.
export async function decideSurveillance(
  id: string,
  decision: 'certified' | 'not_certified',
  note: string,
): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { error } = await supabase.from('surveillance_activities')
    .update({ status: decision, decision_note: note || null, decided_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/cb/surveillance')
  revalidatePath('/surveillance')
  return { ok: true }
}
