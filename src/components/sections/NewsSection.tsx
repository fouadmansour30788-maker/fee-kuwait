'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Calendar } from 'lucide-react'
import { useRef } from 'react'
import { useLang } from '@/context/LangContext'
import { t } from '@/i18n'
import { format } from 'date-fns'
import { DEMO_NEWS } from '@/lib/data/news'

const FEATURED = DEMO_NEWS.slice(0, 3)

export default function NewsSection() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-white py-28" ref={ref}>
      <div className="container-fee">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-14 gap-6"
        >
          <div>
            <span className="badge-green mb-4 inline-block">{lang === 'ar' ? 'أحدث الأخبار' : 'Latest News'}</span>
            <h2 className="section-heading">{t(lang, 'news.title')}</h2>
            <p className="section-sub">{t(lang, 'news.subtitle')}</p>
          </div>
          <Link href="/news" className="btn-secondary hidden md:inline-flex flex-shrink-0">
            {t(lang, 'news.view_all')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="card overflow-hidden group hover:-translate-y-1.5"
            >
              {/* Photo */}
              <div className="relative h-48 overflow-hidden bg-pale">
                <Image
                  src={article.image_url}
                  alt={lang === 'ar' ? article.title_ar : article.title_en}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                {/* Programme tag */}
                {article.programme && (
                  <span
                    className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full text-white backdrop-blur-sm"
                    style={{ background: `${article.colour}CC` }}
                  >
                    {article.programme.toUpperCase().replace('-', ' ')}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: '#7A9080' }}>
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(article.published_at), 'dd MMM yyyy')}
                </div>
                <h3 className="font-bold text-forest text-base leading-snug mb-3 group-hover:text-brand transition-colors line-clamp-2">
                  {lang === 'ar' ? article.title_ar : article.title_en}
                </h3>
                <p className="text-sm leading-relaxed line-clamp-3 mb-4" style={{ color: '#5A6672' }}>
                  {lang === 'ar' ? article.excerpt_ar : article.excerpt_en}
                </p>
                <Link
                  href={`/news/${article.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-emerald transition-colors group/link"
                >
                  {t(lang, 'news.read_more')}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link href="/news" className="btn-secondary">
            {t(lang, 'news.view_all')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
