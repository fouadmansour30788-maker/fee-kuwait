'use client'

import { useState, Fragment } from 'react'
import { Check, X, MessageSquare, ChevronDown, Send, Paperclip, Lock, EyeOff } from 'lucide-react'
import {
  CRITERION_RESULT_META, CRITERION_ROLE_META, resultsPublished, criterionStage,
  visibleCriterionThread, canPostCriterion,
  type ChecklistItem, type CriterionResult, type CriterionMessage,
} from '@/lib/data/audits'
import type { AuditStatus } from '@/lib/data/audits'

type ViewerRole = 'establishment' | 'no' | 'auditor' | 'cb'

interface Props {
  items: ChecklistItem[]
  status: AuditStatus
  viewerRole: ViewerRole
  externalAuditorName?: string
  onSetInternal?: (ref: string, r: CriterionResult) => void
  onSetExternal?: (ref: string, r: CriterionResult) => void
  onSetNarrative?: (ref: string, text: string) => void
  threads?: Record<string, CriterionMessage[]>
  draft?: Record<string, string>
  onDraft?: (ref: string, text: string) => void
  onPost?: (ref: string) => void
  onAttach?: (ref: string) => void
}

function ResultChip({ r }: { r: CriterionResult }) {
  const m = CRITERION_RESULT_META[r]
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: m.bg, color: m.color }}>
      {r === 'pass' ? <Check className="w-3 h-3" /> : r === 'no_pass' ? <X className="w-3 h-3" /> : null}{m.label}
    </span>
  )
}

function ResultToggle({ value, onChange }: { value: CriterionResult; onChange: (r: CriterionResult) => void }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <button onClick={() => onChange('pass')} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold"
        style={value === 'pass' ? { background: '#059669', color: '#fff' } : { background: '#F1F5F9', color: '#059669' }}>
        <Check className="w-3 h-3" /> Pass
      </button>
      <button onClick={() => onChange('no_pass')} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold"
        style={value === 'no_pass' ? { background: '#DC2626', color: '#fff' } : { background: '#F1F5F9', color: '#DC2626' }}>
        <X className="w-3 h-3" /> Not Pass
      </button>
    </div>
  )
}

