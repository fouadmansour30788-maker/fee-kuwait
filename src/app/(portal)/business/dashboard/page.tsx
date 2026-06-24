'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  CheckCircle2, Clock, AlertCircle, ArrowRight,
  Building2, FileText, Award, Waves, KeyRound,
  TrendingUp, Star, Calendar,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'

const DEMO_TASKS = [
  { id: 1, title_en: 'Submit water quality test results', title_ar: 'أرسل نتائج اختبار جودة المياه', due: '2026-06-15', done: false, priority: 'high' },
  { id: 2, title_en: 'Complete waste management report', title_ar: 'أكمل تقرير إدارة النفايات', due: '2026-06-25', done: false, priority: 'medium' },
  { id: 3, title_en: 'Upload beach profile photos', title_ar: 'ارفع صور الشاطئ', due: '2026-05-28', done: true, priority: 'high' },
  { id: 4, title_en: 'Book annual inspection slot', title_ar: 'احجز موعد التفتيش السنوي', due: '2026-07-01', done: false, priority: 'medium' },
]

const STATS = [
  { icon: CheckCircle2, value: '6/10', label_en: 'Criteria met',        label_ar: 'معايير مكتملة',   color: '#006994' },
  { icon: Award,        value: '2',    label_en: 'Active programmes',   label_ar: 'برامج نشطة',       color: '#C8A951' },
  { icon: Calendar,     value: '14',   label_en: 'Days to inspection',  label_ar: 'يوم حتى التفتيش', color: '#8B9B88' },
  { icon: TrendingUp,   value: '72%',  label_en: 'Compliance score',    label_ar: 'نسبة الامتثال',   color: '#7B8266' },
]

const PROGRAMME_COLOR = '#006994'

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay }}>
      {children}
    </motion.div>
  )
}

export default function BusinessDashboardPage() {
  const { lang } = useLang()

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome banner */}
      <FadeIn>
        <div
          className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5"
          style={{ background: 'linear-gradient(135deg, #061A28, #0A2D45)', boxShadow: '0 8px 32px rgba(0,105,148,0.25)' }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${PROGRAMME_COLOR}20`, border: `1px solid ${PROGRAMME_COLOR}30` }}>
            <Waves className="w-7 h-7" style={{ color: '#60B8D9' }} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#60B8D9' }}>
              {lang === 'ar' ? 'مرحباً بعودتك' : 'Welcome back'}
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-white leading-tight mb-1">
              {lang === 'ar' ? 'منتجع الكويت الساحلي' : 'Kuwait Coastal Resort'}
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'ar' ? 'برنامج العلم الأزرق · المفتاح الأخضر' : 'Blue Flag Programme · Green Key'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(0,105,148,0.2)', border: '1px solid rgba(96,184,217,0.3)', color: '#60B8D9' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#60B8D9' }} />
              {lang === 'ar' ? 'المعايير قيد التحقق' : 'Criteria under review'}
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {lang === 'ar' ? 'قُدِّم في 15 مايو 2026' : 'Submitted 15 May 2026'}
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
              <div className="bg-warmwhite rounded-2xl p-5 border border-[#E7E4D6]">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}12` }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
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
          <div className="bg-warmwhite rounded-3xl border border-[#E7E4D6] overflow-hidden h-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7E4D6]">
              <h2 className="font-bold text-forest">{lang === 'ar' ? 'المهام القادمة' : 'Upcoming Tasks'}</h2>
              <Link href="/business/criteria" className="text-xs font-semibold text-brand hover:text-emerald flex items-center gap-1">
                {lang === 'ar' ? 'عرض الكل' : 'View all'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-[#FBF8F0]">
              {DEMO_TASKS.map(task => (
                <div key={task.id} className="flex items-start gap-3.5 px-6 py-4">
                  <div className="mt-0.5 flex-shrink-0">
                    {task.done
                      ? <CheckCircle2 className="w-5 h-5" style={{ color: '#8B9B88' }} />
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
          {/* Compliance score */}
          <FadeIn delay={0.15}>
            <div className="bg-warmwhite rounded-3xl border border-[#E7E4D6] p-6">
              <h2 className="font-bold text-forest mb-4">{lang === 'ar' ? 'تقدم الامتثال' : 'Compliance Progress'}</h2>
              <div className="space-y-3">
                {[
                  { label_en: 'Water Quality',      label_ar: 'جودة المياه',       pct: 80 },
                  { label_en: 'Safety',             label_ar: 'السلامة',           pct: 100 },
                  { label_en: 'Environmental Ed.', label_ar: 'التثقيف البيئي',     pct: 60 },
                  { label_en: 'Waste Management',  label_ar: 'إدارة النفايات',     pct: 45 },
                ].map(item => (
                  <div key={item.label_en}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-forest">{lang === 'ar' ? item.label_ar : item.label_en}</span>
                      <span style={{ color: '#7A9080' }}>{item.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#E8ECE1' }}>
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${item.pct}%`, background: item.pct === 100 ? '#7B8266' : 'linear-gradient(90deg, #006994, #0090C8)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Quick links */}
          <FadeIn delay={0.2}>
            <div className="bg-warmwhite rounded-3xl border border-[#E7E4D6] p-6">
              <h2 className="font-bold text-forest mb-4">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h2>
              <div className="space-y-2">
                {[
                  { href: '/business/application',   icon: FileText, en: 'View Application', ar: 'عرض الطلب' },
                  { href: '/business/criteria',       icon: CheckCircle2, en: 'Criteria Checklist', ar: 'قائمة المعايير' },
                  { href: '/business/certification',  icon: Award, en: 'My Certificates', ar: 'شهاداتي' },
                ].map(({ href, icon: Icon, en, ar }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[#FBF8F0] group"
                    style={{ color: '#4A544C' }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#7B8266' }} />
                    {lang === 'ar' ? ar : en}
                    <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#7B8266' }} />
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Programmes badge */}
          <FadeIn delay={0.25}>
            <div
              className="rounded-3xl p-5"
              style={{ background: 'linear-gradient(135deg, #E8ECE1, #E8F5FB)', border: '1px solid #E7E4D6' }}
            >
              <p className="text-xs font-bold text-forest mb-3">{lang === 'ar' ? 'برامجك النشطة' : 'Your Active Programmes'}</p>
              <div className="space-y-2">
                {[
                  { icon: Waves,    en: 'Blue Flag',  ar: 'العلم الأزرق',  color: '#006994', status_en: 'Under review', status_ar: 'قيد المراجعة' },
                  { icon: KeyRound, en: 'Green Key',  ar: 'المفتاح الأخضر', color: '#C8A951', status_en: 'Criteria check', status_ar: 'فحص المعايير' },
                ].map(({ icon: Icon, en, ar, color, status_en, status_ar }) => (
                  <div key={en} className="flex items-center gap-3 bg-warmwhite rounded-xl px-3.5 py-2.5" style={{ border: '1px solid #E7E4D6' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="text-xs font-semibold text-forest flex-1">{lang === 'ar' ? ar : en}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}12`, color }}>
                      {lang === 'ar' ? status_ar : status_en}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
