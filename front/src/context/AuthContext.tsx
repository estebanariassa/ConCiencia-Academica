import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, AuthResponse } from '../api/auth'

interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  tipo_usuario: string
  user_type?: string
  user_role?: string
  dashboard?: string
  permissions?: string[]
  role_description?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, expectedUserType?: string) => Promise<void>
  register: (data: {
    email: string
    nombre: string
    apellido: string
    tipo_usuario: 'estudiante' | 'profesor' | 'coordinador' | 'admin'
    password: string
  }) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
  getDashboardPath: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario guardado al cargar la app
    const savedUser = authApi.getCurrentUser()
    if (savedUser && authApi.isAuthenticated()) {
      setUser(savedUser)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string, expectedUserType?: string) => {
    try {
      const response: AuthResponse = await authApi.login({ email, password })
      
      // Verificar que el tipo de usuario coincida con el esperado
      if (expectedUserType) {
        const userTypeMapping: { [key: string]: string } = {
          'student': 'estudiante',
          'teacher': 'profesor',
          'coordinator': 'coordinador',
          'admin': 'admin'
        }
        
        const expectedBackendType = userTypeMapping[expectedUserType]
        const actualUserType = response.user.tipo_usuario
        
        // Verificar si el tipo coincide (incluyendo normalización de 'docente' a 'profesor')
        const normalizedActualType = actualUserType === 'docente' ? 'profesor' : actualUserType
        
        if (expectedBackendType !== normalizedActualType) {
          throw new Error(`El tipo de usuario seleccionado (${expectedUserType}) no coincide con el tipo de usuario en el sistema (${actualUserType})`)
        }
      }
      
      // Guardar token y usuario
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      setUser(response.user)
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  }

  const register = async (data: {
    email: string
    nombre: string
    apellido: string
    tipo_usuario: 'estudiante' | 'profesor' | 'coordinador' | 'admin'
    password: string
  }) => {
    try {
      const response: AuthResponse = await authApi.register(data)
      
      // Guardar token y usuario
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      setUser(response.user)
    } catch (error) {
      console.error('Error en registro:', error)
      throw error
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  const getDashboardPath = () => {
    if (!user) return '/login'
    
    // Usar el dashboard del backend si está disponible
    if (user.dashboard) {
      return user.dashboard
    }
    
    // Fallback basado en el tipo de usuario
    const userTypeMapping: { [key: string]: string } = {
      'estudiante': '/dashboard-estudiante',
      'profesor': '/dashboard-profesor',
      'docente': '/dashboard-profesor',
      'coordinador': '/dashboard-coordinador',
      'admin': '/dashboard-admin'
    }
    
    return userTypeMapping[user.tipo_usuario] || '/dashboard'
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    getDashboardPath
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


