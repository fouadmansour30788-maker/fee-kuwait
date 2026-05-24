'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Newspaper, Camera, Mic, PenLine, Trophy, Globe, ArrowRight,
  Calendar, Star, Lightbulb, TreePine,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

const CATEGORIES = [
  {
    Icon: PenLine,
    color: '#52B788',
    title_en: 'Written Article',
    title_ar: 'المقال المكتوب',
    desc_en: 'In-depth investigative pieces on local environmental issues — from waste management to water conservation.',
    desc_ar: 'مقالات استقصائية معمّقة حول القضايا البيئية المحلية — من إدارة النفايات إلى الحفاظ على المياه.',
  },
  {
    Icon: Camera,
    color: '#3B82F6',
    title_en: 'Photo Report',
    title_ar: 'التقرير المصور',
    desc_en: 'A series of at least 6 original photographs that tell a visual story about an environmental topic.',
    desc_ar: 'سلسلة من 6 صور أصلية على الأقل تروي قصة بصرية حول موضوع بيئي.',
  },
  {
    Icon: Mic,
    color: '#7C3AED',
    title_en: 'Video Report',
    title_ar: 'التقرير المرئي',
    desc_en: 'A short documentary or news-style video (3–10 min) covering an environmental story in Kuwait.',
    desc_ar: 'فيلم وثائقي قصير أو تقرير بأسلوب إخباري (3–10 دقائق) يغطي قضية بيئية في الكويت.',
  },
]

const TIMELINE = [
  { month_en: 'Sep – Nov', month_ar: 'سبتمبر – نوفمبر', label_en: 'Registration & Training', label_ar: 'التسجيل والتدريب', color: '#52B788' },
  { month_en: 'Dec – Feb', month_ar: 'ديسمبر – فبراير',  label_en: 'Investigation & Reporting', label_ar: 'التحقيق وإعداد التقارير', color: '#3B82F6' },
  { month_en: 'Mar',       month_ar: 'مارس',              label_en: 'Submissions Deadline', label_ar: 'الموعد النهائي للتقديم', color: '#7C3AED' },
  { month_en: 'Apr – May', month_ar: 'أبريل – مايو',     label_en: 'National Judging', label_ar: 'التحكيم الوطني', color: '#D97706' },
  { month_en: 'Jun',       month_ar: 'يونيو',             label_en: 'Winners & Awards', label_ar: 'الفائزون والجوائز', color: '#059669' },
]

const PAST_WINNERS = [
  { year: 2025, name_en: 'Mariam Al-Rashidi', name_ar: 'مريم الراشدي', school_en: 'Kuwait Model School', school_ar: 'مدرسة الكويت النموذجية', topic_en: 'Microplastics in Kuwait Bay', topic_ar: 'الميكروبلاستيك في خليج الكويت', cat: 'Written', color: '#52B788' },
  { year: 2025, name_en: 'Nasser Al-Mutairi', name_ar: 'ناصر المطيري', school_en: 'Al-Sabah School', school_ar: 'مدرسة الصباح', topic_en: 'Desert Reforestation Efforts', topic_ar: 'جهود إعادة التشجير في الصحراء', cat: 'Photo', color: '#3B82F6' },
  { year: 2024, name_en: 'Fatima Al-Oseimi', name_ar: 'فاطمة العصيمي', school_en: 'Rumaithiya Secondary', school_ar: 'ثانوية الرميثية', topic_en: 'Youth Climate Activism', topic_ar: 'النشاط المناخي للشباب', cat: 'Video', color: '#7C3AED' },
]

