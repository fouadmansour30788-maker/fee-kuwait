'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle, FileText, Download, Send } from 'lucide-react'
import { submitAudit } from '@/app/(auditor)/auditor/applications/[id]/actions'
import CriterionUpload from '@/components/documents/CriterionUpload'
import { AUDIT_REPORT_REF } from '@/lib/doc-refs'

export default function AuditorSubmit({ applicationId, status, reports }: {
  applicationId: string
  status: string
  reports: { id: string; name: string; url: string | null }[]
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()
  const submitted = status !== 'audit'

  function submit() {
    if (typeof window !== 'undefined' && !window.confirm('Submit the audit? Your per-criterion results will be locked and shared with all parties.')) return
    setError('')
    start(async () => { const r = await submitAudit(applicationId); if (r.error) setError(r.error); else router.refresh() })
  }

  return (
    <div className="space-y-3">
      {reports.length > 0 && (
        <div className="space-y-2">
          {reports.map((r) => (
            <a key={r.id} href={r.url ?? '#'} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: '#E2E8F0' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                <FileText className="w-4 h-4" style={{ color: '#64748B' }} />
              </div>
              <p className="text-sm font-semibold flex-1 truncate" style={{ color: '#1E293B' }}>{r.name}</p>
              <Download className="w-4 h-4" style={{ color: '#94A3B8' }} />
            </a>
          ))}
        </div>
      )}

      {submitted ? (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: '#ECFDF3', border: '1px solid #A7F3D0', color: '#047857' }}>
          <CheckCircle2 className="w-4 h-4" /> Audit submitted — results are locked and shared with all parties.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: '#64748B' }}>Attach your final audit report:</span>
            <CriterionUpload applicationId={applicationId} criterionRef={AUDIT_REPORT_REF} />
          </div>
          {error && <p className="flex items-center gap-1.5 text-sm" style={{ color: '#E53E3E' }}><AlertCircle className="w-4 h-4" /> {error}</p>}
          <button onClick={submit} disabled={pending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            <Send className="w-4 h-4" /> {pending ? 'Submitting…' : 'Submit audit'}
          </button>
        </>
      )}
    </div>
  )
}
