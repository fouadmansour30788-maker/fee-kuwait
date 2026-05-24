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

const CERTIFIED_COUNTS: Record<string, number> = {
  'eco-schools': 142,
  'blue-flag':   18,
  'green-key':   34,
  'leaf':        28,
  'yre':         19,
  'eco-campus':  7,
}

export default function ProgrammeCards() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28" style={{ background: '#F4F9F5' }} ref={ref}>
      <div className="container-fee">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-5"
            style={{ background: '#D1FAE5', color: '#059669' }}>
            {t(lang, 'nav.programmes')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: '#0F2318' }}>
            {t(lang, 'programmes.title')}
          </h2>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: '#5A6672' }}>
            {t(lang, 'programmes.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROGRAMMES.map((prog, i) => {
            const Icon = ICONS[prog.id] ?? Leaf
            const count = CERTIFIED_COUNTS[prog.id] ?? 0
            return (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/programmes/${prog.id}`}
                  className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)]"
                  style={{ border: '1px solid #E2EDE6', boxShadow: '0 2px 12px rgba(64,145,108,0.06)' }}
                >
                  {/* Coloured header */}
                  <div
                    className="relative px-6 pt-7 pb-6 flex items-start justify-between overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${prog.color}EE, ${prog.color}BB)` }}
                  >
                    {/* Background icon watermark */}
                    <div className="absolute -right-4 -bottom-4 opacity-[0.12]">
                      <Icon className="w-24 h-24 text-white" />
                    </div>

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Certified badge */}
                    <div className="flex flex-col items-end text-right">
                      <span className="text-2xl font-bold text-white leading-none">{count}+</span>
                      <span className="text-[10px] font-semibold text-white/70 mt-0.5 uppercase tracking-wide">
                        {lang === 'ar' ? 'معتمد' : 'certified'}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-base font-bold mb-2.5 transition-colors group-hover:text-brand" style={{ color: '#0F2318' }}>
                      {lang === 'ar' ? prog.name_ar : prog.name_en}
                    </h3>
                    <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: '#5A6672' }}>
                      {lang === 'ar' ? prog.description_ar : prog.description_en}
                    </p>
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
          <Link
            href="/programmes"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: '#0F2318', color: '#fff', boxShadow: '0 4px 16px rgba(15,35,24,0.25)' }}
          >
            {lang === 'ar' ? 'عرض جميع البرامج' : 'View All Programmes'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
