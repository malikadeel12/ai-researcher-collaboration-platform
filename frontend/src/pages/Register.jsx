/**
 * What changed: Standard-user registration only. Director accounts are seeded.
 * Why: Brief allows public registration for external researchers, not self-serve director roles.
 * Related: backend/src/routes/auth.js
 */
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

export function Register() {
  const { t, lang, setLang } = useI18n()
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/need" replace />

  async function onSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register(name, email, password)
      navigate('/need')
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
        <span />
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
          <h2>{t.registerTitle}</h2>
          <p className="lede">{t.registerLede}</p>
          {error && <p className="error">{error}</p>}
          <div className="field">
            <label htmlFor="name">{t.name}</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="email">{t.email}</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">{t.password}</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button className="btn" type="submit" disabled={busy} style={{ width: '100%' }}>
            {t.register}
          </button>
          <p className="muted" style={{ marginTop: 18 }}>
            {t.haveAccount} <Link className="linkish" to="/login">{t.login}</Link>
          </p>
        </form>
      </section>
    </div>
  )
}
