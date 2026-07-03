'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight, ChevronDown,
  School, Building2,
  Waves, KeyRound, Leaf, Newspaper, GraduationCap,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { t } from '@/i18n'
import { useRef } from 'react'
import Hero3DCards from './Hero3DCards'

const programmes = [
  { label: 'Eco-Schools', href: '/programmes/eco-schools', color: '#52B788', Icon: School },
  { label: 'Blue Flag',   href: '/programmes/blue-flag',   color: '#90E0EF', Icon: Waves },
  { label: 'Green Key',   href: '/programmes/green-key',   color: '#C8A951', Icon: KeyRound },
  { label: 'LEAF',        href: '/programmes/leaf',        color: '#74C69D', Icon: Leaf },
  { label: 'YRE',         href: '/programmes/yre',         color: '#A8DADC', Icon: Newspaper },
  { label: 'Eco-Campus',  href: '/programmes/eco-campus',  color: '#52B788', Icon: GraduationCap },
]

const AVATARS = ['#52B788', '#C8A951', '#3B9ECC', '#74C69D', '#7C3AED']
const AVATAR_LETTERS = ['S', 'F', 'K', 'N', 'A']

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show:   { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
}
// No `filter` here: the headline contains a `-webkit-background-clip:text` gradient
// span, and a filter on the ancestor makes WebKit paint the gradient as a solid box
// on repaint (e.g. when the dir flips on language toggle). Keep it opacity+y only.
const fadeUpText = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
}
const stagger = { show: { transition: { staggerChildren: 0.11 } } }

export default function HeroSection() {
  const { lang } = useLang()
  const ref = useRef<HTMLElement>(null)

  const { scrollY } = useScroll()

  // Content parallax
  const contentY       = useTransform(scrollY, [0, 700], [0, -110])
  const contentOpacity = useTransform(scrollY, [0, 500], [1, 0])

  // Glow parallax (each at different speed for depth)
  const glow1Y = useTransform(scrollY, [0, 700], [0,  80])
  const glow2Y = useTransform(scrollY, [0, 700], [0, -50])
  const glow3Y = useTransform(scrollY, [0, 700], [0,  40])
  const glow4Y = useTransform(scrollY, [0, 700], [0,  20])

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" ref={ref}>

      {/* Base gradient */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, #071410 0%, #0C2018 40%, #071410 100%)' }} />

      {/* Ambient glows — each moves at its own parallax speed */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div style={{ y: glow1Y }}
          className="absolute top-[-5%] right-[5%] w-[600px] h-[500px] rounded-full"
        >
          <div className="w-full h-full rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(27,67,50,0.55) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        </motion.div>

        <motion.div style={{ y: glow2Y }}
          className="absolute bottom-[10%] right-[18%] w-[420px] h-[320px] rounded-full"
        >
          <div className="w-full h-full rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(64,145,108,0.22) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        </motion.div>

        <motion.div style={{ y: glow3Y }}
          className="absolute top-[35%] right-[1%] w-[280px] h-[280px] rounded-full"
        >
          <div className="w-full h-full rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(82,183,136,0.14) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        </motion.div>

        <motion.div style={{ y: glow4Y }}
          className="absolute top-[20%] left-[10%] w-[300px] h-[200px] rounded-full"
        >
          <div className="w-full h-full rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(27,67,50,0.30) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        </motion.div>
      </div>

      {/* Top hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#40916C]/40 to-transparent" />

      {/* Content — parallax wrapper */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 w-full container-fee pt-32 pb-24"
      >
        <div className="max-w-2xl">
          <motion.div variants={stagger} initial="hidden" animate="show">

            {/* Tagline pill */}
            <motion.div variants={fadeUp} className="mb-8">
              <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-semibold tracking-widest uppercase"
                style={{ background: 'rgba(82,183,136,0.10)', border: '1px solid rgba(82,183,136,0.25)', color: '#74C69D' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#74C69D] animate-pulse" />
                {t(lang, 'hero.tagline')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUpText}
              className="font-bold text-white leading-[1.04] tracking-[-0.03em] mb-6"
              style={{ fontSize: 'clamp(2.8rem, 6.5vw, 5rem)' }}
            >
              {lang === 'ar' ? (
                <>
                  نبني مستقبلاً{' '}
                  <span style={{
                    background: 'linear-gradient(90deg, #52B788, #74C69D, #40916C)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>مستداماً</span>
                  <br />للكويت
                </>
              ) : (
                <>
                  Building a{' '}
                  <span style={{
                    background: 'linear-gradient(90deg, #52B788, #74C69D, #B7E4C7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Sustainable
                  </span>
                  <br />Future for Kuwait
                </>
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg leading-relaxed mb-10 max-w-xl"
              style={{ color: 'rgba(255,255,255,0.48)' }}
            >
              {t(lang, 'hero.subheadline')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/register?type=school"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-white text-sm font-semibold rounded-full transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_28px_rgba(64,145,108,0.55)]"
                style={{ background: 'linear-gradient(135deg, #2D6A4F, #52B788)' }}
              >
                <School className="w-4 h-4" />
                {t(lang, 'hero.cta_school')}
              </Link>
              <Link
                href="/register?type=business"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-white text-sm font-semibold rounded-full transition-all duration-200 hover:scale-[1.03]"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}
              >
                <Building2 className="w-4 h-4" />
                {t(lang, 'hero.cta_business')}
              </Link>
              <Link
                href="/programmes"
                className="inline-flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium transition-colors duration-200 hover:text-white"
                style={{ color: 'rgba(116,198,157,0.8)' }}
              >
                {t(lang, 'hero.cta_learn')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Trust bar */}
            <motion.div variants={fadeUp} className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {AVATARS.map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                    style={{ background: color, borderColor: 'rgba(255,255,255,0.12)', zIndex: 5 - i }}
                  >
                    {AVATAR_LETTERS[i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  {lang === 'ar' ? '٢٤٨+ مؤسسة معتمدة' : '248+ institutions certified'}
                </p>
                <p className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {lang === 'ar' ? 'في جميع محافظات الكويت' : 'across all Kuwait governorates'}
                </p>
              </div>
            </motion.div>

          </motion.div>

          {/* Programme badges */}
          <motion.div
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-14"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-3.5"
              style={{ color: 'rgba(255,255,255,0.18)' }}>
              {lang === 'ar' ? 'برامجنا الدولية' : 'Our International Programmes'}
            </p>
            <div className="flex flex-wrap gap-2">
              {programmes.map(({ label, href, color, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                  style={{ color, background: `${color}10`, border: `1px solid ${color}28` }}
                >
                  <Icon className="w-3 h-3" style={{ color }} />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 3D floating cards — desktop right half */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-[48%] z-10 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          <Hero3DCards />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        style={{ color: 'rgba(255,255,255,0.22)' }}
      >
        <span className="text-[9px] tracking-[0.28em] uppercase font-semibold">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </motion.div>
    </section>
  )
}
