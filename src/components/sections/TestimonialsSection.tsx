'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Quote, School, Waves, GraduationCap } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import type { LucideIcon } from 'lucide-react'

interface Testimonial {
  quote_en: string
  quote_ar: string
  name_en: string
  name_ar: string
  role_en: string
  role_ar: string
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
    programme: 'Eco-Schools',
    color: '#40916C',
    Icon: School,
  },
  {
    quote_en: 'Blue Flag certification put us on the international map. Guests now choose us specifically because of our demonstrated environmental commitment.',
    quote_ar: 'ضعتنا شهادة العلم الأزرق على الخريطة الدولية. يختارنا الضيوف الآن تحديداً بسبب التزامنا البيئي المُثبَت.',
    name_en: 'Faisal Al-Mutairi',
    name_ar: 'فيصل المطيري',
    role_en: 'Director, Marina Waves Resort',
    role_ar: 'مدير منتجع مارينا ويفز',
    programme: 'Blue Flag',
    color: '#006994',
    Icon: Waves,
  },
  {
    quote_en: 'Eco-Campus gave our sustainability work global recognition and attracted international partnerships we never imagined possible.',
    quote_ar: 'منحت الحرم البيئي اعترافاً عالمياً لعملنا في الاستدامة وجذب شراكات دولية لم نتخيلها.',
    name_en: 'Dr. Noura Al-Ahmad',
    name_ar: 'د. نورة الأحمد',
    role_en: 'Sustainability Lead, Gulf University',
    role_ar: 'رئيسة الاستدامة، جامعة الخليج',
    programme: 'Eco-Campus',
    color: '#40916C',
    Icon: GraduationCap,
  },
]

export default function TestimonialsSection() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 relative overflow-hidden" ref={ref}
      style={{ background: 'linear-gradient(170deg, #F4F9F5 0%, #EDF7F1 100%)' }}>

      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[400px] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(ellipse at top right, #D8F3DC, transparent 65%)', filter: 'blur(40px)' }} />

      <div className="container-fee relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-green mb-5 inline-block">
            {lang === 'ar' ? 'قصص النجاح' : 'Success Stories'}
          </span>
          <h2 className="section-heading">
            {lang === 'ar' ? 'يقولون عن تجربتهم' : 'Voices From Our Community'}
          </h2>
          <p className="section-sub mx-auto">
            {lang === 'ar'
              ? 'ما يقوله شركاؤنا المعتمدون عن رحلتهم مع FEE الكويت.'
              : 'What our certified partners say about their journey with FEE Kuwait.'}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {TESTIMONIALS.map((item, i) => {
            const Icon = item.Icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.14 }}
                className="relative rounded-3xl p-8 flex flex-col overflow-hidden"
                style={{
                  background: 'white',
                  border: '1px solid #C8E6D0',
                  boxShadow: '0 4px 20px rgba(64,145,108,0.08)',
                }}
              >
                {/* Subtle tinted corner */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[80px] pointer-events-none"
                  style={{ background: `${item.color}07` }} />

                {/* Quote icon */}
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: `${item.color}12` }}>
                    <Quote className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                </div>

                {/* Quote text */}
                <p className="text-sm leading-[1.8] flex-1 mb-7 italic" style={{ color: '#3D4A42' }}>
                  &ldquo;{lang === 'ar' ? item.quote_ar : item.quote_en}&rdquo;
                </p>

                {/* Attribution */}
                <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid #E8F5EC' }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}15`, border: `1.5px solid ${item.color}30` }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-forest text-sm truncate">
                      {lang === 'ar' ? item.name_ar : item.name_en}
                    </p>
                    <p className="text-xs truncate" style={{ color: '#7A9080' }}>
                      {lang === 'ar' ? item.role_ar : item.role_en}
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ color: item.color, background: `${item.color}12` }}
                  >
                    {item.programme}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
