#!/usr/bin/env node

/**
 * Script para probar la conexión completa entre Backend y Frontend
 * Ejecuta pruebas tanto del backend como del frontend
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🚀 Iniciando pruebas del sistema completo Backend-Frontend\n')

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command, args, cwd, description) {
  return new Promise((resolve, reject) => {
    log(`\n🔍 ${description}...`, 'cyan')
    log(`   Comando: ${command} ${args.join(' ')}`, 'blue')
    
    const child = spawn(command, args, {
      cwd: cwd,
      stdio: 'inherit',
      shell: true
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        log(`✅ ${description} - Exitoso`, 'green')
        resolve(true)
      } else {
        log(`❌ ${description} - Falló (código: ${code})`, 'red')
        resolve(false)
      }
    })
    
    child.on('error', (error) => {
      log(`❌ Error ejecutando ${description}: ${error.message}`, 'red')
      resolve(false)
    })
  })
}

async function checkPrerequisites() {
  log('\n📋 Verificando prerrequisitos...', 'yellow')
  
  const checks = [
    {
      name: 'Node.js',
      check: () => {
        try {
          const version = process.version
          log(`   ✅ Node.js ${version}`, 'green')
          return true
        } catch (error) {
          log(`   ❌ Node.js no encontrado`, 'red')
          return false
        }
      }
    },
    {
      name: 'Backend package.json',
      check: () => {
        const backendPackage = path.join(__dirname, 'back', 'package.json')
        if (fs.existsSync(backendPackage)) {
          log(`   ✅ Backend package.json encontrado`, 'green')
          return true
        } else {
          log(`   ❌ Backend package.json no encontrado`, 'red')
          return false
        }
      }
    },
    {
      name: 'Frontend package.json',
      check: () => {
        const frontendPackage = path.join(__dirname, 'front', 'package.json')
        if (fs.existsSync(frontendPackage)) {
          log(`   ✅ Frontend package.json encontrado`, 'green')
          return true
        } else {
          log(`   ❌ Frontend package.json no encontrado`, 'red')
          return false
        }
      }
    },
    {
      name: 'Backend node_modules',
      check: () => {
        const backendModules = path.join(__dirname, 'back', 'node_modules')
        if (fs.existsSync(backendModules)) {
          log(`   ✅ Backend node_modules encontrado`, 'green')
          return true
        } else {
          log(`   ⚠️  Backend node_modules no encontrado - ejecuta 'npm install' en la carpeta back`, 'yellow')
          return false
        }
      }
    },
    {
      name: 'Frontend node_modules',
      check: () => {
        const frontendModules = path.join(__dirname, 'front', 'node_modules')
        if (fs.existsSync(frontendModules)) {
          log(`   ✅ Frontend node_modules encontrado`, 'green')
          return true
        } else {
          log(`   ⚠️  Frontend node_modules no encontrado - ejecuta 'npm install' en la carpeta front`, 'yellow')
          return false
        }
      }
    }
  ]
  
  let allPassed = true
  for (const check of checks) {
    if (!check.check()) {
      allPassed = false
    }
  }
  
  return allPassed
}

async function runBackendTests() {
  log('\n🔧 Ejecutando pruebas del Backend...', 'magenta')
  
  const backendPath = path.join(__dirname, 'back')
  
  // Verificar que el script de prueba existe
  const testScript = path.join(backendPath, 'src', 'test-backend-frontend-connection.ts')
  if (!fs.existsSync(testScript)) {
    log('❌ Script de prueba del backend no encontrado', 'red')
    return false
  }
  
  // Ejecutar las pruebas del backend
  const success = await runCommand(
    'npm',
    ['run', 'test-connection'],
    backendPath,
    'Pruebas de conexión Backend-Frontend'
  )
  
  return success
}

async function runFrontendBuildTest() {
  log('\n🎨 Verificando build del Frontend...', 'magenta')
  
  const frontendPath = path.join(__dirname, 'front')
  
  // Intentar hacer build del frontend para verificar que no hay errores
  const success = await runCommand(
    'npm',
    ['run', 'build'],
    frontendPath,
    'Build del Frontend'
  )
  
  return success
}

async function showUsageInstructions() {
  log('\n📖 Instrucciones de uso:', 'yellow')
  log('=' .repeat(60), 'yellow')
  
  log('\n1. Para probar solo el backend:', 'cyan')
  log('   cd back && npm run test-connection', 'blue')
  
  log('\n2. Para probar el frontend en el navegador:', 'cyan')
  log('   - Ejecuta: cd front && npm run dev', 'blue')
  log('   - Abre http://localhost:5173 en el navegador', 'blue')
  log('   - Abre la consola del navegador (F12)', 'blue')
  log('   - Ejecuta: runFrontendTests()', 'blue')
  
  log('\n3. Para probar el sistema completo:', 'cyan')
  log('   - Ejecuta el backend: cd back && npm run dev', 'blue')
  log('   - En otra terminal, ejecuta el frontend: cd front && npm run dev', 'blue')
  log('   - Abre http://localhost:5173 y prueba el login', 'blue')
  
  log('\n4. Para verificar la conexión manualmente:', 'cyan')
  log('   - Backend health: http://localhost:3000/health', 'blue')
  log('   - Frontend: http://localhost:5173', 'blue')
  
  log('\n🔧 Variables de entorno importantes:', 'yellow')
  log('   - BACKEND_URL (backend): URL del backend (default: http://localhost:3000)', 'blue')
  log('   - VITE_API_URL (frontend): URL del backend (default: http://localhost:3000)', 'blue')
  log('   - SUPABASE_URL y SUPABASE_ANON_KEY: Configuración de Supabase', 'blue')
}

async function main() {
  try {
    // Verificar prerrequisitos
    const prerequisitesOk = await checkPrerequisites()
    
    if (!prerequisitesOk) {
      log('\n⚠️  Algunos prerrequisitos no se cumplieron', 'yellow')
      log('   Instala las dependencias necesarias antes de continuar', 'yellow')
    }
    
    // Ejecutar pruebas del backend
    const backendTestsOk = await runBackendTests()
    
    // Ejecutar build test del frontend
    const frontendBuildOk = await runFrontendBuildTest()
    
    // Mostrar resumen
    log('\n📊 Resumen de Pruebas:', 'bright')
    log('=' .repeat(40), 'bright')
    log(`Prerrequisitos: ${prerequisitesOk ? '✅ OK' : '⚠️  Parcial'}`, prerequisitesOk ? 'green' : 'yellow')
    log(`Backend Tests: ${backendTestsOk ? '✅ OK' : '❌ FALLO'}`, backendTestsOk ? 'green' : 'red')
    log(`Frontend Build: ${frontendBuildOk ? '✅ OK' : '❌ FALLO'}`, frontendBuildOk ? 'green' : 'red')
    
    const allPassed = prerequisitesOk && backendTestsOk && frontendBuildOk
    
    if (allPassed) {
      log('\n🎉 ¡Todas las pruebas pasaron!', 'green')
      log('💡 El sistema está listo para usar', 'green')
    } else {
      log('\n⚠️  Algunas pruebas fallaron', 'yellow')
      log('🔧 Revisa los errores anteriores y la configuración', 'yellow')
    }
    
    // Mostrar instrucciones de uso
    await showUsageInstructions()
    
    process.exit(allPassed ? 0 : 1)
    
  } catch (error) {
    log(`\n❌ Error ejecutando pruebas: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = { main }
