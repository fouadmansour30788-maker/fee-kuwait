'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ArrowLeft, Eye, Target, ListChecks, Gem, BookOpenText, HeartHandshake, Quote,
  GraduationCap, Leaf, Lightbulb, Presentation, FlaskConical, Scale, Globe2, RotateCcw, School, Building, KeyRound,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'

type L = 'en' | 'ar'
const t = (lang: L, en: string, ar: string) => (lang === 'ar' ? ar : en)

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function SectionLabel({ n, Icon, children }: { n: string; Icon: typeof Eye; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-xs font-bold tracking-[0.3em]" style={{ color: '#2D9A6E' }}>{n}</span>
      <span className="h-px w-8" style={{ background: '#2D9A6E' }} />
      <Icon className="w-5 h-5" style={{ color: '#1B6E54' }} />
      <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#14342A' }}>{children}</h2>
    </div>
  )
}

// ── Content (Academics Company Identity Document) ─────────────────────────
const PROGRAMMES = [
  { en: 'Eco-Schools', ar: 'المدارس البيئية', sub_en: 'Primary & Secondary', sub_ar: 'الابتدائي والثانوي', bg: '#E3F4EE', fg: '#1B6E54' },
  { en: 'Eco-Campus', ar: 'الحرم البيئي', sub_en: 'Higher Education', sub_ar: 'التعليم العالي', bg: '#E6EEF8', fg: '#2563A8' },
  { en: 'Green Key', ar: 'المفتاح الأخضر', sub_en: 'Tourism & Hospitality', sub_ar: 'السياحة والضيافة', bg: '#EAF3E0', fg: '#3F6F1F' },
  { en: 'Young Reporters for the Environment', ar: 'المراسلون الشباب من أجل البيئة', sub_en: 'Youth journalism', sub_ar: 'صحافة الشباب', bg: '#E3F4EE', fg: '#1B6E54' },
  { en: 'LEAF', ar: 'LEAF', sub_en: 'Learning about Forests', sub_ar: 'التعلّم عن الغابات', bg: '#E6EEF8', fg: '#2563A8' },
  { en: 'Blue Flag', ar: 'العلم الأزرق', sub_en: 'Beaches & marinas', sub_ar: 'الشواطئ والمراسي', bg: '#EAF3E0', fg: '#3F6F1F' },
]

const DELIVERED = [
  { Icon: School, en: 'Eco-Schools', ar: 'المدارس البيئية', color: '#1B6E54',
    d_en: 'Student-led sustainability action in primary, complementary, and secondary schools.',
    d_ar: 'عمل طلابي نحو الاستدامة في المدارس الابتدائية والمتوسطة والثانوية.' },
  { Icon: Building, en: 'Eco-Campus', ar: 'الحرم البيئي', color: '#2563A8',
    d_en: 'Environmental governance and culture in higher-education institutions.',
    d_ar: 'حوكمة وثقافة بيئية في مؤسسات التعليم العالي.' },
  { Icon: KeyRound, en: 'Green Key', ar: 'المفتاح الأخضر', color: '#3F6F1F',
    d_en: 'Responsible environmental practices in tourism and hospitality establishments.',
    d_ar: 'ممارسات بيئية مسؤولة في منشآت السياحة والضيافة.' },
]

