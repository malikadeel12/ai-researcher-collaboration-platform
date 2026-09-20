/**
 * What changed: Create and fetch a match session for a submitted research need.
 * Why: Recommendations must persist so the user can review profiles then request.
 * Related: backend/src/services/match.js
 */
import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { matchResearchers } from '../services/match.js'
import { readStore, writeStore } from '../store.js'

export const matchRouter = Router()

matchRouter.post('/', requireAuth, async (req, res) => {
  const needText = String(req.body?.needText || '').trim()
  const language = req.body?.language === 'ar' ? 'ar' : 'en'
  if (needText.length < 8) return res.status(400).json({ error: 'Please describe the research need in more detail' })

  const researchers = readStore().researchers
  const result = await matchResearchers(needText, researchers)
  const match = {
    id: randomUUID(),
    userId: req.user.id,
    needText,
    language,
    individuals: result.individuals,
    team: result.team,
    createdAt: new Date().toISOString(),
  }

  writeStore((state) => {
    state.matches.push(match)
    return state
  })

  res.json({ matchId: match.id, ...match })
})

matchRouter.get('/:id', requireAuth, (req, res) => {
  const match = readStore().matches.find((item) => item.id === req.params.id)
  if (!match) return res.status(404).json({ error: 'Match not found' })
  if (match.userId !== req.user.id && req.user.role !== 'director') {
    return res.status(403).json({ error: 'Not allowed' })
  }
  res.json(match)
})
