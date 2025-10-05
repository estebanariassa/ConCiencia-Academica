import { apiClient } from './api/client'
import { authApi } from './api/auth'

interface TestResult {
  name: string
  success: boolean
  message: string
  details?: any
}

class FrontendConnectionTester {
  private results: TestResult[] = []

  private addResult(name: string, success: boolean, message: string, details?: any) {
    this.results.push({ name, success, message, details })
    const status = success ? '✅' : '❌'
    console.log(`${status} ${name}: ${message}`)
    if (details && !success) {
      console.log(`   Detalles: ${JSON.stringify(details, null, 2)}`)
    }
  }

  async testAPIConnection() {
    console.log('🔍 Probando conexión con API del backend...')
    
    try {
      const response = await apiClient.get('/health')
      
      if (response.status === 200 && response.data.ok) {
        this.addResult(
          'API Connection',
          true,
          'Conexión exitosa con el backend'
        )
        return true
      } else {
        this.addResult(
          'API Connection',
          false,
          'Respuesta inesperada del backend',
          response.data
        )
        return false
      }
    } catch (error: any) {
      this.addResult(
        'API Connection',
        false,
        'No se pudo conectar con el backend',
        {
          error: error.message,
          code: error.code,
          url: apiClient.defaults.baseURL
        }
      )
      return false
    }
  }

  async testAuthFlow() {
    console.log('🔍 Probando flujo de autenticación...')
    
    try {
      // Usar credenciales de prueba
      const testCredentials = {
        email: 'test.frontend@example.com',
        password: 'FrontendTest123!'
      }

      // Intentar login
      const response = await authApi.login(testCredentials)
      
      if (response.token && response.user) {
        this.addResult(
          'Auth Login',
          true,
          'Login exitoso desde frontend',
          {
            user: response.user.email,
            tokenLength: response.token.length
          }
        )

        // Verificar que el token se guardó correctamente
        const savedToken = authApi.getToken()
        const savedUser = authApi.getCurrentUser()
        
        if (savedToken && savedUser) {
          this.addResult(
            'Token Storage',
            true,
            'Token y usuario guardados correctamente en localStorage'
          )
          
          // Verificar autenticación
          if (authApi.isAuthenticated()) {
            this.addResult(
              'Authentication Check',
              true,
              'Estado de autenticación correcto'
            )
            return true
          } else {
            this.addResult(
              'Authentication Check',
              false,
              'Estado de autenticación incorrecto'
            )
            return false
          }
        } else {
          this.addResult(
            'Token Storage',
            false,
            'Error guardando token o usuario'
          )
          return false
        }
      } else {
        this.addResult(
          'Auth Login',
          false,
          'Error en login - respuesta inválida',
          response
        )
        return false
      }
    } catch (error: any) {
      this.addResult(
        'Auth Flow',
        false,
        'Error en flujo de autenticación',
        {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      )
      return false
    }
  }

  async testProtectedRequest() {
    console.log('🔍 Probando petición protegida...')
    
    try {
      // Asegurarse de que hay un token
      const token = authApi.getToken()
      if (!token) {
        this.addResult(
          'Protected Request',
          false,
          'No hay token disponible para la petición protegida'
        )
        return false
      }

      // Hacer petición protegida
      const response = await apiClient.get('/auth/me')
      
      if (response.status === 200 && response.data.email) {
        this.addResult(
          'Protected Request',
          true,
          'Petición protegida exitosa',
          {
            user: response.data.email,
            tipo_usuario: response.data.tipo_usuario
          }
        )
        return true
      } else {
        this.addResult(
          'Protected Request',
          false,
          'Error en petición protegida',
          response.data
        )
        return false
      }
    } catch (error: any) {
      this.addResult(
        'Protected Request',
        false,
        'Error en petición protegida',
        {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      )
      return false
    }
  }

  async testLogout() {
    console.log('🔍 Probando logout...')
    
    try {
      // Verificar que está autenticado antes del logout
      if (!authApi.isAuthenticated()) {
        this.addResult(
          'Logout Test',
          false,
          'No hay sesión activa para hacer logout'
        )
        return false
      }

      // Hacer logout
      authApi.logout()
      
      // Verificar que se limpió la sesión
      if (!authApi.isAuthenticated() && !authApi.getToken() && !authApi.getCurrentUser()) {
        this.addResult(
          'Logout Test',
          true,
          'Logout exitoso - sesión limpiada correctamente'
        )
        return true
      } else {
        this.addResult(
          'Logout Test',
          false,
          'Error en logout - sesión no se limpió correctamente'
        )
        return false
      }
    } catch (error: any) {
      this.addResult(
        'Logout Test',
        false,
        'Error en logout',
        { error: error.message }
      )
      return false
    }
  }

  async runAllTests() {
    console.log('🚀 Iniciando pruebas de conexión Frontend-Backend\n')
    console.log(`📍 API Base URL: ${apiClient.defaults.baseURL}\n`)

    // Ejecutar todas las pruebas
    await this.testAPIConnection()
    await this.testAuthFlow()
    await this.testProtectedRequest()
    await this.testLogout()

    // Mostrar resumen
    console.log('\n📋 Resumen de Pruebas Frontend:')
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
      console.log('\n🎉 ¡Todas las pruebas del frontend pasaron!')
      console.log('💡 El frontend está correctamente conectado con el backend')
    } else {
      console.log('\n⚠️  Algunas pruebas del frontend fallaron.')
      console.log('\n🔧 Posibles soluciones:')
      console.log('   - Verifica que el backend esté ejecutándose')
      console.log('   - Revisa la variable VITE_API_URL en el frontend')
      console.log('   - Verifica la configuración de CORS en el backend')
    }

    return successful === total
  }
}

// Función para ejecutar las pruebas desde la consola del navegador
export async function runFrontendTests() {
  const tester = new FrontendConnectionTester()
  return await tester.runAllTests()
}

// Función para ejecutar una prueba específica
export async function testAPIConnection() {
  const tester = new FrontendConnectionTester()
  return await tester.testAPIConnection()
}

export async function testAuthFlow() {
  const tester = new FrontendConnectionTester()
  return await tester.testAuthFlow()
}

// Hacer las funciones disponibles globalmente para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).runFrontendTests = runFrontendTests
  (window as any).testAPIConnection = testAPIConnection
  (window as any).testAuthFlow = testAuthFlow
}

export { FrontendConnectionTester }
