import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth-supabase'
import evaluacionesRoutes from './routes/evaluaciones'
import evaluationRoutes from './routes/evaluationRoutes'
import resultadosRoutes from './routes/resultados'
import teachersRoutes from './routes/teachers'
import courseRoutes from './routes/courseRoutes'

dotenv.config()

export const app = express()

app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/evaluaciones', evaluacionesRoutes)
app.use('/api/evaluations', evaluationRoutes)
app.use('/api/resultados', resultadosRoutes)
app.use('/api/teachers', teachersRoutes)
app.use('/api/courses', courseRoutes)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})


