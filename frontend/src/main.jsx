/**
 * What changed: App entry with editorial global styles.
 * Why: Replace the Vite starter so the first paint matches Markaz.
 * Related: src/App.jsx, src/styles/global.css
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
