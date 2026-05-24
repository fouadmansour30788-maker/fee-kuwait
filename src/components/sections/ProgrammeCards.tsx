'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, School, Waves, KeyRound, Leaf, Newspaper, GraduationCap, LucideIcon } from 'lucide-react'
import { useRef } from 'react'
import { useLang } from '@/context/LangContext'
import { t } from '@/i18n'
import { PROGRAMMES } from '@/lib/utils/programmes'

const ICONS: Record<string, LucideIcon> = {
  'eco-schools': School,
  'blue-flag':   Waves,
  'green-key':   KeyRound,
  'leaf':        Leaf,
  'yre':         Newspaper,
  'eco-campus':  GraduationCap,
}

export default function ProgrammeCards() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-cream py-28" ref={ref}>
      <div className="container-fee">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-green mb-5 inline-block">{t(lang, 'nav.programmes')}</span>
          <h2 className="section-heading">{t(lang, 'programmes.title')}</h2>
          <p className="section-sub mx-auto">{t(lang, 'programmes.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROGRAMMES.map((prog, i) => {
            const Icon = ICONS[prog.id] ?? Leaf
            return (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.1 }}
              >
                <Link
                  href={`/programmes/${prog.id}`}
                  className="group block h-full rounded-3xl bg-white overflow-hidden transition-all duration-300 hover:-translate-y-2"
                  style={{
                    border: '1px solid #C8E6D0',
                    boxShadow: '0 2px 12px rgba(64,145,108,0.08)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${prog.color}28`
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(64,145,108,0.08)'
                  }}
                >
                  {/* Coloured top strip */}
                  <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${prog.color}, ${prog.color}70)` }} />

                  <div className="p-7 flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${prog.color}14`, border: `1px solid ${prog.color}28`, width: '3.25rem', height: '3.25rem' }}
                    >
                      <Icon className="w-6 h-6" style={{ color: prog.color }} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold mb-2.5 text-forest transition-colors group-hover:text-brand">
                      {lang === 'ar' ? prog.name_ar : prog.name_en}
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: '#5A6672' }}>
                      {lang === 'ar' ? prog.description_ar : prog.description_en}
                    </p>

                    {/* Learn more */}
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-2.5"
                      style={{ color: prog.color }}
                    >
                      {t(lang, 'programmes.learn_more')}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link href="/programmes" className="btn-secondary">
            {lang === 'ar' ? 'عرض جميع البرامج' : 'View All Programmes'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
