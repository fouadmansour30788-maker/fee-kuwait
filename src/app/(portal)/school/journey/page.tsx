'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Lock, Star, Award, Leaf, Users, Search, BarChart2, BookOpen, Globe, Code2, Trophy } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const MILESTONES = [
  {
    id: 1,
    Icon: Users,
    color: '#8B9B88',
    title_en: 'Eco-Committee Formed',
    title_ar: 'تشكيل اللجنة البيئية',
    date: '2026-03-01',
    desc_en: 'Elected 8 student representatives and appointed a teacher coordinator.',
    desc_ar: 'انتخاب 8 ممثلين من الطلاب وتعيين منسق من المعلمين.',
    points: 100,
    status: 'done',
  },
  {
    id: 2,
    Icon: Search,
    color: '#006994',
    title_en: 'Environmental Review Started',
    title_ar: 'بدء المراجعة البيئية',
    date: '2026-04-10',
    desc_en: 'Completed energy and water audits. Waste and biodiversity surveys ongoing.',
    desc_ar: 'اكتمال تدقيق الطاقة والمياه. استمرار مسوحات النفايات والتنوع البيولوجي.',
    points: 150,
    status: 'active',
  },
  {
    id: 3,
    Icon: Leaf,
    color: '#7B8266',
    title_en: 'Action Plan Created',
    title_ar: 'إعداد خطة العمل',
    date: '—',
    desc_en: 'Define environmental targets and get principal approval.',
    desc_ar: 'تحديد الأهداف البيئية والحصول على موافقة المدير.',
    points: 200,
    status: 'pending',
  },
  {
    id: 4,
    Icon: BarChart2,
    color: '#C8A951',
    title_en: 'Monitoring in Place',
    title_ar: 'تفعيل الرصد والمتابعة',
    date: '—',
    desc_en: 'KPIs defined and monthly data collection underway.',
    desc_ar: 'تحديد مؤشرات الأداء وبدء جمع البيانات الشهرية.',
    points: 200,
    status: 'pending',
  },
  {
    id: 5,
    Icon: BookOpen,
    color: '#A9B6A4',
    title_en: 'Curriculum Integrated',
    title_ar: 'دمج المنهج الدراسي',
    date: '—',
    desc_en: 'Environmental topics linked to classroom subjects.',
    desc_ar: 'ربط المواضيع البيئية بمواد الفصل الدراسي.',
    points: 150,
    status: 'pending',
  },
  {
    id: 6,
    Icon: Globe,
    color: '#182019',
    title_en: 'Community Engaged',
    title_ar: 'إشراك المجتمع',
    date: '—',
    desc_en: 'Parents, NGOs and wider community involved in activities.',
    desc_ar: 'إشراك أولياء الأمور والمنظمات والمجتمع الأوسع.',
    points: 150,
    status: 'pending',
  },
  {
    id: 7,
    Icon: Code2,
    color: '#A8DADC',
    title_en: 'Eco-Code Published',
    title_ar: 'نشر الرمز البيئي',
    date: '—',
    desc_en: 'School motto created and displayed throughout the campus.',
    desc_ar: 'إنشاء شعار المدرسة وعرضه في أنحاء الحرم المدرسي.',
    points: 50,
    status: 'pending',
  },
  {
    id: 8,
    Icon: Trophy,
    color: '#C8A951',
    title_en: 'Green Flag Award',
    title_ar: 'جائزة العلم الأخضر',
    date: '—',
    desc_en: 'Complete all 7 steps and receive the international Green Flag.',
    desc_ar: 'إكمال الخطوات السبع والحصول على العلم الأخضر الدولي.',
    points: 1000,
    status: 'pending',
    isFinal: true,
  },
]

