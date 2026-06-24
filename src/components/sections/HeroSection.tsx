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

const programmes = [
  { label: 'Eco-Schools', href: '/programmes/eco-schools', color: '#7B8266', Icon: School },
  { label: 'Blue Flag',   href: '/programmes/blue-flag',   color: '#3A6B6E', Icon: Waves },
  { label: 'Green Key',   href: '/programmes/green-key',   color: '#C8A951', Icon: KeyRound },
  { label: 'LEAF',        href: '/programmes/leaf',        color: '#8B9B88', Icon: Leaf },
  { label: 'YRE',         href: '/programmes/yre',         color: '#7B8266', Icon: Newspaper },
  { label: 'Eco-Campus',  href: '/programmes/eco-campus',  color: '#2C3A2D', Icon: GraduationCap },
]

const AVATARS = ['#2C3A2D', '#C8A951', '#3A6B6E', '#8B9B88', '#7B8266']
const AVATAR_LETTERS = ['S', 'F', 'K', 'N', 'A']

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show:   { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
}
const stagger = { show: { transition: { staggerChildren: 0.11 } } }

export default function HeroSection() {
  const { lang } = useLang()
  const ref = useRef<HTMLElement>(null)

  const { scrollY } = useScroll()
  const contentY       = useTransform(scrollY, [0, 700], [0, -90])
  const contentOpacity = useTransform(scrollY, [0, 560], [1, 0])

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-cream" ref={ref}>

      {/* Floating blurred blobs — sage & olive */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, 18, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 13, ease: 'easeInOut' }}
          className="absolute top-[-8%] right-[6%] w-[560px] h-[480px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(139,155,136,0.40) 0%, transparent 68%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 16, ease: 'easeInOut' }}
          className="absolute bottom-[6%] left-[-4%] w-[420px] h-[360px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(123,130,102,0.30) 0%, transparent 70%)', filter: 'blur(70px)' }}
        />
        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ repeat: Infinity, duration: 11, ease: 'easeInOut' }}
          className="absolute top-[40%] left-[34%] w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(200,169,81,0.12) 0%, transparent 72%)', filter: 'blur(55px)' }}
        />
      </div>

      {/* Masked hero video — right side, fades into cream */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[58%] pointer-events-none">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover mask-soft opacity-70 lg:opacity-90"
          style={{ transform: 'scale(1.5)' }}
        >
          <source src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/forest_hero_bg_video.mp4" type="video/mp4" />
        </video>
        {/* Cream blend over the video edge */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #F7F3EA 0%, rgba(247,243,234,0.55) 22%, transparent 60%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-32" style={{ background: 'linear-gradient(to top, #F7F3EA, transparent)' }} />
        <div className="absolute inset-x-0 top-0 h-24" style={{ background: 'linear-gradient(to bottom, #F7F3EA, transparent)' }} />
      </div>

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 w-full container-fee pt-36 pb-24"
      >
        <div className="max-w-2xl">
          <motion.div variants={stagger} initial="hidden" animate="show">

            {/* Tagline pill */}
            <motion.div variants={fadeUp} className="mb-8">
              <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-medium tracking-[0.18em] uppercase bg-pale/80 border border-sage/40 text-olive">
                <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                {t(lang, 'hero.tagline')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-serif font-medium text-forest leading-[1.05] tracking-[-0.015em] mb-6"
              style={{ fontSize: 'clamp(2.8rem, 6.5vw, 5.25rem)' }}
            >
              {lang === 'ar' ? (
                <>
                  نبني مستقبلاً{' '}
                  <span className="italic text-olive">مستداماً</span>
                  <br />للكويت
                </>
              ) : (
                <>
                  Building a{' '}
                  <span className="italic text-olive">Sustainable</span>
                  <br />Future for Kuwait
                </>
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg leading-relaxed mb-10 max-w-xl text-muted"
            >
              {t(lang, 'hero.subheadline')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-12">
              <Link
                href="/register?type=school"
                className="inline-flex items-center gap-2.5 px-8 py-4 text-cream text-sm font-medium rounded-full bg-forest hover:bg-emerald transition-all duration-300 hover:scale-[1.02] shadow-green-md hover:shadow-green-xl"
              >
                <School className="w-4 h-4" />
                {t(lang, 'hero.cta_school')}
              </Link>
              <Link
                href="/register?type=business"
                className="inline-flex items-center gap-2.5 px-8 py-4 text-forest text-sm font-medium rounded-full border border-forest/25 hover:bg-forest hover:text-cream transition-all duration-300 hover:scale-[1.02]"
              >
                <Building2 className="w-4 h-4" />
                {t(lang, 'hero.cta_business')}
              </Link>
              <Link
                href="/programmes"
                className="inline-flex items-center gap-1.5 px-5 py-4 text-sm font-medium text-olive hover:text-forest transition-colors duration-200"
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
                    className="w-8 h-8 rounded-full border-2 border-cream flex items-center justify-center text-cream text-[11px] font-bold flex-shrink-0"
                    style={{ background: color, zIndex: 5 - i }}
                  >
                    {AVATAR_LETTERS[i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-forest leading-tight">
                  {lang === 'ar' ? '٢٤٨+ مؤسسة معتمدة' : '248+ institutions certified'}
                </p>
                <p className="text-[11px] leading-tight text-muted/70">
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-3.5 text-forest/35">
              {lang === 'ar' ? 'برامجنا الدولية' : 'Our International Programmes'}
            </p>
            <div className="flex flex-wrap gap-2">
              {programmes.map(({ label, href, color, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:-translate-y-0.5"
                  style={{ color, background: `${color}14`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-3 h-3" style={{ color }} />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 text-forest/30"
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
