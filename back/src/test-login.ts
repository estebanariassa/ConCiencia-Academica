import { prisma } from './config/db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

async function createTestUserForLogin() {
  console.log('🔍 Creando usuario de prueba para login...')
  
  try {
    const testEmail = 'test.login@example.com'
    const testPassword = 'TestPassword123!'
    
    // Verificar si ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { email: testEmail }
    })
    
    if (existingUser) {
      console.log('ℹ️  Usuario de prueba ya existe, eliminando...')
      await prisma.usuarios.delete({
        where: { id: existingUser.id }
      })
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    
    // Crear usuario de prueba
    const testUser = await prisma.usuarios.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        nombre: 'Usuario',
        apellido: 'Prueba',
        tipo_usuario: 'estudiante',
        activo: true
      }
    })
    
    console.log('✅ Usuario de prueba creado:', testUser.email)
    return { user: testUser, password: testPassword }
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error)
    return null
  }
}

async function testLoginFlow() {
  console.log('🔍 Probando flujo de login...')
  
  try {
    // Crear usuario de prueba
    const testData = await createTestUserForLogin()
    if (!testData) {
      console.error('❌ No se pudo crear usuario de prueba')
      return false
    }
    
    const { user, password } = testData
    
    // Simular login
    console.log('🔐 Simulando proceso de login...')
    
    // Buscar usuario
    const foundUser = await prisma.usuarios.findUnique({
      where: { email: user.email }
    })
    
    if (!foundUser || !foundUser.activo) {
      console.error('❌ Usuario no encontrado o inactivo')
      return false
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, foundUser.password)
    if (!isValidPassword) {
      console.error('❌ Contraseña inválida')
      return false
    }
    
    // Generar JWT
    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email, tipo_usuario: foundUser.tipo_usuario },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '24h' }
    )
    
    console.log('✅ Login exitoso!')
    console.log('👤 Usuario:', foundUser.email)
    console.log('🎫 Token generado:', token.substring(0, 50) + '...')
    
    // Verificar token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any
      console.log('✅ Token válido, payload:', {
        userId: decoded.userId,
        email: decoded.email,
        tipo_usuario: decoded.tipo_usuario
      })
    } catch (tokenError) {
      console.error('❌ Token inválido:', tokenError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('❌ Error en flujo de login:', error)
    return false
  }
}

async function testDatabaseConnection() {
  console.log('🔍 Probando conexión a base de datos...')
  
  try {
    // Probar conexión básica
    await prisma.$connect()
    console.log('✅ Conexión a base de datos exitosa')
    
    // Contar usuarios
    const userCount = await prisma.usuarios.count()
    console.log('📊 Total de usuarios en DB:', userCount)
    
    // Listar algunos usuarios
    const users = await prisma.usuarios.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        tipo_usuario: true,
        activo: true
      }
    })
    
    if (users.length > 0) {
      console.log('👥 Usuarios encontrados:')
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.tipo_usuario}) - ${user.activo ? 'Activo' : 'Inactivo'}`)
      })
    } else {
      console.log('ℹ️  No hay usuarios en la base de datos')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error conectando a base de datos:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de login y conexión...\n')
  
  // Probar conexión a base de datos
  const dbOk = await testDatabaseConnection()
  console.log('')
  
  if (!dbOk) {
    console.log('❌ No se puede continuar sin conexión a base de datos')
    process.exit(1)
  }
  
  // Probar flujo de login
  const loginOk = await testLoginFlow()
  console.log('')
  
  // Resumen
  console.log('📋 Resumen de pruebas:')
  console.log(`   Base de datos: ${dbOk ? '✅ OK' : '❌ FALLO'}`)
  console.log(`   Flujo de login: ${loginOk ? '✅ OK' : '❌ FALLO'}`)
  
  if (dbOk && loginOk) {
    console.log('\n🎉 ¡Todas las pruebas pasaron correctamente!')
    console.log('💡 El backend está listo para manejar autenticación')
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración.')
  }
  
  // Cerrar conexiones
  await prisma.$disconnect()
  process.exit(0)
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

export { testLoginFlow, testDatabaseConnection, createTestUserForLogin }
