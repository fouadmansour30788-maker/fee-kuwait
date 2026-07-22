'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Download, Send, Loader2, AlertCircle } from 'lucide-react'
import CriterionUpload from '@/components/documents/CriterionUpload'
import DocumentRemove from '@/components/documents/DocumentRemove'
import { submitSurveillance } from '@/lib/actions/surveillance'
import type { AppDoc } from '@/lib/db/documents'

export default function SurveillanceRespond({
  id, applicationId, period, criteria, titles, docs, responseNote, editable,
}: {
  id: string
  applicationId: string
  period: number
  criteria: string[]
  titles: Record<string, string>
  docs: AppDoc[]
  responseNote: string | null
  editable: boolean
}) {
  const [note, setNote] = useState(responseNote ?? '')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  // Only this activity's evidence. Rows uploaded before surveillance_id existed
  // fall back to matching on the period.
  const docsFor = (ref: string) => docs.filter((d) => d.criterion_ref === ref && (d.surveillance_id ? d.surveillance_id === id : d.year === period))

  function submit() {
    setError('')
    start(async () => { const r = await submitSurveillance(id, note); if (r.error) setError(r.error); else router.refresh() })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {criteria.map((ref) => (
          <div key={ref} className="rounded-xl border p-3" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-start gap-2">
              <span className="text-xs font-mono font-semibold mt-0.5" style={{ color: '#40916C' }}>{ref}</span>
              <span className="text-sm flex-1" style={{ color: '#1E293B' }}>{titles[ref] ?? ref}</span>
            </div>
            <div className="mt-2 flex flex-col gap-1 items-start">
              {docsFor(ref).map((d) => (
                <span key={d.id} className="inline-flex items-center gap-1">
                  <a href={d.url ?? '#'} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                    <FileText className="w-3 h-3" /> <span className="max-w-[160px] truncate">{d.name}</span> <Download className="w-3 h-3" />
                  </a>
                  {editable && <DocumentRemove documentId={d.id} compact />}
                </span>
              ))}
              {editable && <CriterionUpload applicationId={applicationId} criterionRef={ref} year={period} surveillanceId={id} />}
              {!editable && docsFor(ref).length === 0 && <span className="text-xs" style={{ color: '#CBD5E1' }}>No documents</span>}
            </div>
          </div>
        ))}
      </div>

      {editable ? (
        <>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Response / notes for the operator…"
            className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
          {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
          <button onClick={submit} disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit response
          </button>
        </>
      ) : (
        responseNote && <div className="rounded-xl p-3 text-sm" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155' }}><span className="text-[11px] font-semibold block mb-0.5" style={{ color: '#64748B' }}>Establishment response</span>{responseNote}</div>
      )}
    </div>
  )
}
