'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { useLang } from '@/context/LangContext'
import type { Article, MediaItem } from '@/lib/db/news'

// Turn a YouTube/Vimeo watch URL into an embeddable one; pass others through.
function embedUrl(url: string): { embed: string | null; raw: string } {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return { embed: `https://www.youtube.com/embed/${yt[1]}`, raw: url }
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return { embed: `https://player.vimeo.com/video/${vm[1]}`, raw: url }
  return { embed: null, raw: url }
}

function Slideshow({ urls }: { urls: string[] }) {
  const [i, setI] = useState(0)
  if (urls.length === 0) return null
  const go = (d: number) => setI((n) => (n + d + urls.length) % urls.length)
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: '#0F2318' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={urls[i]} alt="" className="w-full max-h-[32rem] object-contain" />
      {urls.length > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }} aria-label="Previous"><ChevronLeft className="w-5 h-5" /></button>
          <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }} aria-label="Next"><ChevronRight className="w-5 h-5" /></button>
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
            {urls.map((_, n) => (
              <span key={n} className="w-1.5 h-1.5 rounded-full" style={{ background: n === i ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Media({ item }: { item: MediaItem }) {
  let inner: React.ReactNode = null
  if (item.type === 'image' && item.url) {
    // eslint-disable-next-line @next/next/no-img-element
    inner = <img src={item.url} alt={item.caption ?? ''} className="w-full rounded-2xl" />
  } else if (item.type === 'video' && item.url) {
    const { embed, raw } = embedUrl(item.url)
    inner = embed ? (
      <div className="relative rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <iframe src={embed} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={item.title ?? 'Video'} />
      </div>
    ) : (
      <video src={raw} controls className="w-full rounded-2xl" />
    )
  } else if (item.type === 'link' && item.url) {
    inner = (
      <a href={item.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 rounded-2xl transition-colors" style={{ background: '#fff', border: '1px solid #D4E7DA' }}>
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EDF7F1' }}>
          <ExternalLink className="w-5 h-5" style={{ color: '#40916C' }} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold truncate" style={{ color: '#0F2318' }}>{item.title || item.url}</span>
          <span className="block text-xs truncate" style={{ color: '#5B7568' }}>{item.url}</span>
        </span>
      </a>
    )
  } else if (item.type === 'slideshow' && item.urls?.length) {
    inner = <Slideshow urls={item.urls} />
  }
  if (!inner) return null
  return (
    <figure className="my-6">
      {inner}
      {item.caption && item.type !== 'link' && (
        <figcaption className="text-xs mt-2 text-center" style={{ color: '#94A3B8' }}>{item.caption}</figcaption>
      )}
    </figure>
  )
}

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

          {(article.media?.length ?? 0) > 0 && (
            <div className="mt-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {article.media.map((m, i) => <Media key={i} item={m} />)}
            </div>
          )}
        </div>
      </section>
    </article>
  )
}
