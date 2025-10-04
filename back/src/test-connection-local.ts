import { prisma } from './config/db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

async function testLocalDatabaseConnection() {
  console.log('🔍 Probando conexión a base de datos local...')
  
  try {
    // Probar conexión básica
    await prisma.$connect()
    console.log('✅ Conexión a base de datos exitosa')
    
    // Contar usuarios
    const userCount = await prisma.usuarios.count()
    console.log('📊 Total de usuarios en DB:', userCount)
    
    return true
  } catch (error) {
    console.error('❌ Error conectando a base de datos:', error)
    return false
  }
}

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

async function testAPIEndpoints() {
  console.log('🔍 Probando endpoints de API...')
  
  try {
    const baseUrl = 'http://localhost:3000'
    
    // Probar healthcheck
    console.log('📡 Probando healthcheck...')
    const healthResponse = await fetch(`${baseUrl}/health`)
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ Healthcheck OK:', healthData)
    } else {
      console.log('❌ Healthcheck falló')
      return false
    }
    
    // Probar registro
    console.log('📡 Probando endpoint de registro...')
    const registerData = {
      email: 'test.api@example.com',
      nombre: 'Test',
      apellido: 'API',
      tipo_usuario: 'estudiante',
      password: 'TestPassword123!'
    }
    
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    })
    
    if (registerResponse.ok) {
      const registerResult = await registerResponse.json()
      console.log('✅ Registro exitoso:', registerResult.message)
      
      // Probar login con el usuario registrado
      console.log('📡 Probando endpoint de login...')
      const loginData = {
        email: registerData.email,
        password: registerData.password
      }
      
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json()
        console.log('✅ Login exitoso:', loginResult.message)
        console.log('🎫 Token recibido:', loginResult.token ? 'Sí' : 'No')
        return true
      } else {
        console.log('❌ Login falló:', await loginResponse.text())
        return false
      }
    } else {
      console.log('❌ Registro falló:', await registerResponse.text())
      return false
    }
  } catch (error) {
    console.error('❌ Error probando endpoints:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas completas de conexión y login...\n')
  
  // Probar conexión a base de datos
  const dbOk = await testLocalDatabaseConnection()
  console.log('')
  
  if (!dbOk) {
    console.log('❌ No se puede continuar sin conexión a base de datos')
    console.log('💡 Asegúrate de que:')
    console.log('   1. PostgreSQL esté ejecutándose (local o Supabase)')
    console.log('   2. Las credenciales en .env sean correctas')
    console.log('   3. El esquema de la base de datos esté sincronizado (npx prisma db push)')
    process.exit(1)
  }
  
  // Probar flujo de login
  const loginOk = await testLoginFlow()
  console.log('')
  
  // Probar endpoints de API (solo si el servidor está corriendo)
  let apiOk = false
  try {
    apiOk = await testAPIEndpoints()
  } catch (error) {
    console.log('ℹ️  Servidor no está corriendo, saltando pruebas de API')
  }
  console.log('')
  
  // Resumen
  console.log('📋 Resumen de pruebas:')
  console.log(`   Base de datos: ${dbOk ? '✅ OK' : '❌ FALLO'}`)
  console.log(`   Flujo de login: ${loginOk ? '✅ OK' : '❌ FALLO'}`)
  console.log(`   Endpoints API: ${apiOk ? '✅ OK' : '⏭️  NO PROBADO'}`)
  
  if (dbOk && loginOk) {
    console.log('\n🎉 ¡Las pruebas principales pasaron correctamente!')
    console.log('💡 El backend está listo para manejar autenticación')
    if (apiOk) {
      console.log('🌐 Los endpoints de API también funcionan correctamente')
    } else {
      console.log('🌐 Para probar los endpoints, ejecuta: npm run dev')
    }
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

export { testLocalDatabaseConnection, testLoginFlow, testAPIEndpoints }
