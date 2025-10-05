import dotenv from 'dotenv'
import { SupabaseDB } from './config/supabase-only'
import bcrypt from 'bcrypt'

// Cargar variables de entorno
dotenv.config()

async function debugStudentLogin() {
  console.log('🔍 Diagnosticando problema de login con estudiante...\n')
  
  try {
    // 1. Obtener conteo de usuarios
    console.log('📋 Información de la base de datos:')
    console.log('=' .repeat(60))
    
    const userCount = await SupabaseDB.countUsers()
    console.log(`Total de usuarios en la base de datos: ${userCount}`)
    
    // 2. Buscar usuarios específicos conocidos
    console.log('\n🔍 Buscando usuarios conocidos:')
    console.log('=' .repeat(60))
    
    const knownEmails = [
      'test.connection@example.com',
      'test.frontend@example.com', 
      'integration.test@example.com',
      'test.login.supabase@example.com'
    ]
    
    const foundUsers: any[] = []
    
    for (const email of knownEmails) {
      try {
        const user = await SupabaseDB.findUserByEmail(email)
        if (user) {
          foundUsers.push(user)
          console.log(`✅ ${email} - ${user.nombre} ${user.apellido} (${user.tipo_usuario})`)
        }
      } catch (error) {
        // Usuario no encontrado, continuar
      }
    }
    
    // 3. Buscar usuarios de tipo 'estudiante' entre los encontrados
    console.log('\n🎓 Estudiantes encontrados:')
    console.log('=' .repeat(60))
    
    const estudiantes = foundUsers.filter((user: any) => user.tipo_usuario === 'estudiante')
    
    if (estudiantes.length === 0) {
      console.log('❌ No se encontraron estudiantes entre los usuarios conocidos')
    } else {
      estudiantes.forEach((estudiante: any, index: number) => {
        console.log(`${index + 1}. ${estudiante.nombre} ${estudiante.apellido}`)
        console.log(`   Email: ${estudiante.email}`)
        console.log(`   Activo: ${estudiante.activo ? '✅' : '❌'}`)
        console.log(`   Password: ${estudiante.password.substring(0, 30)}...`)
        console.log('')
      })
    }
    
    // 4. Probar login con cada estudiante
    console.log('🔐 Probando login con cada estudiante:')
    console.log('=' .repeat(60))
    
    for (const estudiante of estudiantes) {
      console.log(`\n🧪 Probando con: ${estudiante.email}`)
      
      // Buscar el usuario
      const foundUser = await SupabaseDB.findUserByEmail(estudiante.email)
      
      if (!foundUser) {
        console.log('❌ Usuario no encontrado por email')
        continue
      }
      
      if (!foundUser.activo) {
        console.log('❌ Usuario inactivo')
        continue
      }
      
      console.log('✅ Usuario encontrado y activo')
      console.log(`   Password en DB: ${foundUser.password.substring(0, 30)}...`)
      
      // Verificar si la contraseña está hasheada
      const isHashed = foundUser.password.startsWith('$2b$') || foundUser.password.startsWith('$2a$')
      console.log(`   Password hasheada: ${isHashed ? '✅' : '❌'}`)
      
      if (!isHashed) {
        console.log('⚠️  La contraseña NO está hasheada (está en texto plano)')
        console.log(`   Password actual: "${foundUser.password}"`)
        
        // Preguntar al usuario qué contraseña quiere probar
        console.log('\n💡 Para probar el login, necesitas usar la contraseña exacta que está en la base de datos')
        console.log('   (sin hash)')
      } else {
        console.log('✅ La contraseña está hasheada correctamente')
        console.log('💡 Para probar el login, necesitas la contraseña original (antes del hash)')
      }
    }
    
    // 5. Crear un estudiante de prueba si no hay ninguno
    if (estudiantes.length === 0) {
      console.log('\n🔧 No hay estudiantes. ¿Quieres crear uno de prueba?')
      console.log('   Ejecuta: npm run debug-student create-test')
    }
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
  }
}

async function createTestStudent() {
  console.log('🔧 Creando estudiante de prueba...\n')
  
  try {
    const testEmail = 'estudiante.prueba@example.com'
    const testPassword = 'Estudiante123!'
    
    // Verificar si ya existe
    const existingUser = await SupabaseDB.findUserByEmail(testEmail)
    
    if (existingUser) {
      console.log('ℹ️  El estudiante de prueba ya existe')
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Activo: ${existingUser.activo ? '✅' : '❌'}`)
      return
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    
    // Crear estudiante de prueba
    const testStudent = await SupabaseDB.createUser({
      email: testEmail,
      password: hashedPassword,
      nombre: 'Estudiante',
      apellido: 'Prueba',
      tipo_usuario: 'estudiante'
    })
    
    console.log('✅ Estudiante de prueba creado exitosamente!')
    console.log(`   Email: ${testStudent.email}`)
    console.log(`   Password: ${testPassword}`)
    console.log(`   Nombre: ${testStudent.nombre} ${testStudent.apellido}`)
    console.log(`   Tipo: ${testStudent.tipo_usuario}`)
    console.log(`   Activo: ${testStudent.activo ? '✅' : '❌'}`)
    
    console.log('\n💡 Ahora puedes usar estas credenciales para hacer login:')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: ${testPassword}`)
    
  } catch (error) {
    console.error('❌ Error creando estudiante de prueba:', error)
  }
}

async function testSpecificStudent(email: string, password: string) {
  console.log(`🧪 Probando login específico para: ${email}\n`)
  
  try {
    // Buscar usuario
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
      console.log('❌ Usuario inactivo - no puede hacer login')
      return false
    }
    
    // Verificar contraseña
    const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$')
    console.log(`   Password hasheada: ${isHashed ? '✅' : '❌'}`)
    
    let isValidPassword = false
    
    if (isHashed) {
      isValidPassword = await bcrypt.compare(password, user.password)
      console.log(`🔐 Verificación con bcrypt: ${isValidPassword ? '✅' : '❌'}`)
    } else {
      isValidPassword = user.password === password
      console.log(`🔐 Verificación en texto plano: ${isValidPassword ? '✅' : '❌'}`)
      console.log(`   Password en DB: "${user.password}"`)
      console.log(`   Password ingresada: "${password}"`)
    }
    
    if (isValidPassword) {
      console.log('🎉 ¡Login exitoso!')
      return true
    } else {
      console.log('❌ Contraseña incorrecta')
      return false
    }
    
  } catch (error) {
    console.error('❌ Error probando login:', error)
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    await debugStudentLogin()
  } else if (args[0] === 'create-test') {
    await createTestStudent()
  } else if (args.length === 2) {
    await testSpecificStudent(args[0], args[1])
  } else {
    console.log('Uso:')
    console.log('  npm run debug-student                    # Diagnosticar todos los estudiantes')
    console.log('  npm run debug-student create-test        # Crear estudiante de prueba')
    console.log('  npm run debug-student email@example.com password  # Probar login específico')
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

export { debugStudentLogin, createTestStudent, testSpecificStudent }
