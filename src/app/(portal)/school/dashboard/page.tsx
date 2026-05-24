'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  CheckCircle2, Clock, AlertCircle, ArrowRight,
  School, FileText, CheckSquare, BookOpen, Leaf,
  TrendingUp, Star, Users,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'

const DEMO_TASKS = [
  { id: 1, title_en: 'Submit your Eco-Committee list', title_ar: 'أرسل قائمة اللجنة البيئية', due: '2026-06-10', done: false, priority: 'high' },
  { id: 2, title_en: 'Complete Environmental Review', title_ar: 'أكمل المراجعة البيئية', due: '2026-06-20', done: false, priority: 'medium' },
  { id: 3, title_en: 'Upload signed application form', title_ar: 'ارفع نموذج الطلب الموقّع', due: '2026-05-30', done: true, priority: 'high' },
  { id: 4, title_en: 'Schedule first Eco-Schools meeting', title_ar: 'جدول أول اجتماع للمدارس البيئية', due: '2026-06-05', done: true, priority: 'medium' },
]

const STATS = [
  { icon: CheckSquare, value: '4/7', label_en: 'Criteria met', label_ar: 'معايير مكتملة', color: '#52B788' },
  { icon: BookOpen,    value: '3',   label_en: 'Activities logged', label_ar: 'أنشطة مسجّلة', color: '#40916C' },
  { icon: Users,       value: '240', label_en: 'Students involved', label_ar: 'طالب مشارك', color: '#006994' },
  { icon: TrendingUp,  value: '68%', label_en: 'Progress', label_ar: 'التقدم', color: '#C8A951' },
]

const PROGRAMME_COLOR = '#52B788'

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay }}>
      {children}
    </motion.div>
  )
}

