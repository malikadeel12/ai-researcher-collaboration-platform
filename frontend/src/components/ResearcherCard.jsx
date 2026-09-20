/**
 * What changed: Cards now have feature / compact / default so ranking can be shown.
 * Why: Equal tiles hid the closest fit and made recommendations look like a catalog.
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

export function ResearcherCard({ researcher, reason, score, selected, onSelect, variant = 'card' }) {
  const { t } = useI18n()
  if (!researcher) return null

  const actions = (
    <div className="btn-row">
      <Link className="btn btn-ghost" to={`/researchers/${researcher.id}`}>
        {t.viewProfile}
      </Link>
      {onSelect ? (
        <button className={selected ? 'btn btn-ghost' : 'btn'} type="button" onClick={onSelect}>
          {selected ? t.selected : t.select}
        </button>
      ) : null}
    </div>
  )

  // --- Compact row: everyone after the closest fit ---
  if (variant === 'compact') {
    return (
      <article className={`compare-row ${selected ? 'is-selected' : ''}`}>
        <div>
          <h3>{researcher.fullName}</h3>
          <p className="muted">{researcher.academicPosition}</p>
          {reason ? <p className="why">{reason}</p> : null}
        </div>
        <div className="compare-row-meta">
          {score != null ? (
            <span className="score">
              {score} {t.matchScore}
            </span>
          ) : null}
          {actions}
        </div>
      </article>
    )
  }

  const isFeature = variant === 'feature'

  return (
    <article className={`dossier ${isFeature ? 'feature-match' : ''} ${selected ? 'is-selected' : ''}`}>
      <div className="dossier-top">
        <div className="who">
          <div className="avatar">{initials(researcher.fullName)}</div>
          <div>
            <h3>{researcher.fullName}</h3>
            <p>{researcher.academicPosition}</p>
          </div>
        </div>
        {score != null ? (
          <div className="score">
            {score} {t.matchScore}
          </div>
        ) : null}
      </div>

      <div className="stamps">
        <StatusStamp status={researcher.availabilityStatus || 'available'} />
        {researcher.willingnessToLead ? <span className="stamp stamp-lead">{t.willLead}</span> : null}
      </div>

      <div className="pills">
        {(researcher.keywords || []).slice(0, 4).map((tag) => (
          <span className="pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>

      {reason ? (
        <p className="why">
          <strong>{t.why}. </strong>
          {reason}
        </p>
      ) : null}

      {actions}
    </article>
  )
}

export function TeamCard({ members, reason, selected, onSelect }) {
  const { t } = useI18n()
  return (
    <article className={`dossier team-card ${selected ? 'is-selected' : ''}`}>
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
      {reason ? (
        <p className="why">
          <strong>{t.why}. </strong>
          {reason}
        </p>
      ) : null}
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
        {onSelect ? (
          <button className={selected ? 'btn btn-ghost' : 'btn'} type="button" onClick={onSelect}>
            {selected ? t.selected : t.select}
          </button>
        ) : null}
      </div>
    </article>
  )
}
