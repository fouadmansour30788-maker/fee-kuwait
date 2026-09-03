'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import {
  School, Waves, KeyRound, Leaf, Newspaper, GraduationCap,
  TrendingUp, Globe, Users, TreePine,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  )
}

function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const YEAR_STATS = [
  { year: 2019, schools: 12, businesses: 5, students: 8000 },
  { year: 2020, schools: 24, businesses: 12, students: 18000 },
  { year: 2021, schools: 38, businesses: 22, students: 32000 },
  { year: 2022, schools: 67, businesses: 41, students: 58000 },
  { year: 2023, schools: 112, businesses: 68, students: 97000 },
  { year: 2024, schools: 145, businesses: 89, students: 125000 },
]

const PROGRAMME_IMPACT = [
  { icon: School, name_en: 'Eco-Schools', name_ar: 'المدارس البيئية', sites: 145, color: '#52B788', unit_en: 'certified schools', unit_ar: 'مدرسة معتمدة' },
  { icon: Waves, name_en: 'Blue Flag', name_ar: 'العلم الأزرق', sites: 12, color: '#006994', unit_en: 'certified beaches & marinas', unit_ar: 'شاطئ ومرسى معتمد' },
  { icon: KeyRound, name_en: 'Green Key', name_ar: 'المفتاح الأخضر', sites: 31, color: '#C8A951', unit_en: 'certified tourism sites', unit_ar: 'موقع سياحي معتمد' },
  { icon: Leaf, name_en: 'LEAF', name_ar: 'LEAF', sites: 8, color: '#1B4332', unit_en: 'participating schools', unit_ar: 'مدرسة مشاركة' },
  { icon: Newspaper, name_en: 'YRE', name_ar: 'YRE', sites: 320, color: '#74C69D', unit_en: 'young reporters', unit_ar: 'مراسل شاب' },
  { icon: GraduationCap, name_en: 'Eco-Campus', name_ar: 'الحرم البيئي', sites: 3, color: '#40916C', unit_en: 'certified universities', unit_ar: 'جامعة معتمدة' },
]

