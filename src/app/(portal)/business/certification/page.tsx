'use client'

import { motion } from 'framer-motion'
import { Award, Download, Calendar, Clock, CheckCircle2, Shield, Waves, Share2, ExternalLink } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const HISTORY = [
  {
    year: 2025,
    status_en: 'Awarded',
    status_ar: 'ممنوحة',
    programme_en: 'Blue Flag — Beach',
    programme_ar: 'العلم الأزرق — شاطئ',
    id: 'BF-KW-2025-0021',
    color: '#006994',
    valid: '2025-06-01 → 2026-05-31',
  },
  {
    year: 2024,
    status_en: 'Awarded',
    status_ar: 'ممنوحة',
    programme_en: 'Blue Flag — Beach',
    programme_ar: 'العلم الأزرق — شاطئ',
    id: 'BF-KW-2024-0015',
    color: '#006994',
    valid: '2024-06-01 → 2025-05-31',
  },
]

const BENEFITS = [
  { Icon: Shield, en: 'International recognition', ar: 'اعتراف دولي' },
  { Icon: Waves, en: 'Use of Blue Flag logo', ar: 'استخدام شعار العلم الأزرق' },
  { Icon: ExternalLink, en: 'Listed on FEE global map', ar: 'مدرج على الخريطة العالمية لـ FEE' },
  { Icon: CheckCircle2, en: 'Annual assessment support', ar: 'دعم التقييم السنوي' },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function CertificationPage() {
  const { lang } = useLang()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'الشهادات والجوائز' : 'Certification & Awards'}</h1>
          <p className="text-sm mt-1" style={{ color: '#7A9080' }}>
            {lang === 'ar' ? 'سجل شهاداتك وحالة التجديد' : 'Your certification record and renewal status'}
          </p>
        </div>
      </FadeIn>

      {/* Current status — pending */}
      <FadeIn delay={0.05}>
        <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #071929, #0A2540)' }}>
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(144,224,239,0.12)', border: '1px solid rgba(144,224,239,0.25)' }}>
                <Award className="w-7 h-7" style={{ color: '#90E0EF' }} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#90E0EF' }}>
                  {lang === 'ar' ? 'حالة الشهادة الحالية' : 'Current Certification Status'}
                </p>
                <p className="text-xl font-bold text-white">{lang === 'ar' ? 'قيد التجديد — 2026' : 'Renewal in Progress — 2026'}</p>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {lang === 'ar' ? 'التقييم الفني مجدول في 3 يونيو 2026' : 'Technical assessment scheduled 3 June 2026'}
                </p>
              </div>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-2">
              {[
                { en: 'Applied', ar: 'تقدمنا', done: true },
                { en: 'Assessed', ar: 'تقييم', done: false, active: true },
                { en: 'Decided', ar: 'القرار', done: false },
                { en: 'Awarded', ar: 'الجائزة', done: false },
              ].map((step, i, arr) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={step.done
                        ? { background: '#006994', border: '2px solid #006994' }
                        : step.active
                        ? { background: 'rgba(144,224,239,0.15)', border: '2px solid #90E0EF' }
                        : { background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.15)' }}>
                      {step.done
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        : <div className={`w-2 h-2 rounded-full ${step.active ? 'bg-[#90E0EF] animate-pulse' : ''}`}
                          style={!step.active ? { background: 'rgba(255,255,255,0.2)' } : {}} />}
                    </div>
                    <p className="text-[10px] mt-1.5 font-medium text-center"
                      style={{ color: step.done || step.active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)' }}>
                      {lang === 'ar' ? step.ar : step.en}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="h-px flex-1 mx-1 mb-4"
                      style={{ background: step.done ? '#006994' : 'rgba(255,255,255,0.1)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expiry bar */}
          <div className="px-6 pb-5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>{lang === 'ar' ? 'انتهاء الشهادة الحالية' : 'Current cert. expires'}</span>
              <span style={{ color: '#90E0EF' }}>2026-05-31</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Benefits */}
      <FadeIn delay={0.1}>
        <div className="bg-white rounded-3xl border border-[#C8E6D0] p-5">
          <p className="text-sm font-bold text-forest mb-4">{lang === 'ar' ? 'مزايا Blue Flag' : 'Blue Flag Benefits'}</p>
          <div className="grid grid-cols-2 gap-3">
            {BENEFITS.map(b => (
              <div key={b.en} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,105,148,0.08)' }}>
                  <b.Icon className="w-4 h-4" style={{ color: '#006994' }} />
                </div>
                <p className="text-xs font-medium text-forest">{lang === 'ar' ? b.ar : b.en}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Certification history */}
      <FadeIn delay={0.14}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7A9080' }}>
            {lang === 'ar' ? 'سجل الشهادات' : 'Certification History'}
          </p>
          <div className="space-y-3">
            {HISTORY.map(cert => (
              <div key={cert.id} className="bg-white rounded-2xl border border-[#C8E6D0] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cert.color}14` }}>
                  <Award className="w-5 h-5" style={{ color: cert.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-forest">{lang === 'ar' ? cert.programme_ar : cert.programme_en}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#EDF7F1', color: '#40916C' }}>
                      {lang === 'ar' ? cert.status_ar : cert.status_en}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#7A9080' }}>{cert.id}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" style={{ color: '#A8BFB0' }} />
                    <p className="text-xs" style={{ color: '#A8BFB0' }}>{cert.valid}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#EDF7F1] transition-colors">
                    <Download className="w-4 h-4" style={{ color: '#40916C' }} />
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#EDF7F1] transition-colors">
                    <Share2 className="w-4 h-4" style={{ color: '#40916C' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Download current */}
      <FadeIn delay={0.18}>
        <div className="flex gap-3">
          <button className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #006994, #0096C7)' }}>
            <Download className="w-4 h-4" />
            {lang === 'ar' ? 'تنزيل الشهادة الحالية' : 'Download Current Certificate'}
          </button>
          <button className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: '#EFF8FE', color: '#006994', border: '1px solid rgba(0,105,148,0.2)' }}>
            <Share2 className="w-4 h-4" />
            {lang === 'ar' ? 'مشاركة الشارة' : 'Share Badge'}
          </button>
        </div>
      </FadeIn>
    </div>
  )
}
