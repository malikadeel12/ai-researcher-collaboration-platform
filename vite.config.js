/**
 * What changed: Root Vite config so `vite build` on Vercel finds the frontend.
 * Why: The Vercel project runs from the repo root and failed with “vite: command not found”.
 * Related: frontend/vite.config.js, vercel.json
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: path.join(rootDir, 'frontend'),
  plugins: [react()],
  build: {
    outDir: path.join(rootDir, 'dist'),
    emptyOutDir: true,
  },
})
