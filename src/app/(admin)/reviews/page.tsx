import { redirect } from 'next/navigation'
import { Star, Inbox } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth-server'
import { listAllReviews } from '@/lib/db/reviews'
import ReviewModerationItem from '@/components/reviews/ReviewModerationItem'

export const dynamic = 'force-dynamic'

export default async function ReviewsModerationPage() {
  const me = await getCurrentUser()
  if (!me || !['admin', 'super_admin', 'certification_body'].includes(me.role)) redirect('/dashboard')

  const reviews = await listAllReviews()
  const pending = reviews.filter((r) => r.status === 'pending')
  const rest = reviews.filter((r) => r.status !== 'pending')

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#0F172A' }}>
          <Star className="w-6 h-6" style={{ color: '#F59E0B' }} /> Guest reviews
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Moderate reviews left on the public certified directory.{pending.length > 0 ? ` ${pending.length} awaiting approval.` : ''}</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border py-16 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>No reviews yet</p>
          <p className="text-xs mt-1">Reviews submitted on establishment profiles appear here for approval.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#B45309' }}>Awaiting approval ({pending.length})</h2>
              {pending.map((r) => <ReviewModerationItem key={r.id} review={r} />)}
            </div>
          )}
          {rest.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Reviewed</h2>
              {rest.map((r) => <ReviewModerationItem key={r.id} review={r} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
