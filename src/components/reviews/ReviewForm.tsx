'use client'

import { useState, useTransition } from 'react'
import { Star, Loader2, AlertCircle, CheckCircle2, Send } from 'lucide-react'
import { submitReview } from '@/lib/actions/reviews'

export default function ReviewForm({ certificateNumber }: { certificateNumber: string }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [photo, setPhoto] = useState('')
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (rating < 1) { setError('Please choose a star rating.'); return }
    start(async () => {
      const res = await submitReview({ certificateNumber, authorName: name, rating, comment, photoUrl: photo })
      if (res.error) setError(res.error)
      else setDone(true)
    })
  }

  const field = { border: '1px solid #D4E7DA', color: '#1E293B' } as const

  if (done) {
    return (
      <div className="rounded-2xl border p-6 text-center" style={{ background: '#F0FDF4', borderColor: '#A7F3D0' }}>
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: '#047857' }} />
        <p className="text-sm font-semibold" style={{ color: '#065F46' }}>Thank you — your review was submitted.</p>
        <p className="text-xs mt-1" style={{ color: '#047857' }}>It will appear here once our team has reviewed it.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border p-6 bg-white space-y-4" style={{ borderColor: '#D4E7DA' }}>
      <h3 className="font-bold text-base" style={{ color: '#0F2318' }}>Leave a review</h3>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Your rating</label>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} className="p-0.5" aria-label={`${n} star`}>
              <Star className="w-7 h-7" style={{ color: (hover || rating) >= n ? '#F59E0B' : '#E2E8F0' }} fill={(hover || rating) >= n ? '#F59E0B' : '#E2E8F0'} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="text-sm px-3 py-2.5 rounded-xl outline-none" style={field} />
        <input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="Photo link https:// (optional)" className="text-sm px-3 py-2.5 rounded-xl outline-none" style={field} />
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Share your experience of this green stay…" className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-y" style={field} />

      {error && <p className="flex items-center gap-1.5 text-sm" style={{ color: '#DC2626' }}><AlertCircle className="w-4 h-4" /> {error}</p>}

      <button type="submit" disabled={pending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit review
      </button>
      <p className="text-[11px]" style={{ color: '#94A3B8' }}>Reviews are moderated before they appear publicly.</p>
    </form>
  )
}
