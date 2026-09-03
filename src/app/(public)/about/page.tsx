'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Globe, Leaf, ArrowRight, School, Waves, KeyRound,
  Newspaper, GraduationCap, Award, Users, Target, Heart,
  ShieldCheck, MapPin, Building2,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { PROGRAMMES } from '@/lib/utils/programmes'
const ICON_MAP: Record<string, React.ElementType> = {
  School, Waves, KeyRound, Leaf, Newspaper, GraduationCap,
}

// The FEE National Operator in Kuwait.
const TEAM = [
  {
    name_en: 'Mona El Rez Bassaj',
    name_ar: 'منى الرز بسج',
    role_en: 'FEE National Operator',
    role_ar: 'المشغّل الوطني لـ FEE',
    initials: 'MB',
    photo: '/team/mona.jpg',
    color: '#40916C',
  },
]

const VALUES = [
  {
    icon: Globe,
    title_en: 'Global Standards',
    title_ar: 'معايير عالمية',
    desc_en: 'Every programme is backed by FEE — founded in 1981 and today one of the world\'s largest environmental education organisations, with 110+ member organisations across 100+ countries.',
    desc_ar: 'كل برنامج مدعوم من مؤسسة التعليم البيئي (FEE) — التي تأسست عام 1981 وتُعد اليوم من أكبر منظمات التعليم البيئي في العالم، بأكثر من 110 منظمة عضو في أكثر من 100 دولة.',
    color: '#52B788',
  },
  {
    icon: Award,
    title_en: 'Internationally Recognised',
    title_ar: 'اعتراف دولي',
    desc_en: 'FEE holds consultative status with UNESCO and UNEP, and its certifications are recognised internationally as marks of credible environmental practice.',
    desc_ar: 'تتمتع FEE بمكانة استشارية لدى اليونسكو وبرنامج الأمم المتحدة للبيئة، وتُعترف بشهاداتها دولياً كعلامات على ممارسة بيئية موثوقة.',
    color: '#006994',
  },
  {
    icon: ShieldCheck,
    title_en: 'Verified, Not Declared',
    title_ar: 'مُتحقَّق منه، لا مُعلَن فقط',
    desc_en: 'We don\'t take sustainability on trust. Every certification is assessed against published criteria, supported by documented evidence, and confirmed through independent audit.',
    desc_ar: 'لا نأخذ الاستدامة على محمل الثقة وحدها. تُقيَّم كل شهادة وفق معايير منشورة، مدعومة بأدلة موثقة، ومؤكَّدة عبر تدقيق مستقل.',
    color: '#C8A951',
  },
  {
    icon: Users,
    title_en: 'Community Impact',
    title_ar: 'أثر مجتمعي',
    desc_en: 'We don\'t just certify — we build lasting communities of practice where schools, businesses, and students learn and grow together.',
    desc_ar: 'لا نكتفي بالاعتماد — بل نبني مجتمعات ممارسة دائمة تتعلّم فيها المدارس والشركات والطلاب وتنمو معاً.',
    color: '#40916C',
  },
  {
    icon: Target,
    title_en: 'Local Relevance',
    title_ar: 'ملاءمة محلية',
    desc_en: 'Every programme is adapted to Kuwait\'s unique environment — from desert ecosystems and marine biodiversity to urban sustainability challenges — and aligned with the goals of Kuwait Vision 2035.',
    desc_ar: 'كل برنامج مُكيَّف مع البيئة الكويتية الفريدة — من النظم الصحراوية والتنوع البحري إلى تحديات الاستدامة الحضرية — ومتوائم مع أهداف رؤية الكويت 2035.',
    color: '#1B4332',
  },
  {
    icon: MapPin,
    title_en: 'Global Standards, Local Roots',
    title_ar: 'معايير عالمية بجذور محلية',
    desc_en: 'Kuwaiti in our roots, global in our standards: we connect institutions to internationally recognised frameworks while honouring the priorities and aspirations of Kuwait and the wider Gulf.',
    desc_ar: 'كويتيون في جذورنا، عالميون في معاييرنا: نربط المؤسسات بأطر معترف بها دولياً مع احترام أولويات وطموحات الكويت والخليج.',
    color: '#0891B2',
  },
]

