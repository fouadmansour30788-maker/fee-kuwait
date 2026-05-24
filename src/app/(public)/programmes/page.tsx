'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  School, Waves, KeyRound, Leaf, Newspaper, GraduationCap, ArrowRight, Building2,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { PROGRAMMES } from '@/lib/utils/programmes'

const ICON_MAP: Record<string, React.ElementType> = {
  School, Waves, KeyRound, Leaf, Newspaper, GraduationCap,
}

const PROGRAMME_DETAIL: Record<string, {
  tagline_en: string; tagline_ar: string
  eligibility_en: string[]; eligibility_ar: string[]
  badge_en: string; badge_ar: string
}> = {
  'eco-schools': {
    tagline_en: 'For schools committed to environmental action',
    tagline_ar: 'للمدارس الملتزمة بالعمل البيئي',
    badge_en: 'Green Flag',
    badge_ar: 'العلم الأخضر',
    eligibility_en: ['Primary schools', 'Secondary schools', 'International schools'],
    eligibility_ar: ['المدارس الابتدائية', 'المدارس الثانوية', 'المدارس الدولية'],
  },
  'blue-flag': {
    tagline_en: 'For beaches, marinas & sustainable boating',
    tagline_ar: 'للشواطئ والمراسي ومشغلي القوارب',
    badge_en: 'Blue Flag',
    badge_ar: 'العلم الأزرق',
    eligibility_en: ['Public beaches', 'Marinas', 'Sustainable boating operators'],
    eligibility_ar: ['الشواطئ العامة', 'المراسي', 'مشغلو القوارب المستدامة'],
  },
  'green-key': {
    tagline_en: 'For hotels, restaurants & tourism operators',
    tagline_ar: 'للفنادق والمطاعم ومشغلي السياحة',
    badge_en: 'Green Key',
    badge_ar: 'المفتاح الأخضر',
    eligibility_en: ['Hotels & resorts', 'Restaurants & cafes', 'Tourist attractions', 'Conference centres'],
    eligibility_ar: ['الفنادق والمنتجعات', 'المطاعم والمقاهي', 'المعالم السياحية', 'مراكز المؤتمرات'],
  },
  'leaf': {
    tagline_en: 'Learning about forests through school education',
    tagline_ar: 'التعلم عن الغابات من خلال التعليم المدرسي',
    badge_en: 'LEAF Award',
    badge_ar: 'جائزة LEAF',
    eligibility_en: ['Primary schools', 'Secondary schools'],
    eligibility_ar: ['المدارس الابتدائية', 'المدارس الثانوية'],
  },
  'yre': {
    tagline_en: 'For young journalists aged 13–25',
    tagline_ar: 'للصحفيين الشباب الذين تتراوح أعمارهم بين 13-25',
    badge_en: 'YRE Award',
    badge_ar: 'جائزة YRE',
    eligibility_en: ['Students aged 13–25', 'Youth media groups', 'Environmental clubs'],
    eligibility_ar: ['الطلاب من 13 إلى 25 عاماً', 'مجموعات الإعلام الشبابي', 'الأندية البيئية'],
  },
  'eco-campus': {
    tagline_en: 'For universities leading sustainability',
    tagline_ar: 'للجامعات الرائدة في الاستدامة',
    badge_en: 'Eco-Campus Flag',
    badge_ar: 'علم الحرم البيئي',
    eligibility_en: ['Universities', 'Colleges', 'Higher education institutions'],
    eligibility_ar: ['الجامعات', 'الكليات', 'مؤسسات التعليم العالي'],
  },
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

export default function ProgrammesPage() {
  const { lang } = useLang()

  return (
    <>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="section-forest py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(82,183,136,0.15),transparent_55%)] pointer-events-none" />
        <div className="container-fee relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/35 text-light text-[11px] font-semibold tracking-widest uppercase mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-light animate-pulse" />
              {lang === 'ar' ? 'شهادات دولية' : 'International Certifications'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              {lang === 'ar'
                ? <>برامجنا<br /><span className="text-light">الستة الدولية</span></>
                : <>Our <span className="text-light">6 International</span><br />Programmes</>}
            </h1>
            <p className="text-white/55 text-lg leading-relaxed">
              {lang === 'ar'
                ? 'من المدارس إلى الشواطئ، ومن الفنادق إلى الجامعات — لدينا برنامج اعتماد لكل مؤسسة.'
                : 'From schools to beaches, hotels to universities — we have a certification programme for every institution.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Programmes Grid ────────────────────────────── */}
      <section className="section-white py-24">
        <div className="container-fee">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {PROGRAMMES.map((prog, i) => {
              const Icon = ICON_MAP[prog.icon] ?? Leaf
              const detail = PROGRAMME_DETAIL[prog.id]
              return (
                <FadeIn key={prog.id} delay={i * 0.08}>
                  <div className="card overflow-hidden flex flex-col h-full group">
                    {/* Colour header */}
                    <div
                      className="h-2 w-full"
                      style={{ background: `linear-gradient(90deg, ${prog.color}, ${prog.color}80)` }}
                    />

                    <div className="p-7 flex flex-col flex-1">
                      {/* Icon + name */}
                      <div className="flex items-start gap-4 mb-5">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${prog.color}15`, border: `1px solid ${prog.color}30` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: prog.color }} />
                        </div>
                        <div>
                          <h2 className="font-bold text-forest text-lg leading-tight group-hover:text-brand transition-colors">
                            {lang === 'ar' ? prog.name_ar : prog.name_en}
                          </h2>
                          <p className="text-gray text-xs mt-0.5">
                            {lang === 'ar' ? detail.tagline_ar : detail.tagline_en}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray text-sm leading-relaxed mb-5">
                        {lang === 'ar' ? prog.description_ar : prog.description_en}
                      </p>

                      {/* Eligibility */}
                      <div className="mb-6">
                        <p className="text-xs font-semibold text-forest mb-2 uppercase tracking-wider">
                          {lang === 'ar' ? 'من يمكنه التقديم' : 'Who Can Apply'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(lang === 'ar' ? detail.eligibility_ar : detail.eligibility_en).map((e, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                              style={{ color: prog.color, background: `${prog.color}12`, border: `1px solid ${prog.color}25` }}
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Badge + CTA */}
                      <div className="flex items-center justify-between mt-auto pt-5 border-t border-mint">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ color: prog.color, background: `${prog.color}15` }}>
                          🏅 {lang === 'ar' ? detail.badge_ar : detail.badge_en}
                        </span>
                        <Link
                          href={`/programmes/${prog.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                          style={{ color: prog.color }}
                        >
                          {lang === 'ar' ? 'اعرف المزيد' : 'Learn More'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Compare / eligibility guide ─────────────────── */}
      <section className="section-pale py-20">
        <div className="container-fee">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'ما يناسبك' : 'What Fits You'}
              </span>
              <h2 className="section-heading">
                {lang === 'ar' ? 'أي برنامج يناسب مؤسستك؟' : 'Which Programme Fits Your Institution?'}
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: School, label_en: 'School', label_ar: 'مدرسة', progs_en: 'Eco-Schools · LEAF · YRE', progs_ar: 'المدارس البيئية · LEAF · YRE', color: '#52B788' },
                { icon: Waves, label_en: 'Beach / Marina', label_ar: 'شاطئ / مرسى', progs_en: 'Blue Flag', progs_ar: 'العلم الأزرق', color: '#006994' },
                { icon: Building2, label_en: 'Hotel / Restaurant', label_ar: 'فندق / مطعم', progs_en: 'Green Key', progs_ar: 'المفتاح الأخضر', color: '#C8A951' },
                { icon: GraduationCap, label_en: 'University', label_ar: 'جامعة', progs_en: 'Eco-Campus · YRE', progs_ar: 'الحرم البيئي · YRE', color: '#40916C' },
              ].map((row, i) => {
                const Icon = row.icon
                return (
                  <div key={i} className="card p-6 text-center flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: `${row.color}15`, border: `1px solid ${row.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: row.color }} />
                    </div>
                    <p className="font-bold text-forest text-sm mb-1">
                      {lang === 'ar' ? row.label_ar : row.label_en}
                    </p>
                    <p className="text-gray text-xs">
                      {lang === 'ar' ? row.progs_ar : row.progs_en}
                    </p>
                  </div>
                )
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="section-white py-20">
        <div className="container-fee text-center">
          <FadeIn>
            <h2 className="section-heading mb-4">
              {lang === 'ar' ? 'مستعد للبدء؟' : 'Ready to Get Started?'}
            </h2>
            <p className="section-sub mx-auto mb-8">
              {lang === 'ar'
                ? 'تواصل مع فريقنا وسنساعدك في اختيار البرنامج المناسب لمؤسستك.'
                : 'Reach out to our team and we\'ll help you choose the right programme for your institution.'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register?type=school" className="btn-primary">
                {lang === 'ar' ? 'تسجيل مدرسة' : 'Register a School'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register?type=business" className="btn-secondary">
                {lang === 'ar' ? 'تسجيل منشأة' : 'Register a Business'}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
