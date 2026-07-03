'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Globe, Leaf, ArrowRight, School, Waves, KeyRound,
  Newspaper, GraduationCap, Award, Users, Target, Heart,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { PROGRAMMES } from '@/lib/utils/programmes'
const ICON_MAP: Record<string, React.ElementType> = {
  School, Waves, KeyRound, Leaf, Newspaper, GraduationCap,
}

const TEAM = [
  {
    name_en: 'Dr. Ahmad Al-Sabah',
    name_ar: 'د. أحمد الصباح',
    role_en: 'Executive Director',
    role_ar: 'المدير التنفيذي',
    initials: 'AS',
    color: '#52B788',
  },
  {
    name_en: 'Lulwa Al-Kandari',
    name_ar: 'لولوة الكندري',
    role_en: 'Programmes Manager',
    role_ar: 'مديرة البرامج',
    initials: 'LK',
    color: '#006994',
  },
  {
    name_en: 'Yousef Al-Mutairi',
    name_ar: 'يوسف المطيري',
    role_en: 'Outreach & Partnerships',
    role_ar: 'التواصل والشراكات',
    initials: 'YM',
    color: '#C8A951',
  },
]

const VALUES = [
  {
    icon: Globe,
    title_en: 'Global Standards',
    title_ar: 'معايير عالمية',
    desc_en: 'All our programmes are backed by FEE International — the world\'s largest environmental education organisation operating in 80+ countries.',
    desc_ar: 'جميع برامجنا مدعومة من FEE الدولية — أكبر منظمة تعليم بيئي في العالم تعمل في أكثر من 80 دولة.',
    color: '#52B788',
  },
  {
    icon: Award,
    title_en: 'Recognised Certification',
    title_ar: 'شهادة معترف بها',
    desc_en: 'FEE certifications are recognised by the UN Environment Programme, UNESCO, and governments worldwide as symbols of environmental leadership.',
    desc_ar: 'تحظى شهادات FEE بالاعتراف من برنامج الأمم المتحدة للبيئة واليونسكو وحكومات حول العالم.',
    color: '#006994',
  },
  {
    icon: Users,
    title_en: 'Community Impact',
    title_ar: 'أثر مجتمعي',
    desc_en: 'We don\'t just certify — we build lasting communities of practice where schools, businesses, and students learn and grow together.',
    desc_ar: 'لا نكتفي بالاعتماد — نبني مجتمعات ممارسة دائمة حيث تتعلم المدارس والشركات والطلاب معاً.',
    color: '#C8A951',
  },
  {
    icon: Target,
    title_en: 'Local Relevance',
    title_ar: 'ملاءمة محلية',
    desc_en: 'Every programme is adapted to Kuwait\'s unique environment — from desert ecosystems and marine biodiversity to urban sustainability challenges.',
    desc_ar: 'كل برنامج مُكيَّف مع البيئة الكويتية الفريدة — من النظم البيئية الصحراوية والتنوع البحري إلى تحديات الاستدامة الحضرية.',
    color: '#40916C',
  },
]

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function AboutPage() {
  const { lang } = useLang()
  const heroRef = useRef(null)

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="section-forest py-28 relative overflow-hidden" ref={heroRef}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(82,183,136,0.15),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,105,148,0.10),transparent_50%)] pointer-events-none" />
        <div className="container-fee relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/35 text-light text-[11px] font-semibold tracking-widest uppercase mb-7">
              <Heart className="w-3 h-3" />
              {lang === 'ar' ? 'من نحن' : 'About Us'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              {lang === 'ar'
                ? <>تعليم بيئي<br /><span className="text-light">يصنع الفارق</span></>
                : <>Environmental Education<br /><span className="text-light">That Makes a Difference</span></>}
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              {lang === 'ar'
                ? 'FEE الكويت هي المشغل الوطني الرسمي لمؤسسة التعليم البيئي الدولية في دولة الكويت. نربط المؤسسات الكويتية بمعايير الاعتماد البيئي المعترف بها عالمياً.'
                : 'FEE Kuwait is the official national operator of the Foundation for Environmental Education International in the State of Kuwait — connecting Kuwaiti institutions to world-recognised environmental certification standards.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/programmes" className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand hover:bg-emerald text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.03]">
                {lang === 'ar' ? 'استكشف برامجنا' : 'Explore Programmes'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-200">
                {lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────────── */}
      <section className="section-white py-24">
        <div className="container-fee">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInSection>
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'قصتنا' : 'Our Story'}
              </span>
              <h2 className="section-heading mb-6">
                {lang === 'ar' ? 'رحلة نحو كويت أكثر خضرة' : 'A Journey Toward a Greener Kuwait'}
              </h2>
              <div className="space-y-4 text-gray text-sm leading-relaxed">
                <p>
                  {lang === 'ar'
                    ? 'تأسست FEE الكويت بهدف واحد واضح: ربط الكويت بحركة التعليم البيئي العالمية. منذ انطلاقنا، عملنا على تمكين المدارس والشركات والجامعات من تبني معايير الاستدامة الدولية وتطبيقها في سياقنا المحلي الفريد.'
                    : 'FEE Kuwait was founded with one clear purpose: connecting Kuwait to the global environmental education movement. Since our launch, we have worked to empower schools, businesses, and universities to adopt international sustainability standards within our unique local context.'}
                </p>
                <p>
                  {lang === 'ar'
                    ? 'بصفتنا المشغل الوطني الرسمي لـ FEE الدولية — التي تضم أكثر من 80 دولة عضواً وتديم شبكة من أفضل برامج التعليم البيئي في العالم — نحمل مسؤولية ترجمة هذه البرامج الدولية إلى واقع ملموس يلائم بيئة الكويت وطموحاتها.'
                    : 'As the official national operator of FEE International — which spans 80+ member countries and sustains a network of the world\'s finest environmental education programmes — we carry the responsibility of translating these international frameworks into a tangible reality suited to Kuwait\'s environment and ambitions.'}
                </p>
                <p>
                  {lang === 'ar'
                    ? 'اليوم، يضم مجتمعنا المعتمد أكثر من 200 مؤسسة تشمل مدارس وشواطئ وفنادق وجامعات — وننمو بشكل مستمر.'
                    : 'Today, our certified community includes 200+ institutions spanning schools, beaches, hotels, and universities — and we continue to grow.'}
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: '2019', label_en: 'Year Founded', label_ar: 'سنة التأسيس', color: '#52B788' },
                  { num: '80+', label_en: 'FEE Countries', label_ar: 'دول FEE', color: '#006994' },
                  { num: '200+', label_en: 'Certified Sites', label_ar: 'موقع معتمد', color: '#C8A951' },
                  { num: '6', label_en: 'Programmes', label_ar: 'برامج', color: '#40916C' },
                ].map((s) => (
                  <div key={s.num} className="card p-6 text-center">
                    <p className="text-4xl font-bold mb-1" style={{ color: s.color }}>{s.num}</p>
                    <p className="text-gray text-xs font-medium">{lang === 'ar' ? s.label_ar : s.label_en}</p>
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── Why We Do It ─────────────────────────────────── */}
      <section className="section-pale py-24">
        <div className="container-fee">
          <FadeInSection>
            <div className="text-center mb-14">
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'قيمنا' : 'Our Values'}
              </span>
              <h2 className="section-heading">
                {lang === 'ar' ? 'ما يميّزنا' : 'What Sets Us Apart'}
              </h2>
              <p className="section-sub mx-auto">
                {lang === 'ar'
                  ? 'نؤمن بأن التغيير الحقيقي يبدأ بالتعليم والاعتراف والمجتمع.'
                  : 'We believe real change starts with education, recognition, and community.'}
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v, i) => {
              const Icon = v.icon
              return (
                <FadeInSection key={i} delay={i * 0.1}>
                  <div className="card p-8 flex gap-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${v.color}15`, border: `1px solid ${v.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: v.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-forest text-base mb-2">
                        {lang === 'ar' ? v.title_ar : v.title_en}
                      </h3>
                      <p className="text-gray text-sm leading-relaxed">
                        {lang === 'ar' ? v.desc_ar : v.desc_en}
                      </p>
                    </div>
                  </div>
                </FadeInSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Our 6 Programmes ─────────────────────────────── */}
      <section className="section-white py-24">
        <div className="container-fee">
          <FadeInSection>
            <div className="text-center mb-14">
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'ما نقدمه' : 'What We Offer'}
              </span>
              <h2 className="section-heading">
                {lang === 'ar' ? 'برامجنا الستة' : 'Our 6 Programmes'}
              </h2>
              <p className="section-sub mx-auto">
                {lang === 'ar'
                  ? 'برنامج لكل مؤسسة — سواء كنت مدرسة أو شاطئاً أو فندقاً أو جامعة.'
                  : 'A programme for every institution — whether you\'re a school, beach, hotel, or university.'}
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROGRAMMES.map((prog, i) => {
              const Icon = ICON_MAP[prog.icon] ?? Leaf
              return (
                <FadeInSection key={prog.id} delay={i * 0.08}>
                  <Link
                    href={`/programmes/${prog.id}`}
                    className="card p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-transform duration-200 block"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${prog.color}15`, border: `1px solid ${prog.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: prog.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-forest text-base mb-1 group-hover:text-brand transition-colors">
                        {lang === 'ar' ? prog.name_ar : prog.name_en}
                      </h3>
                      <p className="text-gray text-sm leading-relaxed line-clamp-2">
                        {lang === 'ar' ? prog.description_ar : prog.description_en}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                      style={{ color: prog.color }}
                    >
                      {lang === 'ar' ? 'اعرف المزيد' : 'Learn More'}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </FadeInSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEE International ────────────────────────────── */}
      <section className="section-forest py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(82,183,136,0.10),transparent_65%)] pointer-events-none" />
        <div className="container-fee relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeInSection>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/35 text-light text-[11px] font-semibold tracking-widest uppercase mb-7">
                <Globe className="w-3 h-3" />
                {lang === 'ar' ? 'ارتباطنا العالمي' : 'Our Global Connection'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-5">
                {lang === 'ar'
                  ? <>جزء من أكبر شبكة<br /><span className="text-light">تعليم بيئي في العالم</span></>
                  : <>Part of the World&apos;s Largest<br /><span className="text-light">Environmental Education Network</span></>}
              </h2>
              <p className="text-white/55 text-sm leading-relaxed mb-8">
                {lang === 'ar'
                  ? 'FEE الدولية (مؤسسة التعليم البيئي) هي منظمة دولية غير حكومية تضم 80+ دولة عضواً. تُدار من قِبَل أعضائها الوطنيين وتتمتع بمكانة استشارية لدى اليونسكو وبرنامج الأمم المتحدة للبيئة. نحن، FEE الكويت، ممثلها الرسمي.'
                  : 'FEE International (Foundation for Environmental Education) is an international non-governmental organisation with 80+ national member organisations. Run by its national members, it holds consultative status with UNESCO and UNEP. We — FEE Kuwait — are its official national representative.'}
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { n: '80+', l_en: 'Countries', l_ar: 'دولة' },
                  { n: '35k+', l_en: 'Certified Sites', l_ar: 'موقع معتمد' },
                  { n: '20M+', l_en: 'Young People', l_ar: 'شاب وشابة' },
                ].map((s) => (
                  <div key={s.n} className="text-center">
                    <p className="text-2xl font-bold text-light mb-0.5">{s.n}</p>
                    <p className="text-white/40 text-xs">{lang === 'ar' ? s.l_ar : s.l_en}</p>
                  </div>
                ))}
              </div>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
                {[
                  { prog: 'Eco-Schools', note_en: 'Largest environmental education programme in the world', note_ar: 'أكبر برنامج تعليم بيئي في العالم', color: '#52B788' },
                  { prog: 'Blue Flag', note_en: 'Most recognised beach certification globally', note_ar: 'أشهر شهادة شواطئ على مستوى العالم', color: '#006994' },
                  { prog: 'Green Key', note_en: 'Leading sustainable tourism standard', note_ar: 'المعيار الرائد للسياحة المستدامة', color: '#C8A951' },
                  { prog: 'YRE', note_en: 'Empowering young environmental journalists', note_ar: 'تمكين الصحفيين البيئيين الشباب', color: '#74C69D' },
                  { prog: 'LEAF', note_en: 'Connecting schools to forest ecosystems', note_ar: 'ربط المدارس بالنظم البيئية الحرجية', color: '#1B4332' },
                  { prog: 'Eco-Campus', note_en: 'Certifying universities in sustainability leadership', note_ar: 'اعتماد الجامعات في قيادة الاستدامة', color: '#40916C' },
                ].map((item) => (
                  <div key={item.prog} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                    <div>
                      <span className="text-white font-semibold text-sm">{item.prog}</span>
                      <span className="text-white/40 text-xs ml-2">—</span>
                      <span className="text-white/50 text-xs ml-1">{lang === 'ar' ? item.note_ar : item.note_en}</span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────── */}
      <section className="section-white py-24">
        <div className="container-fee">
          <FadeInSection>
            <div className="text-center mb-14">
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'فريقنا' : 'Our Team'}
              </span>
              <h2 className="section-heading">
                {lang === 'ar' ? 'القيادة والإدارة' : 'Leadership & Management'}
              </h2>
              <p className="section-sub mx-auto">
                {lang === 'ar'
                  ? 'فريق متخصص يجمع بين الخبرة الدولية والمعرفة المحلية.'
                  : 'A dedicated team combining international expertise with local knowledge.'}
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {TEAM.map((member, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="card p-6 text-center flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4"
                    style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}99)` }}
                  >
                    {member.initials}
                  </div>
                  <h3 className="font-bold text-forest text-sm mb-0.5">
                    {lang === 'ar' ? member.name_ar : member.name_en}
                  </h3>
                  <p className="text-gray text-xs">
                    {lang === 'ar' ? member.role_ar : member.role_en}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="section-pale py-20">
        <div className="container-fee text-center">
          <FadeInSection>
            <h2 className="section-heading mb-4">
              {lang === 'ar' ? 'جاهز للانضمام إلينا؟' : 'Ready to Join Us?'}
            </h2>
            <p className="section-sub mx-auto mb-8">
              {lang === 'ar'
                ? 'ابدأ رحلتك نحو الاعتماد البيئي اليوم وكن جزءاً من التغيير.'
                : 'Start your journey toward environmental certification today and be part of the change.'}
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
          </FadeInSection>
        </div>
      </section>
    </>
  )
}
