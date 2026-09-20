/**
 * What changed: Compose and request docs now use a two-column spread so the page is not half empty.
 * Why: A narrow letter on a wide screen looked unfinished to the client.
 * Related: src/pages/DirectorDashboard.jsx, src/styles/global.css
 * MCP Context 7: React 19 view state, no extra layout library.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MatchCurtain } from '../components/MatchCurtain'
import { Seal } from '../components/Seal'
import { StatusStamp } from '../components/StatusStamp'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { api } from '../lib/api'

const CURTAIN_MIN_MS = 1400

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

function nextStepCopy(status, t) {
  if (status === 'approved') return t.nextStepApproved
  if (status === 'rejected') return t.nextStepRejected
  if (status === 'changes_requested') return t.nextStepChanges
  return t.nextStepPending
}

export function UserDashboard() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [view, setView] = useState('home')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const examples = [t.ex1, t.ex2, t.ex3, t.ex4]
  const firstName = user?.name?.split(' ')[0] || ''
  const latest = requests[0]
  const older = requests.slice(1)
  const active = requests.find((item) => item.id === view)

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

  async function onSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const started = Date.now()
    try {
      const data = await api('/api/match', {
        method: 'POST',
        body: JSON.stringify({ needText: text, language: lang }),
      })
      // Hold the curtain long enough to read — instant APIs felt unfinished.
      const wait = Math.max(0, CURTAIN_MIN_MS - (Date.now() - started))
      await new Promise((resolve) => setTimeout(resolve, wait))
      navigate(`/recommendations/${data.matchId}`)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (busy) {
    return <MatchCurtain needText={text} />
  }

  // --- Home: greeting + plates, not a ticket list ---
  if (view === 'home') {
    return (
      <main className="institute rise">
        <header className="institute-hero">
          <p className="kicker">{t.needKicker}</p>
          <h1>{t.hello.replace('{name}', firstName)}</h1>
          <p className="lede">{t.homeLede}</p>
        </header>

        {error ? <p className="error">{error}</p> : null}

        <div className="plates">
          <button type="button" className="plate plate-primary" onClick={() => setView('compose')}>
            <span className="kicker">{t.briefLabel}</span>
            <h2>{t.newBrief}</h2>
            <p>{t.needLede}</p>
            <span className="plate-go">{t.beginBrief}</span>
          </button>

          {latest ? (
            <button type="button" className="plate" onClick={() => setView(latest.id)}>
              <span className="kicker">{t.latestRequest}</span>
              <h2>{latest.code}</h2>
              <StatusStamp status={latest.status} />
              <p>
                {latest.needText.slice(0, 110)}
                {latest.needText.length > 110 ? '…' : ''}
              </p>
              <span className="plate-go">{t.openRequest}</span>
            </button>
          ) : (
            <div className="plate plate-quiet">
              <span className="kicker">{t.navRequests}</span>
              <h2>{t.emptyRequests}</h2>
            </div>
          )}
        </div>

        {older.length > 0 ? (
          <section className="home-list">
            <p className="kicker">{t.navRequests}</p>
            {older.map((item) => (
              <button key={item.id} type="button" className="home-row" onClick={() => setView(item.id)}>
                <span className="mono muted">{item.code}</span>
                <strong>
                  {item.needText.slice(0, 72)}
                  {item.needText.length > 72 ? '…' : ''}
                </strong>
                <StatusStamp status={item.status} />
              </button>
            ))}
          </section>
        ) : null}
      </main>
    )
  }

  // --- Compose: one letter, full stage ---
  if (view === 'compose') {
    return (
      <main className="institute institute-stage rise">
        <button type="button" className="btn-text back-line" onClick={() => setView('home')}>
          {t.backHome}
        </button>
        <form className="composer" onSubmit={onSubmit}>
          <article className="letter letter-wide">
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
            {/* Write on the left, examples on the right — fills the wide page. */}
            <div className="compose-spread">
              <div>
                <h1 className="composer-title">{t.needTitle}</h1>
                <p className="lede" style={{ marginBottom: 8 }}>
                  {t.needLede}
                </p>
                {error ? <p className="error">{error}</p> : null}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.needPlaceholder}
                  required
                  minLength={12}
                />
                <button className="btn" type="submit" style={{ marginTop: 22 }}>
                  {t.findMatches}
                </button>
              </div>
              <aside className="compose-side">
                <p className="kicker">{t.examples}</p>
                <div className="chips">
                  {examples.map((example) => (
                    <button key={example} type="button" className="chip" onClick={() => setText(example)}>
                      {example}
                    </button>
                  ))}
                </div>
              </aside>
            </div>
          </article>
        </form>
      </main>
    )
  }

  // --- One request as a document, not a split inbox ---
  return (
    <main className="institute institute-stage rise">
      <button type="button" className="btn-text back-line" onClick={() => setView('home')}>
        {t.backHome}
      </button>
      {active ? (
        <article className="open-doc">
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
          <div className="doc-spread">
            <div>
              <p className="kicker">{t.originalNeed}</p>
              <p className="desk-brief">{active.needText}</p>
            </div>
            <aside className="doc-side">
              <p className="kicker">{t.selectedCol}</p>
              <ul className="desk-people">
                {active.researchers.map((person) => (
                  <li key={person.id}>
                    <div className="who">
                      <div className="avatar">{initials(person.fullName)}</div>
                      <div>
                        <Link to={`/researchers/${person.id}`}>{person.fullName}</Link>
                        {person.academicPosition ? <span>{person.academicPosition}</span> : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="note">
                <strong>{t.directorNote}: </strong>
                {active.directorNote || t.noDirectorNote}
              </div>
            </aside>
          </div>
          <div className="status-band">
            <div>
              <StatusStamp status={active.status} />
              <p className="lede" style={{ margin: '10px 0 0' }}>
                {nextStepCopy(active.status, t)}
              </p>
            </div>
            <button type="button" className="btn" onClick={() => setView('compose')}>
              {t.newBrief}
            </button>
          </div>
        </article>
      ) : (
        <p className="empty">{t.emptyRequests}</p>
      )}
    </main>
  )
}
