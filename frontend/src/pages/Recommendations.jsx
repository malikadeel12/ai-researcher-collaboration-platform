/**
 * What changed: Closest fit is featured; others sit as a comparison, not equal cards.
 * Why: A flat grid hid the ranking and looked like a template catalog.
 * Related: src/components/ResearcherCard.jsx, backend/src/routes/match.js
 * MCP Context 7: React 19 local selection state, no form library.
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
      navigate('/need')
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

  const [featured, ...others] = match.individuals
  const teamSelected = selection?.type === 'team'
  const selectedLabel =
    selection?.type === 'team'
      ? t.team
      : match.individuals.find((item) => item.researcher.id === selection?.ids?.[0])?.researcher.fullName

  return (
    <main className="page compare rise">
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
      {error ? <p className="error">{error}</p> : null}

      {featured ? (
        <>
          <p className="kicker">{t.featuredMatch}</p>
          <ResearcherCard
            variant="feature"
            researcher={featured.researcher}
            reason={featured.reason}
            score={featured.score}
            selected={selection?.type === 'individual' && selection.ids[0] === featured.researcher.id}
            onSelect={() => setSelection({ type: 'individual', ids: [featured.researcher.id] })}
          />
        </>
      ) : null}

      {others.length > 0 ? (
        <section className="compare-list">
          <p className="kicker">{t.otherMatches}</p>
          {others.map((item) => (
            <ResearcherCard
              key={item.researcher.id}
              variant="compact"
              researcher={item.researcher}
              reason={item.reason}
              score={item.score}
              selected={selection?.type === 'individual' && selection.ids[0] === item.researcher.id}
              onSelect={() => setSelection({ type: 'individual', ids: [item.researcher.id] })}
            />
          ))}
        </section>
      ) : null}

      <h2 className="compare-team-title">{t.team}</h2>
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
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.requestNotePh}
          style={{ minHeight: 110 }}
        />
      </div>

      {/* Sticky dock keeps the decision in reach after scrolling the comparison. */}
      <div className="compare-dock">
        <p>
          {selection ? (
            <>
              <span className="kicker" style={{ marginBottom: 4 }}>
                {t.selectedNow}
              </span>
              <strong>{selectedLabel}</strong>
            </>
          ) : (
            <span className="muted">{t.compareHint}</span>
          )}
        </p>
        <button className="btn" type="button" disabled={!selection || busy} onClick={submit}>
          {busy ? t.submitting : t.submitRequest}
        </button>
      </div>
    </main>
  )
}
