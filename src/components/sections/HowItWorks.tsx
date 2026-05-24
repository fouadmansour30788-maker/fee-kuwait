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
    bgColor: '#EDF7F1',
  },
  {
    num: '02',
    icon: SearchCheck,
    title_en: 'Review & Assessment',
    title_ar: 'المراجعة والتقييم',
    desc_en: 'Our certified assessors review your documentation and conduct a site visit to verify your environmental standards and commitment.',
    desc_ar: 'يراجع مقيّمونا المعتمدون وثائقك ويجرون زيارة ميدانية للتحقق من معاييرك البيئية والتزامك.',
    color: '#C8A951',
    bgColor: '#FBF7ED',
  },
  {
    num: '03',
    icon: BadgeCheck,
    title_en: 'Get Certified',
    title_ar: 'الحصول على الشهادة',
    desc_en: 'Receive your official FEE International certification and flag, join our global network, and inspire your community toward sustainability.',
    desc_ar: 'احصل على شهادتك وعلمك الرسمي من FEE الدولية، وانضم إلى شبكتنا العالمية، وألهم مجتمعك نحو الاستدامة.',
    color: '#40916C',
    bgColor: '#EDF7F1',
  },
]

export default function HowItWorks() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-white py-28" ref={ref}>
      <div className="container-fee">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-18"
          style={{ marginBottom: '4.5rem' }}
        >
          <span className="badge-green mb-5 inline-block">
            {lang === 'ar' ? 'كيف يعمل' : 'How It Works'}
          </span>
          <h2 className="section-heading">
            {lang === 'ar' ? 'ثلاث خطوات نحو الشهادة' : 'Three Steps to Certification'}
          </h2>
          <p className="section-sub mx-auto">
            {lang === 'ar'
              ? 'عملية بسيطة وشفافة تضمن لك أعلى معايير الاعتراف البيئي الدولي.'
              : 'A simple, transparent process to achieve internationally recognised environmental excellence.'}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line — desktop */}
          <div className="absolute top-[3.5rem] left-[calc(16.67%+3.5rem)] right-[calc(16.67%+3.5rem)] h-px hidden lg:block"
            style={{ background: 'linear-gradient(90deg, #40916C40, #C8A95140, #40916C40)' }} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon circle */}
                  <div className="relative mb-8">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(64,145,108,0.12)]"
                      style={{ background: step.bgColor, border: `1.5px solid ${step.color}25` }}
                    >
                      <Icon className="w-10 h-10" style={{ color: step.color }} />
                    </div>
                    <span
                      className="absolute -top-1 -right-1 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)` }}
                    >
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-forest mb-3">
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
      </div>
    </section>
  )
}
