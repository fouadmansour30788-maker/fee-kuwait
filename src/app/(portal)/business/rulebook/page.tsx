'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, KeyRound, Waves, BookOpen, ListChecks, ShieldCheck, Info } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import {
  GK_SECTIONS, GK_CRITERIA, ESTABLISHMENT_CATEGORIES, GUIDELINE_CYCLE, isImperativeFor,
  type EstablishmentCategory,
} from '@/lib/data/greenKeyCriteria'
import {
  BF_SECTIONS, BF_CRITERIA, BF_CATEGORIES, bfIsImperative,
  type BFCategory,
} from '@/lib/data/blueFlagCriteria'

type Programme = 'green' | 'blue'
type Filter = 'all' | 'I' | 'G'

const GREEN = '#C8A951'
const BLUE = '#006994'

interface RuleItem { id: string; sectionN: number; sub?: string; title: string; imp: boolean; desc: string }

function Badge({ imperative, color }: { imperative: boolean; color: string }) {
  const { lang } = useLang()
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={imperative
        ? { background: '#1B433215', color: '#1B4332', border: '1px solid #1B433230' }
        : { background: `${color}1A`, color: '#8a6d1f', border: `1px solid ${color}40` }}>
      {imperative ? (lang === 'ar' ? 'إلزامي' : 'Imperative') : (lang === 'ar' ? 'إرشادي' : 'Guideline')}
    </span>
  )
}

