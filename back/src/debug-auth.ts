import { SupabaseDB } from './config/supabase-only'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication...')
    
    // Obtener el email desde argumentos de línea de comandos
    const email = process.argv[2]
    const password = process.argv[3]
    
    if (!email || !password) {
      console.log('❌ Uso: npm run debug-auth <email> <password>')
      console.log('Ejemplo: npm run debug-auth estudiante@universidad.edu 123456')
      return
    }
    
    console.log(`\n🧪 Probando autenticación para: ${email}`)
    
    // 1. Buscar usuario
    console.log('\n1️⃣ Buscando usuario en la base de datos...')
    const user = await SupabaseDB.findUserByEmail(email)
    
    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos')
      return
    }
    
    console.log('✅ Usuario encontrado:')
    console.log(`   - ID: ${user.id}`)
    console.log(`   - Email: ${user.email}`)
    console.log(`   - Nombre: ${user.nombre} ${user.apellido}`)
    console.log(`   - Tipo: ${user.tipo_usuario}`)
    console.log(`   - Activo: ${user.activo}`)
    console.log(`   - Password hash: ${user.password ? 'Presente' : 'Ausente'}`)
    
    if (!user.activo) {
      console.log('❌ Usuario está inactivo')
      return
    }
    
    // 2. Verificar contraseña
    console.log('\n2️⃣ Verificando contraseña...')
    console.log(`   - Contraseña ingresada: ${password}`)
    console.log(`   - Hash almacenado: ${user.password}`)
    
    if (!user.password) {
      console.log('❌ No hay hash de contraseña almacenado')
      return
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log(`   - Contraseña válida: ${isValidPassword}`)
    
    if (!isValidPassword) {
      console.log('❌ La contraseña no coincide con el hash almacenado')
      
      // Intentar verificar si la contraseña está en texto plano (para debugging)
      if (user.password === password) {
        console.log('⚠️  La contraseña está almacenada en texto plano (no hasheada)')
      }
      
      return
    }
    
    console.log('✅ Autenticación exitosa!')
    
  } catch (error) {
    console.error('❌ Error en debug:', error)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  debugAuth()
}

export { debugAuth }


