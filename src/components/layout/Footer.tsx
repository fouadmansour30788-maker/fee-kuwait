'use client'

import Link from 'next/link'
import { Leaf, MessageCircle, MapPin, Mail, Phone, School, Waves, KeyRound, Newspaper, GraduationCap } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { t } from '@/i18n'
import { PROGRAMMES } from '@/lib/utils/programmes'

const ICON_MAP: Record<string, React.ElementType> = {
  School, Waves, KeyRound, Leaf, Newspaper, GraduationCap,
}

export default function Footer() {
  const { lang } = useLang()

  return (
    <footer style={{ background: 'linear-gradient(160deg, #0F2318 0%, #1B4332 100%)' }}>
      {/* Top border gradient */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(82,183,136,0.35), transparent)' }} />

      <div className="container-fee py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #40916C, #52B788)' }}>
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">FEE Kuwait</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(183,228,199,0.65)' }}>
              {t(lang, 'footer.tagline')}
            </p>

            {/* Social */}
            <div className="flex items-center gap-2.5">
              {[
                { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                { label: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              ].map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(82,183,136,0.25)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'}
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d={path} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Programmes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] mb-5" style={{ color: 'rgba(116,198,157,0.7)' }}>
              {t(lang, 'nav.programmes')}
            </h4>
            <ul className="space-y-2">
              {PROGRAMMES.map(p => {
                const Icon = ICON_MAP[p.icon] ?? Leaf
                return (
                  <li key={p.id}>
                    <Link
                      href={`/programmes/${p.id}`}
                      className="flex items-center gap-2 text-sm transition-colors duration-200 group"
                      style={{ color: 'rgba(255,255,255,0.58)' }}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0 transition-colors" style={{ color: p.color }} />
                      <span className="group-hover:text-white transition-colors">
                        {lang === 'ar' ? p.name_ar : p.name_en}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] mb-5" style={{ color: 'rgba(116,198,157,0.7)' }}>
              {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              {[
                { label: t(lang, 'nav.about'),    href: '/about' },
                { label: t(lang, 'nav.news'),     href: '/news' },
                { label: t(lang, 'nav.impact'),   href: '/impact' },
                { label: t(lang, 'nav.partners'), href: '/partners' },
                { label: t(lang, 'nav.contact'),  href: '/contact' },
                { label: t(lang, 'footer.privacy'), href: '/privacy' },
                { label: t(lang, 'footer.terms'),   href: '/terms' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.58)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] mb-5" style={{ color: 'rgba(116,198,157,0.7)' }}>
              {t(lang, 'nav.contact')}
            </h4>
            <div className="space-y-3 mb-6">
              {[
                { icon: MapPin, text_en: 'Kuwait City, Kuwait', text_ar: 'مدينة الكويت، الكويت' },
                { icon: Mail,   text_en: 'info@feekuwait.org',  text_ar: 'info@feekuwait.org' },
                { icon: Phone,  text_en: '+965 XXXX XXXX',      text_ar: '+965 XXXX XXXX' },
              ].map(({ icon: Icon, text_en, text_ar }, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'rgba(116,198,157,0.55)' }} />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.58)' }}>
                    {lang === 'ar' ? text_ar : text_en}
                  </span>
                </div>
              ))}
            </div>
            <a
              href="https://wa.me/96500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#25D366' }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="container-fee py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>
            {t(lang, 'footer.rights')}
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>
            {lang === 'ar' ? 'عضو في ' : 'Member of '}
            <a href="https://www.fee.global" target="_blank" rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              style={{ color: 'rgba(116,198,157,0.6)' }}>
              FEE International
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