export default function RulebookPage() {
  const { lang } = useLang()
  const [programme, setProgramme] = useState<Programme>('green')
  const [gkCat, setGkCat] = useState<EstablishmentCategory>('HH')
  const [bfCat, setBfCat] = useState<BFCategory>('B')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const color = programme === 'green' ? GREEN : BLUE
  const sections = programme === 'green' ? GK_SECTIONS : BF_SECTIONS
  const secTitle = (n: number) => {
    const s = sections.find((x) => x.n === n)
    if (!s) return `Section ${n}`
    return lang === 'ar' && 'title_ar' in s ? s.title_ar : s.title
  }

  // Normalize both programmes to a common shape.
  const items: RuleItem[] = useMemo(() => {
    if (programme === 'green') {
      return GK_CRITERIA.filter((c) => c.categories.includes(gkCat)).map((c) => ({
        id: c.id, sectionN: c.section, sub: c.subsection, title: c.title, imp: isImperativeFor(c, gkCat), desc: c.note ?? '',
      }))
    }
    return BF_CRITERIA.filter((c) => c.categories.includes(bfCat)).map((c) => ({
      id: c.id, sectionN: c.section, title: c.title, imp: bfIsImperative(c), desc: c.note,
    }))
  }, [programme, gkCat, bfCat])

  const filtered = useMemo(() => items.filter((i) => {
    if (filter === 'I' && !i.imp) return false
    if (filter === 'G' && i.imp) return false
    if (search) {
      const q = search.toLowerCase()
      if (!i.title.toLowerCase().includes(q) && !i.id.includes(q) && !i.desc.toLowerCase().includes(q)) return false
    }
    return true
  }), [items, filter, search])

  const total = items.length
  const impCount = items.filter((i) => i.imp).length
  const guideCount = total - impCount

  // Group by section, then (Green Key) by subsection.
  const grouped = useMemo(() => sections.map((s) => {
    const secItems = filtered.filter((i) => i.sectionN === s.n)
    const subs = programme === 'green' && 'subsections' in s
      ? (s.subsections as string[]).map((sub) => ({ sub, items: secItems.filter((i) => i.sub === sub) })).filter((g) => g.items.length > 0)
      : [{ sub: '', items: secItems }]
    return { n: s.n, items: secItems, subs }
  }).filter((g) => g.items.length > 0), [filtered, sections, programme])

  const categories = programme === 'green'
    ? ESTABLISHMENT_CATEGORIES.map((c) => ({ code: c.code as string, label: c.label }))
    : BF_CATEGORIES.map((c) => ({ code: c.code as string, label: lang === 'ar' ? c.label_ar : c.label }))
  const activeCat = programme === 'green' ? (gkCat as string) : (bfCat as string)
  const setCat = (code: string) => (programme === 'green' ? setGkCat(code as EstablishmentCategory) : setBfCat(code as BFCategory))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}1A`, border: `1px solid ${color}40` }}>
            <BookOpen className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'دليل المعايير' : 'Rulebook'}</h1>
            <p className="text-sm" style={{ color: '#7A9080' }}>
              {lang === 'ar' ? 'معايير المفتاح الأخضر والعلم الأزرق مع شرح كل بند' : 'Green Key & Blue Flag criteria with a description for each indicator'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Programme selector */}
      <div className="flex gap-2">
        {([
          { key: 'green', Icon: KeyRound, en: 'Green Key', ar: 'المفتاح الأخضر', c: GREEN },
          { key: 'blue', Icon: Waves, en: 'Blue Flag', ar: 'العلم الأزرق', c: BLUE },
        ] as { key: Programme; Icon: React.ElementType; en: string; ar: string; c: string }[]).map((p) => {
          const active = programme === p.key
          return (
            <button key={p.key} onClick={() => { setProgramme(p.key); setFilter('all'); setSearch('') }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all"
              style={active ? { background: p.c, color: '#fff', boxShadow: `0 6px 18px ${p.c}45` } : { background: '#fff', color: '#3D4A42', border: '1px solid #E2E8F0' }}>
              <p.Icon className="w-4 h-4" /> {lang === 'ar' ? p.ar : p.en}
            </button>
          )
        })}
      </div>

      {/* Category + filters */}
      <div className="bg-white rounded-2xl border p-4 space-y-3" style={{ borderColor: '#E8F0EA' }}>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => {
            const active = activeCat === c.code
            return (
              <button key={c.code} onClick={() => setCat(c.code)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                style={active ? { background: color, color: '#fff' } : { background: '#F4F7F5', color: '#5B7568' }}>
                {c.label}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: '#F1F5F9' }}>
            {([
              { key: 'all', en: 'All', ar: 'الكل' },
              { key: 'I', en: 'Imperative', ar: 'إلزامي' },
              { key: 'G', en: 'Guideline', ar: 'إرشادي' },
            ] as { key: Filter; en: string; ar: string }[]).map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="text-xs font-semibold px-3 py-1.5 rounded-md transition-all"
                style={filter === f.key ? { background: '#fff', color: '#0F172A', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: '#64748B' }}>
                {lang === 'ar' ? f.ar : f.en}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[160px] px-3 py-1.5 rounded-lg" style={{ background: '#F4F7F5' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث في البنود…' : 'Search indicators…'}
              className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }} />
          </div>
        </div>
        <p className="text-xs" style={{ color: '#7A9080' }}>
          {filtered.length} {lang === 'ar' ? 'بند' : 'indicators'} · {impCount} {lang === 'ar' ? 'إلزامي' : 'imperative'}
        </p>
      </div>

      {/* Counts for the selected programme + category */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: lang === 'ar' ? 'إجمالي المعايير' : 'Applicable', value: total, c: '#40916C', Icon: ListChecks },
          { label: lang === 'ar' ? 'إلزامية' : 'Imperative', value: impCount, c: '#1B4332', Icon: ShieldCheck },
          { label: lang === 'ar' ? 'إرشادية' : 'Guideline', value: guideCount, c: color, Icon: BookOpen },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-3.5 text-center bg-white" style={{ border: '1px solid #E8F0EA' }}>
            <s.Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: s.c }} />
            <p className="text-2xl font-bold" style={{ color: s.c }}>{s.value}</p>
            <p className="text-[11px]" style={{ color: '#7A9080' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Green Key guideline compliance cycle */}
      {programme === 'green' && (
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E8F0EA' }}>
          <div className="px-5 py-3.5 border-b flex items-start gap-2.5" style={{ borderColor: '#F4F9F5' }}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#40916C' }} />
            <p className="text-xs" style={{ color: '#5A6672' }}>
              {lang === 'ar'
                ? 'يجب استيفاء 100% من المعايير الإلزامية، بالإضافة إلى نسبة متزايدة من المعايير الإرشادية حسب عدد سنوات حمل الشهادة.'
                : 'You must meet 100% of imperative criteria, plus an increasing share of applicable guideline criteria based on how long the certificate has been held.'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 460 }}>
              <thead>
                <tr style={{ background: '#F4F9F5' }}>
                  {[
                    lang === 'ar' ? 'الفترة' : 'Period', lang === 'ar' ? 'السنوات' : 'Years',
                    lang === 'ar' ? 'إلزامية' : 'Imperative', lang === 'ar' ? 'إرشادية' : 'Guideline',
                    lang === 'ar' ? 'مطلوب الآن' : 'Req. now',
                  ].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] font-bold uppercase" style={{ color: '#7A9080' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F9F5]">
                {GUIDELINE_CYCLE.map((row) => (
                  <tr key={row.period}>
                    <td className="px-4 py-2.5 font-medium text-forest whitespace-nowrap">{row.period}</td>
                    <td className="px-4 py-2.5" style={{ color: '#5A6672' }}>{row.years}</td>
                    <td className="px-4 py-2.5" style={{ color: '#1B4332' }}>{row.imperative}%</td>
                    <td className="px-4 py-2.5" style={{ color: '#8a6d1f' }}>{row.guideline}%</td>
                    <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: '#40916C' }}>
                      {impCount} + {Math.ceil((guideCount * row.guideline) / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grouped criteria */}
      <div className="space-y-6">
        {grouped.map((g) => (
          <motion.section key={g.n} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${color}1A`, color }}>{g.n}</span>
              <h2 className="text-base font-bold text-forest">{secTitle(g.n)}</h2>
              <span className="text-xs" style={{ color: '#94A3B8' }}>({g.items.length})</span>
            </div>
            <div className="space-y-4">
              {g.subs.map((sg) => (
                <div key={sg.sub || 'all'}>
                  {sg.sub && <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#94A3B8' }}>{sg.sub}</p>}
                  <div className="space-y-2">
                    {sg.items.map((i) => (
                      <div key={i.id} className="bg-white rounded-xl border p-4" style={{ borderColor: '#E8F0EA' }}>
                        <div className="flex items-start gap-2.5">
                          <span className="text-xs font-mono font-bold mt-0.5 flex-shrink-0" style={{ color }}>{i.id}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold" style={{ color: '#243B2E' }}>{i.title}</p>
                              <Badge imperative={i.imp} color={color} />
                            </div>
                            {i.desc && <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#5B7568' }}>{i.desc}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
        {grouped.length === 0 && (
          <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: '#E8F0EA', color: '#94A3B8' }}>
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">{lang === 'ar' ? 'لا توجد بنود مطابقة.' : 'No indicators match.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
