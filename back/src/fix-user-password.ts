import dotenv from 'dotenv'
import { SupabaseDB } from './config/supabase-only'
import bcrypt from 'bcrypt'

// Cargar variables de entorno
dotenv.config()

async function fixUserPassword(email: string, newPassword: string) {
  console.log(`🔧 Arreglando contraseña para: ${email}\n`)
  
  try {
    // 1. Buscar el usuario
    const user = await SupabaseDB.findUserByEmail(email)
    
    if (!user) {
      console.log('❌ Usuario no encontrado')
      return false
    }
    
    console.log('✅ Usuario encontrado:')
    console.log(`   Nombre: ${user.nombre} ${user.apellido}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Tipo: ${user.tipo_usuario}`)
    console.log(`   Activo: ${user.activo ? '✅' : '❌'}`)
    
    if (!user.activo) {
      console.log('⚠️  Usuario inactivo - activándolo...')
      await SupabaseDB.updateUser(user.id, { activo: true })
      console.log('✅ Usuario activado')
    }
    
    // 2. Hash de la nueva contraseña
    console.log('\n🔐 Hasheando nueva contraseña...')
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // 3. Actualizar la contraseña en la base de datos
    console.log('💾 Actualizando contraseña en la base de datos...')
    await SupabaseDB.updateUser(user.id, { password: hashedPassword })
    
    console.log('✅ Contraseña actualizada exitosamente!')
    console.log('\n🎉 Ahora puedes hacer login con:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${newPassword}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error)
    return false
  }
}

async function createUserWithPassword(userData: {
  email: string
  password: string
  nombre: string
  apellido: string
  tipo_usuario: 'estudiante' | 'profesor' | 'coordinador' | 'admin'
}) {
  console.log(`🔧 Creando usuario: ${userData.email}\n`)
  
  try {
    // Verificar si ya existe
    const existingUser = await SupabaseDB.findUserByEmail(userData.email)
    
    if (existingUser) {
      console.log('⚠️  El usuario ya existe. Actualizando contraseña...')
      return await fixUserPassword(userData.email, userData.password)
    }
    
    // Hash de la contraseña
    console.log('🔐 Hasheando contraseña...')
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    // Crear usuario
    console.log('💾 Creando usuario en la base de datos...')
    const newUser = await SupabaseDB.createUser({
      email: userData.email,
      password: hashedPassword,
      nombre: userData.nombre,
      apellido: userData.apellido,
      tipo_usuario: userData.tipo_usuario
    })
    
    console.log('✅ Usuario creado exitosamente!')
    console.log('\n🎉 Ahora puedes hacer login con:')
    console.log(`   Email: ${userData.email}`)
    console.log(`   Password: ${userData.password}`)
    console.log(`   Nombre: ${newUser.nombre} ${newUser.apellido}`)
    console.log(`   Tipo: ${newUser.tipo_usuario}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error)
    return false
  }
}

async function listAllUsers() {
  console.log('📋 Listando todos los usuarios...\n')
  
  try {
    const userCount = await SupabaseDB.countUsers()
    console.log(`Total de usuarios: ${userCount}`)
    
    // Buscar usuarios conocidos
    const knownEmails = [
      'test.connection@example.com',
      'test.frontend@example.com', 
      'integration.test@example.com',
      'test.login.supabase@example.com',
      'estudiante.prueba@example.com'
    ]
    
    console.log('\n🔍 Usuarios encontrados:')
    console.log('=' .repeat(60))
    
    for (const email of knownEmails) {
      try {
        const user = await SupabaseDB.findUserByEmail(email)
        if (user) {
          console.log(`✅ ${user.email}`)
          console.log(`   Nombre: ${user.nombre} ${user.apellido}`)
          console.log(`   Tipo: ${user.tipo_usuario}`)
          console.log(`   Activo: ${user.activo ? '✅' : '❌'}`)
          console.log('')
        }
      } catch (error) {
        // Usuario no encontrado
      }
    }
    
  } catch (error) {
    console.error('❌ Error listando usuarios:', error)
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('🔧 Herramienta para gestionar usuarios y contraseñas\n')
    console.log('Uso:')
    console.log('  npm run fix-password list                                    # Listar usuarios')
    console.log('  npm run fix-password fix email@example.com newpassword      # Arreglar contraseña')
    console.log('  npm run fix-password create email@example.com password "Nombre" "Apellido" estudiante  # Crear usuario')
    console.log('')
    console.log('Ejemplos:')
    console.log('  npm run fix-password fix estudiante@example.com MiPassword123!')
    console.log('  npm run fix-password create nuevo@example.com Password123! "Juan" "Pérez" estudiante')
    return
  }
  
  const command = args[0]
  
  if (command === 'list') {
    await listAllUsers()
  } else if (command === 'fix' && args.length === 3) {
    const email = args[1]
    const password = args[2]
    await fixUserPassword(email, password)
  } else if (command === 'create' && args.length === 6) {
    const email = args[1]
    const password = args[2]
    const nombre = args[3]
    const apellido = args[4]
    const tipo_usuario = args[5] as 'estudiante' | 'profesor' | 'coordinador' | 'admin'
    
    await createUserWithPassword({
      email,
      password,
      nombre,
      apellido,
      tipo_usuario
    })
  } else {
    console.log('❌ Comando inválido. Usa "npm run fix-password" para ver la ayuda.')
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

export { fixUserPassword, createUserWithPassword, listAllUsers }
