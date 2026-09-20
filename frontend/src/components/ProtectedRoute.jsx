/**
 * What changed: Route guard for login and director-only pages.
 * Why: Standard users must not reach director review tools.
 * Related: src/context/AuthContext.jsx
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, role }) {
  const { user, ready } = useAuth()
  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/need" replace />
  return children
}
