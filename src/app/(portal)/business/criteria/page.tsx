'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Waves, Droplets, Leaf, Shield, Users, Info } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const CRITERIA_GROUPS = [
  {
    id: 'water',
    Icon: Droplets,
    color: '#006994',
    title_en: 'Water Quality',
    title_ar: 'جودة المياه',
    desc_en: 'Regular water quality testing meeting EU Bathing Water Directive standards.',
    desc_ar: 'اختبارات منتظمة لجودة المياه وفق معايير توجيه مياه الاستحمام الأوروبية.',
    criteria_en: [
      'Weekly water quality sampling during season',
      'Zero microbial contamination threshold',
      'pH levels between 6.5–8.5',
      'Visible depth ≥ 1 metre',
      'Annual water quality report submitted',
    ],
    criteria_ar: [
      'أخذ عينات أسبوعية خلال الموسم',
      'عدم تجاوز حد التلوث الميكروبي',
      'مستوى pH بين 6.5–8.5',
      'عمق رؤية ≥ متر واحد',
      'تقديم تقرير جودة المياه السنوي',
    ],
    done: [true, true, true, false, false],
  },
  {
    id: 'safety',
    Icon: Shield,
    color: '#C8A951',
    title_en: 'Safety & Services',
    title_ar: 'السلامة والخدمات',
    desc_en: 'Lifeguard presence, first aid, and emergency response provisions.',
    desc_ar: 'وجود منقذين ومسعفين وإجراءات الاستجابة للطوارئ.',
    criteria_en: [
      'Certified lifeguard on duty during hours',
      'First aid kit available and stocked',
      'Emergency action plan displayed',
      'Disabled access to beach provided',
      'Clear signage for hazards',
    ],
    criteria_ar: [
      'منقذ معتمد في الخدمة خلال ساعات العمل',
      'حقيبة إسعافات أولية متاحة ومجهزة',
      'عرض خطة الاستجابة للطوارئ',
      'توفير وصول ذوي الاحتياجات الخاصة',
      'لافتات واضحة للمخاطر',
    ],
    done: [true, true, false, false, true],
  },
  {
    id: 'environment',
    Icon: Leaf,
    color: '#40916C',
    title_en: 'Environmental Education',
    title_ar: 'التعليم البيئي',
    desc_en: 'Educational activities and information for beach users about marine conservation.',
    desc_ar: 'أنشطة تعليمية ومعلومات لمستخدمي الشاطئ حول الحفاظ على البيئة البحرية.',
    criteria_en: [
      'Environmental information board installed',
      'At least 5 educational activities per season',
      'Children\'s eco programme offered',
      'Marine life identification guide available',
    ],
    criteria_ar: [
      'تركيب لوحة معلومات بيئية',
      'على الأقل 5 أنشطة تعليمية في الموسم',
      'تقديم برنامج بيئي للأطفال',
      'دليل تعرف على الحياة البحرية متاح',
    ],
    done: [true, false, false, false],
  },
  {
    id: 'management',
    Icon: Waves,
    color: '#90E0EF',
    title_en: 'Environmental Management',
    title_ar: 'الإدارة البيئية',
    desc_en: 'Waste management, no discharge, and general cleanliness standards.',
    desc_ar: 'إدارة النفايات وعدم الصرف وممارسات النظافة العامة.',
    criteria_en: [
      'Daily beach cleaning during season',
      'Waste separation bins provided',
      'No unauthorized discharge to sea',
      'Algae and debris removal protocol',
      'Annual environmental audit',
    ],
    criteria_ar: [
      'تنظيف يومي للشاطئ خلال الموسم',
      'توفير حاويات فصل النفايات',
      'عدم الصرف غير المرخص في البحر',
      'بروتوكول إزالة الطحالب والحطام',
      'تدقيق بيئي سنوي',
    ],
    done: [true, true, true, false, false],
  },
  {
    id: 'community',
    Icon: Users,
    color: '#74C69D',
    title_en: 'Community Involvement',
    title_ar: 'إشراك المجتمع',
    desc_en: 'Engaging local community in beach management and conservation efforts.',
    desc_ar: 'إشراك المجتمع المحلي في إدارة الشاطئ وجهود الحفظ.',
    criteria_en: [
      'Beach committee with community members',
      'Volunteer clean-up events held',
      'Partnership with local schools',
      'Public feedback mechanism',
    ],
    criteria_ar: [
      'لجنة شاطئ تضم أفراداً من المجتمع',
      'تنظيم فعاليات تنظيف طوعية',
      'شراكة مع المدارس المحلية',
      'آلية لتلقي ملاحظات الجمهور',
    ],
    done: [false, true, false, false],
  },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function CriteriaPage() {
  const { lang } = useLang()
  const [open, setOpen] = useState<string | null>('water')

  const totalCriteria = CRITERIA_GROUPS.flatMap(g => g.done).length
  const totalDone = CRITERIA_GROUPS.flatMap(g => g.done).filter(Boolean).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'معايير Blue Flag' : 'Blue Flag Criteria'}</h1>
          <p className="text-sm mt-1" style={{ color: '#7A9080' }}>
            {lang === 'ar' ? `${totalDone} من ${totalCriteria} معايير مستوفاة` : `${totalDone} of ${totalCriteria} criteria met`}
          </p>
        </div>
      </FadeIn>

      {/* Overall progress */}
      <FadeIn delay={0.05}>
        <div className="bg-white rounded-3xl border border-[#C8E6D0] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-forest">{lang === 'ar' ? 'الاستعداد الإجمالي' : 'Overall Readiness'}</span>
            <span className="text-sm font-bold" style={{ color: '#006994' }}>{Math.round((totalDone / totalCriteria) * 100)}%</span>
          </div>
          <div className="h-2.5 rounded-full" style={{ background: '#EFF8FE' }}>
            <div className="h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${(totalDone / totalCriteria) * 100}%`, background: 'linear-gradient(90deg, #006994, #90E0EF)' }} />
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {CRITERIA_GROUPS.map(g => {
              const done = g.done.filter(Boolean).length
              const total = g.done.length
              return (
                <div key={g.id} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: g.color }} />
                  <span className="text-xs font-medium" style={{ color: '#7A9080' }}>
                    {lang === 'ar' ? g.title_ar : g.title_en}: {done}/{total}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </FadeIn>

      {/* Info note */}
      <FadeIn delay={0.08}>
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl" style={{ background: '#EFF8FE', border: '1px solid #90E0EF60' }}>
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#006994' }} />
          <p className="text-xs" style={{ color: '#006994' }}>
            {lang === 'ar'
              ? 'جميع المعايير الإلزامية يجب استيفاؤها للحصول على شهادة Blue Flag. المعايير الموصى بها تعزز تقييمك.'
              : 'All mandatory criteria must be met to receive Blue Flag certification. Recommended criteria strengthen your assessment.'}
          </p>
        </div>
      </FadeIn>

      {/* Criteria accordion */}
      <div className="space-y-3">
        {CRITERIA_GROUPS.map((group, i) => {
          const Icon = group.Icon
          const isOpen = open === group.id
          const doneCnt = group.done.filter(Boolean).length

          return (
            <FadeIn key={group.id} delay={0.1 + i * 0.04}>
              <div className="bg-white rounded-3xl border overflow-hidden"
                style={{ borderColor: isOpen ? group.color + '50' : '#C8E6D0' }}>
                <button onClick={() => setOpen(isOpen ? null : group.id)}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-[#F9FBF9] transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${group.color}14`, border: `1px solid ${group.color}28` }}>
                    <Icon className="w-5 h-5" style={{ color: group.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-forest text-sm">{lang === 'ar' ? group.title_ar : group.title_en}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#7A9080' }}>
                      {doneCnt}/{group.done.length} {lang === 'ar' ? 'معايير' : 'criteria'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: '#EFF8FE' }}>
                      <div className="h-1.5 rounded-full"
                        style={{ width: `${(doneCnt / group.done.length) * 100}%`, background: group.color }} />
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4" style={{ color: '#7A9080' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#7A9080' }} />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }} className="overflow-hidden">
                      <div className="px-6 pb-6 pt-2 border-t border-[#F4F9F5]">
                        <p className="text-sm mb-4 leading-relaxed" style={{ color: '#5A6672' }}>
                          {lang === 'ar' ? group.desc_ar : group.desc_en}
                        </p>
                        <div className="space-y-2.5">
                          {group.criteria_en.map((criterion, ci) => (
                            <div key={ci} className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0`}
                                style={group.done[ci]
                                  ? { background: group.color, borderColor: group.color }
                                  : { borderColor: '#C8E6D0' }}>
                                {group.done[ci] && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <span className="text-sm" style={group.done[ci] ? { color: '#7A9080', textDecoration: 'line-through' } : { color: '#3D5A47' }}>
                                {lang === 'ar' ? group.criteria_ar[ci] : criterion}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          )
        })}
      </div>
    </div>
  )
}
