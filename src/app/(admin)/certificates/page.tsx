import { Award, Inbox } from 'lucide-react'
import { listCertificates, CERT_STATUS_META } from '@/lib/db/certificates'
import { PROGRAMME_LABEL } from '@/lib/db/applications'

export default async function CertificatesPage() {
  const certs = await listCertificates()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Certificates</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{certs.length} issued</p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Certificate', 'Holder', 'Programme', 'Issued', 'Expires', 'Status'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
            {certs.map((c) => {
              const st = CERT_STATUS_META[c.status] ?? { label: c.status, color: '#64748B', bg: '#F1F5F9' }
              return (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FEF9EC' }}>
                        <Award className="w-4 h-4" style={{ color: '#C8A951' }} />
                      </div>
                      <span className="font-mono font-semibold" style={{ color: '#1E293B' }}>{c.certificate_number}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: '#334155' }}>{c.applicant?.name_en || c.applicant?.email || '—'}</td>
                  <td className="px-5 py-3.5" style={{ color: '#334155' }}>{PROGRAMME_LABEL[c.programme] ?? c.programme}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>{c.issued_at ? new Date(c.issued_at).toLocaleDateString('en-GB') : '—'}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-GB') : '—'}</td>
                  <td className="px-5 py-3.5"><span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: st.bg, color: st.color }}>{st.label}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {certs.length === 0 && (
          <div className="py-16 text-center" style={{ color: '#94A3B8' }}>
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No certificates yet</p>
            <p className="text-xs mt-1">A certificate is issued automatically when you approve an application.</p>
          </div>
        )}
      </div>
    </div>
  )
}
