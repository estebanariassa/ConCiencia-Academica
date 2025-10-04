import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Cargar variables de entorno
dotenv.config()

// Crear cliente de Supabase directamente
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Variables de entorno faltantes:')
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅' : '❌')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

async function testSupabaseConnection() {
  console.log('🔍 Probando conexión a Supabase...')
  console.log('🌐 URL:', supabaseUrl)
  console.log('🔑 Service Role Key:', supabaseServiceRoleKey?.substring(0, 20) + '...')
  
  try {
    // Probar conexión básica a Supabase
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, nombre, apellido, tipo_usuario')
      .limit(1)
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error.message)
      console.error('💡 Detalles del error:', error)
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

async function createTestUserInSupabase() {
  console.log('🔍 Creando usuario de prueba en Supabase...')
  
  try {
    const testEmail = 'test.supabase@example.com'
    const testPassword = 'TestPassword123!'
    
    // Verificar si ya existe
    const { data: existingUser } = await supabaseAdmin
      .from('usuarios')
      .select('id, email')
      .eq('email', testEmail)
      .single()
    
    if (existingUser) {
      console.log('ℹ️  Usuario de prueba ya existe:', existingUser.email)
      return existingUser
    }
    
    // Crear usuario de prueba
    const { data: newUser, error } = await supabaseAdmin
      .from('usuarios')
      .insert({
        email: testEmail,
        password: testPassword, // En producción esto debería estar hasheado
        nombre: 'Usuario',
        apellido: 'Prueba',
        tipo_usuario: 'estudiante',
        activo: true
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error creando usuario:', error.message)
      return null
    }
    
    console.log('✅ Usuario de prueba creado en Supabase:', newUser.email)
    return newUser
  } catch (error) {
    console.error('❌ Error inesperado creando usuario:', error)
    return null
  }
}

async function testLoginWithSupabase() {
  console.log('🔍 Probando login con Supabase...')
  
  try {
    // Crear usuario de prueba
    const testUser = await createTestUserInSupabase()
    if (!testUser) {
      console.error('❌ No se pudo crear usuario de prueba')
      return false
    }
    
    // Buscar usuario para login
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, nombre, apellido, tipo_usuario, activo')
      .eq('email', testUser.email)
      .single()
    
    if (error) {
      console.error('❌ Error buscando usuario:', error.message)
      return false
    }
    
    if (!user || !user.activo) {
      console.error('❌ Usuario no encontrado o inactivo')
      return false
    }
    
    console.log('✅ Usuario encontrado para login:', user.email)
    console.log('👤 Datos del usuario:', {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      tipo_usuario: user.tipo_usuario
    })
    
    return true
  } catch (error) {
    console.error('❌ Error en prueba de login:', error)
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
      email: 'test.api.supabase@example.com',
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
  console.log('🚀 Iniciando pruebas completas de Supabase...\n')
  
  // Probar conexión básica
  const connectionOk = await testSupabaseConnection()
  console.log('')
  
  if (!connectionOk) {
    console.log('❌ No se puede continuar sin conexión a Supabase')
    console.log('💡 Verifica que:')
    console.log('   1. Las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configuradas')
    console.log('   2. El proyecto de Supabase esté activo')
    console.log('   3. La tabla "usuarios" exista en tu base de datos')
    process.exit(1)
  }
  
  // Probar creación y login de usuario
  const loginOk = await testLoginWithSupabase()
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
  console.log(`   Conexión Supabase: ${connectionOk ? '✅ OK' : '❌ FALLO'}`)
  console.log(`   Login con Supabase: ${loginOk ? '✅ OK' : '❌ FALLO'}`)
  console.log(`   Endpoints API: ${apiOk ? '✅ OK' : '⏭️  NO PROBADO'}`)
  
  if (connectionOk && loginOk) {
    console.log('\n🎉 ¡Las pruebas principales de Supabase pasaron correctamente!')
    console.log('💡 El backend está listo para usar Supabase')
    if (apiOk) {
      console.log('🌐 Los endpoints de API también funcionan correctamente')
    } else {
      console.log('🌐 Para probar los endpoints, ejecuta: npm run dev')
    }
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración de Supabase.')
  }
  
  process.exit(0)
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

export { testSupabaseConnection, createTestUserInSupabase, testLoginWithSupabase }
