'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Award, ShieldCheck } from 'lucide-react'
import type { PublicCertifiedEntry } from '@/lib/db/certificates'

const CAT_LABEL = (c: string | null) => {
  if (!c) return 'Establishment'
  const map: Record<string, string> = { hotel: 'Hotel', restaurant: 'Restaurant', beach: 'Beach', marina: 'Marina', School: 'School', other: 'Establishment' }
  return map[c] ?? c.charAt(0).toUpperCase() + c.slice(1)
}
const fmt = (s: string | null) => (s ? new Date(s).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', month: 'short', year: 'numeric' }) : '—')

export default function CertifiedDirectory({ entries }: { entries: PublicCertifiedEntry[] }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')
  const [gov, setGov] = useState<string>('all')

  const cats = useMemo(() => ['all', ...Array.from(new Set(entries.map((e) => e.category ?? 'other')))], [entries])
  const govs = useMemo(() => ['all', ...Array.from(new Set(entries.map((e) => e.governorate).filter(Boolean) as string[]))], [entries])

  const filtered = useMemo(() => entries.filter((e) => {
    if (cat !== 'all' && (e.category ?? 'other') !== cat) return false
    if (gov !== 'all' && e.governorate !== gov) return false
    if (q && !((e.name ?? '').toLowerCase().includes(q.toLowerCase()) || e.number.toLowerCase().includes(q.toLowerCase()))) return false
    return true
  }), [entries, q, cat, gov])

  const selectCls = 'text-sm px-3 py-2 rounded-xl outline-none bg-white border'
  const selectStyle = { borderColor: '#D4E7DA', color: '#1E293B' } as const

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or certificate №…"
            className="w-full text-sm pl-9 pr-3 py-2 rounded-xl outline-none bg-white border" style={selectStyle} />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={selectCls} style={selectStyle}>
          {cats.map((c) => <option key={c} value={c}>{c === 'all' ? 'All categories' : CAT_LABEL(c)}</option>)}
        </select>
        <select value={gov} onChange={(e) => setGov(e.target.value)} className={selectCls} style={selectStyle}>
          {govs.map((g) => <option key={g} value={g}>{g === 'all' ? 'All governorates' : g}</option>)}
        </select>
      </div>

      <p className="text-sm mb-4" style={{ color: '#5B7568' }}>
        <strong style={{ color: '#0F2318' }}>{filtered.length}</strong> certified establishment{filtered.length === 1 ? '' : 's'}
        {(cat !== 'all' || gov !== 'all' || q) && <button onClick={() => { setQ(''); setCat('all'); setGov('all') }} className="ml-2 underline" style={{ color: '#40916C' }}>clear filters</button>}
      </p>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <Link key={e.number} href={`/verify/${encodeURIComponent(e.number)}`}
              className="group bg-white rounded-2xl border p-5 hover:shadow-lg transition-shadow" style={{ borderColor: '#D4E7DA' }}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF3' }}>
                  <Award className="w-5 h-5" style={{ color: '#00A95D' }} />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full" style={{ background: '#ECFDF3', color: '#047857' }}>
                  <ShieldCheck className="w-3 h-3" /> Valid
                </span>
              </div>
              <p className="text-sm font-bold leading-snug" style={{ color: '#0F2318' }}>{e.name ?? '—'}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: '#5B7568' }}>
                <MapPin className="w-3.5 h-3.5" /> {e.governorate ?? 'Kuwait'} · {CAT_LABEL(e.category)}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: '#EEF5F0' }}>
                <span className="font-mono text-[11px]" style={{ color: '#94A3B8' }}>{e.number}</span>
                <span className="text-[11px]" style={{ color: '#5B7568' }}>Valid to {fmt(e.expiresAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border" style={{ borderColor: '#D4E7DA', background: '#fff' }}>
          <Award className="w-9 h-9 mx-auto mb-2 opacity-30" style={{ color: '#40916C' }} />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>No certified establishments match your filters.</p>
        </div>
      )}
    </div>
  )
}
