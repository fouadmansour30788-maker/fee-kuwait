'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  ArrowRight, CheckCircle2, ClipboardList, SearchCheck, BadgeCheck,
  School, Waves, KeyRound, Leaf, Newspaper, GraduationCap,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { getProgramme } from '@/lib/utils/programmes'
import type { Programme } from '@/types'

const ICON_MAP: Record<string, React.ElementType> = {
  School, Waves, KeyRound, Leaf, Newspaper, GraduationCap,
}

interface ProgrammeContent {
  what_en: string; what_ar: string
  benefits_en: string[]; benefits_ar: string[]
  eligibility_en: string[]; eligibility_ar: string[]
  badge_en: string; badge_ar: string
  who_en: string; who_ar: string
  apply_link: string
}

const CONTENT: Record<Programme, ProgrammeContent> = {
  'eco-schools': {
    badge_en: 'Green Flag', badge_ar: 'العلم الأخضر',
    who_en: 'Schools — Primary, Secondary & International', who_ar: 'المدارس — الابتدائية والثانوية والدولية',
    what_en: 'Eco-Schools is the world\'s largest environmental education programme, empowering schools to take meaningful action on environmental issues. Students become environmental stewards, driving real change in their school and community through a proven seven-step process that leads to the iconic Green Flag award.',
    what_ar: 'المدارس البيئية هي أكبر برنامج تعليم بيئي في العالم، تمكّن المدارس من اتخاذ إجراءات فعلية بشأن القضايا البيئية. يصبح الطلاب حراساً بيئيين، ويقودون تغييراً حقيقياً في مدارسهم ومجتمعاتهم من خلال عملية مؤلفة من سبع خطوات مثبتة تؤدي إلى جائزة العلم الأخضر الشهيرة.',
    benefits_en: [
      'Official Green Flag certification recognised globally',
      'Enhanced environmental curriculum across all subjects',
      'Student-led eco-committee and action plans',
      'Improved school environment and biodiversity',
      'Community engagement and parent involvement',
      'Connection to a global network of eco-schools',
    ],
    benefits_ar: [
      'شهادة العلم الأخضر الرسمية المعترف بها عالمياً',
      'منهج بيئي محسّن عبر جميع المواد',
      'لجنة بيئية بقيادة الطلاب وخطط عمل',
      'تحسين البيئة المدرسية والتنوع البيولوجي',
      'مشاركة المجتمع وإشراك أولياء الأمور',
      'ارتباط بشبكة عالمية من المدارس البيئية',
    ],
    eligibility_en: ['Primary schools (Grades 1–6)', 'Secondary schools (Grades 7–12)', 'International schools', 'Public and private schools'],
    eligibility_ar: ['المدارس الابتدائية (الصفوف 1–6)', 'المدارس الثانوية (الصفوف 7–12)', 'المدارس الدولية', 'المدارس الحكومية والخاصة'],
    apply_link: '/register?type=school&programme=eco-schools',
  },
  'blue-flag': {
    badge_en: 'Blue Flag', badge_ar: 'العلم الأزرق',
    who_en: 'Beaches, Marinas & Sustainable Boating Operators', who_ar: 'الشواطئ والمراسي ومشغلو القوارب المستدامة',
    what_en: 'Blue Flag is one of the world\'s most recognised voluntary eco-labels awarded to beaches, marinas and sustainable boating tourism operators. Strict criteria covering water quality, environmental education, safety, and environmental management must all be met for Blue Flag to be awarded and maintained each year.',
    what_ar: 'العلم الأزرق هو أحد أكثر الشارات البيئية الطوعية شهرةً في العالم، يُمنح للشواطئ والمراسي ومشغلي السياحة البحرية المستدامة. يجب استيفاء معايير صارمة تشمل جودة المياه والتثقيف البيئي والسلامة والإدارة البيئية للحصول على العلم الأزرق والحفاظ عليه كل عام.',
    benefits_en: [
      'Internationally recognised Blue Flag certification',
      'Increased tourist footfall and international visibility',
      'Demonstrated commitment to water quality standards',
      'Enhanced safety measures and first aid facilities',
      'Access to the global Blue Flag network',
      'Annual renewal ensuring continued high standards',
    ],
    benefits_ar: [
      'شهادة العلم الأزرق المعترف بها دولياً',
      'زيادة حركة السياح والمرئية الدولية',
      'إثبات الالتزام بمعايير جودة المياه',
      'تعزيز إجراءات السلامة ومرافق الإسعافات الأولية',
      'الوصول إلى شبكة العلم الأزرق العالمية',
      'التجديد السنوي لضمان استمرار المعايير العالية',
    ],
    eligibility_en: ['Public beaches', 'Private beaches open to the public', 'Marina facilities', 'Sustainable boating tour operators'],
    eligibility_ar: ['الشواطئ العامة', 'الشواطئ الخاصة المفتوحة للعموم', 'مرافق المراسي', 'مشغلو جولات القوارب المستدامة'],
    apply_link: '/register?type=business&programme=blue-flag',
  },
  'green-key': {
    badge_en: 'Green Key Award', badge_ar: 'جائزة المفتاح الأخضر',
    who_en: 'Hotels, Restaurants, Campsites & Attractions', who_ar: 'الفنادق والمطاعم ومخيمات التخييم والمعالم السياحية',
    what_en: 'Green Key is the leading standard for excellence in responsible operation for the tourism and hospitality industry. It is a voluntary eco-label awarded to businesses that meet strict criteria for sustainability, responsible management, environmental policy and staff involvement.',
    what_ar: 'المفتاح الأخضر هو المعيار الرائد للتميز في التشغيل المسؤول في صناعة السياحة والضيافة. إنه شارة بيئية طوعية تُمنح للشركات التي تستوفي معايير صارمة للاستدامة والإدارة المسؤولة والسياسة البيئية ومشاركة الموظفين.',
    benefits_en: [
      'International Green Key certification and logo usage',
      'Attract environmentally-conscious guests and clients',
      'Cost savings through energy and water efficiency',
      'Staff engagement and sustainability culture',
      'Marketing advantage in the global eco-tourism market',
      'Annual audits maintaining consistently high standards',
    ],
    benefits_ar: [
      'شهادة المفتاح الأخضر الدولية واستخدام الشعار',
      'استقطاب الضيوف والعملاء المهتمين بالبيئة',
      'توفير التكاليف من خلال كفاءة الطاقة والمياه',
      'مشاركة الموظفين وثقافة الاستدامة',
      'ميزة تسويقية في سوق السياحة البيئية العالمية',
      'عمليات تدقيق سنوية للحفاظ على معايير عالية باستمرار',
    ],
    eligibility_en: ['Hotels and resorts (all star ratings)', 'Restaurants and cafes', 'Campsites and outdoor facilities', 'Conference and event centres', 'Tourist attractions'],
    eligibility_ar: ['الفنادق والمنتجعات (جميع التصنيفات النجمية)', 'المطاعم والمقاهي', 'مخيمات التخييم والمرافق الخارجية', 'مراكز المؤتمرات والفعاليات', 'المعالم السياحية'],
    apply_link: '/register?type=business&programme=green-key',
  },
  'leaf': {
    badge_en: 'LEAF Award', badge_ar: 'جائزة LEAF',
    who_en: 'Primary and Secondary Schools', who_ar: 'المدارس الابتدائية والثانوية',
    what_en: 'LEAF (Learning about Forests) is an international educational programme that connects school students with forests and the natural world. Through hands-on learning about trees, forests, biodiversity and environmental issues, LEAF helps students understand our deep relationship with forests and inspires them to take care of our natural world.',
    what_ar: 'LEAF (التعلم عن الغابات) هو برنامج تعليمي دولي يربط طلاب المدارس بالغابات والعالم الطبيعي. من خلال التعلم العملي عن الأشجار والغابات والتنوع البيولوجي والقضايا البيئية، يساعد LEAF الطلاب على فهم علاقتنا العميقة بالغابات ويلهمهم للاعتناء بعالمنا الطبيعي.',
    benefits_en: [
      'LEAF Award certification for the school',
      'Curriculum-linked forest and nature education resources',
      'Hands-on outdoor learning activities',
      'Student research and environmental projects',
      'Connection to international forest education community',
      'Environmental awareness beyond the classroom',
    ],
    benefits_ar: [
      'شهادة جائزة LEAF للمدرسة',
      'موارد تعليمية عن الغابات والطبيعة مرتبطة بالمناهج',
      'أنشطة تعلم عملية في الهواء الطلق',
      'أبحاث الطلاب والمشاريع البيئية',
      'الارتباط بمجتمع التعليم الغابوي الدولي',
      'الوعي البيئي خارج الفصل الدراسي',
    ],
    eligibility_en: ['Primary schools (Grades 1–6)', 'Secondary schools (Grades 7–12)', 'Both public and private schools'],
    eligibility_ar: ['المدارس الابتدائية (الصفوف 1–6)', 'المدارس الثانوية (الصفوف 7–12)', 'المدارس الحكومية والخاصة'],
    apply_link: '/register?type=school&programme=leaf',
  },
  'yre': {
    badge_en: 'YRE Award', badge_ar: 'جائزة YRE',
    who_en: 'Young People Aged 13–25', who_ar: 'الشباب من 13 إلى 25 عاماً',
    what_en: 'Young Reporters for the Environment (YRE) is an international programme that trains young people to investigate and report on local environmental issues through articles, photos and videos. YRE empowers youth to use the tools of journalism to raise awareness, spark debate and inspire environmental action in their communities.',
    what_ar: 'المراسلون الشباب للبيئة (YRE) هو برنامج دولي يدرّب الشباب على التحقيق في القضايا البيئية المحلية والإبلاغ عنها من خلال المقالات والصور ومقاطع الفيديو. يمكّن YRE الشباب من استخدام أدوات الصحافة لرفع مستوى الوعي وإثارة النقاش وإلهام العمل البيئي في مجتمعاتهم.',
    benefits_en: [
      'International YRE Award for winning entries',
      'Professional journalism and media skills training',
      'Environmental research and investigation skills',
      'Published work shared in the global YRE network',
      'Competition entries at national and international level',
      'Youth leadership and civic engagement experience',
    ],
    benefits_ar: [
      'جائزة YRE الدولية للمشاركات الفائزة',
      'تدريب على مهارات الصحافة والإعلام الاحترافي',
      'مهارات البحث والتحقيق البيئي',
      'نشر الأعمال في شبكة YRE العالمية',
      'مشاركات في المسابقات على المستوى الوطني والدولي',
      'خبرة في القيادة الشبابية والمشاركة المدنية',
    ],
    eligibility_en: ['Young people aged 13–25', 'School students', 'University students', 'Youth groups and environmental clubs'],
    eligibility_ar: ['الشباب من 13 إلى 25 عاماً', 'طلاب المدارس', 'طلاب الجامعات', 'مجموعات الشباب والأندية البيئية'],
    apply_link: '/register?type=school&programme=yre',
  },
  'eco-campus': {
    badge_en: 'Eco-Campus Flag', badge_ar: 'علم الحرم البيئي',
    who_en: 'Universities and Higher Education Institutions', who_ar: 'الجامعات ومؤسسات التعليم العالي',
    what_en: 'Eco-Campus is an international certification programme that recognises universities and colleges as leaders in environmental sustainability. It evaluates and certifies the environmental performance and educational impact of higher education institutions, connecting them to a global network of sustainable campuses.',
    what_ar: 'الحرم البيئي هو برنامج اعتماد دولي يعترف بالجامعات والكليات بوصفها رواداً في الاستدامة البيئية. يقيّم ويعتمد الأداء البيئي والأثر التعليمي لمؤسسات التعليم العالي، ويربطها بشبكة عالمية من الحرم الجامعي المستدام.',
    benefits_en: [
      'International Eco-Campus certification and flag',
      'Global recognition as a sustainability leader',
      'Improved environmental performance metrics',
      'Student and faculty engagement in sustainability',
      'Attract sustainability-focused students and staff',
      'Connection to global network of eco-universities',
    ],
    benefits_ar: [
      'شهادة الحرم البيئي الدولي وعلمه',
      'اعتراف عالمي كرائد في الاستدامة',
      'تحسين مقاييس الأداء البيئي',
      'مشاركة الطلاب وأعضاء هيئة التدريس في الاستدامة',
      'استقطاب الطلاب والموظفين المهتمين بالاستدامة',
      'الارتباط بشبكة عالمية من الجامعات البيئية',
    ],
    eligibility_en: ['Public universities', 'Private universities', 'Colleges and polytechnics', 'Other higher education institutions'],
    eligibility_ar: ['الجامعات الحكومية', 'الجامعات الخاصة', 'الكليات والمعاهد التقنية', 'مؤسسات التعليم العالي الأخرى'],
    apply_link: '/register?type=business&programme=eco-campus',
  },
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

export default function ProgrammeDetail({ programmeId }: { programmeId: Programme }) {
  const { lang } = useLang()
  const prog = getProgramme(programmeId)
  const content = CONTENT[programmeId]
  if (!prog || !content) return null

  const Icon = ICON_MAP[prog.icon] ?? Leaf

  return (
    <>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden" style={{ background: `linear-gradient(135deg, #071510 0%, ${prog.color}22 100%)` }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top right, ${prog.color}25, transparent 60%)` }} />
        <div className="container-fee relative z-10 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Link href="/programmes" className="inline-flex items-center gap-1.5 text-white/40 text-sm mb-8 hover:text-white/70 transition-colors">
              ← {lang === 'ar' ? 'جميع البرامج' : 'All Programmes'}
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${prog.color}20`, border: `1px solid ${prog.color}40` }}
              >
                <Icon className="w-8 h-8" style={{ color: prog.color }} />
              </div>
              <span
                className="text-sm font-bold px-4 py-1.5 rounded-full"
                style={{ color: prog.color, background: `${prog.color}15`, border: `1px solid ${prog.color}30` }}
              >
                {lang === 'ar' ? content.badge_ar : content.badge_en}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-4">
              {lang === 'ar' ? prog.name_ar : prog.name_en}
            </h1>
            <p className="text-white/50 text-base mb-8">
              {lang === 'ar' ? content.who_ar : content.who_en}
            </p>

            <Link
              href={content.apply_link}
              className="inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-2xl text-white text-base shadow-lg transition-all duration-200 hover:scale-[1.03]"
              style={{ background: prog.color }}
            >
              {lang === 'ar' ? 'ابدأ التقديم' : 'Start Application'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── What is it ─────────────────────────────────── */}
      <section className="section-white py-20">
        <div className="container-fee max-w-3xl">
          <FadeIn>
            <span className="badge-green mb-4 inline-block">
              {lang === 'ar' ? 'نظرة عامة' : 'Overview'}
            </span>
            <h2 className="section-heading mb-5">
              {lang === 'ar' ? `ما هو ${prog.name_ar}؟` : `What is ${prog.name_en}?`}
            </h2>
            <p className="text-gray text-base leading-relaxed">
              {lang === 'ar' ? content.what_ar : content.what_en}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────── */}
      <section className="section-pale py-20">
        <div className="container-fee">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'لماذا التقديم' : 'Why Apply'}
              </span>
              <h2 className="section-heading">
                {lang === 'ar' ? 'فوائد الاعتماد' : 'Benefits of Certification'}
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {(lang === 'ar' ? content.benefits_ar : content.benefits_en).map((benefit, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="flex items-start gap-3 p-5 card">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: prog.color }} />
                  <p className="text-charcoal text-sm leading-relaxed">{benefit}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Eligibility ────────────────────────────────── */}
      <section className="section-white py-20">
        <div className="container-fee max-w-3xl">
          <FadeIn>
            <span className="badge-green mb-4 inline-block">
              {lang === 'ar' ? 'من يمكنه التقديم' : 'Eligibility'}
            </span>
            <h2 className="section-heading mb-8">
              {lang === 'ar' ? 'من يمكنه التقديم؟' : 'Who Can Apply?'}
            </h2>
            <div className="flex flex-wrap gap-3">
              {(lang === 'ar' ? content.eligibility_ar : content.eligibility_en).map((e, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ color: prog.color, background: `${prog.color}12`, border: `1px solid ${prog.color}30` }}
                >
                  {e}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── How to Apply ───────────────────────────────── */}
      <section className="section-pale py-20">
        <div className="container-fee">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="badge-green mb-4 inline-block">
                {lang === 'ar' ? 'خطوات التقديم' : 'Application Process'}
              </span>
              <h2 className="section-heading">
                {lang === 'ar' ? 'كيف تتقدم بطلبك' : 'How to Apply'}
              </h2>
            </div>
          </FadeIn>

          <div className="relative max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: ClipboardList,
                  num: '01',
                  title_en: 'Register Online',
                  title_ar: 'التسجيل عبر الإنترنت',
                  desc_en: 'Create your account and complete the initial registration form with your institution details.',
                  desc_ar: 'أنشئ حسابك وأكمل استمارة التسجيل الأولية بتفاصيل مؤسستك.',
                },
                {
                  icon: SearchCheck,
                  num: '02',
                  title_en: 'Assessment',
                  title_ar: 'التقييم',
                  desc_en: 'Our team reviews your application and schedules a site visit to verify your environmental practices.',
                  desc_ar: 'يراجع فريقنا طلبك ويحدد موعد زيارة ميدانية للتحقق من ممارساتك البيئية.',
                },
                {
                  icon: BadgeCheck,
                  num: '03',
                  title_en: 'Get Certified',
                  title_ar: 'الحصول على الشهادة',
                  desc_en: 'Receive your official certification, flag, and join the global certified network.',
                  desc_ar: 'احصل على شهادتك وعلمك الرسمي وانضم إلى الشبكة المعتمدة العالمية.',
                },
              ].map((step, i) => {
                const StepIcon = step.icon
                return (
                  <FadeIn key={i} delay={i * 0.12}>
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-6">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center"
                          style={{ background: `${prog.color}12`, border: `2px solid ${prog.color}40` }}
                        >
                          <StepIcon className="w-9 h-9" style={{ color: prog.color }} />
                        </div>
                        <span
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                          style={{ background: prog.color }}
                        >
                          {step.num}
                        </span>
                      </div>
                      <h3 className="font-bold text-forest text-base mb-2">
                        {lang === 'ar' ? step.title_ar : step.title_en}
                      </h3>
                      <p className="text-gray text-sm leading-relaxed max-w-xs">
                        {lang === 'ar' ? step.desc_ar : step.desc_en}
                      </p>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden" style={{ background: prog.color }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_65%)] pointer-events-none" />
        <div className="container-fee relative z-10 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {lang === 'ar'
                ? `هل أنت مستعد للحصول على ${prog.name_ar}؟`
                : `Ready to earn your ${prog.name_en}?`}
            </h2>
            <p className="text-white/65 mb-10 max-w-xl mx-auto leading-relaxed">
              {lang === 'ar'
                ? 'انضم إلى مئات المؤسسات الكويتية التي حصلت بالفعل على الاعتماد الدولي.'
                : 'Join hundreds of Kuwaiti institutions that have already achieved international certification.'}
            </p>
            <Link
              href={content.apply_link}
              className="inline-flex items-center gap-2 px-9 py-4 bg-warmwhite font-bold rounded-2xl text-base transition-all duration-200 hover:scale-[1.03] shadow-lg"
              style={{ color: prog.color }}
            >
              {lang === 'ar' ? 'ابدأ التقديم الآن' : 'Apply Now'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