const OBJECTIVES = [
  { Icon: GraduationCap, en: 'Provide expert consultancy in educational development and institutional capacity building to schools and higher-education institutions.',
    ar: 'تقديم استشارات متخصصة في التطوير التعليمي وبناء القدرات المؤسسية للمدارس ومؤسسات التعليم العالي.' },
  { Icon: Leaf, en: 'Deliver and manage the FEE programmes — Eco-Schools, Eco-Campus, and Green Key — in accordance with FEE standards and national regulatory requirements.',
    ar: 'تقديم برامج FEE وإدارتها — المدارس البيئية والحرم البيئي والمفتاح الأخضر — وفق معايير FEE والمتطلبات التنظيمية الوطنية.' },
  { Icon: Lightbulb, en: 'Promote environmental literacy, sustainability governance, and ecological responsibility across educational and commercial institutions.',
    ar: 'تعزيز الثقافة البيئية وحوكمة الاستدامة والمسؤولية البيئية في المؤسسات التعليمية والتجارية.' },
  { Icon: Presentation, en: 'Design and deliver professional training, workshops, and capacity-building programmes in general environmental topics for educators, environmental officers, and institutional leadership.',
    ar: 'تصميم وتقديم التدريب المهني وورش العمل وبرامج بناء القدرات في الموضوعات البيئية للمعلمين والمسؤولين البيئيين والقيادات المؤسسية.' },
  { Icon: FlaskConical, en: 'Conduct applied research and publish knowledge resources on Eco-Schools best practices in environmental education, green campus management, and sustainable tourism.',
    ar: 'إجراء البحوث التطبيقية ونشر الموارد المعرفية حول أفضل ممارسات المدارس البيئية في التعليم البيئي وإدارة الحرم الأخضر والسياحة المستدامة.' },
  { Icon: Scale, en: 'Advocate for policy frameworks that embed environmental education and sustainability standards within national educational and institutional governance systems.',
    ar: 'الدعوة إلى أطر سياسات تُدمج التعليم البيئي ومعايير الاستدامة في أنظمة الحوكمة التعليمية والمؤسسية الوطنية.' },
]

const VALUES = [
  { en: 'Environmental Stewardship', ar: 'الرعاية البيئية', bg: '#E3F4EE', fg: '#1E9E6E',
    d_en: 'We act as custodians of the natural world, embedding ecological responsibility into every programme, partnership, and institution we serve.',
    d_ar: 'نعمل أمناء على العالم الطبيعي، ونُدمج المسؤولية البيئية في كل برنامج وشراكة ومؤسسة نخدمها.' },
  { en: 'Academic Integrity', ar: 'النزاهة الأكاديمية', bg: '#E6EEF8', fg: '#2563A8',
    d_en: 'Our work is grounded in evidence, rigour, and honesty. We uphold the highest professional standards in educational and environmental consultancy.',
    d_ar: 'يقوم عملنا على الأدلة والدقة والأمانة، ونلتزم بأعلى المعايير المهنية في الاستشارات التعليمية والبيئية.' },
  { en: 'Community Impact', ar: 'الأثر المجتمعي', bg: '#EAF3E0', fg: '#5E9B2F',
    d_en: 'We believe change begins in the classroom and extends into the community. Our work creates ripple effects that benefit families, institutions, and society at large.',
    d_ar: 'نؤمن بأن التغيير يبدأ في الفصل الدراسي ويمتد إلى المجتمع، فيُحدث عملنا أثراً متسعاً يعود بالنفع على الأسر والمؤسسات والمجتمع.' },
  { en: 'Global Standards, Local Relevance', ar: 'معايير عالمية بملاءمة محلية', bg: '#ECEBFA', fg: '#5B4DB8',
    d_en: 'We connect institutions to internationally recognised frameworks while honouring the cultural context, priorities, and aspirations of Kuwait and the Gulf region.',
    d_ar: 'نربط المؤسسات بأطر معترف بها دولياً مع احترام السياق الثقافي وأولويات الكويت ومنطقة الخليج وتطلعاتهما.' },
  { en: 'Innovation in Education', ar: 'الابتكار في التعليم', bg: '#F8EBE6', fg: '#A23B1E',
    d_en: 'We challenge the ordinary, embracing new pedagogical approaches, technology, and cross-sector collaboration to keep learning purposeful and forward-looking.',
    d_ar: 'نتجاوز المألوف بتبنّي مناهج تربوية جديدة والتقنية والتعاون بين القطاعات، ليبقى التعلّم هادفاً ومتطلعاً إلى المستقبل.' },
  { en: 'Accountability & Transparency', ar: 'المساءلة والشفافية', bg: '#FBF1E1', fg: '#C07A12',
    d_en: 'We measure what we promise. Every certification and programme we manage is delivered with full transparency to institutions, partners, and regulators.',
    d_ar: 'نقيس ما نَعِد به؛ فكل اعتماد وبرنامج نديره يُقدَّم بشفافية كاملة للمؤسسات والشركاء والجهات التنظيمية.' },
]