const WHY_JOIN = [
  { Icon: Globe,  color: '#52B788', title_en: 'Global Stage', title_ar: 'المنصة العالمية', desc_en: 'Top entries compete in the international YRE competition, reaching audiences in 80+ countries.', desc_ar: 'تتنافس أبرز الأعمال في مسابقة YRE الدولية أمام جماهير في 80+ دولة.' },
  { Icon: Trophy, color: '#D97706', title_en: 'Real Prizes', title_ar: 'جوائز حقيقية', desc_en: 'National winners receive certificates, trophies, and sponsored study visits to environmental sites.', desc_ar: 'يحصل الفائزون الوطنيون على شهادات وكؤوس وزيارات دراسية مدعومة للمواقع البيئية.' },
  { Icon: Lightbulb, color: '#7C3AED', title_en: 'Journalism Skills', title_ar: 'مهارات الصحافة', desc_en: 'Free workshops in environmental reporting, data journalism, photography, and video production.', desc_ar: 'ورش عمل مجانية في التقارير البيئية وصحافة البيانات والتصوير وإنتاج الفيديو.' },
  { Icon: TreePine, color: '#059669', title_en: 'Real Impact', title_ar: 'أثر حقيقي', desc_en: 'Past YRE articles have influenced local council decisions on recycling and beach clean-up.', desc_ar: 'أثّرت مقالات YRE السابقة في قرارات المجالس المحلية بشأن إعادة التدوير وتنظيف الشواطئ.' },
]

