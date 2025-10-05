import axios from 'axios'
import dotenv from 'dotenv'
import { SupabaseDB } from './config/supabase-only'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Cargar variables de entorno
dotenv.config()

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

interface TestResult {
  name: string
  success: boolean
  message: string
  details?: any
}

class BackendFrontendTester {
  private results: TestResult[] = []

  private addResult(name: string, success: boolean, message: string, details?: any) {
    this.results.push({ name, success, message, details })
    const status = success ? '✅' : '❌'
    console.log(`${status} ${name}: ${message}`)
    if (details && !success) {
      console.log(`   Detalles: ${JSON.stringify(details, null, 2)}`)
    }
  }

  async testBackendServer() {
    console.log('🔍 Probando servidor backend...')
    
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 })
      
      if (response.status === 200 && response.data.ok) {
        this.addResult(
          'Backend Server',
          true,
          `Servidor backend respondiendo en ${BACKEND_URL}`
        )
        return true
      } else {
        this.addResult(
          'Backend Server',
          false,
          'Respuesta inesperada del servidor',
          response.data
        )
        return false
      }
    } catch (error: any) {
      this.addResult(
        'Backend Server',
        false,
        'No se pudo conectar al servidor backend',
        {
          error: error.message,
          code: error.code,
          url: BACKEND_URL
        }
      )
      return false
    }
  }

  async testDatabaseConnection() {
    console.log('🔍 Probando conexión a base de datos...')
    
    try {
      const userCount = await SupabaseDB.countUsers()
      this.addResult(
        'Database Connection',
        true,
        `Conexión exitosa a Supabase. Usuarios en DB: ${userCount}`
      )
      return true
    } catch (error: any) {
      this.addResult(
        'Database Connection',
        false,
        'Error conectando a la base de datos',
        { error: error.message }
      )
      return false
    }
  }

  async testAuthEndpoints() {
    console.log('🔍 Probando endpoints de autenticación...')
    
    // Crear usuario de prueba
    const testEmail = 'test.connection@example.com'
    const testPassword = 'TestPassword123!'
    
    try {
      // Verificar si el usuario ya existe
      let existingUser = await SupabaseDB.findUserByEmail(testEmail)
      
      if (!existingUser) {
        // Crear usuario de prueba
        const hashedPassword = await bcrypt.hash(testPassword, 10)
        existingUser = await SupabaseDB.createUser({
          email: testEmail,
          password: hashedPassword,
          nombre: 'Test',
          apellido: 'User',
          tipo_usuario: 'estudiante'
        })
        console.log('   Usuario de prueba creado')
      } else {
        console.log('   Usuario de prueba ya existe')
      }

      // Probar endpoint de login
      const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: testEmail,
        password: testPassword
      }, { timeout: 10000 })

      if (loginResponse.status === 200 && loginResponse.data.token) {
        this.addResult(
          'Auth Login Endpoint',
          true,
          'Login exitoso',
          {
            user: loginResponse.data.user.email,
            tokenLength: loginResponse.data.token.length
          }
        )

        // Probar endpoint protegido con el token
        const token = loginResponse.data.token
        const protectedResponse = await axios.get(`${BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        })

        if (protectedResponse.status === 200) {
          this.addResult(
            'Protected Endpoint',
            true,
            'Endpoint protegido accesible con token válido'
          )
          return true
        } else {
          this.addResult(
            'Protected Endpoint',
            false,
            'Error accediendo endpoint protegido',
            protectedResponse.data
          )
          return false
        }
      } else {
        this.addResult(
          'Auth Login Endpoint',
          false,
          'Error en login',
          loginResponse.data
        )
        return false
      }
    } catch (error: any) {
      this.addResult(
        'Auth Endpoints',
        false,
        'Error probando endpoints de autenticación',
        {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      )
      return false
    }
  }

  async testFrontendAPICompatibility() {
    console.log('🔍 Probando compatibilidad con API del frontend...')
    
    try {
      // Simular las llamadas que hace el frontend
      const testEmail = 'test.frontend@example.com'
      const testPassword = 'FrontendTest123!'
      
      // Crear usuario si no existe
      let user = await SupabaseDB.findUserByEmail(testEmail)
      if (!user) {
        const hashedPassword = await bcrypt.hash(testPassword, 10)
        user = await SupabaseDB.createUser({
          email: testEmail,
          password: hashedPassword,
          nombre: 'Frontend',
          apellido: 'Test',
          tipo_usuario: 'estudiante'
        })
      }

      // Probar login como lo haría el frontend
      const loginData = {
        email: testEmail,
        password: testPassword
      }

      const response = await axios.post(`${BACKEND_URL}/auth/login`, loginData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      // Verificar estructura de respuesta compatible con frontend
      const expectedFields = ['message', 'token', 'user']
      const hasAllFields = expectedFields.every(field => field in response.data)
      
      if (hasAllFields && response.data.user && response.data.token) {
        this.addResult(
          'Frontend API Compatibility',
          true,
          'API compatible con estructura esperada por frontend',
          {
            hasMessage: !!response.data.message,
            hasToken: !!response.data.token,
            hasUser: !!response.data.user,
            userFields: Object.keys(response.data.user)
          }
        )
        return true
      } else {
        this.addResult(
          'Frontend API Compatibility',
          false,
          'Estructura de respuesta no compatible con frontend',
          {
            expected: expectedFields,
            received: Object.keys(response.data)
          }
        )
        return false
      }
    } catch (error: any) {
      this.addResult(
        'Frontend API Compatibility',
        false,
        'Error probando compatibilidad con frontend',
        {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      )
      return false
    }
  }

  async testCORSConfiguration() {
    console.log('🔍 Probando configuración CORS...')
    
    try {
      // Hacer una petición OPTIONS para verificar CORS
      const response = await axios.options(`${BACKEND_URL}/auth/login`, {
        headers: {
          'Origin': FRONTEND_URL,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        },
        timeout: 5000
      })

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
      }

      this.addResult(
        'CORS Configuration',
        true,
        'CORS configurado correctamente',
        corsHeaders
      )
      return true
    } catch (error: any) {
      this.addResult(
        'CORS Configuration',
        false,
        'Error verificando configuración CORS',
        { error: error.message }
      )
      return false
    }
  }

  async testFullIntegrationFlow() {
    console.log('🔍 Probando flujo completo de integración...')
    
    try {
      const testEmail = 'integration.test@example.com'
      const testPassword = 'IntegrationTest123!'
      
      // 1. Crear usuario
      let user = await SupabaseDB.findUserByEmail(testEmail)
      if (!user) {
        const hashedPassword = await bcrypt.hash(testPassword, 10)
        user = await SupabaseDB.createUser({
          email: testEmail,
          password: hashedPassword,
          nombre: 'Integration',
          apellido: 'Test',
          tipo_usuario: 'estudiante'
        })
      }

      // 2. Login
      const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: testEmail,
        password: testPassword
      })

      if (!loginResponse.data.token) {
        throw new Error('No se recibió token en login')
      }

      const token = loginResponse.data.token

      // 3. Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any
      
      // 4. Usar token para acceder a endpoint protegido
      const meResponse = await axios.get(`${BACKEND_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // 5. Verificar que la información del usuario coincide
      if (meResponse.data.email === testEmail && decoded.email === testEmail) {
        this.addResult(
          'Full Integration Flow',
          true,
          'Flujo completo de integración exitoso',
          {
            loginSuccess: true,
            tokenValid: true,
            protectedEndpointAccess: true,
            userDataConsistent: true
          }
        )
        return true
      } else {
        this.addResult(
          'Full Integration Flow',
          false,
          'Inconsistencia en datos de usuario',
          {
            loginEmail: testEmail,
            tokenEmail: decoded.email,
            meEmail: meResponse.data.email
          }
        )
        return false
      }
    } catch (error: any) {
      this.addResult(
        'Full Integration Flow',
        false,
        'Error en flujo completo de integración',
        { error: error.message }
      )
      return false
    }
  }

  async runAllTests() {
    console.log('🚀 Iniciando pruebas de conexión Backend-Frontend\n')
    console.log(`📍 Backend URL: ${BACKEND_URL}`)
    console.log(`📍 Frontend URL: ${FRONTEND_URL}\n`)

    // Ejecutar todas las pruebas
    await this.testBackendServer()
    await this.testDatabaseConnection()
    await this.testCORSConfiguration()
    await this.testAuthEndpoints()
    await this.testFrontendAPICompatibility()
    await this.testFullIntegrationFlow()

    // Mostrar resumen
    console.log('\n📋 Resumen de Pruebas:')
    console.log('=' .repeat(50))
    
    const successful = this.results.filter(r => r.success).length
    const total = this.results.length
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${result.name}`)
    })
    
    console.log('=' .repeat(50))
    console.log(`📊 Resultado: ${successful}/${total} pruebas exitosas`)
    
    if (successful === total) {
      console.log('\n🎉 ¡Todas las pruebas pasaron!')
      console.log('💡 El backend está correctamente conectado y listo para el frontend')
    } else {
      console.log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración.')
      console.log('\n🔧 Posibles soluciones:')
      console.log('   - Verifica que el servidor backend esté ejecutándose')
      console.log('   - Revisa las variables de entorno')
      console.log('   - Verifica la configuración de CORS')
      console.log('   - Asegúrate de que Supabase esté configurado correctamente')
    }

    return successful === total
  }
}

async function main() {
  const tester = new BackendFrontendTester()
  const success = await tester.runAllTests()
  process.exit(success ? 0 : 1)
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

export { BackendFrontendTester }
