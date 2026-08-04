import Link from 'next/link'
import { Award, Inbox, CheckCircle2, Download } from 'lucide-react'
import { listCertificates, CERT_STATUS_META } from '@/lib/db/certificates'
import { PROGRAMME_LABEL } from '@/lib/db/applications'

export default async function BusinessCertificationPage() {
  const certs = await listCertificates()

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F2318' }}>Certification</h1>
        <p className="text-sm mt-0.5" style={{ color: '#5B7568' }}>Your awarded certificates.</p>
      </div>

      {certs.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {certs.map((c) => {
            const st = CERT_STATUS_META[c.status] ?? { label: c.status, color: '#64748B', bg: '#F1F5F9' }
            return (
              <div key={c.id} className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#FEF9EC' }}>
                    <Award className="w-6 h-6" style={{ color: '#C8A951' }} />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: st.bg, color: st.color }}>
                    <CheckCircle2 className="w-3 h-3" /> {st.label}
                  </span>
                </div>
                <h2 className="text-lg font-bold mt-4" style={{ color: '#0F2318' }}>{PROGRAMME_LABEL[c.programme] ?? c.programme}</h2>
                <p className="font-mono text-sm mt-1" style={{ color: '#40916C' }}>{c.certificate_number}</p>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-sm" style={{ borderColor: '#EEF5F0' }}>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>Issued</p>
                    <p style={{ color: '#1E293B' }}>{c.issued_at ? new Date(c.issued_at).toLocaleDateString('en-GB') : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>Expires</p>
                    <p style={{ color: '#1E293B' }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-GB') : '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Link href={`/certificate/${c.id}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
                    <Download className="w-4 h-4" /> Download certificate
                  </Link>
                  <Link href={`/verify/${encodeURIComponent(c.certificate_number)}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-xl" style={{ background: '#F1F5F9', color: '#40916C' }}>
                    Verify page →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border py-16 text-center" style={{ borderColor: '#D4E7DA', color: '#94A3B8' }}>
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>No certificates yet</p>
          <p className="text-xs mt-1">Once an application is approved, your certificate appears here.</p>
        </div>
      )}
    </div>
  )
}
