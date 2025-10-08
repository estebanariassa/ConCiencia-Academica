import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback } from './Avatar'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  FaUser, 
  FaSignOutAlt, 
  FaChevronDown,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCog,
  FaCrown
} from 'react-icons/fa'

// Tipo para el usuario del AuthContext
interface AuthUser {
  id: string
  email: string
  nombre: string
  apellido: string
  tipo_usuario: string
}

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  // Convertir el usuario del AuthContext al tipo esperado
  const authUser = user as AuthUser | null

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsOpen(false)
  }

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'estudiante':
        return <FaGraduationCap className="h-4 w-4 text-blue-600" />
      case 'profesor':
        return <FaChalkboardTeacher className="h-4 w-4 text-green-600" />
      case 'coordinador':
        return <FaCog className="h-4 w-4 text-orange-600" />
      case 'admin':
        return <FaCrown className="h-4 w-4 text-purple-600" />
      default:
        return <FaUser className="h-4 w-4 text-gray-600" />
    }
  }

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'estudiante':
        return 'Estudiante'
      case 'profesor':
        return 'Profesor'
      case 'coordinador':
        return 'Coordinador'
      case 'admin':
        return 'Administrador'
      default:
        return 'Usuario'
    }
  }

  if (!authUser) return null

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón del Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback 
            text={`${authUser.nombre} ${authUser.apellido}`}
            className="bg-red-100 text-red-700 font-semibold text-sm"
          />
        </Avatar>
        <FaChevronDown 
          className={`h-3 w-3 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Menú Desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            {/* Header del menú */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback 
                    text={`${authUser.nombre} ${authUser.apellido}`}
                    className="bg-red-100 text-red-700 font-semibold"
                  />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {authUser.nombre} {authUser.apellido}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {authUser.email}
                  </p>
                  <div className="flex items-center mt-1">
                    {getUserTypeIcon(authUser.tipo_usuario)}
                    <span className="ml-1 text-xs text-gray-600">
                      {getUserTypeLabel(authUser.tipo_usuario)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del usuario */}
            <div className="p-3 border-b border-gray-100">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">ID de Usuario</span>
                  <span className="text-xs font-mono text-gray-700">
                    {authUser.id.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Estado</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
              </div>
            </div>

            {/* Opciones del menú */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="h-4 w-4 mr-3" />
                Cerrar Sesión
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                ConCiencia Académica
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}