export default function CriteriaTable({
  items, status, viewerRole, externalAuditorName,
  onSetInternal, onSetExternal, onSetNarrative,
  threads, draft, onDraft, onPost, onAttach,
}: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const published = resultsPublished(status)
  const stage = criterionStage(status)

  const showInternal = viewerRole !== 'establishment'               // internal column is admin-only
  const showExternal = viewerRole !== 'establishment' || published  // establishment sees external only once published
  const editInternal = viewerRole === 'no' && stage === 1 && !!onSetInternal
  const editExternal = viewerRole === 'auditor' && status === 'audit'
  const hasThreads = !!threads

  const cols = 2 + (showInternal ? 1 : 0) + (showExternal ? 3 : 0) + (hasThreads ? 1 : 0)

  const canPostRow = hasThreads && viewerRole !== 'cb' && !!onPost && canPostCriterion(viewerRole, status)

  const th = 'text-left px-3 py-2.5 font-semibold text-[11px] uppercase tracking-wider'
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: cols > 4 ? 760 : undefined }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th className={th} style={{ color: '#94A3B8' }}>Criteria</th>
              <th className={th} style={{ color: '#94A3B8' }}>Indicator</th>
              {showInternal && <th className={th} style={{ color: '#94A3B8' }}>Internal (NO)</th>}
              {showExternal && <th className={th} style={{ color: '#94A3B8' }}>External auditor</th>}
              {showExternal && <th className={th} style={{ color: '#94A3B8' }}>External result</th>}
              {showExternal && <th className={th} style={{ color: '#94A3B8' }}>Narrative</th>}
              {hasThreads && <th className="px-3 py-2.5" />}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#F1F5F9' }}>
            {items.map(c => {
              const isOpen = open === c.ref
              const msgs = hasThreads ? visibleCriterionThread(threads![c.ref] ?? [], viewerRole, status) : []
              return (
                <Fragment key={c.ref}>
                  <tr className="align-top hover:bg-slate-50/60 transition-colors"
                    style={c.result === 'no_pass' && published ? { background: '#FEF6F6' } : undefined}>
                    <td className="px-3 py-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#ECFDF3', color: '#1B4332' }}>{c.criteria}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-semibold mr-1.5" style={{ color: '#94A3B8' }}>{c.ref}</span>
                      <span style={{ color: '#1E293B' }}>{c.title}</span>
                    </td>

                    {showInternal && (
                      <td className="px-3 py-3">
                        {editInternal
                          ? <ResultToggle value={c.internalResult} onChange={r => onSetInternal!(c.ref, r)} />
                          : <ResultChip r={c.internalResult} />}
                      </td>
                    )}

                    {showExternal && (
                      <td className="px-3 py-3 whitespace-nowrap" style={{ color: '#475569' }}>
                        {externalAuditorName ?? '—'}
                      </td>
                    )}
                    {showExternal && (
                      <td className="px-3 py-3">
                        {editExternal
                          ? <ResultToggle value={c.result} onChange={r => onSetExternal!(c.ref, r)} />
                          : <ResultChip r={c.result} />}
                      </td>
                    )}
                    {showExternal && (
                      <td className="px-3 py-3 min-w-[200px]">
                        {editExternal
                          ? <textarea value={c.externalNarrative} onChange={e => onSetNarrative?.(c.ref, e.target.value)} rows={2}
                              placeholder="External auditor feedback…"
                              className="w-full text-xs px-2.5 py-2 rounded-lg outline-none resize-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
                          : <p className="text-xs" style={{ color: c.externalNarrative ? '#475569' : '#CBD5E1' }}>{c.externalNarrative || '—'}</p>}
                      </td>
                    )}

                    {hasThreads && (
                      <td className="px-3 py-3 text-right">
                        <button onClick={() => setOpen(isOpen ? null : c.ref)} className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: msgs.length ? '#40916C' : '#94A3B8' }}>
                          <MessageSquare className="w-3.5 h-3.5" /> {msgs.length}
                          <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                        </button>
                      </td>
                    )}
                  </tr>

                  {hasThreads && isOpen && (
                    <tr>
                      <td colSpan={cols} className="px-4 py-3" style={{ background: '#FCFDFE' }}>
                        {viewerRole === 'establishment' && stage === 2 && (
                          <p className="flex items-center gap-1.5 text-[11px] mb-2" style={{ color: '#94A3B8' }}>
                            <EyeOff className="w-3 h-3" /> The auditor&apos;s observations are hidden until results are published.
                          </p>
                        )}
                        <div className="space-y-2 max-w-2xl">
                          {msgs.length === 0 && <p className="text-xs" style={{ color: '#94A3B8' }}>No comments on this criterion yet.</p>}
                          {msgs.map(m => {
                            const role = CRITERION_ROLE_META[m.role]
                            return (
                              <div key={m.id} className="rounded-lg p-2.5" style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[11px] font-bold" style={{ color: '#1E293B' }}>{m.author}</span>
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: role.bg, color: role.color }}>{role.label}</span>
                                </div>
                                <p className="text-sm" style={{ color: '#334155' }}>{m.body}</p>
                                <p className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>{m.at}</p>
                              </div>
                            )
                          })}
                          {c.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {c.attachments.map(a => (
                                <span key={a.id} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                                  <Paperclip className="w-3 h-3" /> {a.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {canPostRow ? (
                            <div className="flex items-center gap-2 pt-1">
                              <input value={draft?.[c.ref] ?? ''} onChange={e => onDraft?.(c.ref, e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') onPost!(c.ref) }}
                                placeholder="Add a comment…"
                                className="flex-1 text-sm px-3 py-2 rounded-lg outline-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />
                              {onAttach && (
                                <button onClick={() => onAttach(c.ref)} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold" style={{ background: '#F1F5F9', color: '#475569' }}>
                                  <Paperclip className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button onClick={() => onPost!(c.ref)} disabled={!(draft?.[c.ref] ?? '').trim()}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: '#40916C' }}>
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <p className="flex items-center gap-1.5 text-[11px] pt-1" style={{ color: '#94A3B8' }}>
                              <Lock className="w-3 h-3" /> Comments are closed at this stage.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
