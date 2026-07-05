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

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  // Keep the document direction/lang in sync with state (cheap, follows the switch).
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
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
