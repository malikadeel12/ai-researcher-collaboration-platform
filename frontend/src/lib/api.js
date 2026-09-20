/**
 * What changed: Production (Vercel) uses the in-browser dummy API; local still hits Express.
 * Why: The client demo must run end-to-end on frontend-only hosting.
 * Related: src/lib/demoApi.js, backend/src/index.js
 */
import { demoApi } from './demoApi'

const TOKEN_KEY = 'markaz-token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function useDemo() {
  return import.meta.env.PROD || import.meta.env.VITE_DEMO === 'true'
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  if (useDemo()) {
    return demoApi(path, { ...options, headers })
  }

  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data
}

export function isDemoMode() {
  return useDemo()
}