// Value card that flips on hover (pointer devices), focus or tap.
function ValueCard({ v, i, lang }: { v: (typeof VALUES)[number]; i: number; lang: L }) {
  const [flipped, setFlipped] = useState(false)
  const face: React.CSSProperties = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: 20 }
  return (
    <button type="button" onClick={() => setFlipped((f) => !f)} onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)}
      onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)} aria-pressed={flipped}
      className="relative w-full h-56 text-start outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-[20px]" style={{ perspective: 1000 }}>
      <motion.div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <div style={{ ...face, background: v.bg, border: `1px solid ${v.fg}33` }} className="p-6 flex flex-col">
          <span className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-extrabold text-white" style={{ background: v.fg }}>{String(i + 1).padStart(2, '0')}</span>
          <p className="mt-auto text-xl font-bold leading-snug" style={{ color: v.fg }}>{t(lang, v.en, v.ar)}</p>
          <p className="text-xs mt-2 inline-flex items-center gap-1" style={{ color: `${v.fg}AA` }}><RotateCcw className="w-3 h-3" /> {t(lang, 'Hover or tap to read', 'مرّر أو اضغط للقراءة')}</p>
        </div>
        <div style={{ ...face, background: v.fg, transform: 'rotateY(180deg)' }} className="p-6 flex flex-col justify-center">
          <p className="text-sm font-bold text-white/80 mb-2">{t(lang, v.en, v.ar)}</p>
          <p className="text-[15px] leading-relaxed text-white">{t(lang, v.d_en, v.d_ar)}</p>
        </div>
      </motion.div>
    </button>
  )
}

