/**
 * What changed: Matching curtain is a two-column spread, not a left-aligned island.
 * Why: One short headline on a blank page looked like the layout was unfinished.
 * Related: src/pages/UserDashboard.jsx
 */
import { useI18n } from '../context/I18nContext'

export function MatchCurtain({ needText }) {
  const { t } = useI18n()

  return (
    <div className="curtain" role="status" aria-live="polite">
      <div className="curtain-spread">
        <div>
          <p className="kicker">{t.brand}</p>
          <h1>{t.matchCurtainTitle}</h1>
          <p className="lede">{t.matchCurtainBody}</p>
          <div className="curtain-bar" aria-hidden="true" />
        </div>
        {needText ? <p className="curtain-need">{needText}</p> : <div />}
      </div>
    </div>
  )
}
