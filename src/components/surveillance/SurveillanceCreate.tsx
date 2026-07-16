'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import { requestSurveillance } from '@/lib/actions/surveillance'

interface Crit { ref: string; title: string }

export default function SurveillanceCreate({
  apps, criteriaByProgramme,
}: {
  apps: { id: string; label: string; programme: string }[]
  criteriaByProgramme: Record<string, Crit[]>
}) {
  const [open, setOpen] = useState(false)
  const [appId, setAppId] = useState(apps[0]?.id ?? '')
  const [period, setPeriod] = useState(new Date().getFullYear())
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  const programme = apps.find((a) => a.id === appId)?.programme ?? ''
  const criteria = criteriaByProgramme[programme] ?? []
  const visible = useMemo(() => {
    const q = search.toLowerCase()
    return q ? criteria.filter((c) => c.title.toLowerCase().includes(q) || c.ref.toLowerCase().includes(q)) : criteria
  }, [criteria, search])

  function toggle(ref: string) { setSel((p) => { const n = new Set(p); n.has(ref) ? n.delete(ref) : n.add(ref); return n }) }

  function go() {
    setError('')
    start(async () => {
      const r = await requestSurveillance(appId, period, Array.from(sel), note)
      if (r.error) setError(r.error)
      else { setOpen(false); setSel(new Set()); setNote(''); setSearch(''); router.refresh() }
    })
  }

  if (apps.length === 0) return null
  const field = 'text-sm px-3 py-2 rounded-xl bg-white outline-none'

  return (
    <div className="rounded-2xl border" style={{ borderColor: '#E2E8F0' }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-5 py-4">
        <Plus className="w-4 h-4" style={{ color: '#40916C' }} />
        <span className="font-semibold" style={{ color: '#1E293B' }}>Request a surveillance update</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: '#94A3B8' }} />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-2 flex-wrap pt-3">
            <select value={appId} onChange={(e) => { setAppId(e.target.value); setSel(new Set()) }} className={field} style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
              {apps.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
            <label className="text-xs font-semibold" style={{ color: '#64748B' }}>Surveillance year</label>
            <input type="number" value={period} min={2000} max={2100} onChange={(e) => setPeriod(Number(e.target.value))} className={`${field} w-24`} style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ border: '1px solid #E2E8F0' }}>
            <Search className="w-4 h-4" style={{ color: '#94A3B8' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search criteria…" className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }} />
            <span className="text-[11px] whitespace-nowrap" style={{ color: '#94A3B8' }}>{sel.size} selected</span>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-xl border divide-y" style={{ borderColor: '#E2E8F0' }}>
            {visible.map((c) => (
              <label key={c.ref} className="flex items-start gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50">
                <input type="checkbox" checked={sel.has(c.ref)} onChange={() => toggle(c.ref)} className="mt-1 w-4 h-4 accent-green-700" />
                <span className="text-xs font-mono font-semibold mt-0.5" style={{ color: '#94A3B8' }}>{c.ref}</span>
                <span className="text-sm" style={{ color: '#334155' }}>{c.title}</span>
              </label>
            ))}
            {visible.length === 0 && <p className="px-3 py-4 text-sm text-center" style={{ color: '#94A3B8' }}>No criteria.</p>}
          </div>

          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="What update or documents are you requesting?"
            className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1E293B' }} />

          {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#E53E3E' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
          <button onClick={go} disabled={pending || sel.size === 0} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Send request
          </button>
        </div>
      )}
    </div>
  )
}
