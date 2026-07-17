'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  User, Mail, Lock, Eye, EyeOff, Building2, School,
  MapPin, Phone, Users, ChevronRight, ChevronLeft,
  CheckCircle2, ArrowRight, Waves, KeyRound, Leaf,
  Newspaper, GraduationCap, AlertCircle, Check,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { createClient } from '@/lib/supabase/client'
import { PS_QUESTIONS, PS_SERVICES, evaluatePreScreening } from '@/lib/data/preScreening'
import type { PSAnswers, PSQuestion } from '@/lib/data/preScreening'
import { ESTABLISHMENT_CATEGORIES } from '@/lib/data/greenKeyCriteria'

// ── Types ──────────────────────────────────────────
type InstitutionType = 'school' | 'business'

// Register governorate labels (en/ar) → schools.governorate check-constraint values.
const GOV_MAP: Record<string, string> = {
  'Kuwait City': 'Capital', 'مدينة الكويت': 'Capital',
  'Hawalli': 'Hawalli', 'حولي': 'Hawalli',
  'Farwaniyah': 'Farwaniya', 'الفروانية': 'Farwaniya',
  'Ahmadi': 'Ahmadi', 'الأحمدي': 'Ahmadi',
  'Jahra': 'Jahra', 'الجهراء': 'Jahra',
  'Mubarak Al-Kabeer': 'Mubarak Al-Kabeer', 'مبارك الكبير': 'Mubarak Al-Kabeer',
}

interface FormData {
  // Step 1 — Account
  name: string
  email: string
  password: string
  confirmPassword: string
  // Step 2 — Institution
  institutionName: string
  institutionNameAr: string
  schoolType: string
  businessType: string
  governorate: string
  address: string
  studentsCount: string
  contactName: string
  contactPhone: string
  // Step 3 — Programme(s)
  programmes: string[]
}

// ── Constants ───────────────────────────────────────
const GOVERNORATES_EN = ['Kuwait City', 'Hawalli', 'Farwaniyah', 'Ahmadi', 'Jahra', 'Mubarak Al-Kabeer']
const GOVERNORATES_AR = ['مدينة الكويت', 'حولي', 'الفروانية', 'الأحمدي', 'الجهراء', 'مبارك الكبير']

const SCHOOL_TYPES = [
  { value: 'public',        en: 'Public School',        ar: 'مدرسة حكومية' },
  { value: 'private',       en: 'Private School',       ar: 'مدرسة خاصة' },
  { value: 'international', en: 'International School',  ar: 'مدرسة دولية' },
]
const BUSINESS_TYPES = [
  { value: 'hotel',      en: 'Hotel / Resort',      ar: 'فندق / منتجع' },
  { value: 'restaurant', en: 'Restaurant / Café',   ar: 'مطعم / مقهى' },
  { value: 'beach',      en: 'Beach',               ar: 'شاطئ' },
  { value: 'marina',     en: 'Marina',              ar: 'مرسى' },
  { value: 'other',      en: 'Other',               ar: 'أخرى' },
]

const PROGRAMMES = [
  {
    id: 'eco-schools', en: 'Eco-Schools', ar: 'المدارس البيئية',
    desc_en: 'For schools committed to environmental action and the Green Flag.',
    desc_ar: 'للمدارس الملتزمة بالعمل البيئي والعلم الأخضر.',
    color: '#52B788', Icon: School, eligible: ['school'],
  },
  {
    id: 'blue-flag', en: 'Blue Flag', ar: 'العلم الأزرق',
    desc_en: 'For beaches, marinas and sustainable boating operators.',
    desc_ar: 'للشواطئ والمراسي ومشغلي القوارب المستدامة.',
    color: '#006994', Icon: Waves, eligible: ['business'], bizTypes: ['beach', 'marina', 'other'],
  },
  {
    id: 'green-key', en: 'Green Key', ar: 'المفتاح الأخضر',
    desc_en: 'For hotels, restaurants, and tourism operators.',
    desc_ar: 'للفنادق والمطاعم ومشغلي السياحة.',
    color: '#C8A951', Icon: KeyRound, eligible: ['business'], bizTypes: ['hotel', 'restaurant', 'other'],
  },
  {
    id: 'leaf', en: 'LEAF', ar: 'LEAF',
    desc_en: 'Learning about forests — for primary and secondary schools.',
    desc_ar: 'التعلم عن الغابات — للمدارس الابتدائية والثانوية.',
    color: '#1B4332', Icon: Leaf, eligible: ['school'],
  },
  {
    id: 'yre', en: 'Young Reporters (YRE)', ar: 'المراسلون الشباب (YRE)',
    desc_en: 'For young journalists aged 13–25 in schools or universities.',
    desc_ar: 'للصحفيين الشباب 13–25 في المدارس أو الجامعات.',
    color: '#74C69D', Icon: Newspaper, eligible: ['school', 'business'], bizTypes: ['other'],
  },
  {
    id: 'eco-campus', en: 'Eco-Campus', ar: 'الحرم البيئي',
    desc_en: 'For universities and higher education institutions.',
    desc_ar: 'للجامعات ومؤسسات التعليم العالي.',
    color: '#40916C', Icon: GraduationCap, eligible: ['business'], bizTypes: ['other'],
  },
]

