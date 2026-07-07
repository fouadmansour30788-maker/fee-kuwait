'use client'

import { Fragment, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { criteriaForProgramme } from '@/lib/criteria'
import { CRITERIA_PROGRAMMES } from '@/lib/resources'

// Read-only criteria browser (Green Key / Blue Flag) with descriptions + I/G tags.
export default function CriteriaReference() {
  const [programme, setProgramme] = useState('green-key')
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState<'all' | 'I' | 'G'>('all')
  const criteria = criteriaForProgramme(programme)

  const filtered = criteria.filter((c) => {
    const q = search.toLowerCase()
    const matchQ = !q || c.title.toLowerCase().includes(q) || c.ref.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
    const isImp = !!c.type && c.type.includes('I')
    const matchKind = kind === 'all' || (kind === 'I' ? isImp : !isImp)
    return matchQ && matchKind
  })
  const groups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, typeof criteria>()
    for (const c of filtered) { if (!map.has(c.area)) { map.set(c.area, []); order.push(c.area) } map.get(c.area)!.push(c) }
    return order.map((a) => ({ area: a, rows: map.get(a)! }))
  }, [filtered])
  const impCount = criteria.filter((c) => !!c.type && c.type.includes('I')).length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select value={programme} onChange={(e) => setProgramme(e.target.value)} className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
          {CRITERIA_PROGRAMMES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white flex-1 min-w-[160px]" style={{ border: '1px solid #E2E8F0' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search indicators…" className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }} />
        </div>
        {(['all', 'I', 'G'] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className="text-xs font-semibold px-2.5 py-2 rounded-xl"
            style={kind === k ? { background: '#1B4332', color: '#fff' } : { background: '#F1F5F9', color: '#475569' }}>
            {k === 'all' ? 'All' : k === 'I' ? 'Imperative' : 'Guideline'}
          </button>
        ))}
      </div>
      <p className="text-xs" style={{ color: '#94A3B8' }}>{criteria.length} indicators · {impCount} imperative</p>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
          {groups.map((g) => (
            <Fragment key={g.area}>
              <div className="px-4 py-2" style={{ background: '#ECFDF3' }}>
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#1B4332' }}>{g.area}</span>
                <span className="text-[11px] font-semibold ml-2" style={{ color: '#6B9080' }}>· {g.rows.length}</span>
              </div>
              {g.rows.map((c) => {
                const isImp = !!c.type && c.type.includes('I')
                return (
                  <div key={c.ref} className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-mono font-semibold mt-0.5" style={{ color: '#94A3B8' }}>{c.ref}</span>
                      <div className="min-w-0">
                        <p className="text-sm" style={{ color: '#1E293B' }}>
                          {c.title}
                          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={isImp ? { background: '#FEF3C7', color: '#92400E' } : { background: '#EEF2F6', color: '#64748B' }}>{isImp ? 'Imperative' : 'Guideline'}</span>
                        </p>
                        {c.description && <p className="text-xs mt-1" style={{ color: '#64748B' }}>{c.description}</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </Fragment>
          ))}
          {filtered.length === 0 && <p className="text-sm text-center py-8" style={{ color: '#94A3B8' }}>No indicators match your search.</p>}
        </div>
      </div>
    </div>
  )
}