const BADGES = [
  { Icon: Star, label_en: 'Early Starter', label_ar: 'البادئ الأول', color: '#C8A951', earned: true },
  { Icon: Users, label_en: 'Team Builder', label_ar: 'بناء الفريق', color: '#8B9B88', earned: true },
  { Icon: Leaf, label_en: 'Green Learner', label_ar: 'المتعلم الأخضر', color: '#7B8266', earned: false },
  { Icon: Award, label_en: 'Eco Champion', label_ar: 'بطل البيئة', color: '#7A9080', earned: false },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function JourneyPage() {
  const { lang } = useLang()
  const earnedPoints = MILESTONES.filter(m => m.status === 'done').reduce((s, m) => s + m.points, 0)
  const totalPoints = MILESTONES.reduce((s, m) => s + m.points, 0)
  const progress = Math.round((earnedPoints / totalPoints) * 100)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'رحلتي البيئية' : 'My Eco Journey'}</h1>
          <p className="text-sm mt-1" style={{ color: '#7A9080' }}>
            {lang === 'ar' ? 'تتبع تقدمك نحو العلم الأخضر' : 'Track your progress toward the Green Flag'}
          </p>
        </div>
      </FadeIn>

      {/* Points hero */}
      <FadeIn delay={0.05}>
        <div className="rounded-3xl p-6" style={{ background: 'linear-gradient(135deg, #182019, #182019)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#A9B6A4' }}>
                {lang === 'ar' ? 'النقاط المكتسبة' : 'Points Earned'}
              </p>
              <p className="text-4xl font-bold text-white">{earnedPoints} <span className="text-lg font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>/ {totalPoints}</span></p>
            </div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,155,136,0.15)', border: '1px solid rgba(139,155,136,0.3)' }}>
              <Trophy className="w-8 h-8" style={{ color: '#A9B6A4' }} />
            </div>
          </div>
          <div className="h-2 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8B9B88, #A9B6A4)' }} />
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{progress}% {lang === 'ar' ? 'نحو العلم الأخضر' : 'toward Green Flag'}</p>
        </div>
      </FadeIn>

      {/* Badges */}
      <FadeIn delay={0.08}>
        <div className="bg-warmwhite rounded-3xl border border-[#E7E4D6] p-5">
          <p className="text-sm font-bold text-forest mb-4">{lang === 'ar' ? 'الشارات المكتسبة' : 'Earned Badges'}</p>
          <div className="flex gap-3 flex-wrap">
            {BADGES.map(badge => (
              <div key={badge.label_en} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={badge.earned
                    ? { background: `${badge.color}15`, border: `1.5px solid ${badge.color}40` }
                    : { background: '#FBF8F0', border: '1.5px solid #E8ECE1', opacity: 0.45 }}>
                  {badge.earned
                    ? <badge.Icon className="w-5 h-5" style={{ color: badge.color }} />
                    : <Lock className="w-4 h-4" style={{ color: '#E7E4D6' }} />}
                </div>
                <p className="text-[10px] font-semibold text-center" style={{ color: badge.earned ? '#4A544C' : '#A9B6A4' }}>
                  {lang === 'ar' ? badge.label_ar : badge.label_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Timeline */}
      <div className="space-y-0">
        {MILESTONES.map((m, i) => {
          const Icon = m.Icon
          return (
            <FadeIn key={m.id} delay={0.1 + i * 0.04}>
              <div className="flex gap-4">
                {/* Line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 z-10"
                    style={m.status === 'done'
                      ? { background: '#7B8266', border: '2px solid #7B8266' }
                      : m.status === 'active'
                      ? { background: `${m.color}18`, border: `2px solid ${m.color}` }
                      : { background: '#FBF8F0', border: '2px solid #E8ECE1' }}>
                    {m.status === 'done'
                      ? <CheckCircle2 className="w-5 h-5 text-white" />
                      : m.status === 'active'
                      ? <Icon className="w-4.5 h-4.5" style={{ color: m.color }} />
                      : m.isFinal
                      ? <Trophy className="w-4.5 h-4.5" style={{ color: '#E8D48B' }} />
                      : <Lock className="w-4 h-4" style={{ color: '#E7E4D6' }} />}
                  </div>
                  {i < MILESTONES.length - 1 && (
                    <div className="w-0.5 flex-1 my-1" style={{ background: m.status === 'done' ? '#7B8266' : '#E8ECE1', minHeight: '2rem' }} />
                  )}
                </div>
                {/* Card */}
                <div className="pb-4 pt-1 flex-1">
                  <div className={`bg-warmwhite rounded-2xl border p-4 ${m.isFinal ? 'border-[#C8A951]/40' : 'border-[#E7E4D6]'}`}
                    style={m.isFinal ? { background: 'linear-gradient(135deg, #FFFBF0, #FFF8E6)' } : {}}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-forest">{lang === 'ar' ? m.title_ar : m.title_en}</p>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: '#7A9080' }}>
                          {lang === 'ar' ? m.desc_ar : m.desc_en}
                        </p>
                        {m.date !== '—' && (
                          <p className="text-[11px] mt-2 font-medium" style={{ color: '#A9B6A4' }}>{m.date}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs font-bold" style={{ color: m.isFinal ? '#C8A951' : '#8B9B88' }}>+{m.points}</span>
                        <span className="text-[10px]" style={{ color: '#A9B6A4' }}>{lang === 'ar' ? 'نقطة' : 'pts'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          )
        })}
      </div>
    </div>
  )
}
