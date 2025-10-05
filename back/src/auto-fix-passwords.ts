import dotenv from 'dotenv'
import { SupabaseDB } from './config/supabase-only'
import bcrypt from 'bcrypt'

// Cargar variables de entorno
dotenv.config()

async function autoFixAllPasswords() {
  console.log('🔧 Arreglando automáticamente todas las contraseñas...\n')
  
  try {
    // Obtener conteo de usuarios
    const userCount = await SupabaseDB.countUsers()
    console.log(`📊 Total de usuarios en la base de datos: ${userCount}`)
    
    // Buscar usuarios conocidos para verificar
    const knownEmails = [
      'test.connection@example.com',
      'test.frontend@example.com', 
      'integration.test@example.com',
      'test.login.supabase@example.com',
      'estudiante.prueba@example.com'
    ]
    
    let fixedCount = 0
    let alreadyHashedCount = 0
    let errorCount = 0
    
    console.log('\n🔍 Verificando y arreglando contraseñas...')
    console.log('=' .repeat(60))
    
    for (const email of knownEmails) {
      try {
        const user = await SupabaseDB.findUserByEmail(email)
        if (!user) {
          console.log(`⚠️  Usuario no encontrado: ${email}`)
          continue
        }
        
        console.log(`\n👤 Verificando: ${user.email}`)
        console.log(`   Nombre: ${user.nombre} ${user.apellido}`)
        console.log(`   Tipo: ${user.tipo_usuario}`)
        console.log(`   Activo: ${user.activo ? '✅' : '❌'}`)
        
        // Verificar si la contraseña está hasheada
        const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$')
        
        if (isHashed) {
          console.log('   ✅ Contraseña ya está hasheada correctamente')
          alreadyHashedCount++
        } else {
          console.log('   ⚠️  Contraseña NO está hasheada - arreglando...')
          
          // Generar una contraseña temporal basada en el email
          const tempPassword = `Temp${user.email.split('@')[0]}123!`
          
          // Hash de la contraseña temporal
          const hashedPassword = await bcrypt.hash(tempPassword, 10)
          
          // Actualizar la contraseña
          await SupabaseDB.updateUser(user.id, { 
            password: hashedPassword,
            activo: true // Asegurar que esté activo
          })
          
          console.log('   ✅ Contraseña arreglada!')
          console.log(`   🔑 Nueva contraseña temporal: ${tempPassword}`)
          fixedCount++
        }
        
      } catch (error) {
        console.log(`   ❌ Error procesando ${email}:`, error)
        errorCount++
      }
    }
    
    // Resumen
    console.log('\n📋 Resumen de la operación:')
    console.log('=' .repeat(60))
    console.log(`✅ Contraseñas ya hasheadas: ${alreadyHashedCount}`)
    console.log(`🔧 Contraseñas arregladas: ${fixedCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    
    if (fixedCount > 0) {
      console.log('\n💡 Usuarios con contraseñas arregladas:')
      console.log('   Pueden hacer login con las contraseñas temporales mostradas arriba')
      console.log('   Recomendamos que cambien sus contraseñas después del primer login')
    }
    
    if (alreadyHashedCount === knownEmails.length) {
      console.log('\n🎉 ¡Todas las contraseñas están correctamente hasheadas!')
    }
    
  } catch (error) {
    console.error('❌ Error en auto-fix:', error)
  }
}

async function createUserWithAutoHash(userData: {
  email: string
  password: string
  nombre: string
  apellido: string
  tipo_usuario: 'estudiante' | 'profesor' | 'coordinador' | 'admin'
}) {
  console.log(`🔧 Creando usuario con hash automático: ${userData.email}\n`)
  
  try {
    // Verificar si ya existe
    const existingUser = await SupabaseDB.findUserByEmail(userData.email)
    
    if (existingUser) {
      console.log('⚠️  El usuario ya existe. Actualizando contraseña...')
      
      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      
      // Actualizar
      await SupabaseDB.updateUser(existingUser.id, { 
        password: hashedPassword,
        activo: true
      })
      
      console.log('✅ Usuario actualizado exitosamente!')
      console.log(`   Email: ${userData.email}`)
      console.log(`   Password: ${userData.password}`)
      
      return true
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    // Crear usuario
    const newUser = await SupabaseDB.createUser({
      email: userData.email,
      password: hashedPassword,
      nombre: userData.nombre,
      apellido: userData.apellido,
      tipo_usuario: userData.tipo_usuario
    })
    
    console.log('✅ Usuario creado exitosamente!')
    console.log(`   Email: ${userData.email}`)
    console.log(`   Password: ${userData.password}`)
    console.log(`   Nombre: ${newUser.nombre} ${newUser.apellido}`)
    console.log(`   Tipo: ${newUser.tipo_usuario}`)
    console.log(`   Activo: ${newUser.activo ? '✅' : '❌'}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error)
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('🔧 Herramienta de auto-fix de contraseñas\n')
    console.log('Uso:')
    console.log('  npm run auto-fix-passwords fix-all                    # Arreglar todas las contraseñas')
    console.log('  npm run auto-fix-passwords create email password "Nombre" "Apellido" estudiante  # Crear usuario')
    console.log('')
    console.log('Ejemplos:')
    console.log('  npm run auto-fix-passwords fix-all')
    console.log('  npm run auto-fix-passwords create nuevo@example.com Password123! "Juan" "Pérez" estudiante')
    return
  }
  
  const command = args[0]
  
  if (command === 'fix-all') {
    await autoFixAllPasswords()
  } else if (command === 'create' && args.length === 6) {
    const email = args[1]
    const password = args[2]
    const nombre = args[3]
    const apellido = args[4]
    const tipo_usuario = args[5] as 'estudiante' | 'profesor' | 'coordinador' | 'admin'
    
    await createUserWithAutoHash({
      email,
      password,
      nombre,
      apellido,
      tipo_usuario
    })
  } else {
    console.log('❌ Comando inválido. Usa "npm run auto-fix-passwords" para ver la ayuda.')
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

export { autoFixAllPasswords, createUserWithAutoHash }
