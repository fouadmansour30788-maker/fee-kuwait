'use client'

import { Fragment, useMemo, useState } from 'react'
import { Check, X, Search, FileText, Download, MessageSquare } from 'lucide-react'
import CriterionUpload from '@/components/documents/CriterionUpload'
import type { CriterionRef } from '@/lib/criteria'
import type { CriterionAssessment } from '@/lib/db/assessments'
import type { AppDoc } from '@/lib/db/documents'

type Result = 'pending' | 'pass' | 'no_pass'

function ResultChip({ r, label }: { r: Result; label: string }) {
  if (r === 'pending') return null
  const m = r === 'pass' ? { color: '#059669', bg: '#D1FAE5', t: 'Pass' } : { color: '#DC2626', bg: '#FEE2E2', t: 'Not pass' }
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: m.bg, color: m.color }}>
      {r === 'pass' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}{label}: {m.t}
    </span>
  )
}

// Establishment self-assessment view: every criterion/indicator with the
// establishment's per-criterion evidence (upload + list), the internal auditor's
// feedback, and — once the audit is published — the external result + feedback.
export default function CriteriaChecklist({
  applicationId, criteria, assessments, docs, showExternal,
}: {
  applicationId: string
  criteria: CriterionRef[]
  assessments: Record<string, CriterionAssessment>
  docs: AppDoc[]
  showExternal: boolean
}) {
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('all')

  const areas = useMemo(() => Array.from(new Set(criteria.map((c) => c.area))), [criteria])
  const docsByRef = useMemo(() => {
    const m = new Map<string, AppDoc[]>()
    for (const d of docs) { if (!d.criterion_ref) continue; const a = m.get(d.criterion_ref) ?? []; a.push(d); m.set(d.criterion_ref, a) }
    return m
  }, [docs])

  const filtered = criteria.filter((c) => {
    const q = search.toLowerCase()
    return (!q || c.title.toLowerCase().includes(q) || c.ref.toLowerCase().includes(q)) && (area === 'all' || c.area === area)
  })
  const groups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, CriterionRef[]>()
    for (const c of filtered) { if (!map.has(c.area)) { map.set(c.area, []); order.push(c.area) } map.get(c.area)!.push(c) }
    return order.map((a) => ({ area: a, rows: map.get(a)! }))
  }, [filtered])

  const attached = criteria.filter((c) => (docsByRef.get(c.ref)?.length ?? 0) > 0).length

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: '#5B7568' }}>
        Attach your evidence for each indicator and review your reviewer&apos;s feedback. {attached}/{criteria.length} indicators have evidence.
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white flex-1 min-w-[160px]" style={{ border: '1px solid #D4E7DA' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search indicators…" className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }} />
        </div>
        <select value={area} onChange={(e) => setArea(e.target.value)} className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={{ border: '1px solid #D4E7DA', color: '#475569' }}>
          <option value="all">All areas</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {groups.map((g) => (
          <Fragment key={g.area}>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#1B4332' }}>{g.area}</span>
              <span className="text-[11px] font-semibold" style={{ color: '#6B9080' }}>· {g.rows.length}</span>
            </div>
            <div className="space-y-2">
              {g.rows.map((c) => {
                const a = assessments[c.ref]
                const myDocs = docsByRef.get(c.ref) ?? []
                return (
                  <div key={c.ref} className="rounded-xl border p-3.5" style={{ borderColor: '#EEF5F0' }}>
                    <div className="flex items-start gap-2 justify-between flex-wrap">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <span className="text-xs font-mono font-semibold mt-0.5" style={{ color: '#94A3B8' }}>{c.ref}</span>
                        <p className="text-sm min-w-0" style={{ color: '#1E293B' }}>{c.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {a && <ResultChip r={a.internal} label="Reviewer" />}
                        {showExternal && a && <ResultChip r={a.external} label="Auditor" />}
                      </div>
                    </div>

                    {/* Reviewer / auditor feedback */}
                    {(a?.internalNote || (showExternal && a?.note)) && (
                      <div className="mt-2 space-y-1.5">
                        {a?.internalNote && (
                          <div className="flex items-start gap-1.5 rounded-lg px-2.5 py-1.5" style={{ background: '#F4F9F5' }}>
                            <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#40916C' }} />
                            <p className="text-xs" style={{ color: '#3D4A42' }}><span className="font-semibold">Reviewer:</span> {a.internalNote}</p>
                          </div>
                        )}
                        {showExternal && a?.note && (
                          <div className="flex items-start gap-1.5 rounded-lg px-2.5 py-1.5" style={{ background: '#F1F5F9' }}>
                            <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#64748B' }} />
                            <p className="text-xs" style={{ color: '#475569' }}><span className="font-semibold">Auditor:</span> {a.note}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Evidence */}
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      {myDocs.map((d) => (
                        <a key={d.id} href={d.url ?? '#'} target="_blank" rel="noopener"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                          <FileText className="w-3 h-3" /> <span className="max-w-[140px] truncate">{d.name}</span> <Download className="w-3 h-3" />
                        </a>
                      ))}
                      <CriterionUpload applicationId={applicationId} criterionRef={c.ref} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Fragment>
        ))}
        {groups.length === 0 && <p className="text-sm text-center py-6" style={{ color: '#94A3B8' }}>No indicators match your search.</p>}
      </div>
    </div>
  )
}
