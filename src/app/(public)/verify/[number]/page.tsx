import Link from 'next/link'
import { ShieldCheck, ShieldX, Leaf, Award } from 'lucide-react'
import { getPublicCertificate, CERT_STATUS_META } from '@/lib/db/certificates'
import { PROGRAMME_LABEL } from '@/lib/db/applications'
import { siteUrl } from '@/lib/qr'
import { certAuthCode } from '@/lib/certAuth'
import ShareBadge from '@/components/public/ShareBadge'

export const dynamic = 'force-dynamic'

const fmt = (s: string | null) => (s ? new Date(s).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', day: '2-digit', month: 'long', year: 'numeric' }) : '—')

export default async function VerifyPage({ params }: { params: { number: string } }) {
  const cert = await getPublicCertificate(decodeURIComponent(params.number))
  const st = cert ? (CERT_STATUS_META[cert.status] ?? { label: cert.status, color: '#64748B', bg: '#F1F5F9' }) : null

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #0F2318, #1B4332)' }}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Leaf className="w-6 h-6" style={{ color: '#74C69D' }} />
          <span className="text-lg font-bold text-white">Green Key · Certificate Verification</span>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {!cert ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#FEE2E2' }}>
                <ShieldX className="w-8 h-8" style={{ color: '#DC2626' }} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Certificate not found</h1>
              <p className="text-sm mt-2" style={{ color: '#64748B' }}>No certificate matches <strong>{decodeURIComponent(params.number)}</strong>. Check the number and try again.</p>
            </div>
          ) : (
            <>
              <div className="p-8 text-center" style={{ background: cert.valid ? '#ECFDF3' : '#FEF9EC' }}>
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: cert.valid ? '#059669' : '#B45309' }}>
                  {cert.valid ? <ShieldCheck className="w-8 h-8 text-white" /> : <ShieldX className="w-8 h-8 text-white" />}
                </div>
                <h1 className="text-2xl font-bold" style={{ color: cert.valid ? '#047857' : '#854D0E' }}>{cert.valid ? 'Valid certificate' : 'Not currently valid'}</h1>
                <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full" style={{ background: st!.bg, color: st!.color }}>{st!.label}</span>
              </div>
              <div className="p-8 space-y-3">
                <Row label="Establishment" value={cert.holder ?? '—'} />
                <Row label="Programme" value={PROGRAMME_LABEL[cert.programme] ?? cert.programme} icon />
                {cert.governorate && <Row label="Governorate" value={cert.governorate} />}
                <Row label="Certificate №" value={cert.number} mono />
                <Row label="Issued" value={fmt(cert.issuedAt)} />
                <Row label="Valid until" value={fmt(cert.expiresAt)} />
                <Row label="Authenticity code" value={certAuthCode({ number: cert.number, holder: cert.holder, issuedAt: cert.issuedAt, expiresAt: cert.expiresAt })} mono />
              </div>
            </>
          )}
        </div>

        {cert?.valid && (
          <ShareBadge
            number={cert.number}
            name={cert.holder ?? 'This establishment'}
            verifyUrl={`${siteUrl()}/verify/${encodeURIComponent(cert.number)}`}
            badgeUrl={`${siteUrl()}/api/badge/${encodeURIComponent(cert.number)}`}
          />
        )}

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Verified against the FEE Kuwait certification registry · <Link href="/certified" className="underline">all certified establishments</Link>
        </p>
      </div>
    </div>
  )
}

function Row({ label, value, mono, icon }: { label: string; value: string; mono?: boolean; icon?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2.5" style={{ borderColor: '#F1F5F9' }}>
      <span className="text-sm" style={{ color: '#64748B' }}>{label}</span>
      <span className={`text-sm font-semibold text-right ${mono ? 'font-mono' : ''}`} style={{ color: '#1E293B' }}>
        {icon && <Award className="w-4 h-4 inline mr-1" style={{ color: '#40916C' }} />}{value}
      </span>
    </div>
  )
}
