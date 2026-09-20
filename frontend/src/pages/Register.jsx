/**
 * What changed: Register matches the light editorial login.
 * Why: Same calm page as sign-in, so the door does not change character.
 * Related: src/components/AuthFolio.jsx
 */
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthFolio } from '../components/AuthFolio'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

export function Register() {
  const { t } = useI18n()
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
    <AuthFolio title={t.registerTitle} lede={t.registerLede}>
      <form onSubmit={onSubmit}>
        {error && <p className="error">{error}</p>}
        <div className="field">
          <label htmlFor="name">{t.name}</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="email">{t.email}</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">{t.password}</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
        </div>
        <button className="btn" type="submit" disabled={busy}>
          {t.register}
        </button>
        <p className="muted" style={{ marginTop: 18 }}>
          {t.haveAccount} <Link className="linkish" to="/login">{t.login}</Link>
        </p>
      </form>
    </AuthFolio>
  )
}
