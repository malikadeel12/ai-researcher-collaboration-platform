/**
 * What changed: Research need is now a letterhead document, not a loose form.
 * Why: Writing on institutional stationery makes the brief feel serious.
 * Related: src/components/Seal.jsx
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seal } from '../components/Seal'
import { useI18n } from '../context/I18nContext'
import { api } from '../lib/api'

export function SubmitNeed() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const examples = [t.ex1, t.ex2, t.ex3, t.ex4]
  const today = new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

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
        <article className="letter">
          <header className="letterhead">
            <Seal size={34} />
            <div className="letter-meta">
              <span>{t.briefLabel}</span>
              <span>{today}</span>
              <span>
                {t.languageLabel} · {lang === 'ar' ? t.arabic : t.english}
              </span>
            </div>
          </header>
          <hr className="gold-rule" />
          <h1 className="composer-title">{t.needTitle}</h1>
          <p className="lede" style={{ marginBottom: 8 }}>
            {t.needLede}
          </p>
          {error && <p className="error">{error}</p>}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.needPlaceholder}
            required
            minLength={12}
          />
        </article>
        <p className="muted" style={{ margin: '20px 0 8px', fontSize: 13 }}>
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
