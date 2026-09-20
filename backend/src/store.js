/**
 * What changed: Local JSON store so the MVP runs without cloud credentials.
 * Why: Brief requires a locally runnable app; Supabase schema is ready for staging.
 * Related: supabase/schema.sql
 * NOTE: Swap this file for Supabase client calls when keys are provided.
 */
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { seedResearchers } from './data/researchers.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'data')
const filePath = join(dataDir, 'store.json')

function emptyState() {
  return { users: [], researchers: [], matches: [], requests: [], requestSeq: 0 }
}

function load() {
  if (!existsSync(filePath)) return emptyState()
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function save(state) {
  mkdirSync(dataDir, { recursive: true })
  writeFileSync(filePath, JSON.stringify(state, null, 2))
}

export async function initStore() {
  mkdirSync(dataDir, { recursive: true })
  const state = existsSync(filePath) ? load() : emptyState()

  if (!state.researchers.length) {
    state.researchers = seedResearchers
  }

  const directorEmail = (process.env.DIRECTOR_EMAIL || 'director@research.center').toLowerCase()
  const hasDirector = state.users.some((user) => user.role === 'director')
  if (!hasDirector) {
    state.users.push({
      id: randomUUID(),
      name: 'Research Center Director',
      email: directorEmail,
      passwordHash: bcrypt.hashSync(process.env.DIRECTOR_PASSWORD || 'Director2026!', 10),
      role: 'director',
      createdAt: new Date().toISOString(),
    })
  }

  save(state)
  return state
}

export function readStore() {
  return load()
}

export function writeStore(mutator) {
  const state = load()
  const next = mutator(state) || state
  save(next)
  return next
}

export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export function nextRequestCode(state) {
  state.requestSeq = (state.requestSeq || 0) + 1
  return `REQ-${String(state.requestSeq).padStart(3, '0')}`
}
