'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { School, Waves, GraduationCap } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import type { LucideIcon } from 'lucide-react'

interface Testimonial {
  quote_en: string
  quote_ar: string
  name_en: string
  name_ar: string
  role_en: string
  role_ar: string
  initials: string
  programme: string
  color: string
  Icon: LucideIcon
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote_en: 'Joining Eco-Schools transformed how our students see their responsibility toward the environment. We are incredibly proud of our Green Flag.',
    quote_ar: 'انضمامنا لبرنامج المدارس البيئية غيّر نظرة طلابنا تجاه مسؤوليتهم البيئية. نحن فخورون جداً بعلمنا الأخضر.',
    name_en: 'Sarah Al-Rashidi',
    name_ar: 'سارة الرشيدي',
    role_en: 'Principal, Al-Sabah Model School',
    role_ar: 'مديرة مدرسة الصباح النموذجية',
    initials: 'SR',
    programme: 'Eco-Schools',
    color: '#52B788',
    Icon: School,
  },
  {
    quote_en: 'Blue Flag certification put us on the international map. Guests now choose us specifically because of our demonstrated environmental commitment.',
    quote_ar: 'وضعتنا شهادة العلم الأزرق على الخريطة الدولية. يختارنا الضيوف الآن تحديداً بسبب التزامنا البيئي المُثبَت.',
    name_en: 'Faisal Al-Mutairi',
    name_ar: 'فيصل المطيري',
    role_en: 'Director, Marina Waves Resort',
    role_ar: 'مدير منتجع مارينا ويفز',
    initials: 'FM',
    programme: 'Blue Flag',
    color: '#90E0EF',
    Icon: Waves,
  },
  {
    quote_en: 'Eco-Campus gave our sustainability work global recognition and attracted international partnerships we never imagined possible.',
    quote_ar: 'منح الحرم البيئي عملنا في الاستدامة اعترافاً عالمياً وجذب شراكات دولية لم نتخيلها.',
    name_en: 'Dr. Noura Al-Ahmad',
    name_ar: 'د. نورة الأحمد',
    role_en: 'Sustainability Lead, Gulf University',
    role_ar: 'رئيسة الاستدامة، جامعة الخليج',
    initials: 'NA',
    programme: 'Eco-Campus',
    color: '#74C69D',
    Icon: GraduationCap,
  },
]

export default function TestimonialsSection() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 relative overflow-hidden" ref={ref}
      style={{ background: 'linear-gradient(160deg, #071410 0%, #0C2018 50%, #071410 100%)' }}>

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(27,67,50,0.5) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[0%] right-[10%] w-[400px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(64,145,108,0.18) 0%, transparent 65%)', filter: 'blur(70px)' }} />
      </div>

      <div className="container-fee relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(82,183,136,0.12)', border: '1px solid rgba(82,183,136,0.25)', color: '#74C69D' }}>
            {lang === 'ar' ? 'قصص النجاح' : 'Success Stories'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            {lang === 'ar' ? 'يقولون عن تجربتهم' : 'Voices From Our Community'}
          </h2>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {lang === 'ar'
              ? 'ما يقوله شركاؤنا المعتمدون عن رحلتهم مع FEE الكويت.'
              : 'What our certified partners say about their journey with FEE Kuwait.'}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.14 }}
              className="relative rounded-3xl p-8 flex flex-col overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Large decorative quote mark */}
              <div
                className="absolute top-4 right-6 text-[7rem] font-black leading-none select-none pointer-events-none"
                style={{ color: `${item.color}18`, fontFamily: 'Georgia, serif' }}
              >
                &ldquo;
              </div>

              {/* Programme badge */}
              <div className="mb-6">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ color: item.color, background: `${item.color}18`, border: `1px solid ${item.color}30` }}
                >
                  <item.Icon className="w-3 h-3" />
                  {item.programme}
                </span>
              </div>

              {/* Quote */}
              <p className="text-sm leading-[1.85] flex-1 mb-8 relative z-10"
                style={{ color: 'rgba(255,255,255,0.72)' }}>
                &ldquo;{lang === 'ar' ? item.quote_ar : item.quote_en}&rdquo;
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${item.color}CC, ${item.color}88)` }}
                >
                  {item.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">
                    {lang === 'ar' ? item.name_ar : item.name_en}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    {lang === 'ar' ? item.role_ar : item.role_en}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
