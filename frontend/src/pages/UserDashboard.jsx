/**
 * What changed: Standard users now get a desk — queue + brief/status — like the director.
 * Why: After login they only saw a form, so it felt like the dashboard never changed.
 * Related: src/pages/DirectorDashboard.jsx
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Seal } from '../components/Seal'
import { StatusStamp } from '../components/StatusStamp'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { api } from '../lib/api'

export function UserDashboard() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [activeId, setActiveId] = useState('new')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const examples = [t.ex1, t.ex2, t.ex3, t.ex4]
  const today = new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date())
  const dateFmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  useEffect(() => {
    api('/api/requests')
      .then((data) => setRequests(data.requests))
      .catch((err) => setError(err.message))
  }, [])

  const active = requests.find((item) => item.id === activeId)

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
    <main className="desk">
      <aside className="desk-queue">
        <div className="desk-queue-head">
          <p className="kicker" style={{ marginBottom: 6 }}>
            {t.navDesk}
          </p>
          <h1>{t.hello.replace('{name}', user?.name?.split(' ')[0] || '')}</h1>
          <p className="muted" style={{ margin: '6px 0 0', fontSize: 13 }}>
            {requests.length} · {t.navRequests}
          </p>
        </div>

        <div className="desk-list">
          <button
            type="button"
            className={`desk-item ${activeId === 'new' ? 'on' : ''}`}
            onClick={() => setActiveId('new')}
          >
            <span className="mono muted">{t.briefLabel}</span>
            <strong>{t.newBrief}</strong>
            <em>{t.needLede}</em>
          </button>

          {requests.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`desk-item ${activeId === item.id ? 'on' : ''}`}
              onClick={() => setActiveId(item.id)}
            >
              <span className="mono muted">{item.code}</span>
              <strong>
                {item.needText.slice(0, 48)}
                {item.needText.length > 48 ? '…' : ''}
              </strong>
              <em>{item.selectedNames.join(' · ')}</em>
            </button>
          ))}
        </div>
      </aside>

      <section className="desk-stage">
        {error && !active && activeId !== 'new' ? <p className="error">{error}</p> : null}

        {activeId === 'new' ? (
          <form className="composer" onSubmit={onSubmit}>
            <article className="letter desk-letter">
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
              <p className="muted" style={{ margin: '18px 0 8px', fontSize: 13 }}>
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
            </article>
          </form>
        ) : active ? (
          <article className="letter desk-letter">
            <header className="letterhead">
              <div>
                <p className="mono muted" style={{ margin: 0 }}>
                  {active.code}
                </p>
                <p className="muted" style={{ margin: '8px 0 0', fontSize: 13 }}>
                  {dateFmt.format(new Date(active.createdAt))}
                </p>
              </div>
              <StatusStamp status={active.status} />
            </header>
            <hr className="gold-rule" />
            <p className="kicker">{t.originalNeed}</p>
            <p className="desk-brief">{active.needText}</p>
            <p className="kicker" style={{ marginTop: 32 }}>
              {t.selectedCol}
            </p>
            <ul className="desk-people">
              {active.researchers.map((person) => (
                <li key={person.id}>
                  <Link to={`/researchers/${person.id}`}>{person.fullName}</Link>
                  {person.academicPosition ? <span>{person.academicPosition}</span> : null}
                </li>
              ))}
            </ul>
            {active.directorNote && (
              <div className="note">
                <strong>{t.directorNote}: </strong>
                {active.directorNote}
              </div>
            )}
            <div className="btn-row" style={{ marginTop: 28 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setActiveId('new')}>
                {t.newBrief}
              </button>
            </div>
          </article>
        ) : (
          <p className="empty">{t.emptyRequests}</p>
        )}
      </section>
    </main>
  )
}
