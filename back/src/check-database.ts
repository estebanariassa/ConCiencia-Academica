import { SupabaseDB } from './config/supabase-only'
import dotenv from 'dotenv'

dotenv.config()

async function checkDatabase() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...')
    
    // Verificar variables de entorno
    console.log('\n1️⃣ Variables de entorno:')
    console.log(`   - SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Configurada' : '❌ No configurada'}`)
    console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ No configurada'}`)
    console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurada' : '❌ No configurada'}`)
    
    // Probar conexión a Supabase
    console.log('\n2️⃣ Probando conexión a Supabase...')
    try {
      const { data, error } = await SupabaseDB.supabaseAdmin
        .from('usuarios')
        .select('count')
        .limit(1)
      
      if (error) {
        console.log('❌ Error de conexión:', error.message)
        return
      }
      console.log('✅ Conexión a Supabase exitosa')
    } catch (error) {
      console.log('❌ Error de conexión:', error)
      return
    }
    
    // Obtener todos los usuarios
    console.log('\n3️⃣ Obteniendo usuarios de la base de datos...')
    const { data: users, error: usersError } = await SupabaseDB.supabaseAdmin
      .from('usuarios')
      .select('*')
      .limit(10)
    
    if (usersError) {
      console.log('❌ Error obteniendo usuarios:', usersError)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos')
      return
    }
    
    console.log(`✅ Se encontraron ${users.length} usuarios`)
    
    // Mostrar detalles de cada usuario
    console.log('\n4️⃣ Detalles de usuarios:')
    users.forEach((user, index) => {
      console.log(`\n   Usuario ${index + 1}:`)
      console.log(`   - ID: ${user.id}`)
      console.log(`   - Email: ${user.email}`)
      console.log(`   - Nombre: ${user.nombre} ${user.apellido}`)
      console.log(`   - Tipo: ${user.tipo_usuario}`)
      console.log(`   - Activo: ${user.activo}`)
      console.log(`   - Password: ${user.password ? 'Presente' : 'Ausente'}`)
      if (user.password) {
        console.log(`   - Password length: ${user.password.length}`)
        console.log(`   - Password starts with $2: ${user.password.startsWith('$2')}`)
        console.log(`   - Password preview: ${user.password.substring(0, 20)}...`)
      }
    })
    
    // Probar búsqueda por email específico
    console.log('\n5️⃣ Probando búsqueda por email...')
    const testEmail = users[0].email
    console.log(`   Probando con email: ${testEmail}`)
    
    const foundUser = await SupabaseDB.findUserByEmail(testEmail)
    if (foundUser) {
      console.log('   ✅ Usuario encontrado con findUserByEmail')
      console.log(`   - Nombre: ${foundUser.nombre} ${foundUser.apellido}`)
    } else {
      console.log('   ❌ Usuario NO encontrado con findUserByEmail')
    }
    
  } catch (error) {
    console.error('❌ Error en verificación de base de datos:', error)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkDatabase()
}

export { checkDatabase }


