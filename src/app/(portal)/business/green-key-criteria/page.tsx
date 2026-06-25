'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, KeyRound, Info, ShieldCheck, ListChecks } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import {
  GK_SECTIONS, GK_CRITERIA, ESTABLISHMENT_CATEGORIES, GUIDELINE_CYCLE,
  isImperativeFor, countsForCategory,
  type EstablishmentCategory, type Criterion,
} from '@/lib/data/greenKeyCriteria'

type Filter = 'all' | 'I' | 'G'

const GOLD = '#C8A951'

function Badge({ imperative }: { imperative: boolean }) {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={imperative
        ? { background: '#1B433215', color: '#1B4332', border: '1px solid #1B433230' }
        : { background: `${GOLD}1A`, color: '#8a6d1f', border: `1px solid ${GOLD}40` }}>
      {imperative ? 'Imperative' : 'Guideline'}
    </span>
  )
}

export default function GreenKeyCriteriaPage() {
  const { lang } = useLang()
  const [cat, setCat] = useState<EstablishmentCategory>('HH')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const counts = useMemo(() => countsForCategory(cat), [cat])

  // applicable to selected category + search/filter
  const visible = useMemo(() => {
    return GK_CRITERIA.filter(c => {
      if (!c.categories.includes(cat)) return false
      const imp = isImperativeFor(c, cat)
      if (filter === 'I' && !imp) return false
      if (filter === 'G' && imp) return false
      if (search) {
        const q = search.toLowerCase()
        if (!c.title.toLowerCase().includes(q) && !c.id.includes(q) && !c.subsection.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [cat, filter, search])

  const grouped = useMemo(() => {
    return GK_SECTIONS.map(s => {
      const items = visible.filter(c => c.section === s.n)
      const bySub = s.subsections
        .map(sub => ({ sub, items: items.filter(c => c.subsection === sub) }))
        .filter(g => g.items.length > 0)
      return { section: s, bySub, count: items.length }
    }).filter(g => g.count > 0)
  }, [visible])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}1A`, border: `1px solid ${GOLD}40` }}>
            <KeyRound className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'معايير المفتاح الأخضر' : 'Green Key Criteria'}</h1>
            <p className="text-sm" style={{ color: '#7A9080' }}>2026-2031 · {lang === 'ar' ? 'مصفّاة حسب فئة المنشأة' : 'filtered by establishment category'}</p>
          </div>
        </div>
      </motion.div>

      {/* Category selector */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white rounded-3xl border border-[#C8E6D0] p-5">
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#7A9080' }}>
          {lang === 'ar' ? 'فئة المنشأة' : 'Establishment Category'}
        </p>
        <div className="flex flex-wrap gap-2">
          {ESTABLISHMENT_CATEGORIES.map(c => (
            <button key={c.code} onClick={() => setCat(c.code)}
              className="px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={cat === c.code
                ? { background: '#1B4332', color: '#fff' }
                : { background: '#F4F9F5', color: '#3D5A47', border: '1px solid #C8E6D0' }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Counts */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: lang === 'ar' ? 'إجمالي المعايير' : 'Applicable', value: counts.total, color: '#40916C', Icon: ListChecks },
            { label: lang === 'ar' ? 'إلزامية' : 'Imperative', value: counts.imperative, color: '#1B4332', Icon: ShieldCheck },
            { label: lang === 'ar' ? 'إرشادية' : 'Guideline', value: counts.guideline, color: GOLD, Icon: KeyRound },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3.5 text-center" style={{ background: '#F4F9F5', border: '1px solid #E2EDE6' }}>
              <s.Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: s.color }} />
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: '#7A9080' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cycle table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
        className="bg-white rounded-3xl border border-[#C8E6D0] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#F4F9F5] flex items-start gap-2.5">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#40916C' }} />
          <p className="text-xs" style={{ color: '#5A6672' }}>
            {lang === 'ar'
              ? 'يجب استيفاء 100% من المعايير الإلزامية، بالإضافة إلى نسبة متزايدة من المعايير الإرشادية حسب عدد سنوات حمل الشهادة.'
              : 'You must meet 100% of imperative criteria, plus an increasing share of applicable guideline criteria based on how long the certificate has been held.'}
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F4F9F5' }}>
              <th className="text-left px-5 py-2.5 text-[11px] font-bold uppercase" style={{ color: '#7A9080' }}>{lang === 'ar' ? 'الفترة' : 'Period'}</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase" style={{ color: '#7A9080' }}>{lang === 'ar' ? 'السنوات' : 'Years'}</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase" style={{ color: '#7A9080' }}>{lang === 'ar' ? 'إلزامية' : 'Imperative'}</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase" style={{ color: '#7A9080' }}>{lang === 'ar' ? 'إرشادية' : 'Guideline'}</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase" style={{ color: '#7A9080' }}>{lang === 'ar' ? 'مطلوب' : 'Req. now'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F9F5]">
            {GUIDELINE_CYCLE.map(row => (
              <tr key={row.period}>
                <td className="px-5 py-2.5 font-medium text-forest">{row.period}</td>
                <td className="px-3 py-2.5" style={{ color: '#5A6672' }}>{row.years}</td>
                <td className="px-3 py-2.5" style={{ color: '#1B4332' }}>{row.imperative}%</td>
                <td className="px-3 py-2.5" style={{ color: '#8a6d1f' }}>{row.guideline}%</td>
                <td className="px-3 py-2.5 font-semibold" style={{ color: '#40916C' }}>
                  {counts.imperative} + {Math.ceil((counts.guideline * row.guideline) / 100)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px] px-3.5 py-2.5 rounded-xl bg-white" style={{ border: '1px solid #C8E6D0' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#7A9080' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'ابحث في المعايير…' : 'Search criteria…'}
            className="bg-transparent text-sm outline-none w-full" style={{ color: '#3D5A47' }} />
        </div>
        {(['all', 'I', 'G'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={filter === f ? { background: '#1B4332', color: '#fff' } : { background: '#fff', color: '#7A9080', border: '1px solid #C8E6D0' }}>
            {f === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : f === 'I' ? (lang === 'ar' ? 'إلزامية' : 'Imperative') : (lang === 'ar' ? 'إرشادية' : 'Guideline')}
          </button>
        ))}
      </div>

      {/* Criteria grouped by section */}
      <div className="space-y-5">
        {grouped.map(({ section, bySub, count }) => (
          <motion.div key={section.n} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#40916C' }}>{section.n}</span>
              <h2 className="font-bold text-forest">{section.title}</h2>
              <span className="text-xs" style={{ color: '#7A9080' }}>· {count}</span>
            </div>
            <div className="space-y-4">
              {bySub.map(({ sub, items }) => (
                <div key={sub}>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-2 ml-1" style={{ color: '#7A9080' }}>{sub}</p>
                  <div className="bg-white rounded-2xl border border-[#C8E6D0] divide-y divide-[#F4F9F5]">
                    {items.map((c: Criterion) => {
                      const imp = isImperativeFor(c, cat)
                      return (
                        <div key={c.id} className="px-4 py-3.5 flex gap-3">
                          <span className="text-xs font-bold mt-0.5 flex-shrink-0 w-9" style={{ color: '#40916C' }}>{c.id}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm leading-snug text-forest">{c.title}</p>
                              <Badge imperative={imp} />
                            </div>
                            {c.note && <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#7A9080' }}>{c.note}</p>}
                            {c.type === 'I/G' && (
                              <p className="text-[11px] mt-1" style={{ color: GOLD }}>
                                {lang === 'ar' ? 'إلزامية لبعض الفئات' : 'Imperative for some categories, guideline for others'}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
        {grouped.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#C8E6D0] p-12 text-center" style={{ color: '#7A9080' }}>
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">{lang === 'ar' ? 'لا توجد معايير مطابقة.' : 'No criteria match.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
