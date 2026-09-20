/**
 * What changed: Header now uses the seal, a gold active line, and a quiet sign-out.
 * Why: Premium clients read the chrome first — the bar should feel like letterhead, not a SaaS nav.
 * Related: src/components/Seal.jsx
 */
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { LanguageToggle } from './LanguageToggle'
import { Seal } from './Seal'

export function AppShell() {
  const { t } = useI18n()
  const { user, logout } = useAuth()

  return (
    <div className="shell">
      <header className="header">
        <NavLink to={user ? '/need' : '/login'} className="brand">
          <Seal size={28} />
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
          <LanguageToggle />
          {user && (
            <div className="nav-user">
              <span className="who-name">
                {user.name}
                <span className="who-role">{user.role === 'director' ? t.roleDirector : t.roleUser}</span>
              </span>
              <button type="button" className="btn-text" onClick={logout}>
                {t.logout}
              </button>
            </div>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
