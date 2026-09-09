import { createClient } from '@/lib/supabase/server'
import type { Review } from '@/lib/reviews'

export type { Review, ReviewStatus } from '@/lib/reviews'
export { REVIEW_STATUS_META } from '@/lib/reviews'

const COLS = 'id, certificate_number, author_name, rating, comment, photo_url, status, created_at'

// Public: approved reviews for one establishment (service role; only approved).
export async function getApprovedReviews(certNumber: string): Promise<Review[]> {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const { data } = await createAdminClient()
    .from('establishment_reviews')
    .select(COLS)
    .eq('certificate_number', certNumber)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  return (data ?? []) as Review[]
}

// Public: approved-rating aggregate (avg + count) for many certificates at once.
export async function getRatingAggregates(certNumbers: string[]): Promise<Record<string, { avg: number; count: number }>> {
  if (certNumbers.length === 0) return {}
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const { data } = await createAdminClient()
    .from('establishment_reviews')
    .select('certificate_number, rating')
    .eq('status', 'approved')
    .in('certificate_number', certNumbers)
  const acc: Record<string, { sum: number; count: number }> = {}
  for (const r of data ?? []) {
    const k = (r as { certificate_number: string }).certificate_number
    const rt = (r as { rating: number }).rating
    if (!acc[k]) acc[k] = { sum: 0, count: 0 }
    acc[k].sum += rt; acc[k].count++
  }
  const out: Record<string, { avg: number; count: number }> = {}
  for (const [k, v] of Object.entries(acc)) out[k] = { avg: v.sum / v.count, count: v.count }
  return out
}

// Operator: all reviews for moderation (staff RLS).
export async function listAllReviews(): Promise<Review[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('establishment_reviews').select(COLS).order('created_at', { ascending: false })
  if (error) { console.error('listAllReviews:', error.message); return [] }
  return (data ?? []) as Review[]
}
