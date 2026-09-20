/**
 * What changed: Collaboration request create/list/review workflow.
 * Why: Select → submit → director Approve / Reject / Request Changes.
 * Related: frontend/src/pages/DirectorDashboard.jsx
 * Business rule: statuses are pending | approved | rejected | changes_requested.
 */
import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { nextRequestCode, readStore, writeStore } from '../store.js'

export const requestRouter = Router()
const STATUSES = ['pending', 'approved', 'rejected', 'changes_requested']

function hydrate(request, state) {
  const researchers = request.researcherIds
    .map((id) => state.researchers.find((item) => item.id === id))
    .filter(Boolean)
  const requester = state.users.find((user) => user.id === request.userId)
  return {
    ...request,
    selectedNames: researchers.map((item) => item.fullName),
    researchers,
    requesterName: requester?.name || '',
    requesterEmail: requester?.email || '',
  }
}

requestRouter.get('/', requireAuth, (req, res) => {
  const state = readStore()
  const mine =
    req.user.role === 'director'
      ? state.requests
      : state.requests.filter((item) => item.userId === req.user.id)
  const sorted = [...mine].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json({ requests: sorted.map((item) => hydrate(item, state)) })
})

requestRouter.post('/', requireAuth, (req, res) => {
  const { matchId, selectionType, researcherIds, note } = req.body || {}
  const state = readStore()
  const match = state.matches.find((item) => item.id === matchId && item.userId === req.user.id)
  if (!match) return res.status(400).json({ error: 'Match session not found' })

  const ids = Array.isArray(researcherIds) ? researcherIds.filter(Boolean) : []
  const valid = ids.every((id) => state.researchers.some((item) => item.id === id))
  if (!ids.length || !valid) return res.status(400).json({ error: 'Select researchers from the recommendations' })

  let request
  writeStore((current) => {
    request = {
      id: randomUUID(),
      code: nextRequestCode(current),
      userId: req.user.id,
      matchId,
      needText: match.needText,
      selectionType: selectionType === 'team' ? 'team' : 'individual',
      researcherIds: ids,
      userNote: String(note || '').trim(),
      status: 'pending',
      directorNote: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    current.requests.push(request)
    return current
  })

  res.json({ request: hydrate(request, readStore()) })
})

requestRouter.patch('/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'director') return res.status(403).json({ error: 'Director access only' })
  const status = req.body?.status
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' })
  const directorNote = String(req.body?.directorNote || '').trim()
  if (status === 'changes_requested' && !directorNote) {
    return res.status(400).json({ error: 'Add a short note when requesting changes' })
  }

  let updated
  writeStore((state) => {
    const request = state.requests.find((item) => item.id === req.params.id)
    if (!request) return state
    request.status = status
    request.directorNote = directorNote
    request.updatedAt = new Date().toISOString()
    updated = request
    return state
  })

  if (!updated) return res.status(404).json({ error: 'Request not found' })
  res.json({ request: hydrate(updated, readStore()) })
})
