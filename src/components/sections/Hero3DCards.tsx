'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Leaf, Sprout, Users, Check } from 'lucide-react'
import { useRef } from 'react'
import { useLang } from '@/context/LangContext'

export default function Hero3DCards() {
  const { lang } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 14 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 14 })

  const move = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const leave = () => { mx.set(0); my.set(0) }

  const stats = [
    { Icon: Leaf,   v: '248+', l_en: 'Institutions Certified', l_ar: 'مؤسسة معتمدة' },
    { Icon: Sprout, v: '85k+', l_en: 'Students Engaged',       l_ar: 'طالب مشارك' },
    { Icon: Users,  v: '18',   l_en: 'Countries Networked',    l_ar: 'دولة في الشبكة' },
  ]
  const tz = (n: number) => `translateZ(${n}px)`

  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: 1400 }}>
      <motion.div
        className="w-[420px] max-w-[88%]"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
        transition={{
          opacity: { duration: 0.8, delay: 0.3 },
          scale:   { duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
          y:       { repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 0.3 },
        }}
      >
        <motion.div
          ref={ref}
          onMouseMove={move}
          onMouseLeave={leave}
          style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
          className="relative rounded-[1.75rem] p-7 will-change-transform"
        >
          {/* Glass surface */}
          <div
            className="absolute inset-0 rounded-[1.75rem] border"
            style={{
              background: 'linear-gradient(155deg, rgba(45,106,79,0.45) 0%, rgba(7,20,16,0.55) 100%)',
              borderColor: 'rgba(183,228,199,0.20)',
              boxShadow: '0 50px 100px -30px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          />
          {/* Soft top glow */}
          <div className="absolute -top-px left-10 right-10 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(82,183,136,0.6), transparent)' }} />

          {/* Stats row */}
          <div className="relative grid grid-cols-3 gap-3 text-center" style={{ transform: tz(40) }}>
            {stats.map(({ Icon, v, l_en, l_ar }) => (
              <div key={l_en} className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center mb-2.5"
                  style={{ background: 'rgba(183,228,199,0.10)', border: '1px solid rgba(183,228,199,0.22)' }}>
                  <Icon className="w-4 h-4 text-[#B7E4C7]" />
                </div>
                <p className="text-2xl font-bold text-white leading-none tracking-tight">{v}</p>
                <p className="text-[10px] leading-tight mt-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {lang === 'ar' ? l_ar : l_en}
                </p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="relative my-5 h-px" style={{ transform: tz(30), background: 'rgba(183,228,199,0.16)' }} />

          {/* Tagline row */}
          <div className="relative flex items-center gap-3" style={{ transform: tz(40) }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(82,183,136,0.18)', border: '1px solid rgba(82,183,136,0.4)' }}>
              <Check className="w-4 h-4 text-[#74C69D]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white leading-snug">
                {lang === 'ar' ? 'معايير دولية، أثر حقيقي.' : 'International standards. Real impact.'}
              </p>
              <p className="text-[12px] leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {lang === 'ar' ? 'نبني كويتاً مستدامة، معاً.' : 'Building a sustainable Kuwait, together.'}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