export default function SchoolDashboardPage() {
  const { lang } = useLang()

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome banner */}
      <FadeIn>
        <div
          className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5"
          style={{ background: 'linear-gradient(135deg, #0F2318, #1B4332)', boxShadow: '0 8px 32px rgba(64,145,108,0.2)' }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${PROGRAMME_COLOR}20`, border: `1px solid ${PROGRAMME_COLOR}30` }}>
            <School className="w-7 h-7" style={{ color: PROGRAMME_COLOR }} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: PROGRAMME_COLOR }}>
              {lang === 'ar' ? 'مرحباً بعودتك' : 'Welcome back'}
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-white leading-tight mb-1">
              {lang === 'ar' ? 'مدرسة الكويت النموذجية' : 'Kuwait Model School'}
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'ar' ? 'برنامج المدارس البيئية · السنة الأولى' : 'Eco-Schools Programme · Year 1'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(82,183,136,0.15)', border: '1px solid rgba(82,183,136,0.3)', color: '#74C69D' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#74C69D] animate-pulse" />
              {lang === 'ar' ? 'الطلب قيد المراجعة' : 'Application under review'}
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {lang === 'ar' ? 'قُدِّم في 20 مايو 2026' : 'Submitted 20 May 2026'}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon
          return (
            <FadeIn key={i} delay={i * 0.07}>
              <div className="bg-white rounded-2xl p-5 border border-[#C8E6D0]">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}12` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-forest mb-0.5">{s.value}</p>
                <p className="text-xs" style={{ color: '#7A9080' }}>{lang === 'ar' ? s.label_ar : s.label_en}</p>
              </div>
            </FadeIn>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Tasks */}
        <FadeIn delay={0.1} className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-[#C8E6D0] overflow-hidden h-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#C8E6D0]">
              <h2 className="font-bold text-forest">{lang === 'ar' ? 'المهام القادمة' : 'Upcoming Tasks'}</h2>
              <Link href="/school/action-plan" className="text-xs font-semibold text-brand hover:text-emerald flex items-center gap-1">
                {lang === 'ar' ? 'عرض الكل' : 'View all'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-[#F4F9F5]">
              {DEMO_TASKS.map(task => (
                <div key={task.id} className="flex items-start gap-3.5 px-6 py-4">
                  <div className="mt-0.5 flex-shrink-0">
                    {task.done
                      ? <CheckCircle2 className="w-5 h-5" style={{ color: '#52B788' }} />
                      : task.priority === 'high'
                      ? <AlertCircle className="w-5 h-5" style={{ color: '#E53E3E' }} />
                      : <Clock className="w-5 h-5" style={{ color: '#C8A951' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${task.done ? 'line-through' : 'text-forest'}`}
                      style={task.done ? { color: '#7A9080' } : {}}>
                      {lang === 'ar' ? task.title_ar : task.title_en}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#7A9080' }}>
                      {lang === 'ar' ? 'الموعد النهائي: ' : 'Due: '}{task.due}
                    </p>
                  </div>
                  {!task.done && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={task.priority === 'high'
                        ? { background: '#FFF5F5', color: '#E53E3E' }
                        : { background: '#FBF7ED', color: '#C8A951' }}
                    >
                      {task.priority === 'high'
                        ? (lang === 'ar' ? 'عاجل' : 'URGENT')
                        : (lang === 'ar' ? 'متوسط' : 'MEDIUM')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Progress card */}
          <FadeIn delay={0.15}>
            <div className="bg-white rounded-3xl border border-[#C8E6D0] p-6">
              <h2 className="font-bold text-forest mb-4">{lang === 'ar' ? 'تقدم البرنامج' : 'Programme Progress'}</h2>
              <div className="space-y-3">
                {[
                  { label_en: 'Eco-Committee', label_ar: 'اللجنة البيئية', pct: 100 },
                  { label_en: 'Environmental Review', label_ar: 'المراجعة البيئية', pct: 60 },
                  { label_en: 'Action Plan', label_ar: 'خطة العمل', pct: 40 },
                  { label_en: 'Monitoring', label_ar: 'الرصد والمتابعة', pct: 20 },
                ].map(item => (
                  <div key={item.label_en}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-forest">{lang === 'ar' ? item.label_ar : item.label_en}</span>
                      <span style={{ color: '#7A9080' }}>{item.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#EDF7F1' }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${item.pct}%`, background: item.pct === 100 ? '#40916C' : `linear-gradient(90deg, #52B788, #40916C)` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Quick links */}
          <FadeIn delay={0.2}>
            <div className="bg-white rounded-3xl border border-[#C8E6D0] p-6">
              <h2 className="font-bold text-forest mb-4">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h2>
              <div className="space-y-2">
                {[
                  { href: '/school/application', icon: FileText, en: 'View Application', ar: 'عرض الطلب' },
                  { href: '/school/resources', icon: BookOpen, en: 'Learning Resources', ar: 'موارد التعلم' },
                  { href: '/school/journey', icon: Star, en: 'My Journey Map', ar: 'خريطة رحلتي' },
                ].map(({ href, icon: Icon, en, ar }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[#F4F9F5] group"
                    style={{ color: '#3D4A42' }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#40916C' }} />
                    {lang === 'ar' ? ar : en}
                    <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#40916C' }} />
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Green Flag badge */}
          <FadeIn delay={0.25}>
            <div
              className="rounded-3xl p-5 text-center"
              style={{ background: 'linear-gradient(135deg, #EDF7F1, #D8F3DC)', border: '1px solid #C8E6D0' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(82,183,136,0.15)', border: '2px solid rgba(82,183,136,0.3)' }}>
                <Leaf className="w-7 h-7" style={{ color: '#40916C' }} />
              </div>
              <p className="text-xs font-bold text-forest mb-1">
                {lang === 'ar' ? 'هدفك' : 'Your Goal'}
              </p>
              <p className="font-bold text-brand text-sm">
                {lang === 'ar' ? 'العلم الأخضر 2026' : 'Green Flag 2026'}
              </p>
              <p className="text-xs mt-1" style={{ color: '#7A9080' }}>
                {lang === 'ar' ? 'استمر في العمل الرائع!' : 'Keep up the great work!'}
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
