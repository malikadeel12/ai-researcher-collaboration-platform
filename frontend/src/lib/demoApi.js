/**
 * What changed: In-browser dummy API so Vercel can run the full flow without a backend.
 * Why: The client needs end-to-end UI on frontend-only hosting; serverless memory would reset.
 * Related: src/lib/api.js
 */
import { seedResearchers } from '../data/researchers'
import { matchResearchers } from './demoMatch'

const STORE_KEY = 'markaz-demo-store'
const TOKEN_PREFIX = 'demo.'

function uid() {
  return crypto.randomUUID()
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

function emptyState() {
  return { users: [], researchers: seedResearchers, matches: [], requests: [], requestSeq: 0 }
}

function seedState() {
  const state = emptyState()
  const director = {
    id: 'u-director',
    name: 'Research Center Director',
    email: 'director@research.center',
    password: 'Director2026!',
    role: 'director',
  }
  const sara = {
    id: 'u-sara',
    name: 'Sara Ahmed',
    email: 'sara@university.edu',
    password: 'test1234',
    role: 'user',
  }
  state.users.push(director, sara)

  // One ready request so the director desk is not empty on first open.
  const needText =
    'I need researchers experienced in AI and healthcare who are available and willing to lead a short-term research project.'
  state.matches.push({
    id: 'm-demo',
    userId: sara.id,
    needText,
    language: 'en',
    individuals: [],
    team: null,
    createdAt: new Date().toISOString(),
  })
  state.requestSeq = 1
  state.requests.push({
    id: 'req-demo',
    code: 'REQ-001',
    userId: sara.id,
    matchId: 'm-demo',
    needText,
    selectionType: 'individual',
    researcherIds: ['r01'],
    userNote: 'Hospital AI pilot for a six-week collaboration.',
    status: 'pending',
    directorNote: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  return state
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* start clean if the browser store is damaged */
  }
  const state = seedState()
  save(state)
  return state
}

function save(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state))
}

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

function userFromAuth(authHeader) {
  const token = String(authHeader || '').replace(/^Bearer\s+/i, '')
  if (!token.startsWith(TOKEN_PREFIX)) return null
  const id = token.slice(TOKEN_PREFIX.length)
  return load().users.find((user) => user.id === id) || null
}

function ok(body) {
  return body
}

function fail(message) {
  throw new Error(message)
}

export async function demoApi(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const body = options.body ? JSON.parse(options.body) : {}
  const user = userFromAuth(options.headers?.Authorization)
  const state = load()

  if (path === '/api/auth/register' && method === 'POST') {
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (!name || !email || password.length < 6) fail('Name, email, and a 6+ character password are required')
    if (state.users.some((item) => item.email === email)) fail('An account with this email already exists')
    const next = { id: uid(), name, email, password, role: 'user' }
    state.users.push(next)
    save(state)
    return ok({ token: TOKEN_PREFIX + next.id, user: publicUser(next) })
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase()
    const found = state.users.find((item) => item.email === email && item.password === body.password)
    if (!found) fail('Email or password is incorrect')
    return ok({ token: TOKEN_PREFIX + found.id, user: publicUser(found) })
  }

  if (path === '/api/auth/me' && method === 'GET') {
    if (!user) fail('Sign in required')
    return ok({ user: publicUser(user) })
  }

  if (path === '/api/researchers' && method === 'GET') {
    if (!user) fail('Sign in required')
    return ok({ researchers: state.researchers })
  }

  const researcherMatch = path.match(/^\/api\/researchers\/([^/]+)$/)
  if (researcherMatch && method === 'GET') {
    if (!user) fail('Sign in required')
    const researcher = state.researchers.find((item) => item.id === researcherMatch[1])
    if (!researcher) fail('Researcher not found')
    return ok({ researcher })
  }

  if (path === '/api/match' && method === 'POST') {
    if (!user) fail('Sign in required')
    const needText = String(body.needText || '').trim()
    if (needText.length < 8) fail('Please describe the research need in more detail')
    const result = matchResearchers(needText, state.researchers)
    const match = {
      id: uid(),
      userId: user.id,
      needText,
      language: body.language === 'ar' ? 'ar' : 'en',
      ...result,
      createdAt: new Date().toISOString(),
    }
    state.matches.push(match)
    save(state)
    return ok({ matchId: match.id, ...match })
  }

  const matchGet = path.match(/^\/api\/match\/([^/]+)$/)
  if (matchGet && method === 'GET') {
    if (!user) fail('Sign in required')
    const match = state.matches.find((item) => item.id === matchGet[1])
    if (!match) fail('Match not found')
    return ok(match)
  }

  if (path === '/api/requests' && method === 'GET') {
    if (!user) fail('Sign in required')
    const mine = user.role === 'director' ? state.requests : state.requests.filter((item) => item.userId === user.id)
    return ok({
      requests: [...mine].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((item) => hydrate(item, state)),
    })
  }

  if (path === '/api/requests' && method === 'POST') {
    if (!user) fail('Sign in required')
    const match = state.matches.find((item) => item.id === body.matchId && item.userId === user.id)
    if (!match) fail('Match session not found')
    const ids = Array.isArray(body.researcherIds) ? body.researcherIds.filter(Boolean) : []
    if (!ids.length) fail('Select researchers from the recommendations')
    state.requestSeq += 1
    const request = {
      id: uid(),
      code: `REQ-${String(state.requestSeq).padStart(3, '0')}`,
      userId: user.id,
      matchId: match.id,
      needText: match.needText,
      selectionType: body.selectionType === 'team' ? 'team' : 'individual',
      researcherIds: ids,
      userNote: String(body.note || '').trim(),
      status: 'pending',
      directorNote: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    state.requests.push(request)
    save(state)
    return ok({ request: hydrate(request, state) })
  }

  const patchReq = path.match(/^\/api\/requests\/([^/]+)$/)
  if (patchReq && method === 'PATCH') {
    if (!user || user.role !== 'director') fail('Director access only')
    const status = body.status
    if (!['pending', 'approved', 'rejected', 'changes_requested'].includes(status)) fail('Invalid status')
    if (status === 'changes_requested' && !String(body.directorNote || '').trim()) {
      fail('Add a short note when requesting changes')
    }
    const request = state.requests.find((item) => item.id === patchReq[1])
    if (!request) fail('Request not found')
    request.status = status
    request.directorNote = String(body.directorNote || '').trim()
    request.updatedAt = new Date().toISOString()
    save(state)
    return ok({ request: hydrate(request, state) })
  }

  fail('Request failed')
}
