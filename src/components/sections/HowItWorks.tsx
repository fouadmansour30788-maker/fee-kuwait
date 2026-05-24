'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ClipboardList, SearchCheck, BadgeCheck } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const STEPS = [
  {
    num: '01',
    icon: ClipboardList,
    title_en: 'Apply Online',
    title_ar: 'التقديم عبر الإنترنت',
    desc_en: 'Register your school or business through our portal and submit your application with your institution details and environmental practices.',
    desc_ar: 'سجّل مدرستك أو مشروعك عبر بوابتنا وقدّم طلبك مع تفاصيل مؤسستك وممارساتك البيئية.',
    color: '#40916C',
  },
  {
    num: '02',
    icon: SearchCheck,
    title_en: 'Review & Assessment',
    title_ar: 'المراجعة والتقييم',
    desc_en: 'Our certified assessors review your documentation and conduct a site visit to verify your environmental standards and commitment.',
    desc_ar: 'يراجع مقيّمونا المعتمدون وثائقك ويجرون زيارة ميدانية للتحقق من معاييرك البيئية.',
    color: '#C8A951',
  },
  {
    num: '03',
    icon: BadgeCheck,
    title_en: 'Get Certified',
    title_ar: 'الحصول على الشهادة',
    desc_en: 'Receive your official FEE International certification and flag, join our global network, and inspire your community toward sustainability.',
    desc_ar: 'احصل على شهادتك وعلمك الرسمي من FEE الدولية وانضم إلى شبكتنا العالمية.',
    color: '#40916C',
  },
]

export default function HowItWorks() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 bg-white" ref={ref}>
      <div className="container-fee">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-5"
            style={{ background: '#D1FAE5', color: '#059669' }}>
            {lang === 'ar' ? 'كيف يعمل' : 'How It Works'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: '#0F2318' }}>
            {lang === 'ar' ? 'ثلاث خطوات نحو الشهادة' : 'Three Steps to Certification'}
          </h2>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: '#5A6672' }}>
            {lang === 'ar'
              ? 'عملية بسيطة وشفافة تضمن لك أعلى معايير الاعتراف البيئي الدولي.'
              : 'A simple, transparent process to achieve internationally recognised environmental excellence.'}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Desktop connector line */}
          <div className="absolute top-[4.5rem] left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-px hidden lg:block"
            style={{ background: 'linear-gradient(90deg, #40916C30, #C8A95150, #40916C30)' }} />

          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 50, filter: 'blur(6px)', scale: 0.96 }}
                animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 } : {}}
                transition={{ duration: 0.7, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Large background number */}
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8rem] font-black leading-none select-none pointer-events-none"
                  style={{ color: `${step.color}08`, letterSpacing: '-0.06em' }}
                >
                  {step.num}
                </div>

                {/* Icon circle */}
                <div className="relative z-10 mb-8">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-[0_4px_24px_rgba(64,145,108,0.14)] transition-transform duration-300 group-hover:scale-105"
                    style={{ background: `${step.color}12`, border: `1.5px solid ${step.color}22` }}
                  >
                    <Icon className="w-9 h-9" style={{ color: step.color }} />
                  </div>
                  {/* Step number badge */}
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md"
                    style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}BB)` }}
                  >
                    {i + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3" style={{ color: '#0F2318' }}>
                  {lang === 'ar' ? step.title_ar : step.title_en}
                </h3>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#5A6672' }}>
                  {lang === 'ar' ? step.desc_ar : step.desc_en}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
