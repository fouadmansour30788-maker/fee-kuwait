'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { School, Building2, Users, Globe } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { t } from '@/i18n'

const STATS = [
  { key: 'schools',    icon: School,    value: 142, suffix: '+', color: '#74C69D' },
  { key: 'businesses', icon: Building2, value: 68,  suffix: '+', color: '#C8A951' },
  { key: 'students',   icon: Users,     value: 85000, suffix: '+', color: '#90E0EF' },
  { key: 'countries',  icon: Globe,     value: 18,  suffix: '',  color: '#A8DADC' },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const start = Date.now()
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress === 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref}>
      {count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : count}
      {suffix}
    </span>
  )
}

export default function ImpactCounters() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative py-20 overflow-hidden" ref={ref}>
      {/* Warm dark background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #132B1E 0%, #1B4332 50%, #0F2318 100%)' }} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-[500px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #52B788 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, #74C69D 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div className="relative z-10 container-fee">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4" style={{ color: 'rgba(116,198,157,0.65)' }}>
            {lang === 'ar' ? 'أثرنا في أرقام' : 'Our Impact in Numbers'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
            {lang === 'ar' ? 'ننمو معاً كل عام' : 'Growing Together Every Year'}
          </h2>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.42)' }}>
            {lang === 'ar'
              ? 'مؤسسات كويتية ملتزمة تقود التحول البيئي.'
              : 'Committed Kuwaiti institutions leading the environmental shift.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="relative rounded-3xl p-7 text-center overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top, ${stat.color}12, transparent 70%)` }} />

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}35` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div
                  className="text-4xl md:text-5xl font-bold mb-2 tracking-tight"
                  style={{ color: stat.color }}
                >
                  {inView && <Counter target={stat.value} suffix={stat.suffix} />}
                </div>
                <div className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {t(lang, `stats.${stat.key}`)}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
