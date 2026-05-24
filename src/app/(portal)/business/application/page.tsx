'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, AlertCircle, Download, ChevronDown, ChevronUp, Calendar, User, Mail, Phone, Building2, MapPin, Waves } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const TIMELINE = [
  { date: '2026-05-15', en: 'Application submitted', ar: 'تم تقديم الطلب', done: true },
  { date: '2026-05-17', en: 'Initial eligibility check', ar: 'فحص الأهلية الأولي', done: true },
  { date: '2026-05-21', en: 'Document review', ar: 'مراجعة المستندات', done: true },
  { date: '2026-05-23', en: 'Technical assessment scheduled', ar: 'جدولة التقييم الفني', done: false, active: true },
  { date: '—', en: 'On-site inspection', ar: 'الفحص الميداني', done: false },
  { date: '—', en: 'Certification decision', ar: 'قرار الشهادة', done: false },
]

const SECTIONS = [
  {
    id: 'contact',
    title_en: 'Contact Details',
    title_ar: 'تفاصيل التواصل',
    fields: [
      { label_en: 'Manager Name', label_ar: 'اسم المدير', value: 'Fatima Al-Sabah', icon: User },
      { label_en: 'Email', label_ar: 'البريد الإلكتروني', value: 'fatima@marina-kw.com', icon: Mail },
      { label_en: 'Phone', label_ar: 'الهاتف', value: '+965 9876 5432', icon: Phone },
    ],
  },
  {
    id: 'property',
    title_en: 'Property Details',
    title_ar: 'تفاصيل المنشأة',
    fields: [
      { label_en: 'Property Name', label_ar: 'اسم المنشأة', value: 'Marina Beach Resort', icon: Building2 },
      { label_en: 'Type', label_ar: 'النوع', value: 'Beach / Coastal Facility', icon: Waves },
      { label_en: 'Location', label_ar: 'الموقع', value: 'Salmiya, Kuwait City', icon: MapPin },
      { label_en: 'Beach Length', label_ar: 'طول الشاطئ', value: '320 m', icon: Waves },
    ],
  },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function BusinessApplicationPage() {
  const { lang } = useLang()
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'طلب التسجيل' : 'Registration Application'}</h1>
          <p className="text-sm mt-1" style={{ color: '#7A9080' }}>{lang === 'ar' ? 'تتبع حالة طلب Blue Flag' : 'Track your Blue Flag application status'}</p>
        </div>
      </FadeIn>

      {/* Status banner */}
      <FadeIn delay={0.05}>
        <div className="rounded-3xl p-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #071929, #0A2540)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(144,224,239,0.12)', border: '1px solid rgba(144,224,239,0.28)' }}>
            <Clock className="w-7 h-7" style={{ color: '#90E0EF' }} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#90E0EF' }}>
              {lang === 'ar' ? 'حالة الطلب' : 'Application Status'}
            </p>
            <p className="text-xl font-bold text-white">{lang === 'ar' ? 'التقييم الفني' : 'Technical Assessment'}</p>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {lang === 'ar' ? 'رقم الطلب: BF-KW-2026-0038' : 'Application ID: BF-KW-2026-0038'}
            </p>
          </div>
          <button className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}>
            <Download className="w-4 h-4" />
            {lang === 'ar' ? 'تنزيل PDF' : 'Download PDF'}
          </button>
        </div>
      </FadeIn>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Timeline */}
        <FadeIn delay={0.1}>
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#C8E6D0] p-6">
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
                        ? { background: '#006994', border: '2px solid #006994' }
                        : step.active
                        ? { background: 'rgba(0,105,148,0.1)', border: '2px solid #006994' }
                        : { background: '#F4F9F5', border: '2px solid #C8E6D0' }}>
                      {step.done
                        ? <CheckCircle2 className="w-4 h-4 text-white" />
                        : step.active
                        ? <div className="w-2 h-2 rounded-full bg-[#006994] animate-pulse" />
                        : <div className="w-2 h-2 rounded-full" style={{ background: '#C8E6D0' }} />}
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className="w-0.5 flex-1 my-1" style={{ background: step.done ? '#006994' : '#E8F5EC', minHeight: '2rem' }} />
                    )}
                  </div>
                  <div className="pb-5 pt-1 flex-1">
                    <p className="text-sm font-semibold leading-snug"
                      style={{ color: step.done || step.active ? '#1B3A4B' : '#7A9080' }}>
                      {lang === 'ar' ? step.ar : step.en}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#7A9080' }}>{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Details */}
        <div className="lg:col-span-3 space-y-4">
          {SECTIONS.map((section, si) => (
            <FadeIn key={section.id} delay={0.12 + si * 0.07}>
              <div className="bg-white rounded-3xl border border-[#C8E6D0] overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-[#F9FBF9] transition-colors">
                  <h2 className="font-bold text-forest text-sm">{lang === 'ar' ? section.title_ar : section.title_en}</h2>
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
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(0,105,148,0.08)' }}>
                              <Icon className="w-3.5 h-3.5" style={{ color: '#006994' }} />
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

          <FadeIn delay={0.26}>
            <div className="rounded-2xl p-5" style={{ background: '#EFF8FE', border: '1px solid #90E0EF80' }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#006994' }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#004A6E' }}>
                    {lang === 'ar' ? 'ملاحظة المقيّم' : 'Assessor Note'}
                  </p>
                  <p className="text-sm" style={{ color: '#0A6690' }}>
                    {lang === 'ar'
                      ? 'سيتصل بك فريق التقييم الفني خلال 3 أيام عمل لتحديد موعد الزيارة الميدانية.'
                      : 'The technical assessment team will contact you within 3 working days to schedule the on-site inspection.'}
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
