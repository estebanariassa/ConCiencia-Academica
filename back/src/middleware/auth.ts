import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { SupabaseDB } from '../config/supabase-only'
import { RoleService } from '../services/roleService'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    tipo_usuario: string
    roles?: string[]
    permisos?: string[]
  }
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Verificar que el usuario existe y está activo
    const user = await SupabaseDB.findUserById(decoded.userId)

    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Usuario no válido o inactivo' })
    }

    // Obtener roles múltiples del usuario
    const roles = await RoleService.obtenerRolesUsuario(user.id)
    const permisos = await RoleService.obtenerPermisosUsuario(user.id)

    req.user = {
      id: user.id,
      email: user.email,
      tipo_usuario: user.tipo_usuario,
      roles: roles,
      permisos: permisos
    }
    
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const tieneRol = req.user.roles?.some(rol => roles.includes(rol)) || 
                    roles.includes(req.user.tipo_usuario)

    if (!tieneRol) {
      return res.status(403).json({ error: 'Permisos insuficientes' })
    }

    next()
  }
}

export const requirePermission = (permiso: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    // Verificar si el usuario tiene el permiso requerido
    const tienePermiso = req.user.permisos?.includes('all') || 
                        req.user.permisos?.includes(permiso)

    if (!tienePermiso) {
      return res.status(403).json({ error: 'Permisos insuficientes' })
    }

    next()
  }
}


