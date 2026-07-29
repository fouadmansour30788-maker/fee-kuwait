'use client'

import { CheckCircle2, FileText, Download } from 'lucide-react'
import CriterionUpload from '@/components/documents/CriterionUpload'
import { AUDIT_REPORT_REF } from '@/lib/doc-refs'

// Report upload for the auditor. The status transition ("Submit Audit Report")
// is handled by the workflow actions panel; here the auditor just attaches the
// report file while grading is open.
export default function AuditorSubmit({ applicationId, editable, reports }: {
  applicationId: string
  editable: boolean
  reports: { id: string; name: string; url: string | null }[]
}) {
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

      {editable ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: '#64748B' }}>Attach your final audit report:</span>
          <CriterionUpload applicationId={applicationId} criterionRef={AUDIT_REPORT_REF} />
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: '#ECFDF3', border: '1px solid #A7F3D0', color: '#047857' }}>
          <CheckCircle2 className="w-4 h-4" /> Report locked. Use the workflow actions to submit or reassess.
        </div>
      )}
    </div>
  )
}
