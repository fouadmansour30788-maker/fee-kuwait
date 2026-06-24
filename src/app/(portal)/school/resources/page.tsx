'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Download, Play, FileText, Globe, Search, Bookmark, ExternalLink } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const CATEGORIES = [
  { id: 'all', en: 'All', ar: 'الكل' },
  { id: 'guide', en: 'Guides', ar: 'الأدلة' },
  { id: 'template', en: 'Templates', ar: 'النماذج' },
  { id: 'video', en: 'Videos', ar: 'مقاطع الفيديو' },
  { id: 'external', en: 'External Links', ar: 'روابط خارجية' },
]

const RESOURCES = [
  {
    id: 1,
    category: 'guide',
    type: 'PDF',
    Icon: FileText,
    color: '#7B8266',
    title_en: 'Eco-Schools Programme Guide',
    title_ar: 'دليل برنامج المدارس البيئية',
    desc_en: 'Complete guide to achieving the Green Flag award in Kuwait.',
    desc_ar: 'دليل شامل للحصول على جائزة العلم الأخضر في الكويت.',
    size: '2.4 MB',
    new: false,
    bookmarked: true,
  },
  {
    id: 2,
    category: 'template',
    type: 'DOCX',
    Icon: FileText,
    color: '#006994',
    title_en: 'Environmental Review Template',
    title_ar: 'نموذج المراجعة البيئية',
    desc_en: 'Pre-formatted audit sheets for energy, water, waste and biodiversity.',
    desc_ar: 'أوراق تدقيق مهيأة مسبقاً للطاقة والمياه والنفايات والتنوع البيولوجي.',
    size: '340 KB',
    new: true,
    bookmarked: false,
  },
  {
    id: 3,
    category: 'template',
    type: 'XLSX',
    Icon: FileText,
    color: '#C8A951',
    title_en: 'Action Plan Tracker',
    title_ar: 'متتبع خطة العمل',
    desc_en: 'Spreadsheet to set targets, assign tasks and monitor progress.',
    desc_ar: 'جدول بيانات لتحديد الأهداف وتوزيع المهام ومتابعة التقدم.',
    size: '180 KB',
    new: false,
    bookmarked: false,
  },
  {
    id: 4,
    category: 'video',
    type: 'Video',
    Icon: Play,
    color: '#D64545',
    title_en: 'How to Conduct an Energy Audit',
    title_ar: 'كيفية إجراء تدقيق الطاقة',
    desc_en: '12-minute walkthrough of the school energy audit process.',
    desc_ar: 'شرح تفصيلي لمدة 12 دقيقة حول عملية تدقيق طاقة المدرسة.',
    size: '12 min',
    new: true,
    bookmarked: true,
  },
  {
    id: 5,
    category: 'guide',
    type: 'PDF',
    Icon: BookOpen,
    color: '#A9B6A4',
    title_en: 'Biodiversity Survey Handbook',
    title_ar: 'دليل مسح التنوع البيولوجي',
    desc_en: 'Step-by-step guide for surveying plants and animals on school grounds.',
    desc_ar: 'دليل خطوة بخطوة لمسح النباتات والحيوانات في أراضي المدرسة.',
    size: '1.1 MB',
    new: false,
    bookmarked: false,
  },
  {
    id: 6,
    category: 'template',
    type: 'PDF',
    Icon: FileText,
    color: '#8B9B88',
    title_en: 'Eco-Committee Meeting Minutes',
    title_ar: 'محضر اجتماع اللجنة البيئية',
    desc_en: 'Official template for recording committee meeting decisions.',
    desc_ar: 'نموذج رسمي لتسجيل قرارات اجتماعات اللجنة.',
    size: '95 KB',
    new: false,
    bookmarked: false,
  },
  {
    id: 7,
    category: 'external',
    type: 'Link',
    Icon: Globe,
    color: '#182019',
    title_en: 'FEE International Website',
    title_ar: 'موقع FEE الدولي',
    desc_en: 'Access global Eco-Schools resources and country reports.',
    desc_ar: 'الوصول إلى الموارد العالمية لمدارس Eco-Schools وتقارير الدول.',
    size: null,
    new: false,
    bookmarked: false,
  },
  {
    id: 8,
    category: 'video',
    type: 'Video',
    Icon: Play,
    color: '#D64545',
    title_en: 'Writing Your Eco-Code',
    title_ar: 'كتابة رمزك البيئي',
    desc_en: 'Creative workshop guide on creating a meaningful school eco-code.',
    desc_ar: 'دليل ورشة عمل إبداعية حول إنشاء رمز بيئي هادف للمدرسة.',
    size: '8 min',
    new: false,
    bookmarked: false,
  },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function ResourcesPage() {
  const { lang } = useLang()
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = RESOURCES.filter(r => {
    const matchCat = activeCategory === 'all' || r.category === activeCategory
    const matchQuery = query === '' ||
      r.title_en.toLowerCase().includes(query.toLowerCase()) ||
      r.title_ar.includes(query)
    return matchCat && matchQuery
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'مكتبة الموارد' : 'Resources Library'}</h1>
          <p className="text-sm mt-1" style={{ color: '#7A9080' }}>
            {lang === 'ar' ? 'أدلة ونماذج وفيديوهات لمساعدتك' : 'Guides, templates and videos to help you succeed'}
          </p>
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn delay={0.05}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'ابحث في الموارد...' : 'Search resources...'}
            className="w-full bg-warmwhite border border-[#E7E4D6] rounded-2xl pl-11 pr-4 py-3 text-sm text-forest placeholder:text-[#A9B6A4] focus:outline-none focus:border-[#8B9B88] transition-colors"
          />
        </div>
      </FadeIn>

      {/* Categories */}
      <FadeIn delay={0.08}>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={activeCategory === cat.id
                ? { background: '#7B8266', color: '#fff' }
                : { background: '#FBF8F0', color: '#7A9080' }}>
              {lang === 'ar' ? cat.ar : cat.en}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((res, i) => {
          const Icon = res.Icon
          return (
            <FadeIn key={res.id} delay={0.1 + i * 0.03}>
              <div className="bg-warmwhite rounded-2xl border border-[#E7E4D6] p-5 flex flex-col gap-3 hover:border-[#8B9B88]/50 transition-colors group">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${res.color}14`, border: `1px solid ${res.color}28` }}>
                    <Icon className="w-5 h-5" style={{ color: res.color }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {res.new && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#E8ECE1', color: '#7B8266' }}>
                        {lang === 'ar' ? 'جديد' : 'New'}
                      </span>
                    )}
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#E8ECE1]">
                      <Bookmark className="w-3.5 h-3.5" style={{ color: res.bookmarked ? '#7B8266' : '#E7E4D6' }}
                        fill={res.bookmarked ? '#7B8266' : 'none'} />
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-forest">{lang === 'ar' ? res.title_ar : res.title_en}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#7A9080' }}>
                    {lang === 'ar' ? res.desc_ar : res.desc_en}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
                      style={{ background: '#FBF8F0', color: '#7A9080' }}>{res.type}</span>
                    {res.size && <span className="text-[11px]" style={{ color: '#A9B6A4' }}>{res.size}</span>}
                  </div>
                  <button className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                    style={{ background: 'linear-gradient(135deg, #7B8266, #8B9B88)', color: '#fff' }}>
                    {res.category === 'external'
                      ? <><ExternalLink className="w-3 h-3" />{lang === 'ar' ? 'فتح' : 'Open'}</>
                      : res.category === 'video'
                      ? <><Play className="w-3 h-3" />{lang === 'ar' ? 'مشاهدة' : 'Watch'}</>
                      : <><Download className="w-3 h-3" />{lang === 'ar' ? 'تنزيل' : 'Download'}</>}
                  </button>
                </div>
              </div>
            </FadeIn>
          )
        })}
      </div>
    </div>
  )
}
