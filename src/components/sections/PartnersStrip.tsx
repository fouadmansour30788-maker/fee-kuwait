'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useLang } from '@/context/LangContext'
import { t } from '@/i18n'
import PartnerLogo from '@/components/ui/PartnerLogo'
import { PARTNERS_DATA } from '@/lib/data/partners'

export default function PartnersStrip() {
  const { lang } = useLang()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const doubled = [...PARTNERS_DATA, ...PARTNERS_DATA]

  return (
    <section className="py-20 bg-[#FBF8F0]" ref={ref}>
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
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-5 w-max"
        >
          {doubled.map((partner, i) => (
            <a
              key={i}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl bg-warmwhite transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(123,130,102,0.12)] group"
              style={{ border: '1px solid #E7E4D6' }}
              title={lang === 'ar' ? partner.name_ar : partner.name_en}
            >
              {/* Logo */}
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                <PartnerLogo
                  src={partner.logo_url}
                  name={lang === 'ar' ? partner.name_ar : partner.name_en}
                  initials={partner.initials}
                  color={partner.color}
                  className="w-9 h-9 grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
              {/* Name */}
              <span
                className="text-sm font-semibold whitespace-nowrap transition-colors duration-200"
                style={{ color: '#4A544C' }}
              >
                {lang === 'ar' ? partner.name_ar : partner.name_en}
              </span>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
