import { SupabaseDB } from './config/supabase-only'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

async function fixPasswords() {
  try {
    console.log('🔧 Iniciando corrección de contraseñas...')
    
    // Obtener todos los usuarios
    console.log('\n1️⃣ Obteniendo usuarios de la base de datos...')
    const { data: users, error } = await SupabaseDB.supabaseAdmin
      .from('usuarios')
      .select('*')
    
    if (error) {
      console.error('❌ Error obteniendo usuarios:', error)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos')
      return
    }
    
    console.log(`✅ Se encontraron ${users.length} usuarios`)
    
    for (const user of users) {
      try {
        console.log(`\n🔍 Procesando usuario: ${user.email}`)
        console.log(`   - Nombre: ${user.nombre} ${user.apellido}`)
        console.log(`   - Tipo: ${user.tipo_usuario}`)
        console.log(`   - Password actual: ${user.password}`)
        
        // Verificar si la contraseña ya está hasheada
        const isAlreadyHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$')
        
        if (isAlreadyHashed) {
          console.log('   ✅ Contraseña ya está hasheada, saltando...')
          continue
        }
        
        // Si la contraseña no está hasheada, la hasheamos
        console.log('   🔐 Hasheando contraseña...')
        const hashedPassword = await bcrypt.hash(user.password, 10)
        
        // Actualizar en la base de datos
        const { error: updateError } = await SupabaseDB.supabaseAdmin
          .from('usuarios')
          .update({ password: hashedPassword })
          .eq('id', user.id)
        
        if (updateError) {
          console.error(`   ❌ Error actualizando contraseña para ${user.email}:`, updateError)
          continue
        }
        
        console.log('   ✅ Contraseña hasheada y actualizada correctamente')
        
      } catch (error) {
        console.error(`   ❌ Error procesando usuario ${user.email}:`, error)
      }
    }
    
    console.log('\n🎉 Proceso de corrección de contraseñas completado!')
    
  } catch (error) {
    console.error('❌ Error en corrección de contraseñas:', error)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixPasswords()
}

export { fixPasswords }


