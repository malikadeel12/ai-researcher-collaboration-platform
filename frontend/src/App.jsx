/**
 * What changed: App routes for the six MVP areas.
 * Why: Login, home, recommendations, profiles, and director review stay on the same paths.
 * Related: src/pages/*
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { I18nProvider } from './context/I18nContext'
import { DirectorDashboard } from './pages/DirectorDashboard'
import { Login } from './pages/Login'
import { Recommendations } from './pages/Recommendations'
import { Register } from './pages/Register'
import { ResearcherProfile } from './pages/ResearcherProfile'
import { UserDashboard } from './pages/UserDashboard'

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<AppShell />}>
              <Route
                path="/need"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations/:matchId"
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/researchers/:id"
                element={
                  <ProtectedRoute>
                    <ResearcherProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="/requests" element={<Navigate to="/need" replace />} />
              <Route
                path="/director"
                element={
                  <ProtectedRoute role="director">
                    <DirectorDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  )
}
