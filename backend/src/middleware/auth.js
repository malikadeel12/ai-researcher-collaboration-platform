/**
 * What changed: JWT auth middleware with optional director-only guard.
 * Why: Director review must stay protected from standard users.
 * Related: backend/src/routes/auth.js
 */
import jwt from 'jsonwebtoken'
import { publicUser, readStore } from '../store.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Sign in required' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'markaz-dev-secret')
    const user = readStore().users.find((item) => item.id === payload.sub)
    if (!user) return res.status(401).json({ error: 'Account not found' })
    req.user = publicUser(user)
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired' })
  }
}

export function requireDirector(req, res, next) {
  if (req.user?.role !== 'director') {
    return res.status(403).json({ error: 'Director access only' })
  }
  next()
}
