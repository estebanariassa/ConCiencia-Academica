import { app } from './app'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/health`)
})


