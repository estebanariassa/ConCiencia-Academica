import { apiClient } from './client'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  nombre: string
  apellido: string
  tipo_usuario: 'estudiante' | 'profesor' | 'coordinador' | 'admin'
  password: string
}

export interface AuthResponse {
  message: string
  token: string
  user: {
    id: string
    email: string
    nombre: string
    apellido: string
    tipo_usuario: string
  }
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  getToken: () => {
    return localStorage.getItem('token')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  }
}


