'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ReviewStatus } from '@/lib/db/reviews'

const STATUSES: ReviewStatus[] = ['pending', 'approved', 'hidden']

// Public: a visitor submits a review for a certified establishment. Stored as
// 'pending' — it only appears publicly once staff approve it.
export async function submitReview(input: {
  certificateNumber: string
  authorName: string
  rating: number
  comment: string
  photoUrl?: string
}): Promise<{ ok?: true; error?: string }> {
  const certificate_number = input.certificateNumber?.trim()
  const rating = Math.round(Number(input.rating))
  if (!certificate_number) return { error: 'Missing establishment.' }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'Please choose a rating from 1 to 5.' }
  const comment = input.comment?.trim() || null
  if (comment && comment.length > 2000) return { error: 'Your review is too long.' }
  const photo = input.photoUrl?.trim() || null
  if (photo && !/^https?:\/\//i.test(photo)) return { error: 'Photo must be a valid https:// link.' }

  const supabase = createClient()
  const { error } = await supabase.from('establishment_reviews').insert({
    certificate_number, author_name: input.authorName?.trim() || null, rating, comment, photo_url: photo, status: 'pending',
  })
  if (error) return { error: 'Could not submit your review. Please try again.' }

  revalidatePath('/reviews')
  return { ok: true }
}

async function requireStaff() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' as const }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin', 'certification_body'].includes(me.role)) return { error: 'Not allowed' as const }
  return { ok: true as const }
}

// Operator/CB: moderate a review (approve / hide / back to pending).
export async function setReviewStatus(id: string, status: string, certNumber?: string): Promise<{ ok?: true; error?: string }> {
  if (!STATUSES.includes(status as ReviewStatus)) return { error: 'Invalid status' }
  const gate = await requireStaff()
  if (gate.error) return { error: gate.error }
  const supabase = createClient()
  const { error } = await supabase.from('establishment_reviews').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/reviews')
  if (certNumber) revalidatePath(`/certified/${certNumber}`)
  return { ok: true }
}

export async function deleteReview(id: string): Promise<{ ok?: true; error?: string }> {
  const gate = await requireStaff()
  if (gate.error) return { error: gate.error }
  const supabase = createClient()
  const { error } = await supabase.from('establishment_reviews').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/reviews')
  return { ok: true }
}
