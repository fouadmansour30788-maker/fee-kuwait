import { notFound } from 'next/navigation'
import { getCertificate } from '@/lib/db/certificates'
import { qrDataUrl, siteUrl } from '@/lib/qr'
import PrintButton from './PrintButton'

export const dynamic = 'force-dynamic'

const GK_GREEN = '#00AA58'

const fmtIssued = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
const validMonth = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { month: 'long' }).toUpperCase() : '—')
const validYear = (d: string | null) => (d ? new Date(d).getFullYear() : '')

const GK_DESCRIPTION = 'The Green Key certificate is a leading standard for excellence in the field of environmental responsibility and sustainable operation within the tourism industry. This prestigious certificate represents a commitment by businesses that their establishment adheres to the strict criteria set by the Foundation for Environmental Education and highlights the establishments’ efforts to develop a sustainable and responsible business.'

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const cert = await getCertificate(params.id)
  if (!cert) notFound()
  const verifyUrl = `${siteUrl()}/verify/${encodeURIComponent(cert.certificate_number)}`
  const qr = await qrDataUrl(verifyUrl)

  return (
    <div style={{ minHeight: '100vh', background: '#EEF2F5', padding: 24, fontFamily: "'Lato', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`@media print { .no-print { display: none !important } body { background: #fff } #cert { box-shadow: none !important; margin: 0 !important } @page { size: A4 portrait; margin: 12mm } }`}</style>

      <div className="no-print" style={{ maxWidth: 760, margin: '0 auto 16px', display: 'flex', justifyContent: 'flex-end' }}>
        <PrintButton />
      </div>

      {/* Certificate — faithful to the official Green Key Certificate template */}
      <div id="cert" style={{ maxWidth: 760, margin: '0 auto', background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', padding: '44px 56px 28px', minHeight: 1000, display: 'flex', flexDirection: 'column', color: '#1A202C' }}>

        {/* Header ID line */}
        <p style={{ textAlign: 'center', fontSize: 10, color: '#4A5568', margin: 0 }}>
          ID number {cert.certificate_number}. Certificate issued {fmtIssued(cert.issued_at)}.
        </p>

        {/* Top row: national organisation (left) + signature (right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cert/gk-image1.png" alt="Green Key" width={80} height={98} style={{ objectFit: 'contain' }} />
            <div style={{ fontSize: 12, lineHeight: 1.6, color: '#2D3748', paddingTop: 4 }}>
              <div style={{ fontWeight: 700 }}>FEE Kuwait</div>
              <div>National Green Key Operator</div>
              <div>Kuwait</div>
              <div>info@fee-kuwait.org</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, lineHeight: 1.7, color: '#1A202C', paddingTop: 40 }}>
            <div style={{ borderTop: '1px solid #A0AEC0', paddingTop: 6, minWidth: 190 }}>Signature</div>
            <div>Name of national operator</div>
            <div>National Green Key operator</div>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ textAlign: 'center', color: GK_GREEN, fontSize: 38, fontWeight: 800, margin: '52px 0 0', lineHeight: 1.1 }}>CERTIFIED ESTABLISHMENT</h1>

        {/* Establishment name + address */}
        <p style={{ textAlign: 'center', fontSize: 27, fontWeight: 700, margin: '40px 0 0' }}>{cert.holder ?? '—'}</p>
        <p style={{ textAlign: 'center', fontSize: 20, margin: '8px 0 0', color: '#2D3748' }}>{[cert.address, cert.governorate].filter(Boolean).join(', ') || '—'}</p>

        {/* Validity */}
        <p style={{ color: GK_GREEN, fontSize: 18, fontWeight: 700, margin: '48px 0 0' }}>VALID UNTIL THE END OF {validMonth(cert.expires_at)}</p>
        <p style={{ textAlign: 'center', color: GK_GREEN, fontSize: 46, fontWeight: 800, margin: '4px 0 0', lineHeight: 1 }}>{validYear(cert.expires_at)}</p>

        {/* Description */}
        <p style={{ fontSize: 12, lineHeight: 1.7, textAlign: 'justify', margin: '44px 0 0', color: '#2D3748' }}>{GK_DESCRIPTION}</p>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom: FEE logo + footer + verify QR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cert/gk-image2.jpeg" alt="FEE" width={58} height={76} style={{ objectFit: 'contain' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <a href="https://www.greenkey.global" style={{ fontSize: 13, color: GK_GREEN, fontWeight: 700, textDecoration: 'none' }}>www.greenkey.global</a>
          </div>
          <div style={{ textAlign: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Scan to verify" width={68} height={68} style={{ display: 'block' }} />
            <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Scan to verify</div>
          </div>
        </div>
      </div>

      <p className="no-print" style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 16 }}>Verify at {verifyUrl}</p>
    </div>
  )
}
