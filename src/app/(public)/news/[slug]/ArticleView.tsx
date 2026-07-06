'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { useLang } from '@/context/LangContext'
import type { Article } from '@/lib/db/news'

export default function ArticleView({ article }: { article: Article }) {
  const { lang } = useLang()
  const title = (lang === 'ar' ? article.title_ar : article.title_en) || article.title_en
  const body = (lang === 'ar' ? article.body_ar : article.body_en) || article.body_en || ''
  const date = article.published_at ?? article.updated_at
  const paragraphs = body.split(/\n{2,}/).filter(Boolean)

  return (
    <article>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0F2318 0%, #1B4332 100%)' }} />
        <div className="container-fee relative z-10 max-w-3xl mx-auto">
          <Link href="/news" className="inline-flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> {lang === 'ar' ? 'الأخبار' : 'News'}
          </Link>
          {article.programme && (
            <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full text-white mb-4" style={{ background: '#40916C' }}>
              {article.programme.toUpperCase().replace('-', ' ')}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">{title}</h1>
          <p className="flex items-center gap-1.5 text-sm mt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <Calendar className="w-4 h-4" /> {format(new Date(date), 'dd MMMM yyyy')}
          </p>
        </div>
      </section>

      <section className="py-16" style={{ background: '#F4F9F5' }}>
        <div className="container-fee max-w-3xl mx-auto">
          {article.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.image_url} alt={title} className="w-full rounded-2xl mb-8" />
          )}
          <div className="space-y-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {paragraphs.length > 0 ? paragraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed" style={{ color: '#334155' }}>{p}</p>
            )) : (
              <p className="text-base leading-relaxed" style={{ color: '#94A3B8' }}>—</p>
            )}
          </div>
        </div>
      </section>
    </article>
  )
}