export default function YouthPage() {
  const { lang } = useLang()

  return (
    <>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, #0A1C2E 0%, #0F2A18 55%, #1B4332 100%)' }} />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-1/3 w-[420px] h-[300px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, #52B788 0%, transparent 70%)', filter: 'blur(90px)' }} />
          <div className="absolute bottom-0 left-1/4 w-[320px] h-[200px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(ellipse, #3B82F6 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </div>

        <div className="container-fee relative z-10 text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-7"
              style={{ border: '1px solid rgba(82,183,136,0.3)', color: 'rgba(116,198,157,0.9)', background: 'rgba(82,183,136,0.08)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#74C69D] animate-pulse" />
              {lang === 'ar' ? 'برنامج الشباب' : 'Youth Programme'}
            </span>

            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              {lang === 'ar'
                ? <>{' '}مراسلون شباب{' '}<br /><span style={{ color: '#74C69D' }}>من أجل البيئة</span></>
                : <>Young Reporters<br /><span style={{ color: '#74C69D' }}>for the Environment</span></>}
            </h1>

            <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.52)' }}>
              {lang === 'ar'
                ? 'امنح صوتك للبيئة. برنامج YRE يدرّب الشباب الكويتي (13–25 سنة) على الصحافة البيئية ويطلقهم على المسرح العالمي.'
                : 'Give your voice to the environment. YRE trains young Kuwaitis aged 13–25 in environmental journalism and launches them onto the global stage.'}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register?programme=yre"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}
              >
                {lang === 'ar' ? 'سجّل الآن' : 'Register Now'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/programmes/yre"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                {lang === 'ar' ? 'تعرّف على البرنامج' : 'About YRE'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="py-14 border-b" style={{ background: '#fff', borderColor: '#C8E6D0' }}>
        <div className="container-fee">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { n: '320+', label_en: 'Young Reporters', label_ar: 'مراسل شاب', color: '#52B788' },
              { n: '13–25', label_en: 'Age Range', label_ar: 'الفئة العمرية', color: '#3B82F6' },
              { n: '3',    label_en: 'Entry Categories', label_ar: 'فئات التقديم', color: '#7C3AED' },
              { n: '80+',  label_en: 'Global Countries', label_ar: 'دولة عالمية', color: '#D97706' },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <p className="text-4xl font-bold mb-1" style={{ color: s.color }}>{s.n}</p>
                <p className="text-sm font-medium" style={{ color: '#64748B' }}>
                  {lang === 'ar' ? s.label_ar : s.label_en}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Entry categories */}
      <section className="py-24" style={{ background: '#F4F9F5' }}>
        <div className="container-fee">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-4"
                style={{ background: '#D1FAE5', color: '#059669' }}>
                {lang === 'ar' ? 'فئات التقديم' : 'Entry Categories'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#0F2318' }}>
                {lang === 'ar' ? 'اختر طريقة تعبيرك' : 'Choose How You Tell Your Story'}
              </h2>
              <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: '#5A6672' }}>
                {lang === 'ar'
                  ? 'سواء أكنت كاتباً أم مصوراً أم مخرجاً، YRE لديه فئة مناسبة لك.'
                  : 'Whether you\'re a writer, photographer, or filmmaker, YRE has a category for you.'}
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CATEGORIES.map((cat, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border hover:shadow-lg transition-shadow" style={{ borderColor: '#E2E8F0' }}>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
                  >
                    <cat.Icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: '#0F2318' }}>
                    {lang === 'ar' ? cat.title_ar : cat.title_en}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5A6672' }}>
                    {lang === 'ar' ? cat.desc_ar : cat.desc_en}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why join */}
      <section className="py-24 bg-white">
        <div className="container-fee">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-4"
                style={{ background: '#D1FAE5', color: '#059669' }}>
                {lang === 'ar' ? 'لماذا تنضم؟' : 'Why Join?'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#0F2318' }}>
                {lang === 'ar' ? 'ما الذي ستكسبه؟' : 'What You\'ll Gain'}
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {WHY_JOIN.map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="flex gap-4 p-5 rounded-2xl border" style={{ borderColor: '#E2E8F0' }}>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}15` }}
                  >
                    <item.Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: '#0F2318' }}>
                      {lang === 'ar' ? item.title_ar : item.title_en}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#5A6672' }}>
                      {lang === 'ar' ? item.desc_ar : item.desc_en}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Competition timeline */}
      <section className="py-24" style={{ background: '#F4F9F5' }}>
        <div className="container-fee">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-4"
                style={{ background: '#D1FAE5', color: '#059669' }}>
                {lang === 'ar' ? 'جدول المسابقة' : 'Competition Calendar'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#0F2318' }}>
                {lang === 'ar' ? 'رحلة المسابقة 2025–2026' : '2025–2026 Competition Journey'}
              </h2>
            </div>
          </FadeIn>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-px" style={{ background: '#C8E6D0' }} />

              <div className="space-y-6">
                {TIMELINE.map((step, i) => (
                  <FadeIn key={i} delay={i * 0.08}>
                    <div className="flex gap-6 items-start">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 text-xs font-bold text-center leading-tight"
                        style={{ background: `${step.color}15`, color: step.color, border: `1px solid ${step.color}30` }}
                      >
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: step.color }}>
                          {lang === 'ar' ? step.month_ar : step.month_en}
                        </p>
                        <p className="font-bold text-base" style={{ color: '#0F2318' }}>
                          {lang === 'ar' ? step.label_ar : step.label_en}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Past winners */}
      <section className="py-24 bg-white">
        <div className="container-fee">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-4"
                style={{ background: '#FEF3C7', color: '#D97706' }}>
                {lang === 'ar' ? 'الفائزون السابقون' : 'Past Winners'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#0F2318' }}>
                {lang === 'ar' ? 'قصص ملهمة' : 'Inspiring Stories'}
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {PAST_WINNERS.map((w, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow" style={{ borderColor: '#E2E8F0' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4" style={{ color: '#D97706' }} />
                    <span className="text-xs font-semibold" style={{ color: '#D97706' }}>{w.year} Winner</span>
                    <span
                      className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${w.color}15`, color: w.color }}
                    >
                      {w.cat}
                    </span>
                  </div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: '#0F2318' }}>
                    {lang === 'ar' ? w.name_ar : w.name_en}
                  </p>
                  <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>
                    {lang === 'ar' ? w.school_ar : w.school_en}
                  </p>
                  <p className="text-xs leading-relaxed italic" style={{ color: '#5A6672' }}>
                    &ldquo;{lang === 'ar' ? w.topic_ar : w.topic_en}&rdquo;
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, #0F2318 0%, #1B4332 100%)' }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, #52B788 0%, transparent 70%)', filter: 'blur(100px)' }} />
        </div>
        <div className="container-fee relative z-10 text-center max-w-2xl mx-auto">
          <FadeIn>
            <Newspaper className="w-12 h-12 mx-auto mb-6" style={{ color: '#74C69D' }} />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
              {lang === 'ar'
                ? 'صوتك يمكن أن يغيّر العالم'
                : 'Your Voice Can Change the World'}
            </h2>
            <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.52)' }}>
              {lang === 'ar'
                ? 'انضم إلى شبكة عالمية من الشباب الذين يستخدمون الصحافة أداةً للتغيير البيئي. التسجيل مجاني ومفتوح للجميع.'
                : 'Join a global network of young people using journalism as a tool for environmental change. Registration is free and open to all.'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register?programme=yre"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #278A45, #52B788)' }}
              >
                {lang === 'ar' ? 'ابدأ رحلتك الآن' : 'Start Your Journey'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                {lang === 'ar' ? 'تواصل معنا' : 'Get in Touch'}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
