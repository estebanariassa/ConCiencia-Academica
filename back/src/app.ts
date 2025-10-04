import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth-supabase'
import evaluacionesRoutes from './routes/evaluaciones'
import resultadosRoutes from './routes/resultados'

dotenv.config()

export const app = express()

app.use(cors())
app.use(express.json())

// Rutas
app.use('/auth', authRoutes)
app.use('/evaluaciones', evaluacionesRoutes)
app.use('/resultados', resultadosRoutes)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})


