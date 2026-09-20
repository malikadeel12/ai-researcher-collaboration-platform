/**
 * What changed: Auth is a light editorial page — headline + form on one paper surface.
 * Why: The dark “invitation letter” felt fake; a split teal panel felt generic.
 * Related: src/pages/Login.jsx
 */
import { useI18n } from '../context/I18nContext'
import { LanguageToggle } from './LanguageToggle'
import { Seal } from './Seal'

export function AuthFolio({ title, lede, children }) {
  const { t } = useI18n()

  return (
    <div className="auth-gate">
      <header className="auth-top">
        <div className="brand">
          <Seal size={28} />
          <span className="brand-mark">{t.brand}</span>
          <span className="brand-sub">{t.brandSub}</span>
        </div>
        <LanguageToggle />
      </header>

      <main className="auth-spread">
        <section className="auth-copy">
          <p className="kicker">{t.brandSub}</p>
          <h1>{t.storyTitle}</h1>
          <p>{t.storyBody}</p>
        </section>

        <section className="auth-panel">
          <h2>{title}</h2>
          <p className="lede">{lede}</p>
          {children}
        </section>
      </main>
    </div>
  )
}
