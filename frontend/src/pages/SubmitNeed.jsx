/**
 * What changed: Letter-style research-need composer in Arabic or English.
 * Why: A large writing canvas feels like a brief, not a generic search box.
 * Related: backend/src/routes/match.js
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { api } from '../lib/api'

export function SubmitNeed() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const examples = [t.ex1, t.ex2, t.ex3, t.ex4]

  async function onSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await api('/api/match', {
        method: 'POST',
        body: JSON.stringify({ needText: text, language: lang }),
      })
      navigate(`/recommendations/${data.matchId}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page">
      <form className="composer" onSubmit={onSubmit}>
        <p className="kicker">{t.needKicker}</p>
        <h1>{t.needTitle}</h1>
        <p className="lede">{t.needLede}</p>
        {error && <p className="error">{error}</p>}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.needPlaceholder}
          required
          minLength={12}
        />
        <p className="muted" style={{ margin: '14px 0 8px', fontSize: 13 }}>
          {t.examples}
        </p>
        <div className="chips">
          {examples.map((example) => (
            <button key={example} type="button" className="chip" onClick={() => setText(example)}>
              {example}
            </button>
          ))}
        </div>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? t.matching : t.findMatches}
        </button>
      </form>
    </main>
  )
}
