'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Loader2 } from 'lucide-react'
import { archiveAudit } from '@/lib/actions/audits'

// Operator snapshots the current auditor's results into the audit history,
// tagging it on-site (every 2 yrs) or off-site (every year), before reassigning
// the auditor for the next cycle.
export default function ArchiveAudit({ applicationId }: { applicationId: string }) {
  const [type, setType] = useState<'onsite' | 'offsite'>('onsite')
  const [period, setPeriod] = useState(new Date().getFullYear())
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  function go() {
    setMsg(''); setErr('')
    start(async () => {
      const r = await archiveAudit(applicationId, type, period)
      if (r.error) setErr(r.error)
      else { setMsg('Audit archived to history.'); router.refresh() }
    })
  }

  const field = 'text-sm px-3 py-2 rounded-xl bg-white outline-none'
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2 mb-1">
        <Archive className="w-4 h-4" style={{ color: '#40916C' }} />
        <h3 className="font-semibold" style={{ color: '#1E293B' }}>Archive this audit</h3>
      </div>
      <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>
        Snapshots the current auditor’s results & feedback into the audit history (on-site every 2 years, off-site every year), then you can assign a new auditor for the next cycle.
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <select value={type} onChange={(e) => setType(e.target.value as 'onsite' | 'offsite')} className={field} style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
          <option value="onsite">On-site (every 2 years)</option>
          <option value="offsite">Off-site (every year)</option>
        </select>
        <input type="number" value={period} min={2000} max={2100} onChange={(e) => setPeriod(Number(e.target.value))} title="Period (year)" className={`${field} w-24`} style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
        <button onClick={go} disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />} Archive
        </button>
      </div>
      {msg && <p className="text-xs mt-2" style={{ color: '#059669' }}>{msg}</p>}
      {err && <p className="text-xs mt-2" style={{ color: '#E53E3E' }}>{err}</p>}
    </div>
  )
}
