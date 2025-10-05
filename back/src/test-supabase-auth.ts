import dotenv from 'dotenv'
import { SupabaseDB } from './config/supabase-only'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Cargar variables de entorno
dotenv.config()

async function testSupabaseConnection() {
  console.log('🔍 Probando conexión a Supabase...')
  
  try {
    const userCount = await SupabaseDB.countUsers()
    console.log('✅ Conexión a Supabase exitosa')
    console.log('📊 Total de usuarios en DB:', userCount)
    return true
  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error)
    return false
  }
}

async function createTestUserForLogin() {
  console.log('🔍 Creando usuario de prueba para login...')
  
  try {
    const testEmail = 'test.login.supabase@example.com'
    const testPassword = 'TestPassword123!'
    
    // Verificar si ya existe
    const existingUser = await SupabaseDB.findUserByEmail(testEmail)
    
    if (existingUser) {
      console.log('ℹ️  Usuario de prueba ya existe:', existingUser.email)
      return { user: existingUser, password: testPassword }
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    
    // Crear usuario de prueba
    const testUser = await SupabaseDB.createUser({
      email: testEmail,
      password: hashedPassword,
      nombre: 'Usuario',
      apellido: 'Prueba',
      tipo_usuario: 'estudiante'
    })
    
    console.log('✅ Usuario de prueba creado:', testUser.email)
    return { user: testUser, password: testPassword }
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error)
    return null
  }
}

async function testLoginFlow() {
  console.log('🔍 Probando flujo de login con Supabase...')
  
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
    const foundUser = await SupabaseDB.findUserByEmail(user.email)
    
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


async function main() {
  console.log('🚀 Probando conexión y autenticación con Supabase...\n')
  
  // Probar conexión básica
  const connectionOk = await testSupabaseConnection()
  console.log('')
  
  if (!connectionOk) {
    console.log('❌ No se puede continuar sin conexión a Supabase')
    process.exit(1)
  }
  
  // Probar flujo de login
  const loginOk = await testLoginFlow()
  console.log('')
  
  // Resumen
  console.log('📋 Resumen de pruebas:')
  console.log(`   Conexión Supabase: ${connectionOk ? '✅ OK' : '❌ FALLO'}`)
  console.log(`   Flujo de login: ${loginOk ? '✅ OK' : '❌ FALLO'}`)
  
  if (connectionOk && loginOk) {
    console.log('\n🎉 ¡Todas las pruebas pasaron correctamente!')
    console.log('💡 El backend está listo para usar Supabase')
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración.')
  }
  
  process.exit(0)
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

export { testSupabaseConnection, testLoginFlow }
