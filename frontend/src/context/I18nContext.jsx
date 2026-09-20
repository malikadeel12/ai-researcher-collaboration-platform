/**
 * What changed: Language + RTL context for English/Arabic.
 * Why: Arabic must flip layout (dir=rtl), not just swap words.
 * Related: src/i18n/en.js, src/i18n/ar.js
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ar } from '../i18n/ar'
import { en } from '../i18n/en'

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('markaz-lang') || 'en')

  useEffect(() => {
    localStorage.setItem('markaz-lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: lang === 'ar' ? ar : en,
    }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
