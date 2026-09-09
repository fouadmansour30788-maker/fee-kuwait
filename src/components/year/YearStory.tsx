'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Sparkles, Award, MapPin, TrendingUp, ArrowRight, Building2, School } from 'lucide-react'
import GovernorateMap, { type GovDatum } from '@/components/dashboard/GovernorateMap'
import { PROGRAMMES } from '@/lib/utils/programmes'
import { useLang } from '@/context/LangContext'
import type { YearReview } from '@/lib/db/yearReview'

const GOV_DEFS = [
  { key: 'capital', label: 'Al Asimah' }, { key: 'hawalli', label: 'Hawalli' },
  { key: 'farwaniyah', label: 'Al Farwaniyah' }, { key: 'mubarak', label: 'Mubarak Al-Kabeer' },
  { key: 'ahmadi', label: 'Al Ahmadi' }, { key: 'jahra', label: 'Al Jahra' },
]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const PROG = Object.fromEntries(PROGRAMMES.map((p) => [p.id, p]))

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function Counter({ target }: { target: number }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const start = Date.now(); const dur = 1400
    const t = setInterval(() => {
      const p = Math.min((Date.now() - start) / dur, 1)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p >= 1) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [inView, target])
  return <span ref={ref}>{n.toLocaleString()}</span>
}