export default function ImpactPage() {
  const { lang } = useLang()

  const maxStudents = Math.max(...YEAR_STATS.map(y => y.students))

  return (
    <>
      {/* Hero */}
      <section className="section-forest py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(82,183,136,0.15),transparent_55%)] pointer-events-none" />
        <div className="container-fee relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/35 text-light text-[11px] font-semibold tracking-widest uppercase mb-7">
              <TrendingUp className="w-3 h-3" />
              {lang === 'ar' ? 'أثرنا' : 'Our Impact'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              {lang === 'ar'
                ? <><span className="text-light">أرقام حقيقية</span>,<br />تغيير حقيقي</>
                : <><span className="text-light">Real Numbers,</span><br />Real Change</>}
            </h1>
            <p className="text-white/55 text-lg leading-relaxed">
              {lang === 'ar'
                ? 'منذ تأسيسنا، بنينا مجتمعاً متنامياً من المؤسسات الكويتية الملتزمة بالتميز البيئي.'
                : 'Since our founding, we\'ve built a growing community of Kuwaiti institutions committed to environmental excellence.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hero stats */}
      <section className="section-white py-16 border-b border-mint">
        <div className="container-fee">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { target: 145, suffix: '+', label_en: 'Schools Certified', label_ar: 'مدرسة معتمدة', color: '#52B788' },
              { target: 89, suffix: '+', label_en: 'Businesses Certified', label_ar: 'منشأة معتمدة', color: '#006994' },
              { target: 125000, suffix: '+', label_en: 'Students Reached', label_ar: 'طالب وصلنا إليهم', color: '#C8A951' },
              { target: 80, suffix: '+', label_en: 'Countries Connected', label_ar: 'دولة متصلة', color: '#40916C' },
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: stat.color }}>
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  </p>
                  <p className="text-gray text-sm font-medium">
                    {lang === 'ar' ? stat.label_ar : stat.label_en}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Programme-by-programme breakdown */}
      <section className="section-pale py-24">
        <div className="container-fee">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'تفصيل البرامج' : 'Programme Breakdown'}
              </span>
              <h2 className="section-heading">
                {lang === 'ar' ? 'الأثر بحسب البرنامج' : 'Impact by Programme'}
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROGRAMME_IMPACT.map((prog, i) => {
              const Icon = prog.icon
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="card p-6 flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${prog.color}15`, border: `1px solid ${prog.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: prog.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-forest text-sm mb-1">
                        {lang === 'ar' ? prog.name_ar : prog.name_en}
                      </h3>
                      <p className="text-4xl font-bold mb-0.5" style={{ color: prog.color }}>
                        {prog.sites.toLocaleString()}
                      </p>
                      <p className="text-gray text-xs">
                        {lang === 'ar' ? prog.unit_ar : prog.unit_en}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* Growth chart */}
      <section className="section-white py-24">
        <div className="container-fee">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'مسيرة النمو' : 'Growth Journey'}
              </span>
              <h2 className="section-heading">
                {lang === 'ar' ? 'نمو مستمر منذ 2019' : 'Continuous Growth Since 2019'}
              </h2>
              <p className="section-sub mx-auto">
                {lang === 'ar'
                  ? 'عدد الطلاب الذين وصلنا إليهم من خلال برامجنا عاماً بعد عام.'
                  : 'Number of students reached through our programmes year on year.'}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="card p-8">
              <div className="flex items-end gap-3 h-48">
                {YEAR_STATS.map((y, i) => (
                  <div key={y.year} className="flex-1 flex flex-col items-center gap-2">
                    <p className="text-xs font-bold text-brand">{(y.students / 1000).toFixed(0)}k</p>
                    <motion.div
                      className="w-full rounded-t-lg"
                      style={{ background: `linear-gradient(to top, #40916C, #52B788)` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(y.students / maxStudents) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    />
                    <p className="text-xs text-gray">{y.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Global context */}
      <section className="section-forest py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(82,183,136,0.10),transparent_65%)] pointer-events-none" />
        <div className="container-fee relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'الأثر العالمي' : 'Global Context'}
              </span>
              <h2 className="text-3xl font-bold text-white mb-5">
                {lang === 'ar'
                  ? 'الكويت في قلب الحركة البيئية العالمية'
                  : 'Kuwait at the Heart of the Global Environmental Movement'}
              </h2>
              <p className="text-white/55 text-sm leading-relaxed mb-8">
                {lang === 'ar'
                  ? 'تمثل إنجازاتنا في الكويت جزءاً من شبكة عالمية أشمل. تأسست مؤسسة التعليم البيئي عام 1981، وتعمل اليوم عبر أكثر من 110 منظمة عضو في أكثر من 100 دولة — وكويتنا تضيف قيمة لهذه الحركة بنتائجها المميزة.'
                  : 'Our achievements in Kuwait are part of a much larger global network. Founded in 1981, the Foundation for Environmental Education works through 110+ member organisations across 100+ countries — and Kuwait adds real value to this movement through its standout results.'}
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { n: '100+', l_en: 'Countries', l_ar: 'دولة' },
                  { n: '110+', l_en: 'Member Orgs', l_ar: 'منظمة عضو' },
                  { n: '1981', l_en: 'Established', l_ar: 'التأسيس' },
                ].map((s) => (
                  <div key={s.n} className="text-center">
                    <p className="text-2xl font-bold text-light mb-0.5">{s.n}</p>
                    <p className="text-white/40 text-xs">{lang === 'ar' ? s.l_ar : s.l_en}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="space-y-4">
                {[
                  { icon: Globe, title_en: 'International Recognition', title_ar: 'الاعتراف الدولي', desc_en: 'Every certified site in Kuwait is listed on the global FEE registry, visible to international tourists and partners.', desc_ar: 'كل موقع معتمد في الكويت مدرج في السجل العالمي لـ FEE، ومرئي للسياح والشركاء الدوليين.', color: '#52B788' },
                  { icon: Users, title_en: 'Community Building', title_ar: 'بناء المجتمع', desc_en: 'Our certified institutions connect to a peer network of schools, hotels, and campuses across 100+ countries.', desc_ar: 'تتصل مؤسساتنا المعتمدة بشبكة نظيرة من المدارس والفنادق والحرم الجامعي في 100+ دولة.', color: '#006994' },
                  { icon: TreePine, title_en: 'Environmental Action', title_ar: 'العمل البيئي', desc_en: 'Beyond certification, our programmes drive measurable environmental action: waste reduction, energy savings, biodiversity.', desc_ar: 'ما وراء الشهادة، تدفع برامجنا إجراءات بيئية قابلة للقياس: تقليل النفايات وتوفير الطاقة والتنوع البيولوجي.', color: '#C8A951' },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${item.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm mb-1">{lang === 'ar' ? item.title_ar : item.title_en}</h3>
                        <p className="text-white/45 text-xs leading-relaxed">{lang === 'ar' ? item.desc_ar : item.desc_en}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pale py-20">
        <div className="container-fee text-center">
          <FadeIn>
            <h2 className="section-heading mb-4">
              {lang === 'ar' ? 'كن جزءاً من قصة النجاح' : 'Be Part of the Success Story'}
            </h2>
            <p className="section-sub mx-auto mb-8">
              {lang === 'ar'
                ? 'سجّل مؤسستك اليوم وأضف أثرك إلى خريطة التغيير البيئي في الكويت.'
                : 'Register your institution today and add your impact to Kuwait\'s environmental change map.'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register?type=school" className="btn-primary">
                {lang === 'ar' ? 'تسجيل مدرسة' : 'Register a School'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register?type=business" className="btn-secondary">
                {lang === 'ar' ? 'تسجيل منشأة ضيافة' : 'Register a Hospitality Establishment'}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
