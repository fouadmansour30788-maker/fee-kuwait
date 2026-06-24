'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Calendar, ArrowRight, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useLang } from '@/context/LangContext'
import { DEMO_NEWS } from '@/lib/data/news'

const FILTERS = [
  { key: 'all',         label_en: 'All',         label_ar: 'الكل' },
  { key: 'eco-schools', label_en: 'Eco-Schools',  label_ar: 'المدارس البيئية' },
  { key: 'blue-flag',   label_en: 'Blue Flag',    label_ar: 'العلم الأزرق' },
  { key: 'green-key',   label_en: 'Green Key',    label_ar: 'المفتاح الأخضر' },
  { key: 'yre',         label_en: 'YRE',          label_ar: 'YRE' },
  { key: 'eco-campus',  label_en: 'Eco-Campus',   label_ar: 'الحرم البيئي' },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  )
}

export default function NewsPage() {
  const { lang } = useLang()
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = DEMO_NEWS.filter((a) => {
    const matchFilter = activeFilter === 'all' || a.programme === activeFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (lang === 'ar' ? a.title_ar : a.title_en).toLowerCase().includes(q) ||
      (lang === 'ar' ? a.excerpt_ar : a.excerpt_en).toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  return (
    <>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #182019 0%, #182019 100%)' }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[350px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, #8B9B88 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div className="container-fee relative z-10 text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-7"
              style={{ border: '1px solid rgba(139,155,136,0.3)', color: 'rgba(169,182,164,0.85)', background: 'rgba(139,155,136,0.08)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#A9B6A4] animate-pulse" />
              {lang === 'ar' ? 'مركز الإعلام' : 'Media Centre'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              {lang === 'ar'
                ? <>أحدث الأخبار<br /><span style={{ color: '#A9B6A4' }}>والتقارير</span></>
                : <>News &amp;<br /><span style={{ color: '#A9B6A4' }}>Stories</span></>}
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'ar'
                ? 'آخر المستجدات والقصص من مجتمعنا من صانعي التغيير البيئي في الكويت.'
                : 'The latest updates and stories from our community of environmental changemakers across Kuwait.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <section className="bg-warmwhite border-b border-[#E7E4D6] py-4 sticky top-[4.25rem] z-20">
        <div className="container-fee">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={activeFilter === f.key
                    ? { background: '#7B8266', color: '#fff' }
                    : { background: '#E8ECE1', color: '#7B8266', border: '1px solid #E7E4D6' }}
                >
                  {lang === 'ar' ? f.label_ar : f.label_en}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث...' : 'Search...'}
                className="input pl-9 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16" style={{ background: '#FBF8F0' }}>
        <div className="container-fee">
          {filtered.length === 0 ? (
            <div className="text-center py-20" style={{ color: '#7A9080' }}>
              {lang === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No matching articles found.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article, i) => (
                <FadeIn key={article.id} delay={i * 0.07}>
                  <article className="card overflow-hidden flex flex-col h-full group hover:-translate-y-1.5">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-pale">
                      <Image
                        src={article.image_url}
                        alt={lang === 'ar' ? article.title_ar : article.title_en}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                      {article.programme && (
                        <span
                          className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                          style={{ background: `${article.colour}CC`, backdropFilter: 'blur(4px)' }}
                        >
                          {article.programme.toUpperCase().replace('-', ' ')}
                        </span>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: '#7A9080' }}>
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(article.published_at), 'dd MMM yyyy')}
                      </div>
                      <h2 className="font-bold text-forest text-base leading-snug mb-3 group-hover:text-brand transition-colors line-clamp-2">
                        {lang === 'ar' ? article.title_ar : article.title_en}
                      </h2>
                      <p className="text-sm leading-relaxed line-clamp-3 mb-4 flex-1" style={{ color: '#5A6672' }}>
                        {lang === 'ar' ? article.excerpt_ar : article.excerpt_en}
                      </p>
                      <Link
                        href={`/news/${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-emerald transition-colors group/link"
                      >
                        {lang === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
