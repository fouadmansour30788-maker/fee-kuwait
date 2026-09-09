'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, EyeOff, Trash2, Loader2, Star } from 'lucide-react'
import { setReviewStatus, deleteReview } from '@/lib/actions/reviews'
import { REVIEW_STATUS_META, type Review } from '@/lib/reviews'

export default function ReviewModerationItem({ review }: { review: Review }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  const run = (fn: () => Promise<{ error?: string }>) => start(async () => { await fn(); router.refresh() })
  const meta = REVIEW_STATUS_META[review.status]

  return (
    <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-start gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>{review.author_name || 'Guest'}</span>
            <span className="inline-flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => <Star key={n} className="w-3.5 h-3.5" style={{ color: n <= review.rating ? '#F59E0B' : '#E2E8F0' }} fill={n <= review.rating ? '#F59E0B' : '#E2E8F0'} />)}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
            <span className="font-mono text-[11px]" style={{ color: '#94A3B8' }}>{review.certificate_number}</span>
          </div>
          {review.comment && <p className="text-sm mt-1.5" style={{ color: '#334155' }}>{review.comment}</p>}
          {review.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={review.photo_url} alt="" className="mt-2 max-h-40 rounded-lg" style={{ border: '1px solid #E2E8F0' }} />
          )}
          <p className="text-[11px] mt-1.5" style={{ color: '#94A3B8' }}>{new Date(review.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuwait' })}</p>
        </div>
        <div className="flex items-center gap-2">
          {review.status !== 'approved' && (
            <button onClick={() => run(() => setReviewStatus(review.id, 'approved', review.certificate_number))} disabled={pending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60" style={{ background: '#DCFCE7', color: '#166534' }}>
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Approve
            </button>
          )}
          {review.status !== 'hidden' && (
            <button onClick={() => run(() => setReviewStatus(review.id, 'hidden', review.certificate_number))} disabled={pending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60" style={{ background: '#F1F5F9', color: '#475569' }}>
              <EyeOff className="w-3.5 h-3.5" /> Hide
            </button>
          )}
          <button onClick={() => { if (window.confirm('Delete this review permanently?')) run(() => deleteReview(review.id)) }} disabled={pending}
            className="p-1.5 rounded-lg" style={{ color: '#DC2626' }} title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}
