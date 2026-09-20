/**
 * What changed: Small fetch helper for the Express API.
 * Why: One place for auth headers keeps role-based calls consistent.
 * Related: backend/src/index.js
 */
const TOKEN_KEY = 'markaz-token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data
}