export default function YearStory({ data }: { data: YearReview }) {
  const { lang } = useLang()
  const maxMonth = Math.max(1, ...data.byMonth)
  const govData: GovDatum[] = GOV_DEFS.map((g) => {
    const d = data.byGovKey[g.key] ?? { total: 0, schools: 0, establishments: 0 }
    return { key: g.key, label: g.label, active: d.total, ...d }
  })
  const govOther = (() => { const d = data.byGovKey.other ?? { total: 0, schools: 0, establishments: 0 }; return { key: 'other', label: 'Other', active: d.total, ...d } })()

  const stats = [
    { n: data.newThisYear, label: lang === 'ar' ? 'اعتماد جديد هذا العام' : 'new certifications this year', color: '#52B788' },
    { n: data.totalCertifiedNow, label: lang === 'ar' ? 'معتمد حالياً' : 'certified & valid now', color: '#40916C' },
    { n: data.programmesActive, label: lang === 'ar' ? 'برامج نشطة' : 'programmes active', color: '#C8A951' },
    { n: data.governoratesCovered, label: lang === 'ar' ? 'محافظات مشمولة' : 'governorates reached', color: '#006994' },
  ]

  return (
    <div style={{ background: '#F7FBF8' }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0B1F14, #163a27 60%, #0B1F14)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[8%] left-[-6%] w-[460px] h-[380px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(82,183,136,0.18), transparent 65%)', filter: 'blur(70px)' }} />
        </div>
        <div className="max-w-4xl mx-auto px-6 py-28 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-6" style={{ background: 'rgba(255,255,255,0.08)', color: '#86EFAC', border: '1px solid rgba(134,239,172,0.25)' }}>
              <Sparkles className="w-3.5 h-3.5" /> {lang === 'ar' ? 'مراجعة العام' : 'Year in Review'}
            </span>
            <h1 className="text-white font-bold tracking-tight leading-none" style={{ fontSize: 'clamp(3rem, 12vw, 8rem)' }}>{data.year}</h1>
            <p className="text-lg md:text-xl mt-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {lang === 'ar' ? 'عامٌ من الاعتماد البيئي في الكويت مع FEE' : 'A year of environmental certification in Kuwait with FEE'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Headline stats */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="rounded-3xl border bg-white p-7 text-center" style={{ borderColor: '#D4E7DA' }}>
                <p className="text-5xl font-bold tracking-tight" style={{ color: s.color }}><Counter target={s.n} /></p>
                <p className="text-sm mt-2" style={{ color: '#5B7568' }}>{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Monthly issuance */}
      {data.newThisYear > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-12">
          <Reveal>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2" style={{ color: '#0F2318' }}><TrendingUp className="w-6 h-6" style={{ color: '#40916C' }} /> {lang === 'ar' ? 'الاعتمادات شهراً بشهر' : 'Certifications, month by month'}</h2>
            <p className="text-sm mb-6" style={{ color: '#5B7568' }}>{lang === 'ar' ? `عدد الاعتمادات الصادرة كل شهر في ${data.year}` : `Certificates issued each month in ${data.year}`}</p>
            <div className="rounded-3xl border bg-white p-6" style={{ borderColor: '#D4E7DA' }}>
              <div className="flex items-end gap-2 h-44">
                {data.byMonth.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    {v > 0 && <span className="text-xs font-bold" style={{ color: '#40916C' }}>{v}</span>}
                    <motion.div className="w-full rounded-t-lg" style={{ background: 'linear-gradient(to top, #40916C, #52B788)', minHeight: v > 0 ? 4 : 0 }}
                      initial={{ height: 0 }} whileInView={{ height: `${(v / maxMonth) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.04 }} />
                    <span className="text-[10px]" style={{ color: '#94A3B8' }}>{MONTHS[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* By programme */}
      {data.byProgramme.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-12">
          <Reveal>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#0F2318' }}><Award className="w-6 h-6" style={{ color: '#C8A951' }} /> {lang === 'ar' ? 'حسب البرنامج' : 'By programme'}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.byProgramme.map((p, i) => {
                const prog = PROG[p.programme]
                return (
                  <Reveal key={p.programme} delay={i * 0.06}>
                    <div className="rounded-2xl border bg-white p-5 flex items-center gap-4" style={{ borderColor: '#D4E7DA' }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white overflow-hidden flex-shrink-0" style={{ border: `1px solid ${prog?.color ?? '#40916C'}30` }}>
                        {prog?.logo ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={prog.logo} alt="" className="w-9 h-9 object-contain" />) : <Award className="w-5 h-5" style={{ color: prog?.color ?? '#40916C' }} />}
                      </div>
                      <div>
                        <p className="text-3xl font-bold" style={{ color: prog?.color ?? '#40916C' }}>{p.count}</p>
                        <p className="text-xs" style={{ color: '#5B7568' }}>{prog ? (lang === 'ar' ? prog.name_ar : prog.name_en) : p.programme}</p>
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </Reveal>
        </section>
      )}

      {/* Map */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <Reveal>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2" style={{ color: '#0F2318' }}><MapPin className="w-6 h-6" style={{ color: '#0891B2' }} /> {lang === 'ar' ? 'عبر الكويت' : 'Across Kuwait'}</h2>
          <p className="text-sm mb-6" style={{ color: '#5B7568' }}>{lang === 'ar' ? 'الاعتمادات الجديدة حسب المحافظة' : 'New certifications by governorate'}</p>
          <div className="rounded-3xl border bg-white p-6" style={{ borderColor: '#D4E7DA' }}>
            <GovernorateMap data={govData} other={govOther} />
          </div>
        </Reveal>
      </section>

      {/* Newly certified roll-call */}
      {data.newlyCertified.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-12">
          <Reveal>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#0F2318' }}>{lang === 'ar' ? 'المنشآت المعتمدة حديثاً' : 'Newly certified this year'}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.newlyCertified.map((e, i) => {
                const prog = PROG[e.programme]
                const Icon = e.category === 'School' ? School : Building2
                return (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border bg-white p-4" style={{ borderColor: '#D4E7DA' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${prog?.color ?? '#40916C'}12` }}>
                      <Icon className="w-4 h-4" style={{ color: prog?.color ?? '#40916C' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#0F2318' }}>{e.name ?? '—'}</p>
                      <p className="text-xs" style={{ color: '#5B7568' }}>{prog ? (lang === 'ar' ? prog.name_ar : prog.name_en) : e.programme}{e.governorate ? ` · ${e.governorate}` : ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Reveal>
        </section>
      )}

      {/* Close / CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <Reveal>
          <p className="text-lg leading-relaxed" style={{ color: '#3D4A42' }}>
            {lang === 'ar'
              ? `منذ ${data.firstEverYear ?? data.year}، بلغ إجمالي الاعتمادات ${data.cumulativeToDate}. والرحلة مستمرة.`
              : `Since ${data.firstEverYear ?? data.year}, ${data.cumulativeToDate} certifications have been issued in Kuwait — and the journey continues.`}
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href="/certified" className="btn-primary inline-flex">{lang === 'ar' ? 'استكشف المعتمدين' : 'Explore certified establishments'} <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/register" className="btn-secondary inline-flex">{lang === 'ar' ? 'سجّل مؤسستك' : 'Certify your establishment'}</Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
