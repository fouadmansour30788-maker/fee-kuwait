'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Leaf, Droplets, Zap, Recycle, Users, TreePine, ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const CATEGORIES = [
  { id: 'all', en: 'All', ar: 'الكل' },
  { id: 'energy', en: 'Energy', ar: 'الطاقة' },
  { id: 'water', en: 'Water', ar: 'المياه' },
  { id: 'waste', en: 'Waste', ar: 'النفايات' },
  { id: 'biodiversity', en: 'Biodiversity', ar: 'التنوع البيولوجي' },
  { id: 'community', en: 'Community', ar: 'المجتمع' },
]

const ACTIVITIES = [
  {
    id: 1,
    category: 'energy',
    Icon: Zap,
    color: '#C8A951',
    title_en: 'LED Lighting Upgrade',
    title_ar: 'ترقية إضاءة LED',
    desc_en: 'Replaced 120 fluorescent bulbs with energy-efficient LED lights in classrooms and corridors.',
    desc_ar: 'استبدال 120 مصباحاً فلورياً بمصابيح LED موفرة للطاقة في الفصول والممرات.',
    date: '2026-05-10',
    participants: 12,
    impact_en: 'Est. 35% reduction in lighting energy use',
    impact_ar: 'تخفيض متوقع 35% في استهلاك طاقة الإضاءة',
    status: 'completed',
  },
  {
    id: 2,
    category: 'water',
    Icon: Droplets,
    color: '#006994',
    title_en: 'Tap Sensor Installation',
    title_ar: 'تركيب حساسات الصنابير',
    desc_en: 'Installed automatic sensor taps in all bathroom facilities to reduce water waste.',
    desc_ar: 'تركيب صنابير ذاتية الاستشعار في جميع دورات المياه للحد من낭ف المياه.',
    date: '2026-04-28',
    participants: 8,
    impact_en: 'Est. 40% reduction in water consumption',
    impact_ar: 'تخفيض متوقع 40% في استهلاك المياه',
    status: 'completed',
  },
  {
    id: 3,
    category: 'waste',
    Icon: Recycle,
    color: '#52B788',
    title_en: 'Recycling Station Launch',
    title_ar: 'إطلاق محطات إعادة التدوير',
    desc_en: 'Set up colour-coded recycling bins for paper, plastic, and organic waste across the campus.',
    desc_ar: 'إنشاء حاويات إعادة تدوير ملوّنة للورق والبلاستيك والمخلفات العضوية في أنحاء المدرسة.',
    date: '2026-04-15',
    participants: 25,
    impact_en: '200 kg of waste diverted from landfill',
    impact_ar: '200 كجم من النفايات تحولت عن المكبات',
    status: 'completed',
  },
  {
    id: 4,
    category: 'biodiversity',
    Icon: TreePine,
    color: '#40916C',
    title_en: 'School Garden Project',
    title_ar: 'مشروع حديقة المدرسة',
    desc_en: 'Students planted 40 native Kuwaiti plant species in the school garden to support local biodiversity.',
    desc_ar: 'زرع الطلاب 40 نوعاً من النباتات الكويتية المحلية في حديقة المدرسة لدعم التنوع البيولوجي.',
    date: '2026-04-05',
    participants: 60,
    impact_en: '40 native species planted',
    impact_ar: 'زراعة 40 نوعاً محلياً',
    status: 'completed',
  },
  {
    id: 5,
    category: 'community',
    Icon: Users,
    color: '#74C69D',
    title_en: 'Parent Eco-Awareness Day',
    title_ar: 'يوم التوعية البيئية لأولياء الأمور',
    desc_en: 'Hosted an open day where students presented their environmental projects to parents and community members.',
    desc_ar: 'استضافة يوم مفتوح قدّم فيه الطلاب مشاريعهم البيئية لأولياء الأمور وأفراد المجتمع.',
    date: '2026-05-18',
    participants: 150,
    impact_en: '150 community members engaged',
    impact_ar: 'مشاركة 150 فرداً من المجتمع',
    status: 'in-progress',
  },
  {
    id: 6,
    category: 'energy',
    Icon: Zap,
    color: '#C8A951',
    title_en: 'Solar Panel Feasibility Study',
    title_ar: 'دراسة جدوى الألواح الشمسية',
    desc_en: 'Conducting an assessment of rooftop solar panel installation potential with a local engineering firm.',
    desc_ar: 'إجراء تقييم لإمكانية تركيب ألواح شمسية على السطح بالتعاون مع شركة هندسية محلية.',
    date: '2026-05-30',
    participants: 5,
    impact_en: 'Pending assessment completion',
    impact_ar: 'في انتظار اكتمال التقييم',
    status: 'planned',
  },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

const STATUS_STYLE = {
  completed: { bg: '#EDF7F1', color: '#40916C', en: 'Completed', ar: 'مكتملة' },
  'in-progress': { bg: '#FEF9EC', color: '#C8A951', en: 'In Progress', ar: 'جارية' },
  planned: { bg: '#F4F9F5', color: '#7A9080', en: 'Planned', ar: 'مخططة' },
}

export default function ActivitiesPage() {
  const { lang } = useLang()
  const [activeCategory, setActiveCategory] = useState('all')
  const [open, setOpen] = useState<number | null>(null)

  const filtered = activeCategory === 'all' ? ACTIVITIES : ACTIVITIES.filter(a => a.category === activeCategory)
  const completedCount = ACTIVITIES.filter(a => a.status === 'completed').length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'سجل الأنشطة' : 'Activities Log'}</h1>
            <p className="text-sm mt-1" style={{ color: '#7A9080' }}>
              {lang === 'ar' ? `${completedCount} أنشطة مكتملة` : `${completedCount} activities completed`}
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #40916C, #52B788)' }}>
            <Plus className="w-4 h-4" />
            {lang === 'ar' ? 'إضافة نشاط' : 'Log Activity'}
          </button>
        </div>
      </FadeIn>

      {/* Summary cards */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label_en: 'Total Activities', label_ar: 'إجمالي الأنشطة', value: ACTIVITIES.length, Icon: Leaf, color: '#52B788' },
            { label_en: 'Participants', label_ar: 'المشاركون', value: ACTIVITIES.reduce((s, a) => s + a.participants, 0), Icon: Users, color: '#006994' },
            { label_en: 'Completed', label_ar: 'مكتملة', value: completedCount, Icon: CheckCircle2, color: '#40916C' },
          ].map(card => (
            <div key={card.label_en} className="bg-white rounded-2xl border border-[#C8E6D0] p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${card.color}14` }}>
                <card.Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <p className="text-xl font-bold text-forest">{card.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#7A9080' }}>{lang === 'ar' ? card.label_ar : card.label_en}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Category filter */}
      <FadeIn delay={0.08}>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={activeCategory === cat.id
                ? { background: '#40916C', color: '#fff' }
                : { background: '#F4F9F5', color: '#7A9080' }}>
              {lang === 'ar' ? cat.ar : cat.en}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Activities list */}
      <div className="space-y-3">
        {filtered.map((activity, i) => {
          const Icon = activity.Icon
          const isOpen = open === activity.id
          const status = STATUS_STYLE[activity.status as keyof typeof STATUS_STYLE]
          return (
            <FadeIn key={activity.id} delay={0.1 + i * 0.04}>
              <div className="bg-white rounded-3xl border border-[#C8E6D0] overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : activity.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-[#F9FBF9] transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${activity.color}14`, border: `1px solid ${activity.color}28` }}>
                    <Icon className="w-5 h-5" style={{ color: activity.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-forest text-sm">
                      {lang === 'ar' ? activity.title_ar : activity.title_en}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#7A9080' }}>{activity.date}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: status.bg, color: status.color }}>
                      {lang === 'ar' ? status.ar : status.en}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4" style={{ color: '#7A9080' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#7A9080' }} />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }} className="overflow-hidden">
                      <div className="px-6 pb-5 pt-2 border-t border-[#F4F9F5] space-y-3">
                        <p className="text-sm leading-relaxed" style={{ color: '#5A6672' }}>
                          {lang === 'ar' ? activity.desc_ar : activity.desc_en}
                        </p>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" style={{ color: '#7A9080' }} />
                            <span className="text-xs" style={{ color: '#7A9080' }}>
                              {activity.participants} {lang === 'ar' ? 'مشارك' : 'participants'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Leaf className="w-3.5 h-3.5" style={{ color: '#7A9080' }} />
                            <span className="text-xs" style={{ color: '#7A9080' }}>
                              {lang === 'ar' ? activity.impact_ar : activity.impact_en}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          )
        })}
      </div>
    </div>
  )
}
