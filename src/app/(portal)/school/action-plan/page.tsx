'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Plus, Leaf, Users, Search, BarChart2, BookOpen, Globe, Code2 } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const STEPS = [
  {
    id: 1, Icon: Users, color: '#8B9B88',
    title_en: 'Eco-Committee',
    title_ar: 'اللجنة البيئية',
    desc_en: 'Form a committee of students, teachers, and staff to drive environmental action.',
    desc_ar: 'تكوين لجنة من الطلاب والمعلمين والموظفين لقيادة العمل البيئي.',
    status: 'done',
    tasks_en: ['Elect student representatives', 'Appoint teacher coordinator', 'Hold first meeting', 'Create meeting schedule'],
    tasks_ar: ['انتخاب ممثلين الطلاب', 'تعيين منسق من المعلمين', 'عقد الاجتماع الأول', 'وضع جدول الاجتماعات'],
    done: [true, true, true, true],
  },
  {
    id: 2, Icon: Search, color: '#006994',
    title_en: 'Environmental Review',
    title_ar: 'المراجعة البيئية',
    desc_en: 'Audit your school\'s environmental impact across energy, water, waste and more.',
    desc_ar: 'مراجعة الأثر البيئي للمدرسة في الطاقة والمياه والنفايات وغيرها.',
    status: 'active',
    tasks_en: ['Energy consumption audit', 'Water usage review', 'Waste assessment', 'Biodiversity survey', 'Transport analysis'],
    tasks_ar: ['تدقيق استهلاك الطاقة', 'مراجعة استخدام المياه', 'تقييم النفايات', 'مسح التنوع البيولوجي', 'تحليل وسائل النقل'],
    done: [true, true, false, false, false],
  },
  {
    id: 3, Icon: Leaf, color: '#7B8266',
    title_en: 'Action Plan',
    title_ar: 'خطة العمل',
    desc_en: 'Create a concrete plan with goals, actions, and timelines based on your review.',
    desc_ar: 'وضع خطة محددة بأهداف وإجراءات وجداول زمنية بناءً على المراجعة.',
    status: 'pending',
    tasks_en: ['Set environmental targets', 'Assign responsibilities', 'Create timeline', 'Get principal approval'],
    tasks_ar: ['تحديد الأهداف البيئية', 'توزيع المسؤوليات', 'وضع الجدول الزمني', 'الحصول على موافقة المدير'],
    done: [false, false, false, false],
  },
  {
    id: 4, Icon: BarChart2, color: '#C8A951',
    title_en: 'Monitoring & Evaluation',
    title_ar: 'الرصد والتقييم',
    desc_en: 'Track progress against your action plan and measure environmental improvements.',
    desc_ar: 'متابعة التقدم وقياس التحسينات البيئية مقابل خطة العمل.',
    status: 'pending',
    tasks_en: ['Define KPIs', 'Monthly data collection', 'Quarterly review meeting', 'Annual report'],
    tasks_ar: ['تحديد مؤشرات الأداء', 'جمع البيانات شهريًا', 'اجتماع مراجعة ربع سنوي', 'التقرير السنوي'],
    done: [false, false, false, false],
  },
  {
    id: 5, Icon: BookOpen, color: '#A9B6A4',
    title_en: 'Curriculum Links',
    title_ar: 'الربط بالمنهج الدراسي',
    desc_en: 'Integrate environmental topics into classroom lessons across all subjects.',
    desc_ar: 'دمج المواضيع البيئية في دروس الفصول الدراسية عبر جميع المواد.',
    status: 'pending',
    tasks_en: ['Map topics to subjects', 'Teacher training session', 'Sample lesson plans', 'Student projects'],
    tasks_ar: ['ربط الموضوعات بالمواد', 'جلسة تدريب المعلمين', 'نماذج خطط الدروس', 'مشاريع الطلاب'],
    done: [false, false, false, false],
  },
  {
    id: 6, Icon: Globe, color: '#182019',
    title_en: 'Community Involvement',
    title_ar: 'إشراك المجتمع',
    desc_en: 'Engage parents, local organisations and the wider community in your efforts.',
    desc_ar: 'إشراك أولياء الأمور والمنظمات المحلية والمجتمع الأوسع في جهودكم.',
    status: 'pending',
    tasks_en: ['Parent awareness event', 'Local NGO partnership', 'Community clean-up', 'Social media campaign'],
    tasks_ar: ['فعالية توعية أولياء الأمور', 'شراكة مع منظمة محلية', 'حملة تنظيف مجتمعية', 'حملة وسائل التواصل'],
    done: [false, false, false, false],
  },
  {
    id: 7, Icon: Code2, color: '#A8DADC',
    title_en: 'Eco-Code',
    title_ar: 'الرمز البيئي',
    desc_en: 'Create a school motto or pledge that captures your commitment to the environment.',
    desc_ar: 'إنشاء شعار أو تعهد مدرسي يعكس الالتزام بالبيئة.',
    status: 'pending',
    tasks_en: ['Run student competition', 'Vote on winning eco-code', 'Display in school', 'Share with FEE Kuwait'],
    tasks_ar: ['إجراء مسابقة طلابية', 'التصويت على الرمز الفائز', 'عرضه في المدرسة', 'مشاركته مع FEE الكويت'],
    done: [false, false, false, false],
  },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function ActionPlanPage() {
  const { lang } = useLang()
  const [open, setOpen] = useState<number | null>(2)

  const doneCount = STEPS.filter(s => s.status === 'done').length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'خطة العمل البيئية' : 'Eco-Schools Action Plan'}</h1>
            <p className="text-sm mt-1" style={{ color: '#7A9080' }}>
              {lang === 'ar' ? `${doneCount} من 7 خطوات مكتملة` : `${doneCount} of 7 steps completed`}
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7B8266, #8B9B88)' }}>
            <Plus className="w-4 h-4" />
            {lang === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}
          </button>
        </div>
      </FadeIn>

      {/* Overall progress */}
      <FadeIn delay={0.05}>
        <div className="bg-warmwhite rounded-3xl border border-[#E7E4D6] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-forest">{lang === 'ar' ? 'التقدم الكلي' : 'Overall Progress'}</span>
            <span className="text-sm font-bold text-brand">{Math.round((doneCount / 7) * 100)}%</span>
          </div>
          <div className="h-2.5 rounded-full" style={{ background: '#E8ECE1' }}>
            <div className="h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${(doneCount / 7) * 100}%`, background: 'linear-gradient(90deg, #8B9B88, #7B8266)' }} />
          </div>
          <div className="flex justify-between mt-3">
            {STEPS.map(s => (
              <div key={s.id} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={s.status === 'done'
                  ? { background: '#7B8266', color: '#fff' }
                  : s.status === 'active'
                  ? { background: 'rgba(139,155,136,0.15)', border: '2px solid #8B9B88', color: '#8B9B88' }
                  : { background: '#FBF8F0', color: '#7A9080' }}>
                {s.id}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const Icon = step.Icon
          const isOpen = open === step.id
          const tasksDone = step.done.filter(Boolean).length

          return (
            <FadeIn key={step.id} delay={0.08 + i * 0.04}>
              <div className="bg-warmwhite rounded-3xl border overflow-hidden"
                style={{ borderColor: step.status === 'active' ? step.color + '60' : '#E7E4D6' }}>
                <button onClick={() => setOpen(isOpen ? null : step.id)}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-[#FCFAF5] transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${step.color}14`, border: `1px solid ${step.color}28` }}>
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-forest text-sm">
                        {lang === 'ar' ? `${step.id}. ${step.title_ar}` : `${step.id}. ${step.title_en}`}
                      </p>
                      {step.status === 'active' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${step.color}15`, color: step.color }}>
                          {lang === 'ar' ? 'جارٍ' : 'Active'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#7A9080' }}>
                      {tasksDone}/{step.tasks_en.length} {lang === 'ar' ? 'مهام' : 'tasks'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {step.status === 'done'
                      ? <CheckCircle2 className="w-5 h-5" style={{ color: '#7B8266' }} />
                      : <Circle className="w-5 h-5" style={{ color: '#E7E4D6' }} />}
                    {isOpen ? <ChevronUp className="w-4 h-4" style={{ color: '#7A9080' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#7A9080' }} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 border-t" style={{ borderColor: '#FBF8F0' }}>
                        <p className="text-sm mb-5 leading-relaxed" style={{ color: '#5A6672' }}>
                          {lang === 'ar' ? step.desc_ar : step.desc_en}
                        </p>
                        <div className="space-y-2.5">
                          {step.tasks_en.map((task, ti) => (
                            <label key={ti} className="flex items-center gap-3 cursor-pointer group">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${step.done[ti] ? 'border-transparent' : ''}`}
                                style={step.done[ti] ? { background: step.color, borderColor: step.color } : { borderColor: '#E7E4D6' }}>
                                {step.done[ti] && <div className="w-2 h-2 rounded-full bg-warmwhite" />}
                              </div>
                              <span className={`text-sm ${step.done[ti] ? 'line-through' : 'text-forest'}`}
                                style={step.done[ti] ? { color: '#7A9080' } : {}}>
                                {lang === 'ar' ? step.tasks_ar[ti] : task}
                              </span>
                            </label>
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
