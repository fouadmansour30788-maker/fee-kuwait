'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useLang } from '@/context/LangContext'
import { t } from '@/i18n'
import PartnerLogo from '@/components/ui/PartnerLogo'
import { PARTNERS_DATA } from '@/lib/data/partners'
import { GK_PARTNER_GROUPS } from '@/lib/data/greenKeyPartners'
import { FEE_PARTNER_GROUPS } from '@/lib/data/feeGlobalPartners'

interface StripItem { name_en: string; name_ar: string; src: string; initials: string; color: string; website?: string }

const initialsOf = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

// Kuwait-local partners first, then the Green Key + FEE global partner logos —
// one combined marquee. De-duplicated by name (some appear in more than one set).
function buildItems(): StripItem[] {
  const items: StripItem[] = []
  const seen = new Set<string>()
  const push = (it: StripItem) => {
    const key = it.name_en.trim().toLowerCase()
    if (!key || seen.has(key)) return
    seen.add(key); items.push(it)
  }

  for (const p of PARTNERS_DATA) push({ name_en: p.name_en, name_ar: p.name_ar, src: p.logo_url, initials: p.initials, color: p.color, website: p.website })
  for (const g of GK_PARTNER_GROUPS) for (const p of g.partners) if (p.name) push({ name_en: p.name, name_ar: p.name, src: p.logo, initials: initialsOf(p.name), color: '#40916C' })
  for (const g of FEE_PARTNER_GROUPS) for (const p of g.partners) if (p.name) push({ name_en: p.name, name_ar: p.name, src: p.logo, initials: initialsOf(p.name), color: '#40916C' })
  return items
}

const ITEMS = buildItems()

export default function PartnersStrip() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const doubled = [...ITEMS, ...ITEMS]

  return (
    <section className="py-20 bg-[#F4F9F5]" ref={ref}>
      <div className="container-fee mb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-forest mb-2">{t(lang, 'partners.title')}</h2>
          <p style={{ color: '#5A6672' }} className="text-sm">{t(lang, 'partners.subtitle')}</p>
        </motion.div>
      </div>

      {/* Scrolling strip */}
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-5 w-max"
        >
          {doubled.map((partner, i) => {
            const name = lang === 'ar' ? partner.name_ar : partner.name_en
            const inner = (
              <>
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <PartnerLogo src={partner.src} name={name} initials={partner.initials} color={partner.color}
                    className="w-9 h-9 grayscale group-hover:grayscale-0 transition-all duration-300 object-contain" />
                </div>
                <span className="text-sm font-semibold whitespace-nowrap transition-colors duration-200" style={{ color: '#3D4A42' }}>{name}</span>
              </>
            )
            const cls = 'flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(64,145,108,0.12)] group'
            const style = { border: '1px solid #C8E6D0' } as const
            return partner.website ? (
              <a key={i} href={partner.website} target="_blank" rel="noopener noreferrer" className={cls} style={style} title={name}>{inner}</a>
            ) : (
              <div key={i} className={cls} style={style} title={name}>{inner}</div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
