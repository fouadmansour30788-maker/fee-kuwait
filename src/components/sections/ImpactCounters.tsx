'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { School, Building2, Users, Globe } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { t } from '@/i18n'

const STATS = [
  { key: 'schools',    icon: School,    value: 142,   suffix: '+', color: '#8B9B88' },
  { key: 'businesses', icon: Building2, value: 68,    suffix: '+', color: '#C8A951' },
  { key: 'students',   icon: Users,     value: 85000, suffix: '+', color: '#A9B6A4' },
  { key: 'countries',  icon: Globe,     value: 18,    suffix: '',  color: '#90E0EF' },
]

function Counter({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    const duration = 2200
    const start = Date.now()
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress === 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [active, target])

  const display = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : count
  return <>{display}{suffix}</>
}

export default function ImpactCounters() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 bg-warmwhite" ref={ref}>
      <div className="container-fee">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-4"
            style={{ background: '#E8ECE1', color: '#7B8266' }}>
            {lang === 'ar' ? 'أثرنا في أرقام' : 'Our Impact in Numbers'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#182019' }}>
            {lang === 'ar' ? 'ننمو معاً كل عام' : 'Growing Together, Every Year'}
          </h2>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E8ECE1] rounded-3xl overflow-hidden border border-[#E7E4D6]"
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.2 + i * 0.1 }}
                className="bg-warmwhite flex flex-col items-center justify-center py-12 px-6 text-center group hover:bg-[#FBF8F0] transition-colors duration-300"
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                >
                  <Icon className="w-5.5 h-5.5" style={{ color: stat.color }} />
                </div>

                {/* Number */}
                <div
                  className="text-5xl md:text-6xl font-bold tracking-[-0.04em] mb-2 tabular-nums"
                  style={{ color: stat.color }}
                >
                  <Counter target={stat.value} suffix={stat.suffix} active={inView} />
                </div>

                {/* Label */}
                <p className="text-sm font-medium" style={{ color: '#5A7065' }}>
                  {t(lang, `stats.${stat.key}`)}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Sub-label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-xs mt-6"
          style={{ color: '#94A3B8' }}
        >
          {lang === 'ar'
            ? 'بيانات مُحدَّثة · يناير ٢٠٢٦'
            : 'Updated figures · January 2026'}
        </motion.p>
      </div>
    </section>
  )
}
