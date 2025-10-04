import { supabaseAdmin } from './config/supabaseClient'
import { prisma } from './config/db'

async function testSupabaseConnection() {
  console.log('🔍 Probando conexión a Supabase...')
  
  try {
    // Probar conexión básica a Supabase
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, nombre, apellido, tipo_usuario')
      .limit(1)
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error.message)
      return false
    }
    
    console.log('✅ Conexión a Supabase exitosa')
    console.log('📊 Datos encontrados:', data?.length || 0, 'usuarios')
    
    if (data && data.length > 0) {
      console.log('👤 Usuario de ejemplo encontrado:', data[0])
    } else {
      console.log('ℹ️  No hay usuarios en la base de datos')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error inesperado:', error)
    return false
  }
}

async function testPrismaConnection() {
  console.log('🔍 Probando conexión a Prisma/PostgreSQL...')
  
  try {
    // Probar conexión básica a Prisma
    const userCount = await prisma.usuarios.count()
    console.log('✅ Conexión a Prisma exitosa')
    console.log('📊 Total de usuarios en DB:', userCount)
    
    if (userCount > 0) {
      const firstUser = await prisma.usuarios.findFirst({
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          tipo_usuario: true,
          activo: true
        }
      })
      console.log('👤 Primer usuario encontrado:', firstUser)
    }
    
    return true
  } catch (error) {
    console.error('❌ Error conectando a Prisma:', error)
    return false
  }
}

async function createTestUser() {
  console.log('🔍 Creando usuario de prueba...')
  
  try {
    const testEmail = 'test@example.com'
    
    // Verificar si ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { email: testEmail }
    })
    
    if (existingUser) {
      console.log('ℹ️  Usuario de prueba ya existe:', existingUser.email)
      return existingUser
    }
    
    // Crear usuario de prueba
    const testUser = await prisma.usuarios.create({
      data: {
        email: testEmail,
        password: '$2b$10$example.hash.for.testing', // Hash de ejemplo
        nombre: 'Usuario',
        apellido: 'Prueba',
        tipo_usuario: 'estudiante',
        activo: true
      }
    })
    
    console.log('✅ Usuario de prueba creado:', testUser.email)
    return testUser
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error)
    return null
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de conexión...\n')
  
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
  console.log('📋 Resumen de pruebas:')
  console.log(`   Prisma/PostgreSQL: ${prismaOk ? '✅ OK' : '❌ FALLO'}`)
  console.log(`   Supabase: ${supabaseOk ? '✅ OK' : '❌ FALLO'}`)
  
  if (prismaOk && supabaseOk) {
    console.log('\n🎉 ¡Todas las conexiones funcionan correctamente!')
  } else {
    console.log('\n⚠️  Algunas conexiones fallaron. Revisa la configuración.')
  }
  
  // Cerrar conexiones
  await prisma.$disconnect()
  process.exit(0)
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

export { testSupabaseConnection, testPrismaConnection, createTestUser }
