// Client-safe review types & metadata (no server imports).

export type ReviewStatus = 'pending' | 'approved' | 'hidden'

export interface Review {
  id: string
  certificate_number: string
  author_name: string | null
  rating: number
  comment: string | null
  photo_url: string | null
  status: ReviewStatus
  created_at: string
}

export const REVIEW_STATUS_META: Record<ReviewStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#B45309', bg: '#FEF3C7' },
  approved: { label: 'Approved', color: '#047857', bg: '#DCFCE7' },
  hidden:   { label: 'Hidden',   color: '#64748B', bg: '#F1F5F9' },
}
