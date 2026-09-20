/**
 * What changed: Requests are letter rows instead of an admin table.
 * Why: A register of briefs feels institutional; a spreadsheet does not.
 * Related: backend/src/routes/requests.js
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusStamp } from '../components/StatusStamp'
import { useI18n } from '../context/I18nContext'
import { api } from '../lib/api'

export function MyRequests() {
  const { t, lang } = useI18n()
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/requests')
      .then((data) => setRequests(data.requests))
      .catch((err) => setError(err.message))
  }, [])

  const dateFmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <main className="page">
      <p className="kicker">{t.requestId}</p>
      <h1>{t.requestsTitle}</h1>
      <p className="lede">{t.requestsLede}</p>
      {error && <p className="error">{error}</p>}
      {requests.length === 0 ? (
        <p className="empty">
          {t.emptyRequests} <Link className="linkish" to="/need">{t.navNeed}</Link>
        </p>
      ) : (
        <div className="letter-list">
          {requests.map((item) => (
            <article className="letter-row" key={item.id}>
              <span className="mono muted">{item.code}</span>
              <div>
                <h3>
                  {item.needText.slice(0, 90)}
                  {item.needText.length > 90 ? '…' : ''}
                </h3>
                <p className="muted" style={{ margin: 0 }}>
                  {item.selectedNames.join(' · ')}
                </p>
                {item.directorNote && (
                  <div className="note">
                    <strong>{t.directorNote}: </strong>
                    {item.directorNote}
                  </div>
                )}
              </div>
              <span className="mono muted">{dateFmt.format(new Date(item.createdAt))}</span>
              <StatusStamp status={item.status} />
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
