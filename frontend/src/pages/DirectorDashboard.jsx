/**
 * What changed: Director actions are quiet — one Approve, ghost Reject, text for changes.
 * Why: Three candy-colored buttons made the desk look like an admin panel.
 * Related: backend/src/routes/requests.js
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusStamp } from '../components/StatusStamp'
import { useI18n } from '../context/I18nContext'
import { api } from '../lib/api'

export function DirectorDashboard() {
  const { t } = useI18n()
  const [requests, setRequests] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const data = await api('/api/requests')
    setRequests(data.requests)
    setActiveId((current) => current || data.requests[0]?.id || null)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

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

  return (
    <main className="page page-wide">
      <p className="kicker">{t.navDirector}</p>
      <h1>{t.directorTitle}</h1>
      <p className="lede">{t.directorLede}</p>
      <div className="chips">
        {['all', 'pending', 'approved', 'rejected', 'changes_requested'].map((key) => (
          <button
            key={key}
            type="button"
            className={`chip ${filter === key ? 'on' : ''}`}
            onClick={() => setFilter(key === 'all' ? 'all' : key)}
          >
            {key === 'all' ? t.filterAll : t[key === 'changes_requested' ? 'changes' : key]}
          </button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}

      {visible.length === 0 ? (
        <p className="empty">{t.emptyInbox}</p>
      ) : (
        <div className="inbox">
          <div className="inbox-list">
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`inbox-item ${active?.id === item.id ? 'on' : ''}`}
                onClick={() => {
                  setActiveId(item.id)
                  setNote(item.directorNote || '')
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span className="mono" style={{ fontSize: 11 }}>
                    {item.code}
                  </span>
                  <StatusStamp status={item.status} />
                </div>
                <h3>{item.selectedNames.join(' · ')}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                  {item.needText.slice(0, 80)}
                  {item.needText.length > 80 ? '…' : ''}
                </p>
              </button>
            ))}
          </div>
          {active && (
            <div className="inbox-detail">
              <p className="mono muted">
                {t.requestId} {active.code}
              </p>
              <h2 className="serif" style={{ marginTop: 10, fontSize: 32 }}>
                {active.requesterName}
              </h2>
              <p className="muted">{active.requesterEmail}</p>
              <h3 className="kicker" style={{ marginTop: 36 }}>
                {t.originalNeed}
              </h3>
              <p className="quote">{active.needText}</p>
              {active.userNote && <p className="note">{active.userNote}</p>}
              <h3 className="kicker">{t.selectedCol}</h3>
              <div className="pills" style={{ marginBottom: 24 }}>
                {active.researchers.map((person) => (
                  <Link key={person.id} className="pill" to={`/researchers/${person.id}`}>
                    {person.fullName}
                  </Link>
                ))}
              </div>
              <label htmlFor="dnote">{t.directorNote}</label>
              <textarea
                id="dnote"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.notePlaceholder}
                style={{ minHeight: 100 }}
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
            </div>
          )}
        </div>
      )}
    </main>
  )
}
