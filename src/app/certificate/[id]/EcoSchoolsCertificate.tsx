import { Lato } from 'next/font/google'
import type { CertificateDetail } from '@/lib/db/certificates'

// Lato — the typeface of the official template (Lato / Lato Light).
const lato = Lato({ subsets: ['latin'], weight: ['300', '700'] })

// The National Operator block printed under the right-hand signature line
// (template: [Name of National Operator] / Eco-Schools National Operator /
// [Name of organisation], [Country]).
export const ES_OPERATOR_LINES = ['academics', 'Eco-Schools National Operator', 'Kuwait']

const monthYear = (d: string) => new Date(d).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', month: 'long', year: 'numeric' })
export const esValidity = (issued: string, expires: string | null) => (expires ? `${monthYear(issued)} – ${monthYear(expires)}` : `From ${monthYear(issued)}`)

// Eco-Schools "Green Flag Accredited" certificate — the official FEE template
// (A4 landscape artwork in /cert/es-green-flag.jpg) with the school name, the
// validity dates and the National Operator overlaid where the template's text
// boxes sit. All positions/sizes are relative to the page so it scales on screen
// and prints at A4. Container units (cqw) = % of the certificate width.
export default function EcoSchoolsCertificate({ cert, qr }: { cert: CertificateDetail; qr: string }) {
  const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', ...s })
  return (
    <div id="cert" className={lato.className}
      style={{ position: 'relative', width: '100%', maxWidth: 1120, margin: '0 auto', aspectRatio: '297 / 210', containerType: 'inline-size', background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', color: '#1C1F1D', overflow: 'hidden' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/cert/es-green-flag.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* School name — sits on the line under the header */}
      <div style={abs({ left: '14%', right: '13.6%', top: '24%', bottom: '61.6%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' })}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '2.5cqw', lineHeight: 1.15, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{cert.holder ?? '—'}</p>
      </div>

      {/* Dates — under "Valid for:" */}
      <p style={abs({ left: 0, right: 0, top: '60.6%', margin: 0, textAlign: 'center', fontWeight: 300, fontSize: '1.7cqw' })}>
        {esValidity(cert.issued_at, cert.expires_at)}
      </p>

      {/* National Operator — under the right-hand signature line */}
      <div style={abs({ right: '5.4%', top: '77.2%', textAlign: 'right', fontWeight: 300, fontSize: '1.62cqw', lineHeight: 1.45 })}>
        {ES_OPERATOR_LINES.map((l) => <div key={l}>{l}</div>)}
      </div>

      {/* Certificate ID + verify QR — top-right white space under the header */}
      <div style={abs({ right: '2.6%', top: '24%', width: '7.4%', textAlign: 'center' })}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="Scan to verify" style={{ width: '100%', display: 'block' }} />
        <div style={{ fontSize: '0.62cqw', color: '#64748B', marginTop: '0.2cqw', lineHeight: 1.3 }}>Scan to verify<br />{cert.certificate_number}</div>
      </div>
    </div>
  )
}
