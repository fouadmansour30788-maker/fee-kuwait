import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, ShieldCheck, Award, CalendarClock, Leaf, Quote } from 'lucide-react'
import { getPublicCertificate } from '@/lib/db/certificates'
import { PROGRAMME_LABEL } from '@/lib/db/applications'
import { getApprovedReviews } from '@/lib/db/reviews'
import Stars from '@/components/reviews/Stars'
import ReviewForm from '@/components/reviews/ReviewForm'

export const dynamic = 'force-dynamic'

const fmt = (s: string | null) => (s ? new Date(s).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', day: 'numeric', month: 'long', year: 'numeric' }) : '—')

export default async function CertifiedProfilePage({ params }: { params: { number: string } }) {
  const number = decodeURIComponent(params.number)
  const [cert, reviews] = await Promise.all([getPublicCertificate(number), getApprovedReviews(number)])
  if (!cert) notFound()

  const count = reviews.length
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0
  const photos = reviews.filter((r) => r.photo_url).map((r) => r.photo_url as string)

  return (
    <div style={{ background: '#F7FBF8' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #0F2318, #1B4332)' }}>
        <div className="max-w-4xl mx-auto px-6 py-14">
          <Link href="/certified" className="inline-flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> Certified in Kuwait
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: cert.valid ? 'rgba(0,169,93,0.2)' : 'rgba(255,255,255,0.15)', color: cert.valid ? '#86EFAC' : '#E2E8F0' }}>
              <ShieldCheck className="w-3.5 h-3.5" /> {cert.valid ? 'Valid certificate' : cert.status}
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              {PROGRAMME_LABEL[cert.programme] ?? cert.programme}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{cert.holder ?? 'Certified establishment'}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {cert.governorate ?? 'Kuwait'}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarClock className="w-4 h-4" /> Valid to {fmt(cert.expiresAt)}</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs">{cert.number}</span>
          </div>
          {count > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Stars value={avg} size={18} />
              <span className="text-white font-semibold text-sm">{avg.toFixed(1)}</span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>· {count} review{count === 1 ? '' : 's'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Green credentials */}
        <div className="rounded-2xl border p-6 bg-white flex items-start gap-4" style={{ borderColor: '#D4E7DA' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF3' }}>
            <Leaf className="w-5 h-5" style={{ color: '#00A95D' }} />
          </div>
          <div>
            <h2 className="font-bold text-base" style={{ color: '#0F2318' }}>A certified green stay</h2>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: '#5B7568' }}>
              This establishment meets the {PROGRAMME_LABEL[cert.programme] ?? cert.programme} standard for environmental
              responsibility and sustainable tourism, independently verified by the Foundation for Environmental Education in Kuwait.
            </p>
            <Link href={`/verify/${encodeURIComponent(cert.number)}`} className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3" style={{ color: '#40916C' }}>
              <Award className="w-4 h-4" /> Verify this certificate
            </Link>
          </div>
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-4" style={{ color: '#0F2318' }}>Guest photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.slice(0, 12).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" loading="lazy" className="w-full aspect-square object-cover rounded-xl" style={{ border: '1px solid #D4E7DA' }} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h2 className="font-bold text-lg mb-4" style={{ color: '#0F2318' }}>Guest reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border p-5 bg-white" style={{ borderColor: '#D4E7DA' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
                      {(r.author_name || 'G').slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#0F2318' }}>{r.author_name || 'Guest'}</p>
                      <div className="flex items-center gap-2"><Stars value={r.rating} size={13} /><span className="text-[11px]" style={{ color: '#94A3B8' }}>{fmt(r.created_at)}</span></div>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm leading-relaxed flex gap-2" style={{ color: '#3D4A42' }}>
                      <Quote className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-40" /> {r.comment}
                    </p>
                  )}
                  {r.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo_url} alt="" loading="lazy" className="mt-3 max-h-56 rounded-xl object-cover" style={{ border: '1px solid #D4E7DA' }} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm rounded-2xl border p-6 bg-white" style={{ borderColor: '#D4E7DA', color: '#94A3B8' }}>
              No reviews yet — be the first to share your experience of this green stay.
            </p>
          )}
        </div>

        {/* Leave a review */}
        <ReviewForm certificateNumber={cert.number} />
      </div>
    </div>
  )
}
