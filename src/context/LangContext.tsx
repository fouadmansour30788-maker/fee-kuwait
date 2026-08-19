'use client'

import { createContext, useContext, useEffect, useState, startTransition } from 'react'
import type { Lang } from '@/i18n'

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  dir: 'ltr' | 'rtl'
}

export const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  dir: 'ltr',
})

export function useLang() {
  return useContext(LangContext)
}

function readCookieLang(): Lang {
  if (typeof document === 'undefined') return 'en'
  const m = document.cookie.match(/(?:^|;\s*)lang=(ar|en)/)
  return (m?.[1] as Lang) ?? 'en'
}

export function LangProvider({ children, initial = 'en' }: { children: React.ReactNode; initial?: Lang }) {
  // Server passes the cookie value so the first paint already matches; hydrate
  // from the cookie on mount too (covers client-side navigations).
  const [lang, setLangState] = useState<Lang>(initial)
  useEffect(() => { const c = readCookieLang(); if (c !== lang) setLangState(c) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the document direction/lang + persisted cookie in sync with state.
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.cookie = `lang=${lang}; path=/; max-age=31536000; samesite=lax`
  }, [lang])

  // Switching language re-renders the whole (heavily animated) tree. Mark it as a
  // non-urgent transition so React yields to the browser and the click stays
  // responsive — fixes the INP long-task on the language toggle.
  const setLang = (l: Lang) => {
    startTransition(() => setLangState(l))
  }

  return (
    <LangContext.Provider value={{ lang, setLang, dir: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {children}
    </LangContext.Provider>
  )
}
