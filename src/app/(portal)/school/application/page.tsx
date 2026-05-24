'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, AlertCircle, FileText, Download, ChevronDown, ChevronUp, Calendar, User, Mail, Phone, Building2 } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const TIMELINE = [
  { date: '2026-05-20', en: 'Application submitted', ar: 'تم تقديم الطلب', done: true },
  { date: '2026-05-22', en: 'Documents verified', ar: 'تم التحقق من المستندات', done: true },
  { date: '2026-05-25', en: 'Under review by FEE Kuwait team', ar: 'قيد المراجعة من فريق FEE الكويت', done: false, active: true },
  { date: '—', en: 'Site visit scheduled', ar: 'تحديد موعد الزيارة الميدانية', done: false },
  { date: '—', en: 'Decision issued', ar: 'إصدار القرار', done: false },
]

const SECTIONS = [
  {
    id: 'contact',
    title_en: 'Contact Information',
    title_ar: 'معلومات التواصل',
    fields: [
      { label_en: 'Principal Name', label_ar: 'اسم المدير', value: 'Ahmed Al-Rashidi', icon: User },
      { label_en: 'Email', label_ar: 'البريد الإلكتروني', value: 'ahmed@kwschool.edu.kw', icon: Mail },
      { label_en: 'Phone', label_ar: 'الهاتف', value: '+965 2234 5678', icon: Phone },
    ],
  },
  {
    id: 'institution',
    title_en: 'Institution Details',
    title_ar: 'تفاصيل المؤسسة',
    fields: [
      { label_en: 'School Name', label_ar: 'اسم المدرسة', value: 'Kuwait Model School', icon: Building2 },
      { label_en: 'Type', label_ar: 'النوع', value: 'Public School', icon: FileText },
      { label_en: 'Governorate', label_ar: 'المحافظة', value: 'Hawalli', icon: Building2 },
      { label_en: 'Students', label_ar: 'الطلاب', value: '820', icon: User },
    ],
  },
]

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function SchoolApplicationPage() {
  const { lang } = useLang()
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'طلب التسجيل' : 'Registration Application'}</h1>
          <p className="text-sm mt-1" style={{ color: '#7A9080' }}>{lang === 'ar' ? 'تتبع حالة طلبك' : 'Track the status of your application'}</p>
        </div>
      </FadeIn>

      {/* Status banner */}
      <FadeIn delay={0.05}>
        <div className="rounded-3xl p-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #0F2318, #1B4332)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(82,183,136,0.18)', border: '1px solid rgba(82,183,136,0.35)' }}>
            <Clock className="w-7 h-7" style={{ color: '#74C69D' }} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#74C69D' }}>
              {lang === 'ar' ? 'حالة الطلب' : 'Application Status'}
            </p>
            <p className="text-xl font-bold text-white">{lang === 'ar' ? 'قيد المراجعة' : 'Under Review'}</p>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {lang === 'ar' ? 'رقم الطلب: KW-2026-00142' : 'Application ID: KW-2026-00142'}
            </p>
          </div>
          <button className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Download className="w-4 h-4" />
            {lang === 'ar' ? 'تنزيل PDF' : 'Download PDF'}
          </button>
        </div>
      </FadeIn>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Timeline */}
        <FadeIn delay={0.1} className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-[#C8E6D0] p-6 h-full">
            <h2 className="font-bold text-forest mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" />
              {lang === 'ar' ? 'مراحل الطلب' : 'Application Timeline'}
            </h2>
            <div className="space-y-0">
              {TIMELINE.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                      style={step.done
                        ? { background: '#40916C', border: '2px solid #40916C' }
                        : step.active
                        ? { background: 'rgba(82,183,136,0.15)', border: '2px solid #52B788' }
                        : { background: '#F4F9F5', border: '2px solid #C8E6D0' }}>
                      {step.done
                        ? <CheckCircle2 className="w-4 h-4 text-white" />
                        : step.active
                        ? <div className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
                        : <div className="w-2 h-2 rounded-full" style={{ background: '#C8E6D0' }} />}
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className="w-0.5 flex-1 my-1" style={{ background: step.done ? '#40916C' : '#E8F5EC', minHeight: '2rem' }} />
                    )}
                  </div>
                  <div className="pb-5 pt-1 flex-1">
                    <p className={`text-sm font-semibold leading-snug ${step.done || step.active ? 'text-forest' : ''}`}
                      style={!step.done && !step.active ? { color: '#7A9080' } : {}}>
                      {lang === 'ar' ? step.ar : step.en}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#7A9080' }}>{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Application details */}
        <div className="lg:col-span-3 space-y-4">
          {SECTIONS.map((section, si) => (
            <FadeIn key={section.id} delay={0.12 + si * 0.07}>
              <div className="bg-white rounded-3xl border border-[#C8E6D0] overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-[#F9FBF9] transition-colors"
                >
                  <h2 className="font-bold text-forest text-sm">
                    {lang === 'ar' ? section.title_ar : section.title_en}
                  </h2>
                  {expanded === section.id
                    ? <ChevronUp className="w-4 h-4" style={{ color: '#7A9080' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: '#7A9080' }} />}
                </button>
                {expanded === section.id && (
                  <div className="px-6 pb-6 pt-2 border-t border-[#F4F9F5]">
                    <div className="space-y-3">
                      {section.fields.map(f => {
                        const Icon = f.icon
                        return (
                          <div key={f.label_en} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EDF7F1' }}>
                              <Icon className="w-3.5 h-3.5 text-brand" />
                            </div>
                            <div>
                              <p className="text-xs" style={{ color: '#7A9080' }}>{lang === 'ar' ? f.label_ar : f.label_en}</p>
                              <p className="text-sm font-semibold text-forest">{f.value}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}

          {/* Notes from reviewer */}
          <FadeIn delay={0.26}>
            <div className="rounded-2xl p-5" style={{ background: '#FBF7ED', border: '1px solid #E8D99A' }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C8A951' }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#7A5C00' }}>
                    {lang === 'ar' ? 'ملاحظة من المراجع' : 'Reviewer Note'}
                  </p>
                  <p className="text-sm" style={{ color: '#8A6E1A' }}>
                    {lang === 'ar'
                      ? 'يرجى التأكد من رفع قائمة أعضاء اللجنة البيئية. سيتم إرسال بريد إلكتروني عند اكتمال المراجعة.'
                      : 'Please ensure the Eco-Committee member list is uploaded. You will receive an email once the review is complete.'}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