// About-page programme blurbs (from FEE's programme descriptions).
const PROG_DESC: Record<string, { en: string; ar: string }> = {
  'eco-schools': {
    en: 'The world\'s largest sustainability education programme, guiding primary and secondary schools toward measurable environmental action, led by students themselves.',
    ar: 'أكبر برنامج للتعليم من أجل الاستدامة في العالم، يقود المدارس الابتدائية والثانوية نحو عمل بيئي قابل للقياس، بقيادة الطلاب أنفسهم.',
  },
  'eco-campus': {
    en: 'Empowering universities and higher-education institutions to embed environmental governance into their operations, culture, and campus life.',
    ar: 'تمكين الجامعات ومؤسسات التعليم العالي من ترسيخ الحوكمة البيئية في عملياتها وثقافتها وحياتها الجامعية.',
  },
  'green-key': {
    en: 'The leading international standard for environmental responsibility and sustainable operation in tourism and hospitality.',
    ar: 'المعيار الدولي الرائد للمسؤولية البيئية والتشغيل المستدام في قطاع السياحة والضيافة.',
  },
  'blue-flag': {
    en: 'One of the world\'s most recognised voluntary awards for beaches, marinas, and sustainable tourism boats, covering water quality, safety, accessibility, and education.',
    ar: 'من أكثر الجوائز الطوعية شهرة في العالم للشواطئ والمراسي وقوارب السياحة المستدامة، وتشمل جودة المياه والسلامة وسهولة الوصول والتثقيف.',
  },
  'leaf': {
    en: 'Learning about Ecosystems and Forests: outdoor, hands-on learning that connects students directly with the natural world.',
    ar: 'التعلّم عن النظم البيئية والغابات: تعلّم خارجي عملي يربط الطلاب مباشرة بالعالم الطبيعي.',
  },
  'yre': {
    en: 'Equipping young people aged 11–25 to investigate environmental issues and share solutions through journalism, photography, video, and podcasts.',
    ar: 'تمكين الشباب من 11 إلى 25 عاماً من استقصاء القضايا البيئية ومشاركة الحلول عبر الصحافة والتصوير والفيديو والبودكاست.',
  },
}

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
                ? 'تأسست مؤسسة التعليم البيئي عام 1981، وهي من أكبر منظمات التعليم البيئي في العالم، وتعمل عبر أكثر من 110 منظمة عضو في أكثر من 100 دولة. في الكويت، تُقدَّم برامج FEE الستة من قِبَل Academics، مشغّلها الوطني المعتمد — لربط المؤسسات الكويتية بمعايير الاعتماد البيئي المعترف بها عالمياً.'
                : 'Founded in 1981, the Foundation for Environmental Education is one of the world\'s largest environmental education organisations, working through 110+ member organisations across 100+ countries. In Kuwait, FEE\'s six programmes are delivered by Academics, its authorised National Operator — connecting Kuwaiti institutions to world-recognised environmental certification standards.'}
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
                {lang === 'ar' ? 'أربعة عقود من المعايير العالمية، بجذور كويتية' : 'Four Decades of Global Standards, Rooted in Kuwait'}
              </h2>
              <div className="space-y-4 text-gray text-sm leading-relaxed">
                {(lang === 'ar'
                  ? [
                      'لأكثر من أربعين عاماً، عملت مؤسسة التعليم البيئي على قناعة بسيطة: أن التعليم هو السبيل لجعل التغيير البيئي واقعاً دائماً. تأسست FEE عام 1981، وتضم اليوم أكثر من 110 منظمة عضو في أكثر من 100 دولة، ويقود عملها هدف واحد — إشراك الناس وتمكينهم عبر التعليم، بالشراكة مع الأعضاء حول العالم، نحو عالم مستدام يصنع فيه التعليم تغييراً إيجابياً للجميع.',
                      'تحمل برامج FEE الستة هذه الرسالة إلى الممارسة. أربعة منها تعليمية — Eco-Schools وEco-Campus وLEAF وYoung Reporters for the Environment — وتمكّن الشباب من مواجهة التحديات البيئية بنهج قائم على الحلول. واثنان معياران للتشغيل المستدام: Green Key للسياحة والضيافة، وBlue Flag للشواطئ والمراسي وقوارب السياحة. وتوجّه استراتيجية GAIA 20:30 البرامج الستة جميعها نحو العمل المناخي والتنوع البيولوجي والحد من التلوث البيئي.',
                      'انضمّت الكويت إلى هذه الشبكة العالمية عام 2023. ومع تقدّم البلاد نحو رؤية الكويت 2035 — مستقبل يقوم على التنويع الاقتصادي والتنمية المعرفية والنمو المستدام — لم تكن أهمية التعليم البيئي يوماً أكبر مما هي عليه الآن. فالتغيير الدائم لا يبدأ في وثائق السياسات، بل في العقول التي تتشكّل داخل المدارس والجامعات والمؤسسات.',
                      'يتولّى هذا العمل Academics، وهي استشارية كويتية تعليمية وبيئية، والمشغّل الوطني المعتمد لـ FEE في دولة الكويت. تتحمّل Academics مسؤولية تقديم برامج FEE وإدارتها وطنياً، وفق معايير FEE الدولية ومتطلبات الكويت التنظيمية — بترجمة الأطر العالمية إلى واقع يلائم بيئة الكويت وثقافتها وطموحاتها.',
                      'اليوم يمتد مجتمعنا المعتمد ليشمل مدارس وجامعات وشواطئ ومنشآت ضيافة في مختلف أنحاء البلاد — وهو في نموّ مستمر.',
                    ]
                  : [
                      'For more than forty years, the Foundation for Environmental Education has worked on a simple conviction: that education is how environmental change becomes real and lasting. Established in 1981, FEE today brings together over 110 member organisations in 100+ countries, and its work is guided by a single aim — to engage and empower people through education, in partnership with members worldwide, toward a sustainable world where education creates positive change for all.',
                      'FEE\'s six programmes carry that mission into practice. Four are educational — Eco-Schools, Eco-Campus, LEAF, and Young Reporters for the Environment — and empower young people to address environmental challenges through a solutions-based approach. Two are certification standards for sustainable operation: Green Key for tourism and hospitality, and Blue Flag for beaches, marinas, and tourism boats. FEE\'s GAIA 20:30 strategy directs all six toward climate action, biodiversity, and reducing environmental pollution.',
                      'Kuwait joined this global network in 2023. As the nation advances toward Kuwait Vision 2035 — a future built on economic diversification, knowledge-based development, and sustainable growth — the role of environmental education has never been more urgent. Lasting change begins not in policy documents, but in the minds shaped within schools, universities, and institutions.',
                      'That work is carried out by Academics, a Kuwaiti educational and environmental consultancy and FEE\'s authorised National Operator in the State of Kuwait. Academics is responsible for delivering and managing the FEE programmes nationally, in accordance with FEE\'s international standards and Kuwait\'s regulatory requirements — translating global frameworks into a reality suited to Kuwait\'s environment, culture, and ambitions.',
                      'Today our certified community spans schools, universities, beaches, and hospitality establishments across the country — and it continues to grow.',
                    ]
                ).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: '1981', label_en: 'Year Founded', label_ar: 'سنة التأسيس', color: '#52B788' },
                  { num: '110+', label_en: 'Member Organisations', label_ar: 'منظمة عضو', color: '#006994' },
                  { num: '100+', label_en: 'Countries', label_ar: 'دولة', color: '#C8A951' },
                  { num: '2023', label_en: 'Kuwait Joined', label_ar: 'انضمام الكويت', color: '#40916C' },
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

      {/* ── Our Values ───────────────────────────────────── */}
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
                  ? 'التغيير الحقيقي يبدأ بالتعليم والاعتراف والمجتمع.'
                  : 'Real change starts with education, recognition, and community.'}
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
                  ? 'برنامج لكل مؤسسة — مدرسة أو جامعة أو شاطئ أو فندق.'
                  : 'A programme for every institution — school, university, beach, or hotel.'}
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROGRAMMES.map((prog, i) => {
              const Icon = ICON_MAP[prog.icon] ?? Leaf
              const blurb = PROG_DESC[prog.id]
              return (
                <FadeInSection key={prog.id} delay={i * 0.08}>
                  <Link
                    href={`/programmes/${prog.id}`}
                    className="card p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-transform duration-200 block"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden bg-white"
                      style={{ border: `1px solid ${prog.color}30` }}
                    >
                      {prog.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={prog.logo} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <Icon className="w-5 h-5" style={{ color: prog.color }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-forest text-base mb-1 group-hover:text-brand transition-colors">
                        {lang === 'ar' ? prog.name_ar : prog.name_en}
                      </h3>
                      <p className="text-gray text-sm leading-relaxed">
                        {blurb ? (lang === 'ar' ? blurb.ar : blurb.en) : (lang === 'ar' ? prog.description_ar : prog.description_en)}
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
                  ? 'مؤسسة التعليم البيئي منظمة دولية غير حكومية تأسست عام 1981، تُدار من قِبَل أعضائها الوطنيين وتتمتع بمكانة استشارية لدى اليونسكو وبرنامج الأمم المتحدة للبيئة. وAcademics هي المشغّل الوطني المعتمد لـ FEE في دولة الكويت، المسؤول عن تقديم برامج FEE الستة جميعها وطنياً.'
                  : 'The Foundation for Environmental Education is an international non-governmental organisation established in 1981, run by its national members and holding consultative status with UNESCO and UNEP. Academics is FEE\'s authorised National Operator in the State of Kuwait, responsible for delivering all six FEE programmes nationally.'}
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { n: '1981', l_en: 'Established', l_ar: 'التأسيس' },
                  { n: '110+', l_en: 'Member Orgs', l_ar: 'منظمة عضو' },
                  { n: '100+', l_en: 'Countries', l_ar: 'دولة' },
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

      {/* ── Delivered by Academics ───────────────────────── */}
      <section className="section-white py-24">
        <div className="container-fee max-w-4xl">
          <FadeInSection>
            <div className="text-center mb-10">
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'المشغّل الوطني' : 'National Operator'}
              </span>
              <h2 className="section-heading flex items-center justify-center gap-3">
                <Building2 className="w-7 h-7" style={{ color: '#40916C' }} />
                {lang === 'ar' ? 'يُقدَّم في الكويت من قِبَل Academics' : 'Delivered in Kuwait by Academics'}
              </h2>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <div className="space-y-4 text-gray text-sm leading-relaxed">
              {(lang === 'ar'
                ? [
                    'Academics استشارية كويتية متخصصة في التطوير التعليمي والاستدامة البيئية، والمشغّل الوطني المعتمد لـ FEE في دولة الكويت. تعمل مع المدارس والجامعات والجهات الحكومية ومنشآت الضيافة في الكويت والخليج لبناء مؤسسات متميزة أكاديمياً، واعية بيئياً، ومسؤولة عالمياً.',
                    'بصفتها المشغّل الوطني، تدير Academics رحلة الاعتماد الكاملة — من التقديم ومراجعة الأدلة، مروراً بالتدقيق المستقل، وصولاً إلى الاعتماد — وفق معايير FEE الدولية. وإلى جانب البرامج، تقدّم استشارات في بناء القدرات المؤسسية والتدريب المهني والاستشارات المتعلقة بالسياسات.',
                    'هذه البرامج ليست مجرد شهادات، بل أُطُر للتحوّل: عمليات منهجية تنقل المؤسسات من الوعي إلى العمل، ومن النية إلى أثر مُتحقَّق منه.',
                  ]
                : [
                    'Academics is a Kuwaiti consultancy specialising in educational development and environmental sustainability, and FEE\'s authorised National Operator in the State of Kuwait. It works with schools, universities, governmental bodies, and hospitality establishments across Kuwait and the wider Gulf to build institutions that are academically excellent, environmentally conscious, and globally responsible.',
                    'As National Operator, Academics manages the full certification journey — from application and evidence review through independent audit to certification — in accordance with FEE\'s international standards. Beyond the programmes, it provides consultancy in institutional capacity building, professional training, and policy advisory.',
                    'These programmes are not simply certifications. They are frameworks for transformation: systematic processes that move institutions from awareness to action, and from intention to verified impact.',
                  ]
              ).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────── */}
      <section className="section-pale py-24">
        <div className="container-fee">
          <FadeInSection>
            <div className="text-center mb-14">
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'فريقنا' : 'Our Team'}
              </span>
              <h2 className="section-heading">
                {lang === 'ar' ? 'القيادة والإدارة' : 'Leadership & Management'}
              </h2>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 gap-6 max-w-xs mx-auto">
            {TEAM.map((member, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="card p-8 text-center flex flex-col items-center">
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photo}
                      alt={lang === 'ar' ? member.name_ar : member.name_en}
                      className="w-24 h-24 rounded-full object-cover mb-4"
                      style={{ boxShadow: `0 0 0 3px #fff, 0 0 0 5px ${member.color}` }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4"
                      style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}99)` }}
                    >
                      {member.initials}
                    </div>
                  )}
                  <h3 className="font-bold text-forest text-base mb-0.5">
                    {lang === 'ar' ? member.name_ar : member.name_en}
                  </h3>
                  <p className="text-gray text-sm">
                    {lang === 'ar' ? member.role_ar : member.role_en}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="section-white py-20">
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
