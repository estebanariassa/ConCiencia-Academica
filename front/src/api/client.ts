import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token JWT a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Solo redirigir al login si es un error de autenticación real
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Verificar si el error es por token expirado o inválido
      const token = localStorage.getItem('token');
      if (!token) {
        // No hay token, redirigir al login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        // Hay token pero el servidor lo rechaza, podría ser un problema temporal
        console.warn('⚠️ Error de autenticación con token presente:', error.response?.status);
        // No redirigir automáticamente, dejar que el componente maneje el error
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient


