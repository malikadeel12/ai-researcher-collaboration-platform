/**
 * What changed: Vite config with API proxy so the React app talks to Express locally.
 * Why: The MVP must run locally without CORS friction during client testing.
 * Related: backend/src/index.js
 */
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