// Wizard step labels. Hospitality (business) registrations get a pre-screening
// section first; schools go straight to Account.
const STEP_LABELS: Record<string, { en: string; ar: string }> = {
  prescreen:   { en: 'Eligibility',  ar: 'الأهلية' },
  account:     { en: 'Account',      ar: 'الحساب' },
  institution: { en: 'Institution',  ar: 'المؤسسة' },
  programme:   { en: 'Programme',    ar: 'البرنامج' },
  review:      { en: 'Review',       ar: 'المراجعة' },
}
// Pre-screening sections shown in the wizard (General information is collected by
// the Account/Institution steps, so it is omitted here).
const PS_WIZARD_SECTIONS = ['Eligibility', 'Main category', 'Scope & sub-categories', 'Operational filters', 'Declarations']
const catLabel = (c: string) => ESTABLISHMENT_CATEGORIES.find((x) => x.code === c)?.label ?? c

const EMPTY: FormData = {
  name: '', email: '', password: '', confirmPassword: '',
  institutionName: '', institutionNameAr: '',
  schoolType: '', businessType: '', governorate: '',
  address: '', studentsCount: '', contactName: '', contactPhone: '',
  programmes: [],
}

// ── Helpers ─────────────────────────────────────────
function FieldError({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: '#E53E3E' }}>
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{msg}
    </p>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-forest mb-1.5">{children}</label>
}

