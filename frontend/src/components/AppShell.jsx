/**
 * What changed: Shared header for authenticated screens.
 * Why: Navigation stays quiet so the research brief and dossiers remain the focus.
 * Related: src/App.jsx
 */
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

export function AppShell() {
  const { t, lang, setLang } = useI18n()
  const { user, logout } = useAuth()

  return (
    <div className="shell">
      <header className="header">
        <NavLink to={user ? '/need' : '/login'} className="brand">
          <span className="brand-mark">{t.brand}</span>
          <span className="brand-sub">{t.brandSub}</span>
        </NavLink>

        <nav className="nav">
          {user && (
            <>
              <NavLink to="/need">{t.navNeed}</NavLink>
              <NavLink to="/requests">{t.navRequests}</NavLink>
              {user.role === 'director' && <NavLink to="/director">{t.navDirector}</NavLink>}
            </>
          )}
          <div className="lang-toggle">
            <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>
              EN
            </button>
            <button type="button" className={lang === 'ar' ? 'on' : ''} onClick={() => setLang('ar')}>
              عربي
            </button>
          </div>
          {user && (
            <button type="button" className="btn btn-ghost" onClick={logout}>
              {t.logout}
            </button>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
