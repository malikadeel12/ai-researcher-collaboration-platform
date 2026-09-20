/**
 * What changed: Recommendation page keeps the brief quote and uses a single teal submit.
 * Why: Copper CTAs were too loud for the atelier finish.
 * Related: backend/src/routes/match.js, backend/src/routes/requests.js
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ResearcherCard, TeamCard } from '../components/ResearcherCard'
import { useI18n } from '../context/I18nContext'
import { api } from '../lib/api'

export function Recommendations() {
  const { matchId } = useParams()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [selection, setSelection] = useState(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api(`/api/match/${matchId}`)
      .then(setMatch)
      .catch((err) => setError(err.message))
  }, [matchId])

  async function submit() {
    if (!selection) return
    setBusy(true)
    setError('')
    try {
      await api('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          matchId,
          selectionType: selection.type,
          researcherIds: selection.ids,
          note,
        }),
      })
      navigate('/requests')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (error && !match) {
    return (
      <main className="page">
        <p className="error">{error}</p>
      </main>
    )
  }

  if (!match) return null

  const teamSelected = selection?.type === 'team'

  return (
    <main className="page">
      <div className="section-head">
        <div>
          <p className="kicker">{t.recKicker}</p>
          <h1>{t.recTitle}</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            {t.recLede}
          </p>
        </div>
      </div>

      <p className="quote">{match.needText}</p>
      {error && <p className="error">{error}</p>}

      <h2 style={{ fontSize: 28, margin: '28px 0 16px' }}>{t.individuals}</h2>
      <div className="grid">
        {match.individuals.map((item) => (
          <ResearcherCard
            key={item.researcher.id}
            researcher={item.researcher}
            reason={item.reason}
            score={item.score}
            selected={selection?.type === 'individual' && selection.ids[0] === item.researcher.id}
            onSelect={() =>
              setSelection({ type: 'individual', ids: [item.researcher.id] })
            }
          />
        ))}
      </div>

      <h2 style={{ fontSize: 28, margin: '40px 0 8px' }}>{t.team}</h2>
      {match.team ? (
        <TeamCard
          members={match.team.members}
          reason={match.team.reason}
          selected={teamSelected}
          onSelect={() => setSelection({ type: 'team', ids: match.team.members.map((m) => m.id) })}
        />
      ) : (
        <p className="muted">{t.noTeam}</p>
      )}

      <div className="block" style={{ marginTop: 36, maxWidth: 640 }}>
        <label htmlFor="note">{t.optionalNote}</label>
        <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.requestNotePh} style={{ minHeight: 110 }} />
      </div>

      <button className="btn" type="button" disabled={!selection || busy} onClick={submit}>
        {busy ? t.submitting : t.submitRequest}
      </button>
    </main>
  )
}
