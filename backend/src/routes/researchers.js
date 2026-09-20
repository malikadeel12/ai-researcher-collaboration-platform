/**
 * What changed: Researcher list/detail plus CSV import for the client dataset.
 * Why: Profiles must show only fields that exist in the imported records.
 * Related: backend/src/data/researchers.js
 */
import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { readStore, writeStore } from '../store.js'
import { requireAuth, requireDirector } from '../middleware/auth.js'

export const researcherRouter = Router()

researcherRouter.get('/', requireAuth, (req, res) => {
  res.json({ researchers: readStore().researchers })
})

researcherRouter.get('/:id', requireAuth, (req, res) => {
  const researcher = readStore().researchers.find((item) => item.id === req.params.id)
  if (!researcher) return res.status(404).json({ error: 'Researcher not found' })
  res.json({ researcher })
})

researcherRouter.post('/import', requireAuth, requireDirector, (req, res) => {
  const rows = Array.isArray(req.body?.researchers) ? req.body.researchers : parseCsv(req.body?.csv || '')
  if (!rows.length) return res.status(400).json({ error: 'No researcher rows found' })

  const researchers = rows.map((row) => normalizeRow(row))
  writeStore((state) => {
    state.researchers = researchers
    return state
  })
  res.json({ imported: researchers.length })
})

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = splitCsvLine(lines[0]).map((cell) => cell.trim())
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line)
    const row = {}
    headers.forEach((header, index) => {
      row[header] = cells[index] || ''
    })
    return row
  })
}

function splitCsvLine(line) {
  const out = []
  let current = ''
  let quoted = false
  for (const char of line) {
    if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) {
      out.push(current)
      current = ''
    } else current += char
  }
  out.push(current)
  return out
}

function list(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value || '')
    .split(/[;|]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function normalizeRow(row) {
  const get = (...keys) => {
    for (const key of keys) {
      const found = Object.keys(row).find((item) => item.toLowerCase().replace(/\s+/g, '') === key.toLowerCase().replace(/\s+/g, ''))
      if (found && row[found]) return row[found]
    }
    return ''
  }

  return {
    id: String(get('id') || randomUUID()),
    fullName: get('Full Name', 'fullName', 'name'),
    email: get('Email Address', 'email'),
    academicPosition: get('Academic Position', 'academicPosition'),
    primaryResearchAreas: list(get('Primary Research Areas', 'primaryResearchAreas')),
    specificInterests: list(get('Specific Research Interests', 'specificInterests')),
    keywords: list(get('Keywords / Tags', 'Keywords', 'keywords')),
    currentProjects: list(get('Current Research Projects', 'currentProjects')),
    pastProjects: list(get('Past Research Projects', 'pastProjects')),
    googleScholarUrl: get('Google Scholar Profile URL', 'googleScholarUrl'),
    publicationCount: Number(get('Number of Publications', 'publicationCount')) || null,
    opportunityTypes: list(get('Types of Opportunities Interested In', 'opportunityTypes')),
    preferredDuration: get('Preferred Project Duration', 'preferredDuration'),
    availabilityStatus: String(get('Availability Status', 'availabilityStatus') || 'available').toLowerCase(),
    willingnessToLead: /yes|true|1|willing/i.test(String(get('Willingness to Lead Projects', 'willingnessToLead'))),
    technicalSkills: list(get('Technical Skills', 'technicalSkills')),
    additionalSkills: get('Additional Skills', 'additionalSkills'),
    cvUrl: get('CV / Resume', 'cvUrl'),
    website: get('Website', 'website'),
    linkedinUrl: get('LinkedIn Profile', 'linkedinUrl'),
    bio: get('Brief Bio / About Me', 'bio'),
  }
}
