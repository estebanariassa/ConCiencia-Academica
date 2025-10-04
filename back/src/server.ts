import { app } from './app'
import { testSupabaseConnection, testPrismaConnection, createTestUser } from './test-connection'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

async function startServer() {
  // Ejecutar pruebas de conexión al iniciar
  console.log('🔍 Verificando conexiones...\n')
  
  try {
    // Probar conexión a Prisma
    const prismaOk = await testPrismaConnection()
    console.log('')
    
    // Probar conexión a Supabase
    const supabaseOk = await testSupabaseConnection()
    console.log('')
    
    // Crear usuario de prueba si Prisma funciona
    if (prismaOk) {
      await createTestUser()
      console.log('')
    }
    
    // Resumen
    console.log('📋 Estado de conexiones:')
    console.log(`   Prisma/PostgreSQL: ${prismaOk ? '✅ OK' : '❌ FALLO'}`)
    console.log(`   Supabase: ${supabaseOk ? '✅ OK' : '❌ FALLO'}`)
    console.log('')
    
  } catch (error) {
    console.error('❌ Error en pruebas de conexión:', error)
  }
  
  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
    console.log(`📚 API Documentation: http://localhost:${PORT}/health`)
  })
}

startServer().catch(console.error)


