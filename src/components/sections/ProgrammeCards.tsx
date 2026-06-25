'use client'

import Link from 'next/link'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
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
  'eco-schools': 142, 'blue-flag': 18, 'green-key': 34,
  'leaf': 28, 'yre': 19, 'eco-campus': 7,
}

const IMAGES: Record<string, string> = {
  'eco-schools': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop',
  'blue-flag':   'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=500&fit=crop',
  'green-key':   'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop',
  'leaf':        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop',
  'yre':         'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop',
  'eco-campus':  'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop',
}

/* ── Image-banner 3D tilt card with overlapping icon badge ── */
function ProgrammeTiltCard({ prog, index }: { prog: typeof PROGRAMMES[number]; index: number }) {
  const { lang } = useLang()
  const Icon = ICONS[prog.id] ?? Leaf
  const count = CERTIFIED_COUNTS[prog.id] ?? 0

  const ref = useRef<HTMLAnchorElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 180, damping: 15 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 180, damping: 15 })

  const move = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const leave = () => { mx.set(0); my.set(0) }

  return (
    <motion.a
      ref={ref}
      href={`/programmes/${prog.id}`}
      onMouseMove={move}
      onMouseLeave={leave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', perspective: 1000 }}
      initial={{ opacity: 0, y: 44, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative block rounded-[1.5rem] overflow-hidden will-change-transform"
      aria-label={lang === 'ar' ? prog.name_ar : prog.name_en}
    >
      {/* Banner image */}
      <div className="relative h-44 overflow-hidden" style={{ backgroundColor: '#0F2318', transform: 'translateZ(28px)' }}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url('${IMAGES[prog.id]}')` }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(15,35,24,0.25) 0%, rgba(15,35,24,0.85) 100%)' }} />
        {/* Certified count chip */}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}>
          {count}+ {lang === 'ar' ? 'معتمد' : 'certified'}
        </span>
      </div>

      {/* Body panel */}
      <div className="relative px-5 pt-9 pb-6 text-center"
        style={{ background: 'linear-gradient(180deg, #173a27 0%, #102a1c 100%)', transform: 'translateZ(16px)' }}>
        {/* Overlapping circular icon badge */}
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${prog.color}, ${prog.color}CC)`,
            border: '3px solid #102a1c',
            transform: 'translateZ(50px)',
          }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2">
          {lang === 'ar' ? prog.name_ar : prog.name_en}
        </h3>
        <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {lang === 'ar' ? prog.description_ar : prog.description_en}
        </p>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all duration-200 group-hover:gap-2.5"
          style={{ color: prog.color }}>
          {t(lang, 'programmes.learn_more')}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl-flip" />
        </span>
      </div>
    </motion.a>
  )
}

export default function ProgrammeCards() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0C2018 0%, #102a1c 60%, #0C2018 100%)' }} ref={ref}>
      {/* Ambient blur */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[10%] left-[-5%] w-[420px] h-[360px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(82,183,136,0.12) 0%, transparent 65%)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-[8%] right-[-5%] w-[420px] h-[360px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(64,145,108,0.10) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      <div className="container-fee relative">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(82,183,136,0.12)', color: '#74C69D', border: '1px solid rgba(82,183,136,0.25)' }}>
            {t(lang, 'nav.programmes')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            {t(lang, 'programmes.title')}
          </h2>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {t(lang, 'programmes.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12" style={{ perspective: 1400 }}>
          {PROGRAMMES.map((prog, i) => (
            <ProgrammeTiltCard key={prog.id} prog={prog} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <Link
            href="/programmes"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-[#0F2318] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
          >
            {lang === 'ar' ? 'عرض جميع البرامج' : 'View All Programmes'}
            <ArrowRight className="w-4 h-4 rtl-flip" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
