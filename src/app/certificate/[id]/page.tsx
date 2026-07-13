import { notFound } from 'next/navigation'
import { getCertificate } from '@/lib/db/certificates'
import { PROGRAMME_LABEL } from '@/lib/db/applications'
import PrintButton from './PrintButton'

export const dynamic = 'force-dynamic'

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—')

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const cert = await getCertificate(params.id)
  if (!cert) notFound()
  const prog = PROGRAMME_LABEL[cert.programme] ?? cert.programme

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', padding: '24px' }}>
      <style>{`@media print { .no-print { display: none !important } body { background: #fff } @page { size: A4 landscape; margin: 12mm } }`}</style>

      <div className="no-print" style={{ maxWidth: 900, margin: '0 auto 16px', display: 'flex', justifyContent: 'flex-end' }}>
        <PrintButton />
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: 10 }}>
        <div style={{ border: '2px solid #C8A951', borderRadius: 12, padding: '40px 48px', textAlign: 'center' as const }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#1B4332,#40916C)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>FE</div>
            <div style={{ textAlign: 'left' as const }}>
              <div style={{ fontWeight: 800, color: '#0F2318', fontSize: 16, lineHeight: 1 }}>FEE Kuwait</div>
              <div style={{ fontSize: 11, color: '#5B7568' }}>Foundation for Environmental Education</div>
            </div>
          </div>

          <p style={{ letterSpacing: 3, textTransform: 'uppercase' as const, fontSize: 11, color: '#8a6d1f', margin: '20px 0 4px', fontWeight: 700 }}>Certificate of Achievement</p>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1B4332', margin: '0 0 6px' }}>{prog}</h1>
          <p style={{ fontSize: 13, color: '#5B7568', margin: 0 }}>This certifies that</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: '#0F2318', margin: '10px 0' }}>{cert.holder ?? '—'}</p>
          <p style={{ fontSize: 13, color: '#5B7568', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            has met the {prog} programme criteria and is hereby awarded this certification by FEE Kuwait, national operator of the Foundation for Environmental Education programmes.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 28, flexWrap: 'wrap' as const }}>
            {[
              { label: 'Certificate number', value: cert.certificate_number },
              { label: 'Issued', value: fmt(cert.issued_at) },
              { label: 'Valid until', value: fmt(cert.expires_at) },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#94A3B8', fontWeight: 700 }}>{f.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2318', fontFamily: f.label.includes('number') ? 'monospace' : undefined }}>{f.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 40 }}>
            <div style={{ textAlign: 'left' as const }}>
              <div style={{ width: 180, borderTop: '1px solid #CBD5E1', paddingTop: 6, fontSize: 11, color: '#5B7568' }}>National Operator</div>
            </div>
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #C8A951', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a6d1f', fontSize: 10, fontWeight: 700, textAlign: 'center' as const }}>FEE<br />KUWAIT</div>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ width: 180, borderTop: '1px solid #CBD5E1', paddingTop: 6, fontSize: 11, color: '#5B7568' }}>Certification Body</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
