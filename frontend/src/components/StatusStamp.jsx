/**
 * What changed: Typographic status stamps instead of rainbow SaaS badges.
 * Why: Editorial stamps feel institutional and keep color meaningful.
 * Related: src/styles/global.css
 */
import { useI18n } from '../context/I18nContext'

const MAP = {
  pending: { cls: 'stamp-pending', key: 'pending' },
  approved: { cls: 'stamp-approved', key: 'approved' },
  rejected: { cls: 'stamp-rejected', key: 'rejected' },
  changes_requested: { cls: 'stamp-changes', key: 'changes' },
  available: { cls: 'stamp-available', key: 'available' },
  limited: { cls: 'stamp-limited', key: 'limited' },
  unavailable: { cls: 'stamp-rejected', key: 'unavailable' },
}

export function StatusStamp({ status }) {
  const { t } = useI18n()
  const item = MAP[status] || MAP.pending
  return <span className={`stamp ${item.cls}`}>{t[item.key]}</span>
}
