'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Building2, GraduationCap, Landmark, ArrowRight, Handshake } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import Link from 'next/link'
import PartnerLogo from '@/components/ui/PartnerLogo'
import { PARTNERS_DATA } from '@/lib/data/partners'

const TYPE_CONFIG: Record<string, { label_en: string; label_ar: string; icon: React.ElementType; color: string }> = {
  government:   { label_en: 'Government',  label_ar: 'حكومي',        icon: Landmark,     color: '#7B8266' },
  corporate:    { label_en: 'Corporate',   label_ar: 'مؤسسي',        icon: Building2,    color: '#C8A951' },
  institutional:{ label_en: 'Institutional', label_ar: 'أكاديمي / دولي', icon: GraduationCap, color: '#006994' },
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  )
}

export default function PartnersPage() {
  const { lang } = useLang()

  const grouped = Object.entries(TYPE_CONFIG).map(([type, config]) => ({
    type,
    config,
    partners: PARTNERS_DATA.filter((p) => p.type === type),
  }))

  return (
    <>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #182019 0%, #182019 100%)' }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 left-1/3 w-[500px] h-[350px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, #8B9B88 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div className="container-fee relative z-10 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-7"
              style={{ border: '1px solid rgba(139,155,136,0.3)', color: 'rgba(169,182,164,0.85)', background: 'rgba(139,155,136,0.08)' }}>
              <Handshake className="w-3 h-3" />
              {lang === 'ar' ? 'شركاؤنا' : 'Our Partners'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              {lang === 'ar'
                ? <><span style={{ color: '#A9B6A4' }}>معاً</span><br />نصنع الفارق</>
                : <>Together We<br /><span style={{ color: '#A9B6A4' }}>Make a Difference</span></>}
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'ar'
                ? 'FEE الكويت مدعومة بشبكة من الشركاء الحكوميين والمؤسسيين والأكاديميين.'
                : 'FEE Kuwait is backed by a network of government, corporate, and institutional partners.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Partners by category */}
      <section className="section-white py-24">
        <div className="container-fee space-y-20">
          {grouped.map(({ type, config, partners }, gi) => {
            const GroupIcon = config.icon
            return (
              <div key={type}>
                <FadeIn delay={gi * 0.05}>
                  <div className="flex items-center gap-3 mb-10">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${config.color}12`, border: `1px solid ${config.color}28` }}
                    >
                      <GroupIcon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <h2 className="text-xl font-bold text-forest">
                      {lang === 'ar' ? `${config.label_ar} الشركاء` : `${config.label_en} Partners`}
                    </h2>
                    <div className="flex-1 h-px bg-[#E7E4D6] ml-4" />
                  </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {partners.map((partner, i) => (
                    <FadeIn key={i} delay={gi * 0.05 + i * 0.08}>
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card p-6 flex gap-4 items-start h-full group hover:-translate-y-1.5 block"
                      >
                        {/* Logo */}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#FBF8F0] border border-[#E7E4D6] p-2 overflow-hidden">
                          <PartnerLogo
                            src={partner.logo_url}
                            name={lang === 'ar' ? partner.name_ar : partner.name_en}
                            initials={partner.initials}
                            color={partner.color}
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-forest text-sm mb-1.5 group-hover:text-brand transition-colors leading-tight">
                            {lang === 'ar' ? partner.name_ar : partner.name_en}
                          </h3>
                          <p className="text-xs leading-relaxed" style={{ color: '#5A6672' }}>
                            {lang === 'ar' ? partner.desc_ar : partner.desc_en}
                          </p>
                        </div>
                      </a>
                    </FadeIn>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Logo scrolling strip */}
      <section className="py-14" style={{ background: '#FBF8F0' }}>
        <div className="container-fee mb-8 text-center">
          <FadeIn>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#7A9080' }}>
              {lang === 'ar' ? 'شركاؤنا الموثوقون' : 'Our Trusted Partners'}
            </p>
          </FadeIn>
        </div>
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
            className="flex items-center gap-5 w-max"
          >
            {[...PARTNERS_DATA, ...PARTNERS_DATA].map((p, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-warmwhite"
                style={{ border: '1px solid #E7E4D6' }}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <PartnerLogo
                    src={p.logo_url}
                    name={lang === 'ar' ? p.name_ar : p.name_en}
                    initials={p.initials}
                    color={p.color}
                    className="w-8 h-8 object-contain grayscale"
                  />
                </div>
                <span className="text-sm font-semibold whitespace-nowrap" style={{ color: '#4A544C' }}>
                  {lang === 'ar' ? p.name_ar : p.name_en}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Become a partner CTA */}
      <section className="section-white py-24">
        <div className="container-fee">
          <FadeIn>
            <div className="card p-10 md:p-14 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#E8ECE1] border border-[#E7E4D6] flex items-center justify-center mx-auto mb-6">
                <Handshake className="w-8 h-8 text-brand" />
              </div>
              <h2 className="text-2xl font-bold text-forest mb-4">
                {lang === 'ar' ? 'هل أنت مهتم بالشراكة؟' : 'Interested in Partnering?'}
              </h2>
              <p className="text-sm leading-relaxed mb-8 max-w-md mx-auto" style={{ color: '#5A6672' }}>
                {lang === 'ar'
                  ? 'نرحب بالشراكات مع الشركات والمؤسسات الحكومية والأكاديمية. تواصل مع فريقنا لمعرفة كيفية التعاون.'
                  : 'We welcome partnerships with companies, government bodies, and academic institutions. Reach out to our team to explore how we can collaborate.'}
              </p>
              <Link href="/contact" className="btn-primary inline-flex">
                {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