// ── Main component (inner, uses searchParams) ────────
function RegisterForm() {
  const { lang } = useLang()
  const searchParams = useSearchParams()
  const router = useRouter()

  const typeParam = searchParams.get('type') as InstitutionType | null
  const progParam = searchParams.get('programme') ?? ''

  const [institutionType, setInstitutionType] = useState<InstitutionType>(typeParam === 'business' ? 'business' : 'school')
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [data, setData] = useState<FormData>({ ...EMPTY, programmes: progParam ? [progParam] : [] })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'general', string>>>({})
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // If no type param, show a type selector before step 0
  const [typeChosen, setTypeChosen] = useState(!!typeParam)

  // Pre-screening (hospitality) — collected as the first wizard section for every
  // business/hospitality registration. Green Key establishments get a category;
  // non-Green-Key businesses (e.g. Blue Flag beaches) can still proceed.
  const [ps, setPs] = useState<PSAnswers>({})
  const hasPreScreen = institutionType === 'business'
  const flow: string[] = [...(hasPreScreen ? ['prescreen'] : []), 'account', 'institution', 'programme', 'review']
  const stepId = flow[step] ?? 'review'
  const psResult = evaluatePreScreening(ps)
  const psVisible = PS_QUESTIONS.filter((q) => PS_WIZARD_SECTIONS.includes(q.section) && (!q.showIf || q.showIf(ps)))
  // All visible questions answered, and not explicitly ineligible. A null result
  // (e.g. a beach with no Green Key category) may still continue to registration.
  const psComplete = psVisible.every((q) => {
    const v = ps[q.id]
    if (q.field === 'checkbox') return v === true
    if (q.field === 'multiservice') return true
    return v !== undefined && v !== '' && v !== null
  }) && psResult.eligible !== false
  const setPsAnswer = (id: string, v: string | string[] | boolean) => { setPs((p) => ({ ...p, [id]: v })); setErrors((e) => ({ ...e, general: '' })) }
  const togglePsService = (val: string) => {
    const cur = Array.isArray(ps.q_services) ? ps.q_services : []
    setPsAnswer('q_services', cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val])
  }

  function PsField({ q }: { q: PSQuestion }) {
    if (q.field === 'yesno') return (
      <div className="inline-flex items-center gap-1.5">
        {(['yes', 'no'] as const).map((v) => {
          const on = ps[q.id] === v
          return (
            <button key={v} type="button" onClick={() => setPsAnswer(q.id, v)} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold"
              style={on ? { background: v === 'yes' ? '#40916C' : '#DC2626', color: '#fff' } : { background: '#F4F9F5', color: v === 'yes' ? '#40916C' : '#DC2626', border: '1px solid #C8E6D0' }}>
              {v === 'yes' ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')}
            </button>
          )
        })}
      </div>
    )
    if (q.field === 'checkbox') return (
      <label className="flex items-start gap-2 cursor-pointer">
        <input type="checkbox" checked={ps[q.id] === true} onChange={(e) => setPsAnswer(q.id, e.target.checked)} className="mt-1 w-4 h-4 accent-green-700" />
        <span className="text-sm" style={{ color: '#334155' }}>{q.text}</span>
      </label>
    )
    if (q.field === 'multiservice') {
      const cur = Array.isArray(ps.q_services) ? ps.q_services : []
      return (
        <div className="flex flex-col gap-1.5">
          {PS_SERVICES.map((s) => (
            <label key={s.value} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#334155' }}>
              <input type="checkbox" checked={cur.includes(s.value)} onChange={() => togglePsService(s.value)} className="w-4 h-4 accent-green-700" />{s.label}
            </label>
          ))}
        </div>
      )
    }
    const type = q.field === 'email' ? 'email' : 'text'
    return <input type={type} value={(ps[q.id] as string) ?? ''} onChange={(e) => setPsAnswer(q.id, e.target.value)} className="input max-w-md" placeholder={q.field === 'country' ? (lang === 'ar' ? 'الدولة' : 'Country') : ''} />
  }

  function set(key: keyof FormData, val: string) {
    setData(d => ({ ...d, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function toggleProgramme(id: string) {
    setData(d => ({ ...d, programmes: d.programmes.includes(id) ? d.programmes.filter(p => p !== id) : [...d.programmes, id] }))
    setErrors(e => ({ ...e, programmes: '' }))
  }

  // ── Validation ──────────────────────────────────
  function validateStep(s: string): boolean {
    const e: typeof errors = {}
    const required = (k: keyof FormData, msg: string) => { if (!data[k]) e[k] = msg }

    if (s === 'prescreen') {
      if (!psComplete) {
        e.general = psResult.eligible === false
          ? (lang === 'ar' ? 'المنشأة غير مؤهلة بناءً على إجاباتك.' : 'Based on your answers, the establishment is not eligible.')
          : (lang === 'ar' ? 'يرجى الإجابة على جميع أسئلة الأهلية.' : 'Please answer all eligibility questions.')
      }
    }

    if (s === 'account') {
      required('name', lang === 'ar' ? 'الاسم مطلوب' : 'Name is required')
      required('email', lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required')
      if (data.email && !/^[^@]+@[^@]+\.[^@]+$/.test(data.email))
        e.email = lang === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email address'
      required('password', lang === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required')
      if (data.password && data.password.length < 8)
        e.password = lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters'
      if (data.password && data.confirmPassword && data.password !== data.confirmPassword)
        e.confirmPassword = lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'
      required('confirmPassword', lang === 'ar' ? 'تأكيد كلمة المرور مطلوب' : 'Please confirm your password')
    }

    if (s === 'institution') {
      required('institutionName', lang === 'ar' ? 'اسم المؤسسة مطلوب' : 'Institution name is required')
      if (institutionType === 'school') {
        required('schoolType', lang === 'ar' ? 'نوع المدرسة مطلوب' : 'School type is required')
        required('contactName', lang === 'ar' ? 'اسم المدير مطلوب' : 'Principal name is required')
      } else {
        required('businessType', lang === 'ar' ? 'نوع المنشأة مطلوب' : 'Establishment type is required')
        required('contactName', lang === 'ar' ? 'اسم جهة الاتصال مطلوب' : 'Contact name is required')
      }
      required('governorate', lang === 'ar' ? 'المحافظة مطلوبة' : 'Governorate is required')
      required('contactPhone', lang === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required')
    }

    if (s === 'programme') {
      if (data.programmes.length === 0)
        e.programmes = lang === 'ar' ? 'يرجى اختيار برنامج واحد على الأقل' : 'Please select at least one programme'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (!validateStep(stepId)) return
    setDirection(1)
    setStep(s => s + 1)
  }

  function back() {
    setDirection(-1)
    setStep(s => s - 1)
  }

  async function handleSubmit() {
    if (!validateStep('review')) return
    setSubmitting(true)
    setErrors(e => ({ ...e, general: '' }))

    const supabase = createClient()
    const { data: signUp, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: institutionType,                 // 'school' | 'business'
          name_en: data.institutionName || data.name,
          name_ar: data.institutionNameAr || null,
          preferred_language: lang,
        },
      },
    })
    if (error || !signUp.user) {
      setSubmitting(false)
      setErrors(e => ({ ...e, general: error?.message ?? (lang === 'ar' ? 'تعذّر إنشاء الحساب.' : 'Could not create the account.') }))
      return
    }

    // With a session (email confirmation off), create the institution record now
    // and one application per selected programme.
    if (signUp.session) {
      const uid = signUp.user.id
      let entityId: string | null = null
      if (institutionType === 'school') {
        const { data: row } = await supabase.from('schools').insert({
          user_id: uid, name_en: data.institutionName, name_ar: data.institutionNameAr || null,
          type: data.schoolType || null, governorate: GOV_MAP[data.governorate] ?? null,
          address: data.address || null, students_count: data.studentsCount ? Number(data.studentsCount) : null,
          principal_name: data.contactName || null, principal_phone: data.contactPhone || null,
        }).select('id').single()
        entityId = row?.id ?? null
      } else {
        const { data: row } = await supabase.from('businesses').insert({
          user_id: uid, name_en: data.institutionName, name_ar: data.institutionNameAr || null,
          type: data.businessType || null, governorate: data.governorate || null, address: data.address || null,
        }).select('id').single()
        entityId = row?.id ?? null
      }
      // One application per chosen programme (e.g. Green Key + Blue Flag).
      if (data.programmes.length > 0) {
        const { data: createdApps } = await supabase.from('applications').insert(
          data.programmes.map((programme) => ({
            applicant_id: uid, entity_type: institutionType, entity_id: entityId, programme, status: 'new',
          }))
        ).select('id, programme')

        // Save the pre-screening (Stage 1) with the Green Key application.
        const gk = createdApps?.find((a) => a.programme === 'green-key')
        if (gk && hasPreScreen && psResult.mainCategory) {
          await supabase.from('pre_screening').insert({
            application_id: gk.id, answers: ps, eligible: psResult.eligible, ineligible_reason: psResult.ineligibleReason,
            main_category: psResult.mainCategory, sub_categories: psResult.subCategories, flags: psResult.flags,
            status: 'submitted', submitted_at: new Date().toISOString(),
          })
        }
      }
    }

    setSubmitting(false)
    setSubmitted(true)
    // Signed-in → workspace; else (email confirmation required) → login after verifying.
    const dest = signUp.session ? (institutionType === 'school' ? '/school/dashboard' : '/business/dashboard') : '/login'
    setTimeout(() => { router.push(dest); router.refresh() }, 2500)
  }

  // ── Eligible programmes for this institution type ──
  // For a business, also narrow by the selected establishment type so a hotel
  // doesn't see education/other-sector programmes (e.g. Eco-Campus, YRE).
  const fitsBizType = (p: (typeof PROGRAMMES)[number]) => {
    const bt = (p as { bizTypes?: string[] }).bizTypes
    return institutionType !== 'business' || !bt || !data.businessType || bt.includes(data.businessType)
  }
  const eligibleProgs = PROGRAMMES.filter(p => p.eligible.includes(institutionType) && fitsBizType(p))
  const otherProgs = PROGRAMMES.filter(p => !(p.eligible.includes(institutionType) && fitsBizType(p)))

  // ── Type selector (shown when no ?type param) ──────
  if (!typeChosen) {
    return (
      <div className="w-full max-w-md mx-auto pt-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            {lang === 'ar' ? 'أنت من؟' : 'Who are you registering?'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-sm">
            {lang === 'ar' ? 'سنوجهك نحو البرامج المناسبة لمؤسستك.' : "We'll guide you to the right programmes for your institution."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { type: 'school' as const, Icon: School, color: '#52B788', en: 'A School', ar: 'مدرسة', subEn: 'Eco-Schools, LEAF, YRE', subAr: 'مدارس بيئية، LEAF، YRE' },
            { type: 'business' as const, Icon: Building2, color: '#C8A951', en: 'A Hospitality Establishment', ar: 'منشأة ضيافة', subEn: 'Blue Flag, Green Key, Eco-Campus', subAr: 'علم أزرق، مفتاح أخضر، حرم بيئي' },
          ].map(({ type, Icon, color, en, ar, subEn, subAr }) => (
            <button
              key={type}
              onClick={() => { setInstitutionType(type); setTypeChosen(true) }}
              className="rounded-3xl p-7 text-left transition-all duration-200 hover:-translate-y-1 group"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `${color}20` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <p className="font-bold text-white text-base mb-1">{lang === 'ar' ? ar : en}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{lang === 'ar' ? subAr : subEn}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Success screen ──────────────────────────────────
  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto pt-8 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(82,183,136,0.15)', border: '2px solid rgba(82,183,136,0.4)' }}>
            <CheckCircle2 className="w-12 h-12" style={{ color: '#52B788' }} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            {lang === 'ar' ? 'تم التسجيل بنجاح!' : 'Registration Successful!'}
          </h2>
          <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {lang === 'ar'
              ? 'مرحباً بك في FEE الكويت. جاري توجيهك إلى لوحة التحكم...'
              : 'Welcome to FEE Kuwait. Redirecting you to your dashboard...'}
          </p>
          <div className="flex justify-center gap-1.5">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: '#52B788' }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Wizard ──────────────────────────────────────────
  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  }

  return (
    <div className="w-full max-w-2xl mx-auto pt-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest mb-5"
          style={{ background: institutionType === 'school' ? 'rgba(82,183,136,0.12)' : 'rgba(200,169,81,0.12)', border: `1px solid ${institutionType === 'school' ? 'rgba(82,183,136,0.3)' : 'rgba(200,169,81,0.3)'}`, color: institutionType === 'school' ? '#74C69D' : '#C8A951' }}>
          {institutionType === 'school'
            ? <><School className="w-3 h-3" />{lang === 'ar' ? 'تسجيل مدرسة' : 'School Registration'}</>
            : <><Building2 className="w-3 h-3" />{lang === 'ar' ? 'تسجيل منشأة ضيافة' : 'Hospitality Establishment Registration'}</>}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {lang === 'ar' ? 'إنشاء حسابك' : 'Create Your Account'}
        </h1>
      </div>

      {/* Progress steps */}
      <div className="flex items-center mb-8 px-2">
        {flow.map((sid, i) => (
          <div key={sid} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0"
                style={i < step
                  ? { background: '#40916C', color: '#fff' }
                  : i === step
                  ? { background: 'rgba(82,183,136,0.2)', border: '2px solid #52B788', color: '#74C69D' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.3)' }}
              >
                {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span className="text-[10px] font-semibold whitespace-nowrap hidden sm:block"
                style={{ color: i === step ? '#74C69D' : 'rgba(255,255,255,0.3)' }}>
                {lang === 'ar' ? STEP_LABELS[sid].ar : STEP_LABELS[sid].en}
              </span>
            </div>
            {/* Connector */}
            {i < flow.length - 1 && (
              <div className="flex-1 h-px mx-2 transition-colors duration-300"
                style={{ background: i < step ? '#40916C' : 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step card */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="p-8 md:p-10"
          >

            {/* ── Pre-screening (hospitality) ─────── */}
            {stepId === 'prescreen' && (
              <div>
                <h2 className="text-xl font-bold text-forest mb-1">{lang === 'ar' ? 'تقييم الأهلية المسبق' : 'Pre-screening'}</h2>
                <p className="text-sm mb-6" style={{ color: '#5A6672' }}>
                  {lang === 'ar' ? 'نحدّد أولاً أهليتك وفئة المفتاح الأخضر قبل التسجيل.' : "First, let's determine your eligibility and Green Key category before registration."}
                </p>
                <div className="space-y-6">
                  {PS_WIZARD_SECTIONS.map((section) => {
                    const qs = psVisible.filter((q) => q.section === section)
                    if (!qs.length) return null
                    return (
                      <div key={section}>
                        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#40916C' }}>{section}</p>
                        <div className="space-y-4">
                          {qs.map((q) => (
                            <div key={q.id}>
                              {q.field !== 'checkbox' && <label className="block text-sm font-medium mb-1.5" style={{ color: '#1E293B' }}>{q.text}</label>}
                              <PsField q={q} />
                              {q.help && <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{q.help}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {/* Live result */}
                  <div className="rounded-2xl p-4" style={{ background: '#F4F9F5', border: '1px solid #C8E6D0' }}>
                    {psResult.eligible === false ? (
                      <p className="text-sm font-medium" style={{ color: '#B91C1C' }}>{lang === 'ar' ? 'غير مؤهل: ' : 'Not eligible: '}{psResult.ineligibleReason}</p>
                    ) : psResult.mainCategory ? (
                      <div className="text-sm" style={{ color: '#334155' }}>
                        <p className="font-semibold" style={{ color: '#047857' }}>{lang === 'ar' ? 'يبدو مؤهلاً للمفتاح الأخضر.' : 'Seems eligible for Green Key.'}</p>
                        <p className="mt-1">{lang === 'ar' ? 'الفئة الرئيسية: ' : 'Main category: '}<strong>{catLabel(psResult.mainCategory)} ({psResult.mainCategory})</strong></p>
                        {psResult.subCategories.length > 0 && <p>{lang === 'ar' ? 'فئات فرعية: ' : 'Sub-categories: '}<strong>{psResult.subCategories.map(catLabel).join(', ')}</strong></p>}
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: '#7A9080' }}>{lang === 'ar' ? 'أجب عن الأسئلة أعلاه لعرض الأهلية والفئة.' : 'Answer the questions above to see eligibility and category.'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 0: Account ─────────────────── */}
            {stepId === 'account' && (
              <div>
                <h2 className="text-xl font-bold text-forest mb-1">
                  {lang === 'ar' ? 'تفاصيل الحساب' : 'Account Details'}
                </h2>
                <p className="text-sm mb-7" style={{ color: '#5A6672' }}>
                  {lang === 'ar' ? 'هذه بيانات تسجيل الدخول الخاصة بك.' : 'These will be your login credentials.'}
                </p>
                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <Label>{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
                      <input type="text" value={data.name} onChange={e => set('name', e.target.value)}
                        className="input pl-10" placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Your full name'} />
                    </div>
                    {errors.name && <FieldError msg={errors.name} />}
                  </div>

                  {/* Email */}
                  <div>
                    <Label>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
                      <input type="email" value={data.email} onChange={e => set('email', e.target.value)}
                        className="input pl-10" placeholder="you@institution.com" />
                    </div>
                    {errors.email && <FieldError msg={errors.email} />}
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{lang === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
                        <input type={showPass ? 'text' : 'password'} value={data.password} onChange={e => set('password', e.target.value)}
                          className="input pl-10 pr-10" placeholder="Min. 8 characters" />
                        <button type="button" onClick={() => setShowPass(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#7A9080' }}>
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <FieldError msg={errors.password} />}
                    </div>
                    <div>
                      <Label>{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
                        <input type={showConfirm ? 'text' : 'password'} value={data.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                          className="input pl-10 pr-10" placeholder="Repeat password" />
                        <button type="button" onClick={() => setShowConfirm(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#7A9080' }}>
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <FieldError msg={errors.confirmPassword} />}
                    </div>
                  </div>

                  {/* Password strength */}
                  {data.password && (
                    <div className="flex gap-1.5 items-center">
                      {[8, 12, 16].map((len, i) => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-colors duration-300"
                          style={{ background: data.password.length >= len ? '#40916C' : '#C8E6D0' }} />
                      ))}
                      <span className="text-[10px] font-semibold ml-1" style={{ color: data.password.length >= 12 ? '#40916C' : '#7A9080' }}>
                        {data.password.length < 8 ? (lang === 'ar' ? 'ضعيف' : 'Weak') :
                         data.password.length < 12 ? (lang === 'ar' ? 'متوسط' : 'Fair') :
                         (lang === 'ar' ? 'قوي' : 'Strong')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 1: Institution ─────────────── */}
            {stepId === 'institution' && (
              <div>
                <h2 className="text-xl font-bold text-forest mb-1">
                  {lang === 'ar' ? 'تفاصيل المؤسسة' : 'Institution Details'}
                </h2>
                <p className="text-sm mb-7" style={{ color: '#5A6672' }}>
                  {lang === 'ar'
                    ? 'أخبرنا عن مدرستك أو منشأتك.'
                    : 'Tell us about your school or business.'}
                </p>
                <div className="space-y-5">
                  {/* Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{lang === 'ar' ? 'اسم المؤسسة (إنجليزي)' : 'Institution Name (EN)'}</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
                        <input type="text" value={data.institutionName} onChange={e => set('institutionName', e.target.value)}
                          className="input pl-10" placeholder="Name in English" />
                      </div>
                      {errors.institutionName && <FieldError msg={errors.institutionName} />}
                    </div>
                    <div>
                      <Label>{lang === 'ar' ? 'اسم المؤسسة (عربي)' : 'Institution Name (AR)'}</Label>
                      <input type="text" value={data.institutionNameAr} onChange={e => set('institutionNameAr', e.target.value)}
                        className="input text-right" placeholder="الاسم بالعربية" dir="rtl" />
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <Label>{lang === 'ar' ? 'نوع المؤسسة' : 'Institution Type'}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(institutionType === 'school' ? SCHOOL_TYPES : BUSINESS_TYPES).map(t => (
                        <button key={t.value} type="button"
                          onClick={() => institutionType === 'school' ? set('schoolType', t.value) : set('businessType', t.value)}
                          className="py-2.5 px-3 rounded-xl text-xs font-semibold text-center transition-all duration-200"
                          style={
                            (institutionType === 'school' ? data.schoolType : data.businessType) === t.value
                              ? { background: '#40916C', color: '#fff' }
                              : { background: '#F4F9F5', color: '#40916C', border: '1px solid #C8E6D0' }
                          }
                        >
                          {lang === 'ar' ? t.ar : t.en}
                        </button>
                      ))}
                    </div>
                    {(errors.schoolType || errors.businessType) && (
                      <FieldError msg={errors.schoolType || errors.businessType || ''} />
                    )}
                  </div>

                  {/* Governorate + Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{lang === 'ar' ? 'المحافظة' : 'Governorate'}</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
                        <select value={data.governorate} onChange={e => set('governorate', e.target.value)} className="input pl-10 appearance-none">
                          <option value="">{lang === 'ar' ? 'اختر...' : 'Select...'}</option>
                          {GOVERNORATES_EN.map((g, i) => (
                            <option key={g} value={g}>{lang === 'ar' ? GOVERNORATES_AR[i] : g}</option>
                          ))}
                        </select>
                      </div>
                      {errors.governorate && <FieldError msg={errors.governorate} />}
                    </div>
                    <div>
                      <Label>{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
                        <input type="tel" value={data.contactPhone} onChange={e => set('contactPhone', e.target.value)}
                          className="input pl-10" placeholder="+965 XXXX XXXX" />
                      </div>
                      {errors.contactPhone && <FieldError msg={errors.contactPhone} />}
                    </div>
                  </div>

                  {/* Contact / Principal */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        {institutionType === 'school'
                          ? (lang === 'ar' ? 'اسم المدير' : 'Principal Name')
                          : (lang === 'ar' ? 'اسم جهة الاتصال' : 'Contact Name')}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
                        <input type="text" value={data.contactName} onChange={e => set('contactName', e.target.value)}
                          className="input pl-10" placeholder={lang === 'ar' ? 'الاسم' : 'Full name'} />
                      </div>
                      {errors.contactName && <FieldError msg={errors.contactName} />}
                    </div>
                    {institutionType === 'school' && (
                      <div>
                        <Label>{lang === 'ar' ? 'عدد الطلاب' : 'Number of Students'}</Label>
                        <div className="relative">
                          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
                          <input type="number" min="0" value={data.studentsCount} onChange={e => set('studentsCount', e.target.value)}
                            className="input pl-10" placeholder="e.g. 800" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <Label>{lang === 'ar' ? 'العنوان' : 'Address'}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: '#7A9080' }} />
                      <textarea value={data.address} onChange={e => set('address', e.target.value)}
                        className="input pl-10 resize-none" rows={2} placeholder={lang === 'ar' ? 'العنوان الكامل' : 'Full address'} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Programme ───────────────── */}
            {stepId === 'programme' && (
              <div>
                <h2 className="text-xl font-bold text-forest mb-1">
                  {lang === 'ar' ? 'اختر برنامجك' : 'Choose Your Programme'}
                </h2>
                <p className="text-sm mb-7" style={{ color: '#5A6672' }}>
                  {lang === 'ar'
                    ? 'اختر برنامجاً واحداً أو أكثر تريد التقدم له — يمكنك اختيار أكثر من برنامج.'
                    : 'Select one or more programmes to apply for — you can choose several (e.g. Green Key and Blue Flag).'}
                </p>

                {errors.programmes && (
                  <div className="mb-5 p-3 rounded-xl flex items-center gap-2 text-sm" style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#E53E3E' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.programmes}
                  </div>
                )}

                {/* Eligible */}
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#40916C' }}>
                  {lang === 'ar' ? 'مناسب لك' : 'Recommended for you'}
                </p>
                <div className="space-y-3 mb-6">
                  {eligibleProgs.map(prog => {
                    const Icon = prog.Icon
                    const selected = data.programmes.includes(prog.id)
                    return (
                      <button key={prog.id} type="button" onClick={() => toggleProgramme(prog.id)}
                        className="w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all duration-200"
                        style={selected
                          ? { background: `${prog.color}10`, border: `2px solid ${prog.color}` }
                          : { background: '#F9FBF9', border: '2px solid #C8E6D0' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${prog.color}15` }}>
                          <Icon className="w-5 h-5" style={{ color: prog.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-forest">{lang === 'ar' ? prog.ar : prog.en}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#5A6672' }}>{lang === 'ar' ? prog.desc_ar : prog.desc_en}</p>
                        </div>
                        <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                          style={selected ? { background: prog.color, borderColor: prog.color } : { borderColor: '#C8E6D0' }}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Other programmes */}
                {otherProgs.length > 0 && (
                  <>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#7A9080' }}>
                      {lang === 'ar' ? 'برامج أخرى' : 'Other programmes'}
                    </p>
                    <div className="space-y-2">
                      {otherProgs.map(prog => {
                        const Icon = prog.Icon
                        return (
                          <div key={prog.id} className="flex items-center gap-3 p-3 rounded-xl opacity-50"
                            style={{ background: '#F4F9F5', border: '1px solid #C8E6D0' }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${prog.color}12` }}>
                              <Icon className="w-4 h-4" style={{ color: prog.color }} />
                            </div>
                            <p className="text-sm font-medium text-forest">{lang === 'ar' ? prog.ar : prog.en}</p>
                            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#E8F5EC', color: '#7A9080' }}>
                              {lang === 'ar' ? 'غير متاح لهذا النوع' : 'Not for this type'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Step 3: Review ──────────────────── */}
            {stepId === 'review' && (
              <div>
                <h2 className="text-xl font-bold text-forest mb-1">
                  {lang === 'ar' ? 'مراجعة طلبك' : 'Review Your Application'}
                </h2>
                <p className="text-sm mb-7" style={{ color: '#5A6672' }}>
                  {lang === 'ar' ? 'تأكد من صحة المعلومات قبل الإرسال.' : 'Confirm everything is correct before submitting.'}
                </p>

                <div className="space-y-5">
                  {/* Account summary */}
                  <div className="rounded-2xl p-5" style={{ background: '#F4F9F5', border: '1px solid #C8E6D0' }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#40916C' }}>
                        {lang === 'ar' ? 'الحساب' : 'Account'}
                      </p>
                      <button onClick={() => { setDirection(-1); setStep(flow.indexOf('account')) }} className="text-xs font-semibold text-brand hover:text-emerald transition-colors">
                        {lang === 'ar' ? 'تعديل' : 'Edit'}
                      </button>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <p><span style={{ color: '#7A9080' }}>{lang === 'ar' ? 'الاسم: ' : 'Name: '}</span><span className="font-medium text-forest">{data.name}</span></p>
                      <p><span style={{ color: '#7A9080' }}>{lang === 'ar' ? 'البريد: ' : 'Email: '}</span><span className="font-medium text-forest">{data.email}</span></p>
                    </div>
                  </div>

                  {/* Institution summary */}
                  <div className="rounded-2xl p-5" style={{ background: '#F4F9F5', border: '1px solid #C8E6D0' }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#40916C' }}>
                        {lang === 'ar' ? 'المؤسسة' : 'Institution'}
                      </p>
                      <button onClick={() => { setDirection(-1); setStep(flow.indexOf('institution')) }} className="text-xs font-semibold text-brand hover:text-emerald transition-colors">
                        {lang === 'ar' ? 'تعديل' : 'Edit'}
                      </button>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <p><span style={{ color: '#7A9080' }}>{lang === 'ar' ? 'الاسم: ' : 'Name: '}</span><span className="font-medium text-forest">{data.institutionName}</span></p>
                      <p><span style={{ color: '#7A9080' }}>{lang === 'ar' ? 'النوع: ' : 'Type: '}</span><span className="font-medium text-forest capitalize">{institutionType === 'school' ? data.schoolType : data.businessType}</span></p>
                      <p><span style={{ color: '#7A9080' }}>{lang === 'ar' ? 'المحافظة: ' : 'Governorate: '}</span><span className="font-medium text-forest">{data.governorate}</span></p>
                      <p><span style={{ color: '#7A9080' }}>{lang === 'ar' ? 'جهة الاتصال: ' : 'Contact: '}</span><span className="font-medium text-forest">{data.contactName} · {data.contactPhone}</span></p>
                    </div>
                  </div>

                  {/* Programme summary */}
                  <div className="rounded-2xl p-5" style={{ background: '#F4F9F5', border: '1px solid #C8E6D0' }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#40916C' }}>
                        {lang === 'ar' ? 'البرنامج' : 'Programme'}
                      </p>
                      <button onClick={() => { setDirection(-1); setStep(flow.indexOf('programme')) }} className="text-xs font-semibold text-brand hover:text-emerald transition-colors">
                        {lang === 'ar' ? 'تعديل' : 'Edit'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.programmes.map((id) => {
                        const prog = PROGRAMMES.find(p => p.id === id)
                        if (!prog) return null
                        return (
                          <div key={id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: `${prog.color}12`, border: `1px solid ${prog.color}30` }}>
                            <prog.Icon className="w-4 h-4" style={{ color: prog.color }} />
                            <span className="font-semibold text-sm text-forest">{lang === 'ar' ? prog.ar : prog.en}</span>
                          </div>
                        )
                      })}
                      {data.programmes.length === 0 && <span className="text-sm" style={{ color: '#94A3B8' }}>—</span>}
                    </div>
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-center" style={{ color: '#7A9080' }}>
                    {lang === 'ar'
                      ? 'بالنقر على "إرسال الطلب" فإنك توافق على '
                      : 'By clicking "Submit Application" you agree to our '}
                    <Link href="/terms" className="text-brand hover:underline">{lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}</Link>
                    {lang === 'ar' ? ' و' : ' and '}
                    <Link href="/privacy" className="text-brand hover:underline">{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>.
                  </p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation footer */}
        {errors.general && (
          <div className="px-8 md:px-10 pb-2">
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#E53E3E' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.general}
            </div>
          </div>
        )}
        <div className="px-8 md:px-10 pb-8 flex items-center justify-between gap-4 border-t" style={{ borderColor: '#E8F5EC' }}>
          <button onClick={back} disabled={step === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-30"
            style={{ color: '#40916C' }}>
            <ChevronLeft className="w-4 h-4" />
            {lang === 'ar' ? 'السابق' : 'Back'}
          </button>

          <div className="flex gap-1.5">
            {flow.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{ background: i === step ? '#40916C' : '#C8E6D0', width: i === step ? '1.5rem' : '0.375rem' }} />
            ))}
          </div>

          {step < flow.length - 1 ? (
            <button onClick={next}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #40916C, #52B788)', boxShadow: '0 4px 12px rgba(64,145,108,0.35)' }}>
              {lang === 'ar' ? 'التالي' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #40916C, #52B788)', boxShadow: '0 4px 12px rgba(64,145,108,0.35)' }}>
              {submitting ? (
                <>
                  <motion.div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
                  {lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
                </>
              ) : (
                <>
                  {lang === 'ar' ? 'إرسال الطلب' : 'Submit Application'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sign-in link */}
      <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {lang === 'ar' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
        <Link href="/login" className="font-semibold transition-colors" style={{ color: '#74C69D' }}>
          {lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
        </Link>
      </p>
    </div>
  )
}

// ── Page wrapper (Suspense for useSearchParams) ──────
export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
