'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle2, AlertCircle, User, MapPin, FileText, ChevronRight } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const UPCOMING = [
  {
    id: 1,
    type_en: 'Technical Assessment',
    type_ar: 'التقييم الفني',
    date: '2026-06-03',
    time: '09:00 – 12:00',
    inspector_en: 'Dr. Khalid Al-Mutairi',
    inspector_ar: 'د. خالد المطيري',
    location_en: 'Marina Beach Resort — Main Entrance',
    location_ar: 'منتجع مارينا بيتش — المدخل الرئيسي',
    color: '#006994',
    status: 'confirmed',
  },
]

const PAST = [
  {
    id: 2,
    type_en: 'Pre-Assessment Visit',
    type_ar: 'زيارة التقييم المبدئي',
    date: '2026-05-10',
    time: '10:00 – 11:30',
    inspector_en: 'Eng. Sara Al-Ansari',
    inspector_ar: 'م. سارة الأنصاري',
    result_en: 'Satisfactory — minor items to address',
    result_ar: 'مرضٍ — بنود بسيطة تحتاج معالجة',
    score: 78,
    color: '#7B8266',
    status: 'completed',
  },
  {
    id: 3,
    type_en: 'Document Check',
    type_ar: 'فحص المستندات',
    date: '2026-04-22',
    time: '14:00 – 15:00',
    inspector_en: 'FEE Kuwait Team',
    inspector_ar: 'فريق FEE الكويت',
    result_en: 'All documents verified',
    result_ar: 'تم التحقق من جميع المستندات',
    score: null,
    color: '#8B9B88',
    status: 'completed',
  },
]

const CHECKLIST = [
  { en: 'Water quality test results available', ar: 'نتائج اختبار جودة المياه متاحة', done: true },
  { en: 'Safety equipment inspected', ar: 'تم فحص معدات السلامة', done: true },
  { en: 'Environmental management plan ready', ar: 'خطة الإدارة البيئية جاهزة', done: false },
  { en: 'Staff briefed on assessment process', ar: 'تم إحاطة الموظفين حول عملية التقييم', done: false },
  { en: 'Public information boards in place', ar: 'لوحات المعلومات العامة في مكانها', done: true },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function InspectionsPage() {
  const { lang } = useLang()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'الفحوصات والزيارات' : 'Inspections & Visits'}</h1>
          <p className="text-sm mt-1" style={{ color: '#7A9080' }}>
            {lang === 'ar' ? 'جدول التقييمات وسجل الزيارات السابقة' : 'Assessment schedule and history of past visits'}
          </p>
        </div>
      </FadeIn>

      {/* Upcoming */}
      {UPCOMING.length > 0 && (
        <FadeIn delay={0.05}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7A9080' }}>
              {lang === 'ar' ? 'الزيارات القادمة' : 'Upcoming'}
            </p>
            {UPCOMING.map(insp => (
              <div key={insp.id} className="rounded-3xl p-5 space-y-4" style={{ background: 'linear-gradient(135deg, #071929, #0A2540)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#90E0EF' }}>
                      {lang === 'ar' ? 'مؤكدة' : 'Confirmed'}
                    </span>
                    <p className="text-lg font-bold text-white mt-1">
                      {lang === 'ar' ? insp.type_ar : insp.type_en}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(144,224,239,0.12)', border: '1px solid rgba(144,224,239,0.28)' }}>
                    <Calendar className="w-5 h-5" style={{ color: '#90E0EF' }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { Icon: Calendar, val: insp.date },
                    { Icon: Clock, val: insp.time },
                    { Icon: User, val: lang === 'ar' ? insp.inspector_ar : insp.inspector_en },
                    { Icon: MapPin, val: lang === 'ar' ? insp.location_ar : insp.location_en },
                  ].map(({ Icon, val }, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#90E0EF' }} />
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Pre-inspection checklist */}
      <FadeIn delay={0.1}>
        <div className="bg-warmwhite rounded-3xl border border-[#E7E4D6] p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4" style={{ color: '#006994' }} />
            <p className="text-sm font-bold text-forest">{lang === 'ar' ? 'قائمة التحضير للفحص' : 'Pre-Inspection Checklist'}</p>
          </div>
          <div className="space-y-2.5">
            {CHECKLIST.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={item.done ? { background: '#006994', borderColor: '#006994' } : { borderColor: '#E7E4D6' }}>
                  {item.done && <div className="w-2 h-2 rounded-full bg-warmwhite" />}
                </div>
                <span className="text-sm" style={item.done ? { color: '#7A9080', textDecoration: 'line-through' } : { color: '#4A544C' }}>
                  {lang === 'ar' ? item.ar : item.en}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#FBF8F0]">
            <div className="flex items-center justify-between text-xs" style={{ color: '#7A9080' }}>
              <span>{lang === 'ar' ? 'مكتمل' : 'Complete'}</span>
              <span>{CHECKLIST.filter(c => c.done).length}/{CHECKLIST.length}</span>
            </div>
            <div className="h-1.5 rounded-full mt-2" style={{ background: '#EFF8FE' }}>
              <div className="h-1.5 rounded-full"
                style={{ width: `${(CHECKLIST.filter(c => c.done).length / CHECKLIST.length) * 100}%`, background: '#006994' }} />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Past inspections */}
      <FadeIn delay={0.14}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7A9080' }}>
            {lang === 'ar' ? 'الزيارات السابقة' : 'Past Inspections'}
          </p>
          <div className="space-y-3">
            {PAST.map(insp => (
              <div key={insp.id} className="bg-warmwhite rounded-2xl border border-[#E7E4D6] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${insp.color}14` }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: insp.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-forest">{lang === 'ar' ? insp.type_ar : insp.type_en}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7A9080' }}>{insp.date} · {lang === 'ar' ? insp.inspector_ar : insp.inspector_en}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: insp.color }}>
                    {lang === 'ar' ? insp.result_ar : insp.result_en}
                  </p>
                </div>
                {insp.score !== null && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xl font-bold text-forest">{insp.score}<span className="text-xs font-normal" style={{ color: '#7A9080' }}>/100</span></p>
                    <p className="text-[11px]" style={{ color: '#7A9080' }}>{lang === 'ar' ? 'النتيجة' : 'Score'}</p>
                  </div>
                )}
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#E7E4D6' }} />
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
