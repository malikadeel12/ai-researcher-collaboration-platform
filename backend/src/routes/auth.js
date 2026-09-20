/**
 * What changed: Register/login for standard users; director is seeded.
 * Why: Brief includes role-based authentication.
 * Related: backend/src/middleware/auth.js
 */
import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { publicUser, readStore, writeStore } from '../store.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

function tokenFor(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'markaz-dev-secret', {
    expiresIn: '7d',
  })
}

authRouter.post('/register', (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  if (!name || !email || password.length < 6) {
    return res.status(400).json({ error: 'Name, email, and a 6+ character password are required' })
  }

  const exists = readStore().users.some((user) => user.email === email)
  if (exists) return res.status(409).json({ error: 'An account with this email already exists' })

  const user = {
    id: randomUUID(),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'user',
    createdAt: new Date().toISOString(),
  }
  writeStore((state) => {
    state.users.push(user)
    return state
  })
  res.json({ token: tokenFor(user), user: publicUser(user) })
})

authRouter.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const user = readStore().users.find((item) => item.email === email)
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Email or password is incorrect' })
  }
  res.json({ token: tokenFor(user), user: publicUser(user) })
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})
