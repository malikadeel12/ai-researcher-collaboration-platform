/**
 * What changed: Review letter is now a two-column spread — brief left, decision right.
 * Why: A 720px letter left a whole empty half on wide screens.
 * Related: backend/src/routes/requests.js
 * MCP Context 7: React 19 useMemo for filter counts, no extra state library.
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
  const active = visible.find((item) => item.id === activeId) || visible[0]

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

  function openRequest(item) {
    setActiveId(item.id)
    setNote(item.directorNote || '')
  }

  return (
    <main className="review rise">
      {/* --- Review header: title + waiting count, not a sidebar --- */}
      <header className="review-head">
        <div>
          <p className="kicker">{t.reviewKicker}</p>
          <h1>{t.directorTitle}</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            {counts.pending} {t.waiting}. {t.directorLede}
          </p>
        </div>
        <div className="review-filters" role="tablist">
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
      </header>

      {error ? <p className="error">{error}</p> : null}

      {/* --- Horizontal codes so this is not a mail list --- */}
      {visible.length === 0 ? (
        <p className="empty">{t.emptyInbox}</p>
      ) : (
        <div className="review-rail">
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rail-chip ${active?.id === item.id ? 'on' : ''}`}
              onClick={() => openRequest(item)}
            >
              <span className="mono muted">{item.code}</span>
              <strong>{item.requesterName}</strong>
              <em>
                {item.needText.slice(0, 56)}
                {item.needText.length > 56 ? '…' : ''}
              </em>
            </button>
          ))}
        </div>
      )}

      {!active ? null : (
        <article className="letter letter-wide review-doc letter-doc">
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
              <p className="kicker">{t.from}</p>
              <h2 className="desk-name">{active.requesterName}</h2>
              <p className="muted" style={{ marginTop: 0 }}>
                {active.requesterEmail}
              </p>
              <p className="kicker" style={{ marginTop: 32 }}>
                {t.originalNeed}
              </p>
              <p className="desk-brief">{active.needText}</p>
              {active.userNote ? <p className="note">{active.userNote}</p> : null}
            </div>
            <aside className="doc-side">
              <p className="kicker">{t.selectedCol}</p>
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
            </aside>
          </div>
        </article>
      )}
    </main>
  )
}
