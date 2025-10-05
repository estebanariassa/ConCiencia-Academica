import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { SupabaseDB } from '../config/supabase-only'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  tipo_usuario: z.enum(['estudiante', 'profesor', 'coordinador', 'admin']),
  password: z.string().min(6)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body)
    
    // Verificar si el usuario ya existe
    const existingUser = await SupabaseDB.findUserByEmail(validatedData.email)

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Crear usuario
    const user = await SupabaseDB.createUser({
      email: validatedData.email,
      password: hashedPassword,
      nombre: validatedData.nombre,
      apellido: validatedData.apellido,
      tipo_usuario: validatedData.tipo_usuario,
    })

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        tipo_usuario: user.tipo_usuario
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    console.error('Error en registro:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body)
    
    console.log(`🔍 Intentando login para: ${validatedData.email}`)
    
    // Buscar usuario
    const user = await SupabaseDB.findUserByEmail(validatedData.email)

    if (!user) {
      console.log(`❌ Usuario no encontrado: ${validatedData.email}`)
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    if (!user.activo) {
      console.log(`❌ Usuario inactivo: ${validatedData.email}`)
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    console.log(`✅ Usuario encontrado: ${user.nombre} ${user.apellido} (${user.tipo_usuario})`)

    // Verificar contraseña
    let isValidPassword = false
    
    // Primero intentar con bcrypt (contraseña hasheada)
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      isValidPassword = await bcrypt.compare(validatedData.password, user.password)
      console.log(`🔐 Verificación con bcrypt: ${isValidPassword}`)
    } else {
      // Si no está hasheada, comparar en texto plano (para compatibilidad)
      isValidPassword = user.password === validatedData.password
      console.log(`🔐 Verificación en texto plano: ${isValidPassword}`)
      
      // Si la contraseña es correcta pero no está hasheada, la hasheamos automáticamente
      if (isValidPassword) {
        console.log(`🔧 Hasheando contraseña para: ${validatedData.email}`)
        const hashedPassword = await bcrypt.hash(validatedData.password, 10)
        
        // Actualizar la contraseña hasheada en la base de datos
        try {
          await SupabaseDB.updateUser(user.id, { password: hashedPassword })
          console.log(`✅ Contraseña hasheada y actualizada para: ${validatedData.email}`)
        } catch (updateError) {
          console.error(`⚠️ Error actualizando contraseña hasheada:`, updateError)
          // Continuar con el login aunque no se haya actualizado
        }
      }
    }
    
    if (!isValidPassword) {
      console.log(`❌ Contraseña incorrecta para: ${validatedData.email}`)
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        tipo_usuario: user.tipo_usuario
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /auth/me - Obtener información del usuario actual
router.get('/me', async (req, res) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorización requerido' })
    }

    const token = authHeader.substring(7) // Remover 'Bearer '

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // Buscar el usuario en la base de datos
    const user = await SupabaseDB.findUserByEmail(decoded.email)

    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' })
    }

    // Devolver información del usuario (sin la contraseña)
    res.json({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      tipo_usuario: user.tipo_usuario,
      activo: user.activo,
      created_at: user.created_at
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Token inválido' })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expirado' })
    }
    console.error('Error en /auth/me:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /auth/create-user - Crear usuario con hash automático (para administradores)
router.post('/create-user', async (req, res) => {
  try {
    const { email, password, nombre, apellido, tipo_usuario } = req.body
    
    // Validación básica
    if (!email || !password || !nombre || !apellido || !tipo_usuario) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' })
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await SupabaseDB.findUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }
    
    // Hash automático de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Crear usuario
    const user = await SupabaseDB.createUser({
      email,
      password: hashedPassword,
      nombre,
      apellido,
      tipo_usuario
    })
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        tipo_usuario: user.tipo_usuario,
        activo: user.activo
      },
      loginCredentials: {
        email: email,
        password: password // Mostrar la contraseña original para referencia
      }
    })
  } catch (error) {
    console.error('Error creando usuario:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
