/**
 * What changed: Folio-style researcher detail. Empty fields are hidden.
 * Why: Brief says only available dataset fields should appear.
 * Related: backend/src/routes/researchers.js
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatusStamp } from '../components/StatusStamp'
import { useI18n } from '../context/I18nContext'
import { api } from '../lib/api'

function Block({ title, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null
  const text = Array.isArray(value) ? value.join(' · ') : value
  return (
    <section className="block">
      <h3>{title}</h3>
      <p style={{ margin: 0 }}>{text}</p>
    </section>
  )
}

export function ResearcherProfile() {
  const { id } = useParams()
  const { t } = useI18n()
  const [researcher, setResearcher] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api(`/api/researchers/${id}`)
      .then((data) => setResearcher(data.researcher))
      .catch((err) => setError(err.message))
  }, [id])

  if (error) {
    return (
      <main className="page">
        <p className="error">{error}</p>
      </main>
    )
  }
  if (!researcher) return null

  return (
    <main className="page">
      <Link className="btn-text" to={-1}>
        {t.back}
      </Link>
      <div className="folio" style={{ marginTop: 24 }}>
        <aside className="folio-side">
          <p className="kicker">{t.profile}</p>
          <h1>{researcher.fullName}</h1>
          <p className="muted">{researcher.academicPosition}</p>
          <div className="stamps" style={{ marginTop: 16 }}>
            <StatusStamp status={researcher.availabilityStatus || 'available'} />
            {researcher.willingnessToLead && <span className="stamp stamp-lead">{t.willLead}</span>}
          </div>
          {researcher.publicationCount != null && (
            <p className="meta-row">
              {t.publications}: {researcher.publicationCount}
            </p>
          )}
          {researcher.preferredDuration && (
            <p className="meta-row">
              {t.duration}: {researcher.preferredDuration}
            </p>
          )}
          <div className="block" style={{ marginTop: 24 }}>
            <h3>{t.links}</h3>
            {researcher.email && <p className="meta-row">{researcher.email}</p>}
            {researcher.googleScholarUrl && (
              <p className="meta-row">
                <a href={researcher.googleScholarUrl} target="_blank" rel="noreferrer">
                  Google Scholar
                </a>
              </p>
            )}
            {researcher.linkedinUrl && (
              <p className="meta-row">
                <a href={researcher.linkedinUrl} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </p>
            )}
            {researcher.website && (
              <p className="meta-row">
                <a href={researcher.website} target="_blank" rel="noreferrer">
                  {researcher.website}
                </a>
              </p>
            )}
            {researcher.cvUrl && (
              <p className="meta-row">
                <a href={researcher.cvUrl} target="_blank" rel="noreferrer">
                  CV
                </a>
              </p>
            )}
          </div>
        </aside>
        <div>
          <Block title={t.bio} value={researcher.bio} />
          <Block title={t.areas} value={researcher.primaryResearchAreas} />
          <Block title={t.interests} value={researcher.specificInterests} />
          <Block title={t.keywords} value={researcher.keywords} />
          <Block title={t.current} value={researcher.currentProjects} />
          <Block title={t.past} value={researcher.pastProjects} />
          <Block title={t.skills} value={researcher.technicalSkills} />
          <Block title={t.extraSkills} value={researcher.additionalSkills} />
          <Block title={t.opportunities} value={researcher.opportunityTypes} />
        </div>
      </div>
    </main>
  )
}
