'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen, FileText, Plus, Lock, ShieldCheck, Download,
  Info, Calendar, CheckCircle2, Upload,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'
import {
  DOC_CRITERIA, DOC_YEARS, INITIAL_DOCS, CURRENT_ESTABLISHMENT, type DemoDoc,
} from '@/lib/data/criterionDocs'

const GOLD = '#C8A951'

export default function DocumentsByYearPage() {
  const { lang } = useLang()
  const [docs, setDocs] = useState<DemoDoc[]>(INITIAL_DOCS)
  const [criterion, setCriterion] = useState(DOC_CRITERIA[0].ref)
  const [year, setYear] = useState<number>(DOC_YEARS[0])
  const [locked, setLocked] = useState(false)   // true once application submitted/certified
  const [draftName, setDraftName] = useState('')

  const countFor = (ref: string, y?: number) =>
    docs.filter(d => d.criterionRef === ref && (y == null || d.year === y)).length

  const visible = useMemo(
    () => docs.filter(d => d.criterionRef === criterion && d.year === year),
    [docs, criterion, year],
  )

  function addDocument() {
    if (locked) return
    const name = draftName.trim() || `Evidence ${year}.pdf`
    const ext = name.split('.').pop()?.toUpperCase() ?? 'PDF'
    setDocs(prev => [...prev, {
      id: `D-${Date.now()}`,
      criterionRef: criterion,
      year,
      name,
      type: ext,
      size: 'just now',
      uploadedBy: CURRENT_ESTABLISHMENT,
      uploadedAt: new Date().toISOString().slice(0, 10),
    }])
    setDraftName('')
  }

  const activeCriterion = DOC_CRITERIA.find(c => c.ref === criterion)!

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold text-forest">
          {lang === 'ar' ? 'المستندات حسب المعيار والسنة' : 'Documents by Criterion & Year'}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#5A7065' }}>
          {lang === 'ar'
            ? 'شهادة متعددة السنوات: ترفع مستندات كل سنة تحت المعيار المعني. يمكن الإضافة فقط.'
            : 'Multi-year certification: upload each year’s evidence under the relevant criterion. Add-only.'}
        </p>
      </motion.div>

      {/* Status / lock banner */}
      <div className="rounded-2xl border p-4 flex items-start gap-3"
        style={locked
          ? { background: '#FEF2F2', borderColor: '#FECACA' }
          : { background: '#F0FDF4', borderColor: '#BBF7D0' }}>
        {locked ? <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#DC2626' }} />
                : <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#16A34A' }} />}
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: locked ? '#991B1B' : '#166534' }}>
            {locked
              ? (lang === 'ar' ? 'الطلب مُقدَّم — المستندات مقفلة للقراءة فقط' : 'Application submitted — documents are locked (read-only)')
              : (lang === 'ar' ? 'الطلب مفتوح — يمكن إضافة مستندات' : 'Application open — documents can be added')}
          </p>
          <p className="text-xs mt-0.5" style={{ color: locked ? '#B91C1C' : '#15803D' }}>
            {lang === 'ar'
              ? 'يمكن الإضافة فقط. لا يمكن حذف أو استبدال أي مستند مرفوع — السجل غير قابل للتعديل.'
              : 'Add-only: no uploaded document can be deleted or replaced. Once submitted, everything locks permanently — the record is tamper-proof.'}
          </p>
        </div>
        <button
          onClick={() => setLocked(l => !l)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{ background: locked ? '#FEE2E2' : '#DCFCE7', color: locked ? '#991B1B' : '#166534' }}
        >
          {locked ? (lang === 'ar' ? 'محاكاة: إعادة فتح' : 'Demo: reopen') : (lang === 'ar' ? 'محاكاة: تقديم وقفل' : 'Demo: submit & lock')}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Criteria list */}
        <div className="bg-white rounded-2xl border p-3" style={{ borderColor: '#E2EDE6' }}>
          <p className="text-xs font-bold uppercase tracking-wide px-2 py-2" style={{ color: '#94A3B8' }}>
            {lang === 'ar' ? 'المعايير' : 'Criteria'}
          </p>
          <div className="space-y-0.5">
            {DOC_CRITERIA.map(c => {
              const active = c.ref === criterion
              const years = DOC_YEARS.filter(y => countFor(c.ref, y) > 0)
              return (
                <button
                  key={c.ref}
                  onClick={() => setCriterion(c.ref)}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-colors"
                  style={active ? { background: `${GOLD}18` } : {}}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${GOLD}22`, color: '#8A6D1F' }}>{c.ref}</span>
                    <span className="text-sm font-medium flex-1" style={{ color: active ? '#1B4332' : '#475569' }}>{c.title}</span>
                    <span className="text-[11px]" style={{ color: '#94A3B8' }}>{countFor(c.ref)}</span>
                  </div>
                  {years.length > 0 && (
                    <div className="flex gap-1 mt-1.5 pl-8">
                      {years.map(y => (
                        <span key={y} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>{y}</span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected criterion: years + docs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border p-5" style={{ borderColor: '#E2EDE6' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${GOLD}22`, color: '#8A6D1F' }}>{activeCriterion.ref}</span>
            <h2 className="text-base font-bold text-forest">{activeCriterion.title}</h2>
          </div>

          {/* Year tabs */}
          <div className="flex gap-2 mt-4 mb-4 border-b" style={{ borderColor: '#F1F5F9' }}>
            {DOC_YEARS.map(y => {
              const active = y === year
              const n = countFor(criterion, y)
              return (
                <button key={y} onClick={() => setYear(y)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold -mb-px border-b-2 transition-colors"
                  style={active ? { borderColor: GOLD, color: '#8A6D1F' } : { borderColor: 'transparent', color: '#94A3B8' }}>
                  <Calendar className="w-3.5 h-3.5" /> {y}
                  <span className="text-[11px] px-1.5 rounded-full" style={{ background: active ? `${GOLD}22` : '#F1F5F9', color: active ? '#8A6D1F' : '#94A3B8' }}>{n}</span>
                </button>
              )
            })}
          </div>

          {/* Documents for selected year */}
          <div className="space-y-2.5">
            {visible.map(d => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: '#E2E8F0' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                  <FileText className="w-4 h-4" style={{ color: '#64748B' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>{d.name}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{d.type} · {d.size} · {d.uploadedBy} · {d.uploadedAt}</p>
                </div>
                {/* Immutable: view/download only — never delete */}
                <span title="Locked record (add-only)"><Lock className="w-3.5 h-3.5" style={{ color: '#CBD5E1' }} /></span>
                <button className="p-1.5 rounded-lg hover:bg-slate-100" style={{ color: '#94A3B8' }} aria-label="Download"><Download className="w-4 h-4" /></button>
              </div>
            ))}
            {visible.length === 0 && (
              <div className="text-center py-8 text-sm" style={{ color: '#94A3B8' }}>
                <FolderOpen className="w-7 h-7 mx-auto mb-2 opacity-40" />
                {lang === 'ar' ? `لا مستندات لسنة ${year} بعد.` : `No documents for ${year} yet.`}
              </div>
            )}
          </div>

          {/* Add (only) composer */}
          <div className="mt-5 pt-4 border-t" style={{ borderColor: '#F1F5F9' }}>
            {locked ? (
              <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3" style={{ background: '#F8FAFC', color: '#64748B' }}>
                <Lock className="w-4 h-4" />
                {lang === 'ar' ? 'الطلب مقفل — لا يمكن إضافة مستندات.' : 'Application locked — no further documents can be added.'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addDocument() }}
                  placeholder={lang === 'ar' ? `اسم المستند لسنة ${year}...` : `Document name for ${year}...`}
                  className="flex-1 text-sm px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#1E293B' }}
                />
                <button
                  onClick={addDocument}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #B8912F, #C8A951)' }}
                >
                  <Upload className="w-4 h-4" /> {lang === 'ar' ? `أضف إلى ${year}` : `Add to ${year}`}
                </button>
              </div>
            )}
            <p className="flex items-center gap-1.5 text-[11px] mt-2" style={{ color: '#94A3B8' }}>
              <Info className="w-3 h-3" />
              {lang === 'ar'
                ? 'المستندات المضافة لا يمكن حذفها أو استبدالها.'
                : 'Added documents cannot be deleted or replaced. New evidence goes under the current year.'}
            </p>
          </div>
        </div>
      </div>

      {/* Integrity note */}
      <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm" style={{ background: '#ECFDF3', border: '1px solid #A7F3D0', color: '#047857' }}>
        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>{lang === 'ar'
          ? 'كل سنة تُحفظ بشكل منفصل ويمكن مراجعتها وحدها. السجل غير قابل للتعديل لضمان نزاهة التدقيق.'
          : 'Each year is stored separately and can be audited on its own. The record is append-only and tamper-proof for audit integrity (enforced at the database level).'}</p>
      </div>
    </div>
  )
}
