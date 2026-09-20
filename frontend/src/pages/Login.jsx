/**
 * What changed: Editorial split-screen login for standard users and the director.
 * Why: First screen should feel like a research center, not a SaaS signup.
 * Related: src/pages/Register.jsx
 */
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

export function Login() {
  const { t, lang, setLang } = useI18n()
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={user.role === 'director' ? '/director' : '/need'} replace />

  async function onSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const next = await login(email, password)
      navigate(next.role === 'director' ? '/director' : '/need')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-split">
      <aside className="auth-story">
        <div>
          <p className="auth-kicker">{t.brandSub}</p>
          <h1>{t.storyTitle}</h1>
          <p>{t.storyBody}</p>
        </div>
        <p className="muted" style={{ color: 'rgba(246,243,236,0.65)' }}>
          {t.directorHint}
        </p>
      </aside>
      <section className="auth-form">
        <form className="form-card" onSubmit={onSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <span className="brand-mark">{t.brand}</span>
            <div className="lang-toggle">
              <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>
                EN
              </button>
              <button type="button" className={lang === 'ar' ? 'on' : ''} onClick={() => setLang('ar')}>
                عربي
              </button>
            </div>
          </div>
          <h2>{t.loginTitle}</h2>
          <p className="lede">{t.loginLede}</p>
          {error && <p className="error">{error}</p>}
          <div className="field">
            <label htmlFor="email">{t.email}</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">{t.password}</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn" type="submit" disabled={busy} style={{ width: '100%' }}>
            {t.login}
          </button>
          <p className="muted" style={{ marginTop: 18 }}>
            {t.noAccount} <Link className="linkish" to="/register">{t.register}</Link>
          </p>
        </form>
      </section>
    </div>
  )
}
