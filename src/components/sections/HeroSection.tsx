'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, ChevronDown,
  School, Building2,
  Waves, KeyRound, Leaf, Newspaper, GraduationCap,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { t } from '@/i18n'

const programmes = [
  { label: 'Eco-Schools', href: '/programmes/eco-schools', color: '#52B788', Icon: School },
  { label: 'Blue Flag',   href: '/programmes/blue-flag',   color: '#90E0EF', Icon: Waves },
  { label: 'Green Key',   href: '/programmes/green-key',   color: '#C8A951', Icon: KeyRound },
  { label: 'LEAF',        href: '/programmes/leaf',        color: '#74C69D', Icon: Leaf },
  { label: 'YRE',         href: '/programmes/yre',         color: '#A8DADC', Icon: Newspaper },
  { label: 'Eco-Campus',  href: '/programmes/eco-campus',  color: '#52B788', Icon: GraduationCap },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const } },
}
const stagger = { show: { transition: { staggerChildren: 0.11 } } }

export default function HeroSection() {
  const { lang } = useLang()

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

      {/* 1 ── Dark base */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, #0A1F14 0%, #0F2B1C 40%, #0A1810 100%)' }} />

      {/* 2 ── Ambient glow blobs (right side) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[8%] w-[520px] h-[420px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(ellipse, #1B4332 0%, transparent 68%)', filter: 'blur(72px)' }} />
        <div className="absolute bottom-[15%] right-[20%] w-[380px] h-[300px] rounded-full opacity-18"
          style={{ background: 'radial-gradient(ellipse, #40916C 0%, transparent 65%)', filter: 'blur(90px)' }} />
        <div className="absolute top-[40%] right-[3%] w-[260px] h-[260px] rounded-full opacity-12"
          style={{ background: 'radial-gradient(ellipse, #52B788 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* 4 ── Top / bottom vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,20,12,0.55) 0%, transparent 22%, transparent 72%, rgba(8,20,12,0.65) 100%)',
        }}
      />

      {/* 5 ── Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #B7E4C7 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* 6 ── Top hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      {/* 7 ── Content */}
      <div className="relative z-10 w-full container-fee pt-28 pb-24">
        <div className="max-w-2xl">
          <motion.div variants={stagger} initial="hidden" animate="show">

            {/* Tagline pill */}
            <motion.div variants={fadeUp} className="mb-8">
              <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-semibold tracking-widest uppercase"
                style={{ background: 'rgba(82,183,136,0.12)', border: '1px solid rgba(82,183,136,0.28)', color: '#74C69D' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#74C69D] animate-pulse" />
                {t(lang, 'hero.tagline')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-bold text-white leading-[1.05] tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.6rem, 6vw, 4.5rem)' }}
            >
              {lang === 'ar' ? (
                <>
                  نبني مستقبلاً{' '}
                  <span style={{ color: '#74C69D' }}>مستداماً</span>
                  <br />للكويت
                </>
              ) : (
                <>
                  Building a{' '}
                  <span style={{
                    background: 'linear-gradient(90deg, #74C69D, #52B788)',
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
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              {t(lang, 'hero.subheadline')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-14">
              <Link
                href="/register?type=school"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-white text-sm font-semibold rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(64,145,108,0.45)]"
                style={{ background: 'linear-gradient(135deg, #40916C, #52B788)' }}
              >
                <School className="w-4 h-4" />
                {t(lang, 'hero.cta_school')}
              </Link>
              <Link
                href="/register?type=business"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-white text-sm font-semibold rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)' }}
              >
                <Building2 className="w-4 h-4" />
                {t(lang, 'hero.cta_business')}
              </Link>
              <Link
                href="/programmes"
                className="inline-flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium transition-colors duration-200 hover:text-white"
                style={{ color: 'rgba(116,198,157,0.85)' }}
              >
                {t(lang, 'hero.cta_learn')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

          </motion.div>

          {/* Programme badges */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.7 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-3.5"
              style={{ color: 'rgba(255,255,255,0.22)' }}>
              {lang === 'ar' ? 'برامجنا الدولية' : 'Our International Programmes'}
            </p>
            <div className="flex flex-wrap gap-2">
              {programmes.map(({ label, href, color, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5"
                  style={{ color, background: `${color}12`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-3 h-3" style={{ color }} />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        style={{ color: 'rgba(255,255,255,0.28)' }}
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
