/**
 * What changed: User-facing request list with director notes.
 * Why: Users must see Pending / Approved / Rejected / Changes Requested.
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

  const dateFmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en', {
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
        <table className="table">
          <thead>
            <tr>
              <th>{t.requestId}</th>
              <th>{t.needCol}</th>
              <th>{t.selectedCol}</th>
              <th>{t.dateCol}</th>
              <th>{t.statusCol}</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item) => (
              <tr key={item.id}>
                <td className="mono">{item.code}</td>
                <td>
                  {item.needText.slice(0, 90)}
                  {item.needText.length > 90 ? '…' : ''}
                  {item.directorNote && (
                    <div className="note">
                      <strong>{t.directorNote}: </strong>
                      {item.directorNote}
                    </div>
                  )}
                </td>
                <td>{item.selectedNames.join(' · ')}</td>
                <td className="mono">{dateFmt.format(new Date(item.createdAt))}</td>
                <td>
                  <StatusStamp status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
