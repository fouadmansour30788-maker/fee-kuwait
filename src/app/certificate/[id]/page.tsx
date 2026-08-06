import { notFound } from 'next/navigation'
import { getCertificate } from '@/lib/db/certificates'
import { PROGRAMME_LABEL } from '@/lib/db/applications'
import { qrDataUrl, siteUrl } from '@/lib/qr'
import PrintButton from './PrintButton'

export const dynamic = 'force-dynamic'

const GK_GREEN = '#00AA58'
const GK_BLUE = '#1E88C7'

// "VALID UNTIL THE END OF FEBRUARY 2024" — month + year of the expiry date.
function validUntil(d: string | null): string {
  if (!d) return '—'
  const dt = new Date(d)
  return `${dt.toLocaleDateString('en-GB', { month: 'long' }).toUpperCase()} ${dt.getFullYear()}`
}

const GK_DESCRIPTION = 'The Green Key certificate is a leading standard for excellence in the field of environmental responsibility and sustainable operation within the tourism industry. This prestigious certificate represents a commitment by businesses that their establishment adheres to the strict criteria set by the Foundation for Environmental Education and highlights the establishments’ efforts to develop a sustainable and responsible business.'

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const cert = await getCertificate(params.id)
  if (!cert) notFound()
  const prog = PROGRAMME_LABEL[cert.programme] ?? cert.programme
  const isGK = cert.programme === 'green-key'
  const verifyUrl = `${siteUrl()}/verify/${encodeURIComponent(cert.certificate_number)}`
  const qr = await qrDataUrl(verifyUrl)

  return (
    <div style={{ minHeight: '100vh', background: '#EEF2F5', padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`@media print { .no-print { display: none !important } body { background: #fff } #cert { box-shadow: none !important; margin: 0 !important } @page { size: A4 portrait; margin: 10mm } }`}</style>

      <div className="no-print" style={{ maxWidth: 720, margin: '0 auto 16px', display: 'flex', justifyContent: 'flex-end' }}>
        <PrintButton />
      </div>

      {/* Certificate (A4 portrait proportions) */}
      <div id="cert" style={{ maxWidth: 720, margin: '0 auto', background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', position: 'relative' }}>
        <div style={{ border: `3px solid ${GK_GREEN}`, margin: 10, padding: '36px 44px 28px', minHeight: 900, display: 'flex', flexDirection: 'column' }}>

          {/* Header: national organisation + Green Key logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 11, color: '#4A5568', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, color: '#1A202C' }}>FEE Kuwait</div>
              <div>National Green Key Operator</div>
              <div>Foundation for Environmental Education</div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cert/gk-image1.png" alt="Green Key" width={92} height={112} style={{ objectFit: 'contain' }} />
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <h1 style={{ color: GK_GREEN, fontSize: 40, fontWeight: 800, letterSpacing: 1, margin: 0, lineHeight: 1.1 }}>CERTIFIED ESTABLISHMENT</h1>
          </div>

          {/* Establishment */}
          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <p style={{ fontSize: 30, fontWeight: 800, color: '#1A202C', margin: '0 0 8px' }}>{cert.holder ?? '—'}</p>
            <p style={{ fontSize: 15, color: '#4A5568', margin: 0 }}>{[cert.address, cert.governorate].filter(Boolean).join(', ') || '—'}</p>
            {!isGK && <p style={{ fontSize: 13, color: '#718096', marginTop: 8 }}>{prog}</p>}
          </div>

          {/* Validity */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <p style={{ color: GK_BLUE, fontSize: 18, fontWeight: 700, letterSpacing: 1, margin: 0 }}>VALID UNTIL THE END OF {validUntil(cert.expires_at)}</p>
          </div>

          {/* Description */}
          <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, textAlign: 'center', maxWidth: 560, margin: '40px auto 0' }}>
            {isGK ? GK_DESCRIPTION : `This certificate is awarded under the ${prog} programme by FEE Kuwait, national operator of the Foundation for Environmental Education.`}
          </p>

          {/* Spacer pushes footer down */}
          <div style={{ flex: 1 }} />

          {/* Footer: signature, certificate meta, FEE logo + QR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 48 }}>
            <div style={{ fontSize: 11, color: '#4A5568' }}>
              <div style={{ width: 200, borderTop: '1px solid #A0AEC0', paddingTop: 6 }}>Signature</div>
              <div style={{ marginTop: 6, fontWeight: 700, color: '#1A202C' }}>National Green Key Operator</div>
              <div style={{ marginTop: 10, fontFamily: 'monospace', color: '#718096' }}>{cert.certificate_number}</div>
              <div style={{ color: '#718096' }}>Issued {new Date(cert.issued_at).toLocaleDateString('en-GB')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cert/gk-image2.jpeg" alt="FEE" width={64} height={84} style={{ objectFit: 'contain' }} />
              <div style={{ textAlign: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="Scan to verify" width={80} height={80} style={{ display: 'block' }} />
                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Scan to verify</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="no-print" style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 16 }}>Verify at {verifyUrl}</p>
    </div>
  )
}
