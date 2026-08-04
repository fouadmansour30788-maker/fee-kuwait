'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, ChevronRight, Check } from 'lucide-react'
import { OPERATOR_ACTIONS, CB_ACTIONS, AUDITOR_ACTIONS, ESTABLISHMENT_ACTIONS, type AppStatus, type Transition } from '@/lib/workflow'
import { applyWorkflowAction, type ActionInput } from '@/lib/actions/workflow'

const TABLES = { operator: OPERATOR_ACTIONS, cb: CB_ACTIONS, auditor: AUDITOR_ACTIONS, establishment: ESTABLISHMENT_ACTIONS }
const toneBg: Record<string, string> = { primary: 'linear-gradient(135deg, #1B4332, #40916C)', danger: '#DC2626', neutral: '#475569' }

// The role's available workflow actions for the current status, each expanding
// to collect any required input (reason / deadline / clarification owner / date /
// criteria to reopen).
export default function WorkflowActions({ applicationId, role, status, criteria = [] }: {
  applicationId: string; role: 'operator' | 'cb' | 'auditor' | 'establishment'; status: string
  criteria?: { ref: string; title: string }[]
}) {
  const actions = TABLES[role][status as AppStatus] ?? []
  const [open, setOpen] = useState<string | null>(null)
  const [input, setInput] = useState<ActionInput>({})
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  if (actions.length === 0) {
    return <p className="text-xs" style={{ color: '#94A3B8' }}>No actions available at this stage for your role.</p>
  }

  function run(t: Transition) {
    setError('')
    start(async () => {
      const r = await applyWorkflowAction(applicationId, role, t.action, input)
      if (r.error) setError(r.error)
      else { setOpen(null); setInput({}); router.refresh() }
    })
  }

  const field = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

  return (
    <div className="space-y-2">
      {actions.map((t) => {
        const isOpen = open === t.action
        const req = t.requires ?? []
        return (
          <div key={t.action} className="rounded-xl border" style={{ borderColor: '#E2E8F0' }}>
            <button onClick={() => { setOpen(isOpen ? null : t.action); setInput({}); setError('') }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.tone === 'danger' ? '#DC2626' : t.tone === 'neutral' ? '#94A3B8' : '#40916C' }} />
              <span className="text-sm font-semibold flex-1" style={{ color: '#1E293B' }}>{t.action}</span>
              <ChevronRight className="w-4 h-4 transition-transform" style={{ color: '#94A3B8', transform: isOpen ? 'rotate(90deg)' : 'none' }} />
            </button>
            {isOpen && (
              <div className="px-3 pb-3 space-y-2">
                {t.note && <p className="text-xs" style={{ color: '#94A3B8' }}>{t.note}</p>}
                {req.includes('owner') && (
                  <select value={input.owner ?? ''} onChange={(e) => setInput((i) => ({ ...i, owner: e.target.value as ActionInput['owner'] }))}
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none bg-white" style={field}>
                    <option value="">Who must respond?…</option>
                    <option value="operator">Operator</option>
                    <option value="auditor">Auditor</option>
                    <option value="establishment">Establishment</option>
                  </select>
                )}
                {req.includes('criteria') && (
                  <div className="rounded-lg border max-h-52 overflow-y-auto divide-y" style={{ borderColor: '#E2E8F0' }}>
                    {criteria.length === 0 && <p className="text-xs p-2" style={{ color: '#94A3B8' }}>No criteria to reopen.</p>}
                    {criteria.map((c) => {
                      const on = (input.criteria ?? []).includes(c.ref)
                      return (
                        <button key={c.ref} type="button"
                          onClick={() => setInput((i) => ({ ...i, criteria: on ? (i.criteria ?? []).filter((x) => x !== c.ref) : [...(i.criteria ?? []), c.ref] }))}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs">
                          <span className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0" style={on ? { background: '#40916C', borderColor: '#40916C' } : { borderColor: '#CBD5E1' }}>
                            {on && <Check className="w-3 h-3 text-white" />}
                          </span>
                          <span className="font-mono font-semibold" style={{ color: '#64748B' }}>{c.ref}</span>
                          <span className="truncate" style={{ color: '#1E293B' }}>{c.title}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
                {req.includes('date') && (
                  <input type="date" value={input.date ?? ''} onChange={(e) => setInput((i) => ({ ...i, date: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} />
                )}
                {req.includes('deadline') && (
                  <div>
                    <label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Deadline</label>
                    <input type="date" value={input.deadline ?? ''} onChange={(e) => setInput((i) => ({ ...i, deadline: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} />
                  </div>
                )}
                {req.includes('reason') && (
                  <textarea value={input.reason ?? ''} onChange={(e) => setInput((i) => ({ ...i, reason: e.target.value }))} rows={2}
                    placeholder="Reason / note…" className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-none" style={field} />
                )}
                <button onClick={() => run(t)} disabled={pending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: toneBg[t.tone ?? 'primary'] }}>
                  {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Confirm: {t.action}
                </button>
              </div>
            )}
          </div>
        )
      })}
      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
    </div>
  )
}
