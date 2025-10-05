import { SupabaseDB } from './config/supabase-only'
import dotenv from 'dotenv'

dotenv.config()

async function investigateUsers() {
  try {
    console.log('🔍 Investigando usuarios en la base de datos...')
    
    // 1. Contar usuarios totales
    console.log('\n1️⃣ Contando usuarios totales...')
    const { count, error: countError } = await SupabaseDB.supabaseAdmin
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log('❌ Error contando usuarios:', countError)
    } else {
      console.log(`✅ Total de usuarios en la tabla: ${count}`)
    }
    
    // 2. Obtener todos los usuarios sin límite
    console.log('\n2️⃣ Obteniendo todos los usuarios...')
    const { data: allUsers, error: allUsersError } = await SupabaseDB.supabaseAdmin
      .from('usuarios')
      .select('*')
    
    if (allUsersError) {
      console.log('❌ Error obteniendo usuarios:', allUsersError)
      return
    }
    
    console.log(`✅ Usuarios obtenidos: ${allUsers?.length || 0}`)
    
    if (allUsers && allUsers.length > 0) {
      console.log('\n3️⃣ Lista completa de usuarios:')
      allUsers.forEach((user, index) => {
        console.log(`\n   Usuario ${index + 1}:`)
        console.log(`   - ID: ${user.id}`)
        console.log(`   - Email: ${user.email}`)
        console.log(`   - Nombre: ${user.nombre} ${user.apellido}`)
        console.log(`   - Tipo: ${user.tipo_usuario}`)
        console.log(`   - Activo: ${user.activo}`)
        console.log(`   - Creado: ${user.created_at || 'N/A'}`)
        console.log(`   - Actualizado: ${user.updated_at || 'N/A'}`)
      })
    }
    
    // 3. Probar diferentes consultas
    console.log('\n4️⃣ Probando diferentes consultas...')
    
    // Consulta con filtro activo
    const { data: activeUsers, error: activeError } = await SupabaseDB.supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('activo', true)
    
    console.log(`   - Usuarios activos: ${activeUsers?.length || 0}`)
    if (activeError) console.log(`   - Error: ${activeError.message}`)
    
    // Consulta sin filtro activo
    const { data: allUsersNoFilter, error: noFilterError } = await SupabaseDB.supabaseAdmin
      .from('usuarios')
      .select('*')
      .is('activo', null)
    
    console.log(`   - Usuarios sin campo activo: ${allUsersNoFilter?.length || 0}`)
    if (noFilterError) console.log(`   - Error: ${noFilterError.message}`)
    
    // 4. Verificar estructura de la tabla
    console.log('\n5️⃣ Verificando estructura de la tabla...')
    const { data: sampleUser, error: sampleError } = await SupabaseDB.supabaseAdmin
      .from('usuarios')
      .select('*')
      .limit(1)
      .single()
    
    if (sampleError) {
      console.log('❌ Error obteniendo muestra:', sampleError)
    } else if (sampleUser) {
      console.log('✅ Estructura de la tabla:')
      Object.keys(sampleUser).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleUser[key]}`)
      })
    }
    
    // 5. Probar la función findUserByEmail con diferentes emails
    console.log('\n6️⃣ Probando findUserByEmail...')
    if (allUsers && allUsers.length > 0) {
      for (const user of allUsers.slice(0, 3)) { // Probar con los primeros 3
        console.log(`   Probando con: ${user.email}`)
        const foundUser = await SupabaseDB.findUserByEmail(user.email)
        if (foundUser) {
          console.log(`   ✅ Encontrado: ${foundUser.nombre} ${foundUser.apellido}`)
        } else {
          console.log(`   ❌ NO encontrado`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error en investigación:', error)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  investigateUsers()
}

export { investigateUsers }


