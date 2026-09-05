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
          ? 'shadow-[0_2px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl'
          : ''
      )}
      style={{
        background: scrolled
          ? 'rgba(20, 51, 37, 0.96)'
          : 'transparent',
      }}
    >
      <nav className="container-fee h-[4.25rem] flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-white font-bold text-lg shrink-0 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fee-logo.jpg" alt="FEE — Foundation for Environmental Education" className="h-14 w-auto rounded-md transition-transform group-hover:scale-105" />
          <span className="hidden sm:block tracking-tight">FEE Kuwait</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200"
              style={{ color: 'rgba(255,255,255,0.78)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.78)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {link.label}
            </Link>
          ))}

          {/* Programmes dropdown */}
          <div className="relative" onMouseLeave={() => setProgrammesOpen(false)}>
            <button
              onMouseEnter={() => setProgrammesOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200"
              style={{ color: 'rgba(255,255,255,0.78)' }}
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
                  className="absolute top-full mt-2.5 w-72 bg-white rounded-2xl overflow-hidden"
                  style={{
                    [dir === 'rtl' ? 'right' : 'left']: 0,
                    boxShadow: '0 16px 48px rgba(27,67,50,0.18), 0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #C8E6D0',
                  }}
                >
                  <div className="p-1.5">
                    {PROGRAMMES.map(p => {
                      const Icon = ICON_MAP[p.icon] ?? Leaf
                      return (
                        <Link
                          key={p.id}
                          href={`/programmes/${p.id}`}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[#EDF7F1] transition-colors group"
                          onClick={() => setProgrammesOpen(false)}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-white"
                          >
                            {p.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.logo} alt="" className="w-6 h-6 object-contain" />
                            ) : (
                              <Icon className="w-4 h-4" style={{ color: p.color }} />
                            )}
                          </div>
                          <span className="text-sm font-medium text-charcoal group-hover:text-brand transition-colors">
                            {lang === 'ar' ? p.name_ar : p.name_en}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                  <div className="px-4 py-3 border-t border-[#C8E6D0]">
                    <Link
                      href="/programmes"
                      className="text-xs font-semibold text-brand hover:text-emerald transition-colors flex items-center gap-1"
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.16)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.72)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)' }}
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? 'ع' : 'EN'}
          </button>

          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium px-3.5 py-1.5 rounded-xl transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.72)' }}
          >
            {t(lang, 'nav.login')}
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #40916C, #52B788)', boxShadow: '0 4px 12px rgba(64,145,108,0.35)' }}
          >
            {t(lang, 'nav.register')}
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl transition-colors"
            style={{ color: 'rgba(255,255,255,0.85)' }}
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
            style={{ background: 'rgba(20, 51, 37, 0.98)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="container-fee py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ color: 'rgba(255,255,255,0.78)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {t(lang, 'nav.programmes')}
                </p>
                {PROGRAMMES.map(p => {
                  const Icon = ICON_MAP[p.icon] ?? Leaf
                  return (
                    <Link
                      key={p.id}
                      href={`/programmes/${p.id}`}
                      className="flex items-center gap-2.5 py-2 pl-2"
                      style={{ color: 'rgba(255,255,255,0.65)' }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: p.color }} />
                      <span className="text-sm">{lang === 'ar' ? p.name_ar : p.name_en}</span>
                    </Link>
                  )
                })}
              </div>
              <div className="border-t mt-2 pt-3 flex gap-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}
                  onClick={() => setMobileOpen(false)}>
                  {t(lang, 'nav.login')}
                </Link>
                <Link href="/register" className="flex-1 text-center py-2.5 text-sm font-semibold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #40916C, #52B788)' }}
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
