'use client'

import { createContext, useContext, useState } from 'react'
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

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
    }
  }

  return (
    <LangContext.Provider value={{ lang, setLang, dir: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {children}
    </LangContext.Provider>
  )
}
