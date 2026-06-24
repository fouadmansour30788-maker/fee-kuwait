'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Globe, ChevronDown, Leaf,
  School, Waves, KeyRound, Newspaper, GraduationCap,
} from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { t } from '@/i18n'
import { cn } from '@/lib/utils/cn'
import { PROGRAMMES } from '@/lib/utils/programmes'

const ICON_MAP: Record<string, React.ElementType> = {
  School, Waves, KeyRound, Leaf, Newspaper, GraduationCap,
}

export default function Navbar() {
  const { lang, setLang, dir } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [programmesOpen, setProgrammesOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { href: '/',         label: t(lang, 'nav.home') },
    { href: '/about',    label: t(lang, 'nav.about') },
    { href: '/news',     label: t(lang, 'nav.news') },
    { href: '/impact',   label: t(lang, 'nav.impact') },
    { href: '/youth',    label: t(lang, 'nav.youth') },
    { href: '/partners', label: t(lang, 'nav.partners') },
    { href: '/contact',  label: t(lang, 'nav.contact') },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'shadow-[0_4px_30px_rgba(24,32,25,0.06)] backdrop-blur-md border-b border-forest/5'
          : ''
      )}
      style={{
        background: scrolled
          ? 'rgba(247, 243, 234, 0.80)'
          : 'transparent',
      }}
    >
      <nav className="container-fee h-[4.5rem] flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-forest font-semibold text-lg shrink-0 group">
          <div className="w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #2C3A2D, #8B9B88)' }}>
            <Leaf className="w-4.5 h-4.5 text-cream" />
          </div>
          <span className="hidden sm:block font-serif tracking-tight text-forest">FEE Kuwait</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 text-sm font-medium rounded-full text-forest/70 hover:text-forest hover:bg-forest/[0.04] transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}

          {/* Programmes dropdown */}
          <div className="relative" onMouseLeave={() => setProgrammesOpen(false)}>
            <button
              onMouseEnter={() => setProgrammesOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full text-forest/70 hover:text-forest hover:bg-forest/[0.04] transition-all duration-200"
              onFocus={() => setProgrammesOpen(true)}
            >
              {t(lang, 'nav.programmes')}
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', programmesOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {programmesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-full mt-2.5 w-72 bg-warmwhite rounded-3xl overflow-hidden"
                  style={{
                    [dir === 'rtl' ? 'right' : 'left']: 0,
                    boxShadow: '0 20px 56px rgba(24,32,25,0.14), 0 4px 12px rgba(24,32,25,0.06)',
                    border: '1px solid #E7E4D6',
                  }}
                >
                  <div className="p-1.5">
                    {PROGRAMMES.map(p => {
                      const Icon = ICON_MAP[p.icon] ?? Leaf
                      return (
                        <Link
                          key={p.id}
                          href={`/programmes/${p.id}`}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-pale transition-colors group"
                          onClick={() => setProgrammesOpen(false)}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: `${p.color}1f` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: p.color }} />
                          </div>
                          <span className="text-sm font-medium text-charcoal group-hover:text-olive transition-colors">
                            {lang === 'ar' ? p.name_ar : p.name_en}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                  <div className="px-4 py-3 border-t border-[#E7E4D6]">
                    <Link
                      href="/programmes"
                      className="text-xs font-semibold text-olive hover:text-forest transition-colors flex items-center gap-1"
                      onClick={() => setProgrammesOpen(false)}
                    >
                      {lang === 'ar' ? 'عرض جميع البرامج' : 'View all programmes'}
                      <ChevronDown className="w-3 h-3 -rotate-90" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full text-forest/70 hover:text-forest border border-forest/15 hover:border-forest/35 transition-all duration-200"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? 'ع' : 'EN'}
          </button>

          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium px-3.5 py-1.5 rounded-full text-forest/70 hover:text-forest transition-all duration-200"
          >
            {t(lang, 'nav.login')}
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium text-cream bg-forest hover:bg-emerald transition-all duration-300 hover:scale-[1.03] shadow-green-md hover:shadow-green-lg"
          >
            {t(lang, 'nav.register')}
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-full text-forest transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="lg:hidden overflow-hidden"
            style={{ background: 'rgba(247, 243, 234, 0.98)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(24,32,25,0.07)' }}
          >
            <div className="container-fee py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 rounded-full text-sm font-medium text-forest/80 hover:bg-forest/[0.04] transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 text-forest/40">
                  {t(lang, 'nav.programmes')}
                </p>
                {PROGRAMMES.map(p => {
                  const Icon = ICON_MAP[p.icon] ?? Leaf
                  return (
                    <Link
                      key={p.id}
                      href={`/programmes/${p.id}`}
                      className="flex items-center gap-2.5 py-2 pl-2 text-forest/70"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: p.color }} />
                      <span className="text-sm">{lang === 'ar' ? p.name_ar : p.name_en}</span>
                    </Link>
                  )
                })}
              </div>
              <div className="border-t mt-2 pt-3 flex gap-2 border-forest/10">
                <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium text-forest/70 rounded-full"
                  onClick={() => setMobileOpen(false)}>
                  {t(lang, 'nav.login')}
                </Link>
                <Link href="/register" className="flex-1 text-center py-2.5 text-sm font-medium text-cream rounded-full bg-forest"
                  onClick={() => setMobileOpen(false)}>
                  {t(lang, 'nav.register')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
