import { notFound } from 'next/navigation'
import { Lato } from 'next/font/google'
import { getCertificate } from '@/lib/db/certificates'
import { qrDataUrl, siteUrl } from '@/lib/qr'
import { certAuthCode } from '@/lib/certAuth'
import PrintButton from './PrintButton'

export const dynamic = 'force-dynamic'

// Lato — the official FEE brand typeface (Branding Guidelines, p.25).
const lato = Lato({ subsets: ['latin'], weight: ['400', '700', '900'] })

// Green Key brand green (FEE Branding Guidelines logo colour, RGB 0 169 93).
const GK_GREEN = '#00A95D'

// The National Operator that issues Green Key in Kuwait. Address / phone / e-mail
// print beneath the national logo — fill these with academics' real details.
const OPERATOR_NAME = 'academics'
const OPERATOR_LINES = ['National Green Key Operator', 'Kuwait']

const fmtIssued = (d: string) => new Date(d).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', day: '2-digit', month: 'long', year: 'numeric' })
const validMonth = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', month: 'long' }).toUpperCase() : '—')
const validYear = (d: string | null) => (d ? new Date(d).getFullYear() : '')

const GK_DESCRIPTION = 'The Green Key certificate is a leading standard for excellence in the field of environmental responsibility and sustainable operation within the tourism industry. This prestigious certificate represents a commitment by businesses that their establishment adheres to the strict criteria set by the Foundation for Environmental Education and highlights the establishments’ efforts to develop a sustainable and responsible business.'

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const cert = await getCertificate(params.id)
  if (!cert) notFound()
  const verifyUrl = `${siteUrl()}/verify/${encodeURIComponent(cert.certificate_number)}`
  const qr = await qrDataUrl(verifyUrl)
  const authCode = certAuthCode({ number: cert.certificate_number, holder: cert.holder, issuedAt: cert.issued_at, expiresAt: cert.expires_at })

  return (
    <div className={lato.className} style={{ minHeight: '100vh', background: '#EEF2F5', padding: 24 }}>
      <style>{`@media print { .no-print { display: none !important } body { background: #fff } #cert { box-shadow: none !important; margin: 0 !important } @page { size: A4 portrait; margin: 10mm } }`}</style>

      <div className="no-print" style={{ maxWidth: 720, margin: '0 auto 16px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <a href={`/certificate/${params.id}/pdf`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 10, background: '#fff', color: '#334155', border: '1px solid #E2E8F0', textDecoration: 'none' }}>
          ⬇ Download PDF
        </a>
        <PrintButton />
      </div>

      {/* Certificate — faithful to the official Green Key Certificate template */}
      <div id="cert" style={{ maxWidth: 720, margin: '0 auto', background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: `1px solid ${GK_GREEN}`, padding: '30px 44px 22px', minHeight: 1000, display: 'flex', flexDirection: 'column', color: '#1A202C' }}>

        {/* Header: FEE logo top-left + centered ID line */}
        <div style={{ position: 'relative', minHeight: 60 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cert/gk-image2.jpeg" alt="FEE" width={44} height={58} style={{ objectFit: 'contain', position: 'absolute', left: 0, top: 0 }} />
          <p style={{ textAlign: 'center', fontSize: 11, color: '#4A5568', margin: 0, paddingTop: 6 }}>
            ID number {cert.certificate_number}. Certificate issued {fmtIssued(cert.issued_at)}.
          </p>
        </div>

        {/* Green Key logo (centred) */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cert/gk-image1.png" alt="Green Key" width={150} height={181} style={{ objectFit: 'contain', display: 'inline-block' }} />
        </div>

        {/* Title */}
        <h1 style={{ textAlign: 'center', color: GK_GREEN, fontSize: 40, fontWeight: 400, letterSpacing: 1, margin: '18px 0 0', lineHeight: 1.1 }}>CERTIFIED ESTABLISHMENT</h1>

        {/* Establishment name + address */}
        <p style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, fontStyle: 'italic', margin: '30px 0 0' }}>{cert.holder ?? '—'}</p>
        <p style={{ textAlign: 'center', fontSize: 21, fontStyle: 'italic', margin: '8px 0 0', color: '#2D3748' }}>{[cert.address, cert.governorate].filter(Boolean).join(', ') || '—'}</p>

        {/* Validity */}
        <p style={{ textAlign: 'center', color: GK_GREEN, fontSize: 20, fontWeight: 400, letterSpacing: 0.5, margin: '34px 0 0' }}>VALID UNTIL THE END OF {validMonth(cert.expires_at)}</p>
        <p style={{ textAlign: 'center', color: GK_GREEN, fontSize: 58, fontWeight: 400, margin: '2px 0 0', lineHeight: 1 }}>{validYear(cert.expires_at)}</p>

        {/* Description */}
        <p style={{ fontSize: 13, lineHeight: 1.7, textAlign: 'center', margin: '34px auto 0', color: '#2D3748', maxWidth: 560 }}>{GK_DESCRIPTION}</p>

        {/* Spacer pushes the operator block + footer to the bottom */}
        <div style={{ flex: 1, minHeight: 40 }} />

        {/* Bottom: national logo + organisation (left) · signature (right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cert/academics-logo.png" alt={OPERATOR_NAME} width={120} height={49} style={{ objectFit: 'contain', display: 'block' }} />
            <div style={{ fontSize: 12, lineHeight: 1.6, color: '#2D3748', paddingTop: 2 }}>
              {OPERATOR_LINES.map((l) => <div key={l}>{l}</div>)}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, lineHeight: 1.7, color: '#1A202C' }}>
            <div style={{ borderTop: '1px solid #A0AEC0', paddingTop: 5, minWidth: 180 }}>Signature</div>
            <div style={{ textTransform: 'capitalize' }}>{OPERATOR_NAME}</div>
            <div>National Green Key operator</div>
          </div>
        </div>

        {/* Footer: greenkey.global centred, verify QR at the far right */}
        <div style={{ position: 'relative', marginTop: 22, minHeight: 60 }}>
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <a href="https://www.greenkey.global" style={{ fontSize: 13, color: '#4A5568', textDecoration: 'none' }}>www.greenkey.global</a>
          </div>
          <div style={{ position: 'absolute', right: 0, bottom: 0, textAlign: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Scan to verify" width={58} height={58} style={{ display: 'block' }} />
            <div style={{ fontSize: 8, color: '#94A3B8', marginTop: 1 }}>Scan to verify</div>
            <div style={{ fontSize: 7.5, color: '#94A3B8', marginTop: 1, fontFamily: 'monospace' }}>Auth {authCode}</div>
          </div>
        </div>
      </div>

      <p className="no-print" style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 16 }}>Verify at {verifyUrl}</p>
    </div>
  )
}
