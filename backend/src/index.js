/**
 * What changed: Express API entry for auth, matching, researchers, and requests.
 * Why: Frontend stays thin; matching and director permissions live on the server.
 * Related: frontend/vite.config.js
 */
import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { authRouter } from './routes/auth.js'
import { matchRouter } from './routes/match.js'
import { requestRouter } from './routes/requests.js'
import { researcherRouter } from './routes/researchers.js'
import { initStore } from './store.js'

const app = express()
const port = Number(process.env.PORT || 4000)

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'markaz-api' })
})

app.use('/api/auth', authRouter)
app.use('/api/researchers', researcherRouter)
app.use('/api/match', matchRouter)
app.use('/api/requests', requestRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong' })
})

await initStore()

app.listen(port, () => {
  console.log(`Markaz API on http://localhost:${port}`)
})
