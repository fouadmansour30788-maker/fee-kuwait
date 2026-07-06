'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Calendar, ArrowRight, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useLang } from '@/context/LangContext'
import type { Article } from '@/lib/db/news'

const FILTERS = [
  { key: 'all', label_en: 'All', label_ar: 'الكل' },
  { key: 'eco-schools', label_en: 'Eco-Schools', label_ar: 'المدارس البيئية' },
  { key: 'blue-flag', label_en: 'Blue Flag', label_ar: 'العلم الأزرق' },
  { key: 'green-key', label_en: 'Green Key', label_ar: 'المفتاح الأخضر' },
  { key: 'yre', label_en: 'YRE', label_ar: 'YRE' },
  { key: 'eco-campus', label_en: 'Eco-Campus', label_ar: 'الحرم البيئي' },
]
const COLOUR: Record<string, string> = {
  'eco-schools': '#52B788', 'blue-flag': '#006994', 'green-key': '#C8A951',
  'leaf': '#74C69D', 'yre': '#74C69D', 'eco-campus': '#40916C',
}

export default function NewsList({ articles }: { articles: Article[] }) {
  const { lang } = useLang()
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = articles.filter((a) => {
    const matchFilter = activeFilter === 'all' || a.programme === activeFilter
    const q = search.toLowerCase()
    const title = (lang === 'ar' ? a.title_ar : a.title_en) || a.title_en || ''
    const excerpt = (lang === 'ar' ? a.excerpt_ar : a.excerpt_en) || a.excerpt_en || ''
    const matchSearch = !q || title.toLowerCase().includes(q) || excerpt.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  return (
    <>
      <section className="bg-white border-b border-[#C8E6D0] py-4 sticky top-[4.25rem] z-20">
        <div className="container-fee">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button key={f.key} onClick={() => setActiveFilter(f.key)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={activeFilter === f.key ? { background: '#40916C', color: '#fff' } : { background: '#EDF7F1', color: '#40916C', border: '1px solid #C8E6D0' }}>
                  {lang === 'ar' ? f.label_ar : f.label_en}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث...' : 'Search...'} className="input pl-9 py-2 text-sm" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: '#F4F9F5' }}>
        <div className="container-fee">
          {filtered.length === 0 ? (
            <div className="text-center py-20" style={{ color: '#7A9080' }}>
              {articles.length === 0
                ? (lang === 'ar' ? 'لا توجد أخبار منشورة بعد.' : 'No published news yet.')
                : (lang === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No matching articles found.')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article) => {
                const title = (lang === 'ar' ? article.title_ar : article.title_en) || article.title_en
                const excerpt = (lang === 'ar' ? article.excerpt_ar : article.excerpt_en) || article.excerpt_en || ''
                const colour = COLOUR[article.programme ?? ''] ?? '#40916C'
                const date = article.published_at ?? article.updated_at
                return (
                  <article key={article.id} className="card overflow-hidden flex flex-col h-full group hover:-translate-y-1.5">
                    <div className="relative h-48 overflow-hidden bg-pale">
                      {article.image_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={article.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${colour}33, ${colour}11)` }} />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                      {article.programme && (
                        <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: `${colour}CC`, backdropFilter: 'blur(4px)' }}>
                          {article.programme.toUpperCase().replace('-', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: '#7A9080' }}>
                        <Calendar className="w-3.5 h-3.5" /> {format(new Date(date), 'dd MMM yyyy')}
                      </div>
                      <h2 className="font-bold text-forest text-base leading-snug mb-3 group-hover:text-brand transition-colors line-clamp-2">{title}</h2>
                      <p className="text-sm leading-relaxed line-clamp-3 mb-4 flex-1" style={{ color: '#5A6672' }}>{excerpt}</p>
                      <Link href={`/news/${article.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-emerald transition-colors group/link">
                        {lang === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
