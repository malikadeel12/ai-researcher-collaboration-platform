/**
 * What changed: Login uses the light editorial gate — honest form, no costume letter.
 * Why: The previous version tried too hard and looked worse than a simple page.
 * Related: src/components/AuthFolio.jsx
 */
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthFolio } from '../components/AuthFolio'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

export function Login() {
  const { t } = useI18n()
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
    <AuthFolio title={t.loginTitle} lede={t.loginLede}>
      <form onSubmit={onSubmit}>
        {error && <p className="error">{error}</p>}
        <div className="field">
          <label htmlFor="email">{t.email}</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">{t.password}</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <button className="btn" type="submit" disabled={busy}>
          {t.login}
        </button>
        <p className="muted" style={{ marginTop: 18 }}>
          {t.noAccount} <Link className="linkish" to="/register">{t.register}</Link>
        </p>
      </form>
    </AuthFolio>
  )
}
