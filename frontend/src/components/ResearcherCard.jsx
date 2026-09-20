/**
 * What changed: Dossier-style researcher and team recommendation cards.
 * Why: Users should see why a match exists before they select anyone.
 * Related: src/pages/Recommendations.jsx
 */
import { Link } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { StatusStamp } from './StatusStamp'

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

export function ResearcherCard({ researcher, reason, score, selected, onSelect }) {
  const { t } = useI18n()
  if (!researcher) return null

  return (
    <article className="dossier">
      <div className="dossier-top">
        <div className="who">
          <div className="avatar">{initials(researcher.fullName)}</div>
          <div>
            <h3>{researcher.fullName}</h3>
            <p>{researcher.academicPosition}</p>
          </div>
        </div>
        {score != null && (
          <div className="score">
            {score} {t.matchScore}
          </div>
        )}
      </div>

      <div className="stamps">
        <StatusStamp status={researcher.availabilityStatus || 'available'} />
        {researcher.willingnessToLead && <span className="stamp stamp-lead">{t.willLead}</span>}
      </div>

      <div className="pills">
        {(researcher.keywords || []).slice(0, 4).map((tag) => (
          <span className="pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>

      {reason && (
        <p className="why">
          <strong>{t.why}. </strong>
          {reason}
        </p>
      )}

      <div className="btn-row">
        <Link className="btn btn-ghost" to={`/researchers/${researcher.id}`}>
          {t.viewProfile}
        </Link>
        {onSelect && (
          <button className={selected ? 'btn btn-copper' : 'btn'} type="button" onClick={onSelect}>
            {selected ? t.selected : t.select}
          </button>
        )}
      </div>
    </article>
  )
}

export function TeamCard({ members, reason, selected, onSelect }) {
  const { t } = useI18n()
  return (
    <article className="dossier team-card">
      <div className="who-row">
        {members.map((member) => (
          <div className="avatar" key={member.id} title={member.fullName}>
            {initials(member.fullName)}
          </div>
        ))}
      </div>
      <h3 className="serif" style={{ margin: '0 0 8px', fontSize: 22 }}>
        {members.map((member) => member.fullName).join(' · ')}
      </h3>
      {reason && (
        <p className="why">
          <strong>{t.why}. </strong>
          {reason}
        </p>
      )}
      <div className="pills">
        {members.flatMap((member) => (member.keywords || []).slice(0, 2)).map((tag) => (
          <span className="pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="btn-row">
        {members.map((member) => (
          <Link key={member.id} className="btn btn-ghost" to={`/researchers/${member.id}`}>
            {member.fullName.split(' ')[0]}
          </Link>
        ))}
        {onSelect && (
          <button className={selected ? 'btn btn-copper' : 'btn'} type="button" onClick={onSelect}>
            {selected ? t.selected : t.select}
          </button>
        )}
      </div>
    </article>
  )
}