export default function AcademicsPage() {
  const { lang: rawLang } = useLang()
  const lang = (rawLang === 'ar' ? 'ar' : 'en') as L
  const [openObj, setOpenObj] = useState<number | null>(0)
  const word = 'ACADEMICS'.split('')

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="section-forest py-24 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(82,183,136,0.18),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(37,99,168,0.14),transparent_50%)] pointer-events-none" />
        <div className="container-fee relative z-10 text-center max-w-4xl">
          <Link href="/about" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-8">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t(lang, 'Back to About', 'العودة إلى من نحن')}
          </Link>
          <h1 className="flex justify-center flex-wrap gap-x-2 md:gap-x-4 text-5xl md:text-7xl font-extrabold text-white" dir="ltr" aria-label="Academics">
            {word.map((c, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 40, rotateX: -90 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}>{c}</motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }}
            className="text-xl md:text-2xl font-semibold mt-6" style={{ color: '#74C69D' }}>
            {t(lang, 'Educational & Environmental Consultancy', 'استشارات تعليمية وبيئية')}
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.6 }}
            className="text-white/55 italic mt-2">
            {t(lang, 'Authorised National Operator — Foundation for Environmental Education (FEE) · Kuwait', 'المشغّل الوطني المعتمد — مؤسسة التعليم البيئي (FEE) · الكويت')}
          </motion.p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img src="/academics-logo.png" alt="Academics" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3, duration: 0.6 }}
            className="h-16 md:h-20 w-auto mx-auto mt-10 rounded-xl bg-white px-5 py-3" />
        </div>
      </section>

      {/* ── Programme tiles ──────────────────────────────── */}
      <section className="section-white py-16">
        <div className="container-fee max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROGRAMMES.map((p, i) => (
              <Reveal key={p.en} delay={i * 0.06}>
                <motion.div whileHover={{ y: -6, boxShadow: `0 14px 30px ${p.fg}26` }} className="rounded-2xl p-5 h-full text-center" style={{ background: p.bg, border: `1px solid ${p.fg}22` }}>
                  <p className="font-bold text-lg leading-tight" style={{ color: p.fg }}>{t(lang, p.en, p.ar)}</p>
                  <p className="text-sm mt-1" style={{ color: `${p.fg}BB` }}>{t(lang, p.sub_en, p.sub_ar)}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 01 Vision ────────────────────────────────────── */}
      <section className="section-pale py-20">
        <div className="container-fee max-w-4xl">
          <Reveal><SectionLabel n="01" Icon={Eye}>{t(lang, 'Vision', 'الرؤية')}</SectionLabel></Reveal>
          <Reveal delay={0.1}>
            <div className="relative rounded-3xl p-8 md:p-12 bg-white" style={{ boxShadow: '0 20px 50px rgba(27,110,84,0.10)' }}>
              <Quote className="absolute -top-5 left-8 rtl:left-auto rtl:right-8 w-10 h-10 p-2 rounded-xl text-white" style={{ background: '#1B6E54' }} />
              <p className="text-xl md:text-2xl leading-relaxed font-medium" style={{ color: '#14342A' }}>
                {t(lang,
                  'To be the leading consultancy bridging academic excellence and environmental stewardship by empowering institutions at every level to educate, act, and lead in building a sustainable future for the Kuwaiti community.',
                  'أن نكون الاستشارية الرائدة التي تجمع بين التميّز الأكاديمي والرعاية البيئية، بتمكين المؤسسات على كل المستويات من التعليم والعمل والقيادة في بناء مستقبل مستدام للمجتمع الكويتي.')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 02 Mission ───────────────────────────────────── */}
      <section className="section-white py-20">
        <div className="container-fee max-w-5xl">
          <Reveal><SectionLabel n="02" Icon={Target}>{t(lang, 'Mission Statement', 'بيان الرسالة')}</SectionLabel></Reveal>
          <Reveal delay={0.05}>
            <p className="text-gray leading-relaxed max-w-3xl">
              {t(lang,
                'Academics provides specialist consultancy in education and environmental sustainability, guiding schools, universities, and hospitality organisations to integrate environmental values into their culture, governance, and practice. As an authorised operator of the Foundation for Environmental Education (FEE), the world’s largest environmental education organisation, we deliver three internationally recognised certification programmes in Kuwait:',
                'تقدّم Academics استشارات متخصصة في التعليم والاستدامة البيئية، وتوجّه المدارس والجامعات ومؤسسات الضيافة نحو دمج القيم البيئية في ثقافتها وحوكمتها وممارساتها. وبصفتها مشغّلاً معتمداً لمؤسسة التعليم البيئي (FEE)، أكبر منظمة للتعليم البيئي في العالم، تقدّم ثلاثة برامج اعتماد معترف بها دولياً في الكويت:')}
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {DELIVERED.map((d, i) => (
              <Reveal key={d.en} delay={0.1 + i * 0.1}>
                <motion.div whileHover={{ y: -6 }} className="rounded-2xl p-6 h-full border bg-white" style={{ borderColor: `${d.color}33`, borderTop: `4px solid ${d.color}` }}>
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${d.color}14` }}>
                    <d.Icon className="w-5 h-5" style={{ color: d.color }} />
                  </span>
                  <p className="text-lg font-bold" style={{ color: d.color }}>{t(lang, d.en, d.ar)}</p>
                  <p className="text-sm text-gray mt-1.5 leading-relaxed">{t(lang, d.d_en, d.d_ar)}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="mt-8 text-lg font-semibold leading-relaxed max-w-3xl" style={{ color: '#1B6E54' }}>
              {t(lang,
                'These programmes are not simply certifications — they are frameworks for transformation that move institutions from awareness to action, and from intention to verified sustainable impact.',
                'هذه البرامج ليست مجرد شهادات، بل أُطُر للتحوّل تنقل المؤسسات من الوعي إلى العمل، ومن النية إلى أثر مستدام مُتحقَّق منه.')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 03 Statutory objectives ──────────────────────── */}
      <section className="section-cream py-20">
        <div className="container-fee max-w-5xl">
          <Reveal><SectionLabel n="03" Icon={ListChecks}>{t(lang, 'Statutory Objectives', 'الأهداف النظامية')}</SectionLabel></Reveal>
          <div className="grid md:grid-cols-2 gap-3">
            {OBJECTIVES.map((o, i) => {
              const open = openObj === i
              return (
                <Reveal key={i} delay={i * 0.05}>
                  <button type="button" onClick={() => setOpenObj(open ? null : i)} aria-expanded={open}
                    className="w-full text-start rounded-2xl p-5 bg-white border transition-all"
                    style={{ borderColor: open ? '#2D9A6E' : '#E2EDE5', boxShadow: open ? '0 10px 28px rgba(45,154,110,0.14)' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: open ? '#2D9A6E' : '#E3F4EE' }}>
                        <o.Icon className="w-5 h-5" style={{ color: open ? '#fff' : '#1B6E54' }} />
                      </span>
                      <span className="text-2xl font-extrabold" style={{ color: open ? '#2D9A6E' : '#B7D9C8' }}>{i + 1}</span>
                      <span className="text-sm font-semibold flex-1 line-clamp-1" style={{ color: '#14342A', display: open ? 'none' : undefined }}>{t(lang, o.en, o.ar)}</span>
                    </div>
                    <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} className="overflow-hidden">
                      <p className="text-[15px] leading-relaxed mt-3" style={{ color: '#334155' }}>{t(lang, o.en, o.ar)}</p>
                    </motion.div>
                  </button>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 04 Core values ───────────────────────────────── */}
      <section className="section-white py-20">
        <div className="container-fee max-w-5xl">
          <Reveal><SectionLabel n="04" Icon={Gem}>{t(lang, 'Core Values', 'القيم الجوهرية')}</SectionLabel></Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES.map((v, i) => <Reveal key={v.en} delay={i * 0.06}><ValueCard v={v} i={i} lang={lang} /></Reveal>)}
          </div>
        </div>
      </section>

      {/* ── 05 Founding narrative ────────────────────────── */}
      <section className="section-pale py-20">
        <div className="container-fee max-w-4xl">
          <Reveal><SectionLabel n="05" Icon={BookOpenText}>{t(lang, 'Founding Narrative — About Us', 'قصة التأسيس — من نحن')}</SectionLabel></Reveal>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { big: '2035', l_en: 'Aligned with Kuwait Vision 2035', l_ar: 'متوافقة مع رؤية الكويت 2035' },
              { big: '90+', l_en: 'Countries in FEE’s global network', l_ar: 'دولة في شبكة FEE العالمية' },
            ].map((s, i) => (
              <Reveal key={s.big} delay={i * 0.1}>
                <div className="rounded-2xl p-6 text-center bg-white" style={{ boxShadow: '0 10px 30px rgba(27,110,84,0.08)' }}>
                  <p className="text-5xl font-extrabold" style={{ color: '#1B6E54' }}>{s.big}</p>
                  <p className="text-sm mt-1 text-gray">{t(lang, s.l_en, s.l_ar)}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="space-y-5 text-[15px] leading-relaxed" style={{ color: '#334155' }}>
            <Reveal><p>{t(lang,
              'Kuwait stands at a pivotal moment. As the nation charts its course toward Kuwait Vision 2035 — a future defined by economic diversification, knowledge-based development, and sustainable growth — the role of education and environmental awareness has never been more urgent. It is from this conviction that Academics was founded.',
              'تقف الكويت عند لحظة محورية. فمع رسم الدولة مسارها نحو رؤية الكويت 2035 — مستقبلٌ يقوم على التنويع الاقتصادي والتنمية القائمة على المعرفة والنمو المستدام — لم يكن دور التعليم والوعي البيئي يوماً أكثر إلحاحاً. ومن هذه القناعة تأسست Academics.')}</p></Reveal>
            <Reveal>
              <blockquote className="border-s-4 ps-5 py-1 text-xl italic font-serif" style={{ borderColor: '#2D9A6E', color: '#1B6E54' }}>
                {t(lang,
                  'We were established on the belief that the most lasting change begins not in policy documents, but in the minds shaped within our schools, universities, and institutions.',
                  'تأسسنا على إيمان بأن التغيير الأكثر رسوخاً لا يبدأ في وثائق السياسات، بل في العقول التي تتشكّل داخل مدارسنا وجامعاتنا ومؤسساتنا.')}
              </blockquote>
            </Reveal>
            <Reveal><p>{t(lang,
              'Academics is a Kuwaiti consultancy specialising in educational development and environmental sustainability. We work with schools, universities, governmental bodies, hospitality establishments, and organisations across Kuwait and the wider Gulf region to build institutions that are not only academically excellent, but environmentally conscious and globally responsible.',
              'Academics استشارية كويتية متخصصة في التطوير التعليمي والاستدامة البيئية. نعمل مع المدارس والجامعات والجهات الحكومية ومنشآت الضيافة والمؤسسات في الكويت ومنطقة الخليج لبناء مؤسسات ليست متميزة أكاديمياً فحسب، بل واعية بيئياً ومسؤولة عالمياً.')}</p></Reveal>
            <Reveal><p>{t(lang,
              'As an authorised national operator of the Foundation for Environmental Education (FEE), the world’s largest environmental education organisation, we manage three internationally recognised certification programmes in Kuwait. Through them, Academics connects Kuwait’s educational and commercial landscape to a global network of over 90 countries committed to the same green future.',
              'وبصفتنا مشغّلاً وطنياً معتمداً لمؤسسة التعليم البيئي (FEE)، أكبر منظمة للتعليم البيئي في العالم، ندير ثلاثة برامج اعتماد معترف بها دولياً في الكويت. ومن خلالها تربط Academics المشهد التعليمي والتجاري في الكويت بشبكة عالمية تضم أكثر من 90 دولة ملتزمة بالمستقبل الأخضر نفسه.')}</p></Reveal>
            <Reveal><p>{t(lang,
              'Beyond the FEE programmes, we offer specialist consultancy in institutional capacity building, professional training, and policy advisory — serving as a trusted partner to institutions navigating the complex intersection of education and sustainability.',
              'وإلى جانب برامج FEE، نقدّم استشارات متخصصة في بناء القدرات المؤسسية والتدريب المهني والاستشارات المتعلقة بالسياسات — شريكاً موثوقاً للمؤسسات في تقاطع التعليم والاستدامة.')}</p></Reveal>
            <Reveal>
              <p className="text-lg font-semibold" style={{ color: '#14342A' }}>{t(lang,
                'We are Kuwaiti in our roots, global in our standards, and unwavering in our purpose: to build the knowledge, the capacity, and the culture that Kuwait needs to thrive for every generation to come.',
                'نحن كويتيون في جذورنا، عالميون في معاييرنا، وثابتون في غايتنا: بناء المعرفة والقدرات والثقافة التي تحتاجها الكويت لتزدهر لكل الأجيال القادمة.')}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 06 Equality, inclusion & democratic values ───── */}
      <section className="section-forest py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(82,183,136,0.14),transparent_60%)] pointer-events-none" />
        <div className="container-fee max-w-4xl relative z-10">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold tracking-[0.3em]" style={{ color: '#74C69D' }}>06</span>
              <span className="h-px w-8" style={{ background: '#74C69D' }} />
              <HeartHandshake className="w-5 h-5" style={{ color: '#74C69D' }} />
              <h2 className="text-2xl md:text-3xl font-bold text-white">{t(lang, 'Equality, Inclusion & Democratic Values', 'المساواة والشمول والقيم الديمقراطية')}</h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-white/75 leading-relaxed">{t(lang,
              'Academics is a proudly democratic company, founded on the principles of openness, respect, and equal opportunity. We are unconditionally open to all individuals regardless of race, ethnicity, religion, gender, nationality, or background — whether as employees, partners, clients, or beneficiaries of the programmes we manage.',
              'Academics شركة ديمقراطية بفخر، قائمة على مبادئ الانفتاح والاحترام وتكافؤ الفرص. نحن منفتحون دون قيد على جميع الأفراد بغض النظر عن العِرق أو الأصل أو الدين أو الجنس أو الجنسية أو الخلفية — موظفين كانوا أو شركاء أو عملاء أو مستفيدين من البرامج التي نديرها.')}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-2xl md:text-3xl font-serif italic my-8 leading-snug" style={{ color: '#B7E4C7' }}>
              “{t(lang, 'We believe that diversity of perspective is not merely a value to be stated, but a strength to be actively cultivated.', 'نؤمن بأن تنوّع وجهات النظر ليس مجرد قيمة تُعلَن، بل قوة يجب رعايتها بفاعلية.')}”
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-white/75 leading-relaxed">{t(lang,
              'Every voice within our team is heard, every contribution respected, and every individual treated with dignity and fairness. In all our operations — from the management of FEE programmes to the delivery of consultancy services — Academics is committed to creating spaces where people of all backgrounds can learn, lead, and thrive together.',
              'يُسمع كل صوت في فريقنا، ويُحترم كل إسهام، ويُعامل كل فرد بكرامة وإنصاف. وفي جميع أعمالنا — من إدارة برامج FEE إلى تقديم الخدمات الاستشارية — تلتزم Academics بخلق مساحات يتعلّم فيها الناس من جميع الخلفيات ويقودون ويزدهرون معاً.')}</p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="flex flex-wrap gap-3 mt-10">
              <Link href="/programmes" className="btn-primary inline-flex items-center gap-2">
                <Globe2 className="w-4 h-4" /> {t(lang, 'Explore the programmes', 'استكشف البرامج')}
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/25 hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t(lang, 'Back to About', 'العودة إلى من نحن')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
