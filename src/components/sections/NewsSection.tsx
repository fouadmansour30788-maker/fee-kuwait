'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Calendar } from 'lucide-react'
import { useRef } from 'react'
import { useLang } from '@/context/LangContext'
import { t } from '@/i18n'
import { format } from 'date-fns'
import type { Article } from '@/lib/db/news'

const COLOUR: Record<string, string> = {
  'eco-schools': '#52B788', 'blue-flag': '#006994', 'green-key': '#C8A951',
  'leaf': '#74C69D', 'yre': '#74C69D', 'eco-campus': '#40916C',
}

export default function NewsSection({ articles }: { articles: Article[] }) {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  if (articles.length === 0) return null

  return (
    <section className="py-28 bg-white" ref={ref}>
      <div className="container-fee">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between mb-14 gap-6"
        >
          <div>
            <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-5"
              style={{ background: '#D1FAE5', color: '#059669' }}>
              {lang === 'ar' ? 'أحدث الأخبار' : 'Latest News'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: '#0F2318' }}>{t(lang, 'news.title')}</h2>
            <p className="text-base leading-relaxed max-w-lg" style={{ color: '#5A6672' }}>{t(lang, 'news.subtitle')}</p>
          </div>
          <Link href="/news" className="hidden md:inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: '#0F2318', color: '#fff', boxShadow: '0 4px 16px rgba(15,35,24,0.22)' }}>
            {t(lang, 'news.view_all')} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => {
            const title = (lang === 'ar' ? article.title_ar : article.title_en) || article.title_en
            const excerpt = (lang === 'ar' ? article.excerpt_ar : article.excerpt_en) || article.excerpt_en || ''
            const colour = COLOUR[article.programme ?? ''] ?? '#40916C'
            const date = article.published_at ?? article.updated_at
            return (
              <motion.article key={article.id}
                initial={{ opacity: 0, y: 48, scale: 0.97 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.65, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)]"
                style={{ border: '1px solid #E2EDE6', boxShadow: '0 2px 12px rgba(64,145,108,0.06)' }}>
                <div className="relative h-56 overflow-hidden flex-shrink-0" style={{ background: '#F4F9F5' }}>
                  {article.image_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={article.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${colour}33, ${colour}11)` }} />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {i === 0 && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: '#40916C' }}>{lang === 'ar' ? 'مميز' : 'Featured'}</span>}
                    {article.programme && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white backdrop-blur-sm" style={{ background: `${colour}CC` }}>{article.programme.toUpperCase().replace('-', ' ')}</span>}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: '#7A9080' }}>
                    <Calendar className="w-3.5 h-3.5" /> {format(new Date(date), 'dd MMM yyyy')}
                  </div>
                  <h3 className="font-bold text-base leading-snug mb-3 flex-1 group-hover:text-[#40916C] transition-colors line-clamp-2" style={{ color: '#0F2318' }}>{title}</h3>
                  <p className="text-sm leading-relaxed line-clamp-2 mb-5" style={{ color: '#5A6672' }}>{excerpt}</p>
                  <Link href={`/news/${article.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-2.5" style={{ color: '#40916C' }}>
                    {t(lang, 'news.read_more')} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            )
          })}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Link href="/news" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200" style={{ background: '#0F2318', color: '#fff' }}>
            {t(lang, 'news.view_all')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
