'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { School, Building2, ArrowRight } from 'lucide-react'
import { useLang } from '@/context/LangContext'

export default function CtaSection() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative py-28 overflow-hidden" ref={ref}>
      {/* Rich warm-dark background */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(150deg, #0F2318 0%, #1B4332 45%, #132B1E 100%)' }} />

      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #52B788 0%, transparent 65%)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, #74C69D 0%, transparent 65%)', filter: 'blur(90px)' }} />
      </div>

      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #B7E4C7 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

      <div className="relative z-10 container-fee text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-8"
            style={{ border: '1px solid rgba(82,183,136,0.3)', color: 'rgba(116,198,157,0.85)', background: 'rgba(82,183,136,0.08)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#74C69D' }} />
            {lang === 'ar' ? 'ابدأ رحلتك' : 'Start Your Journey'}
          </span>

          <h2 className="font-bold text-white leading-[1.08] tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}>
            {lang === 'ar'
              ? <>انضم إلى أكثر من <span style={{ color: '#74C69D' }}>٢٠٠</span> مؤسسة معتمدة</>
              : <>Join <span style={{ background: 'linear-gradient(90deg, #74C69D, #52B788)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>200+</span> Certified Institutions</>}
          </h2>

          <p className="text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.48)' }}>
            {lang === 'ar'
              ? 'مدارس ومشاريع وجامعات كويتية تقود التحول البيئي. سجّل اليوم وكن جزءاً من التغيير.'
              : 'Schools, businesses, and universities across Kuwait leading the environmental shift. Register today and be part of the change.'}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/register?type=school"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-white font-semibold rounded-2xl text-base transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #40916C, #52B788)', boxShadow: '0 8px 28px rgba(64,145,108,0.45)' }}
            >
              <School className="w-5 h-5" />
              {lang === 'ar' ? 'تسجيل مدرسة' : 'Register a School'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register?type=business"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-white font-semibold rounded-2xl text-base transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)' }}
            >
              <Building2 className="w-5 h-5" />
              {lang === 'ar' ? 'تسجيل منشأة ضيافة ضيافة' : 'Register a Hospitality Establishment'}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
