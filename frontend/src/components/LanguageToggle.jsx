/**
 * What changed: Shared EN / عربي toggle.
 * Why: One quiet control keeps language switching consistent on login and in the header.
 * Related: src/context/I18nContext.jsx
 */
import { useI18n } from '../context/I18nContext'

export function LanguageToggle() {
  const { lang, setLang } = useI18n()

  return (
    <div className="lang-toggle">
      <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>
        EN
      </button>
      <button type="button" className={lang === 'ar' ? 'on' : ''} onClick={() => setLang('ar')}>
        عربي
      </button>
    </div>
  )
}
