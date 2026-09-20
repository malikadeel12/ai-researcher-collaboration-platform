/**
 * What changed: Director screen is a reading desk — queue + letter — not a boxed inbox.
 * Why: Title, chips, and a ticket panel made the dashboard feel like support software.
 * Related: backend/src/routes/requests.js
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusStamp } from '../components/StatusStamp'
import { useI18n } from '../context/I18nContext'
import { api } from '../lib/api'

const FILTERS = ['all', 'pending', 'approved', 'rejected', 'changes_requested']

export function DirectorDashboard() {
  const { t, lang } = useI18n()
  const [requests, setRequests] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const dateFmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  async function load() {
    const data = await api('/api/requests')
    setRequests(data.requests)
    setActiveId((current) => current || data.requests[0]?.id || null)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  const counts = useMemo(() => {
    const next = { all: requests.length, pending: 0, approved: 0, rejected: 0, changes_requested: 0 }
    requests.forEach((item) => {
      next[item.status] = (next[item.status] || 0) + 1
    })
    return next
  }, [requests])

  const visible = useMemo(
    () => requests.filter((item) => filter === 'all' || item.status === filter),
    [requests, filter],
  )
  const active = requests.find((item) => item.id === activeId) || visible[0]

  async function decide(status) {
    if (!active) return
    if (status === 'changes_requested' && !note.trim()) return
    setBusy(true)
    setError('')
    try {
      await api(`/api/requests/${active.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, directorNote: note }),
      })
      setNote('')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function filterLabel(key) {
    if (key === 'all') return t.filterAll
    if (key === 'changes_requested') return t.changes
    return t[key]
  }

  return (
    <main className="desk">
      <aside className="desk-queue">
        <div className="desk-queue-head">
          <p className="kicker" style={{ marginBottom: 6 }}>
            {t.queue}
          </p>
          <h1>{t.directorTitle}</h1>
          <p className="muted" style={{ margin: '6px 0 0', fontSize: 13 }}>
            {counts.pending} {t.waiting}
          </p>
        </div>

        <div className="desk-tabs" role="tablist">
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              className={filter === key ? 'on' : ''}
              onClick={() => setFilter(key)}
            >
              {filterLabel(key)}
              <span>{counts[key] || 0}</span>
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        <div className="desk-list">
          {visible.length === 0 ? (
            <p className="empty">{t.emptyInbox}</p>
          ) : (
            visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`desk-item ${active?.id === item.id ? 'on' : ''}`}
                onClick={() => {
                  setActiveId(item.id)
                  setNote(item.directorNote || '')
                }}
              >
                <span className="mono muted">{item.code}</span>
                <strong>{item.requesterName}</strong>
                <em>
                  {item.needText.slice(0, 72)}
                  {item.needText.length > 72 ? '…' : ''}
                </em>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="desk-stage">
        {!active ? (
          <p className="empty">{t.emptyInbox}</p>
        ) : (
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

            <p className="kicker">{t.from}</p>
            <h2 className="desk-name">{active.requesterName}</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              {active.requesterEmail}
            </p>

            <p className="kicker" style={{ marginTop: 32 }}>
              {t.originalNeed}
            </p>
            <p className="desk-brief">{active.needText}</p>
            {active.userNote && <p className="note">{active.userNote}</p>}

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

            <label htmlFor="dnote">{t.directorNote}</label>
            <textarea
              id="dnote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.notePlaceholder}
            />
            <div className="btn-row decision-row">
              <button className="btn" type="button" disabled={busy} onClick={() => decide('approved')}>
                {t.approve}
              </button>
              <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => decide('rejected')}>
                {t.reject}
              </button>
              <button className="btn-text" type="button" disabled={busy} onClick={() => decide('changes_requested')}>
                {t.requestChanges}
              </button>
            </div>
          </article>
        )}
      </section>
    </main>
  )
}
