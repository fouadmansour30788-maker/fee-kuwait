'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, CheckCircle2, AlertCircle, Clock, Download, Trash2, Plus } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const REQUIRED_DOCS = [
  {
    id: 'committee',
    title_en: 'Eco-Committee Member List',
    title_ar: 'قائمة أعضاء اللجنة البيئية',
    desc_en: 'List of all committee members with roles',
    desc_ar: 'قائمة بجميع أعضاء اللجنة مع أدوارهم',
    required: true,
    status: 'uploaded',
    file: 'eco-committee-2026.pdf',
    size: '124 KB',
    date: '2026-03-05',
  },
  {
    id: 'review',
    title_en: 'Environmental Review Report',
    title_ar: 'تقرير المراجعة البيئية',
    desc_en: 'Full audit results for energy, water, and waste',
    desc_ar: 'نتائج التدقيق الكاملة للطاقة والمياه والنفايات',
    required: true,
    status: 'pending',
    file: null,
    size: null,
    date: null,
  },
  {
    id: 'action',
    title_en: 'Action Plan Document',
    title_ar: 'وثيقة خطة العمل',
    desc_en: 'Signed action plan with goals and timelines',
    desc_ar: 'خطة العمل الموقعة مع الأهداف والجداول الزمنية',
    required: true,
    status: 'pending',
    file: null,
    size: null,
    date: null,
  },
  {
    id: 'photos',
    title_en: 'Activity Photos',
    title_ar: 'صور الأنشطة',
    desc_en: 'Photos documenting your environmental activities',
    desc_ar: 'صور توثق أنشطتكم البيئية',
    required: false,
    status: 'uploaded',
    file: 'activities-photos-q1.zip',
    size: '8.2 MB',
    date: '2026-05-10',
  },
  {
    id: 'principal',
    title_en: 'Principal Approval Letter',
    title_ar: 'خطاب موافقة المدير',
    desc_en: 'Signed letter from school principal',
    desc_ar: 'خطاب موقع من مدير المدرسة',
    required: true,
    status: 'review',
    file: 'principal-approval.pdf',
    size: '89 KB',
    date: '2026-05-20',
  },
]

const STATUS_CONFIG = {
  uploaded: { color: '#40916C', bg: '#EDF7F1', Icon: CheckCircle2, en: 'Uploaded', ar: 'تم الرفع' },
  pending: { color: '#7A9080', bg: '#F4F9F5', Icon: Clock, en: 'Required', ar: 'مطلوب' },
  review: { color: '#C8A951', bg: '#FEF9EC', Icon: AlertCircle, en: 'Under Review', ar: 'قيد المراجعة' },
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function DocumentsPage() {
  const { lang } = useLang()
  const [dragging, setDragging] = useState(false)

  const uploadedCount = REQUIRED_DOCS.filter(d => d.status === 'uploaded' || d.status === 'review').length
  const requiredCount = REQUIRED_DOCS.filter(d => d.required).length
  const requiredUploaded = REQUIRED_DOCS.filter(d => d.required && (d.status === 'uploaded' || d.status === 'review')).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'المستندات' : 'Documents'}</h1>
            <p className="text-sm mt-1" style={{ color: '#7A9080' }}>
              {lang === 'ar'
                ? `${requiredUploaded} من ${requiredCount} مستندات مطلوبة مرفوعة`
                : `${requiredUploaded} of ${requiredCount} required documents uploaded`}
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #40916C, #52B788)' }}>
            <Plus className="w-4 h-4" />
            {lang === 'ar' ? 'رفع مستند' : 'Upload'}
          </button>
        </div>
      </FadeIn>

      {/* Progress */}
      <FadeIn delay={0.05}>
        <div className="bg-white rounded-3xl border border-[#C8E6D0] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-forest">{lang === 'ar' ? 'اكتمال المستندات' : 'Document Completion'}</span>
            <span className="text-sm font-bold text-brand">{Math.round((requiredUploaded / requiredCount) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: '#EDF7F1' }}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${(requiredUploaded / requiredCount) * 100}%`, background: 'linear-gradient(90deg, #52B788, #40916C)' }} />
          </div>
          <div className="flex gap-4 mt-4">
            {[
              { label_en: 'Total files', label_ar: 'إجمالي الملفات', val: `${uploadedCount}/${REQUIRED_DOCS.length}` },
              { label_en: 'Required', label_ar: 'مطلوبة', val: `${requiredUploaded}/${requiredCount}` },
            ].map(item => (
              <div key={item.label_en}>
                <p className="text-lg font-bold text-forest">{item.val}</p>
                <p className="text-xs" style={{ color: '#7A9080' }}>{lang === 'ar' ? item.label_ar : item.label_en}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Drop zone */}
      <FadeIn delay={0.08}>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={() => setDragging(false)}
          className="rounded-3xl border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-all cursor-pointer"
          style={{ borderColor: dragging ? '#52B788' : '#C8E6D0', background: dragging ? '#F0FAF4' : '#F9FBF9' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#EDF7F1' }}>
            <Upload className="w-6 h-6" style={{ color: '#40916C' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-forest">
              {lang === 'ar' ? 'اسحب الملفات هنا أو انقر للتحديد' : 'Drag files here or click to select'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#7A9080' }}>
              {lang === 'ar' ? 'PDF، JPG، PNG — حتى 20 ميغابايت' : 'PDF, JPG, PNG — up to 20 MB'}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Document list */}
      <div className="space-y-3">
        {REQUIRED_DOCS.map((doc, i) => {
          const cfg = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG]
          const StatusIcon = cfg.Icon
          return (
            <FadeIn key={doc.id} delay={0.1 + i * 0.04}>
              <div className="bg-white rounded-2xl border border-[#C8E6D0] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EDF7F1' }}>
                  <FileText className="w-5 h-5" style={{ color: '#40916C' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-forest">{lang === 'ar' ? doc.title_ar : doc.title_en}</p>
                    {doc.required && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: '#FEF0F0', color: '#D64545' }}>
                        {lang === 'ar' ? 'مطلوب' : 'Required'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#7A9080' }}>
                    {doc.file ? `${doc.file} · ${doc.size} · ${doc.date}` : (lang === 'ar' ? doc.desc_ar : doc.desc_en)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    <StatusIcon className="w-3 h-3" />
                    {lang === 'ar' ? cfg.ar : cfg.en}
                  </span>
                  {doc.file && (
                    <>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#EDF7F1] transition-colors">
                        <Download className="w-4 h-4" style={{ color: '#40916C' }} />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FEF0F0] transition-colors">
                        <Trash2 className="w-4 h-4" style={{ color: '#D64545' }} />
                      </button>
                    </>
                  )}
                  {!doc.file && (
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                      style={{ background: 'linear-gradient(135deg, #40916C, #52B788)', color: '#fff' }}>
                      {lang === 'ar' ? 'رفع' : 'Upload'}
                    </button>
                  )}
                </div>
              </div>
            </FadeIn>
          )
        })}
      </div>
    </div>
  )
}
